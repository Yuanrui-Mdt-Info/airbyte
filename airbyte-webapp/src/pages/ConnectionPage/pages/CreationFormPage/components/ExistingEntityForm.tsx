import { Field, FieldProps, Form, Formik } from "formik";
import React, { useMemo } from "react";
// import { FormattedMessage, useIntl } from "react-intl";
import styled from "styled-components";
import * as yup from "yup";

import { ControlLabels, DropDown } from "components"; // Button
// import { Card } from "components/base/Card";
import { ConnectorIcon } from "components/ConnectorIcon";

import { useDestinationDefinitionList } from "services/connector/DestinationDefinitionService";
import { useSourceDefinitionList } from "services/connector/SourceDefinitionService";

import { useDestinationList } from "../../../../../hooks/services/useDestinationHook";
import { useSourceList } from "../../../../../hooks/services/useSourceHook";

interface IProps {
  type: "source" | "destination";
  onSubmit: (id: string) => void;
  onChange: (id: string) => void;
}

const FormContent = styled(Form)`
  // padding: 22px 27px 23px 24px;
`;

const FormSelect = styled(Form)`
  border: 1px solid #d1d5db;
  // box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  // height: 52px;
  // padding: 9px 13px;
  box-sizing: border-box;
  background: #ffffff;
`;

// const BottomBlock = styled.div`
//   text-align: right;
//   margin-top: 34px;
// `;

const PaddingBlock = styled.div`
  text-align: center;
  padding: 40px 0 15px;
  font-weight: 500;
  font-size: 15px;
  line-height: 18px;
`;

export const PanelTitle = styled.div`
  font-weight: 500;
  font-size: 24px;
  line-height: 30px;
  color: #27272a;
  margin-bottom: 30px;
  margin-top: 30px;
`;

const existingEntityValidationSchema = yup.object().shape({
  entityId: yup.string().required("form.empty.error"),
});

const ExistingEntityForm: React.FC<IProps> = ({ type, onSubmit, onChange }) => {
  // const { formatMessage } = useIntl();
  const { sources } = useSourceList();
  const { sourceDefinitions } = useSourceDefinitionList();

  const { destinations } = useDestinationList();

  const { destinationDefinitions } = useDestinationDefinitionList();

  const dropDownData = useMemo(() => {
    if (type === "source") {
      return sources.map((item) => {
        const sourceDef = sourceDefinitions.find((sd) => sd.sourceDefinitionId === item.sourceDefinitionId);
        return {
          label: item.name,
          value: item.sourceId,
          img: <ConnectorIcon icon={sourceDef?.icon} />,
        };
      });
    }
    return destinations.map((item) => {
      const destinationDef = destinationDefinitions.find(
        (dd) => dd.destinationDefinitionId === item.destinationDefinitionId
      );
      return {
        label: item.name,
        value: item.destinationId,
        img: <ConnectorIcon icon={destinationDef?.icon} />,
      };
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  if (!dropDownData.length) {
    return null;
  }

  const initialValues = { entityId: "" };
  return (
    <>
      {/* <Card title={<FormattedMessage id={`connectionForm.${type}Existing`} />}> */}
      <PanelTitle>Select from existing data source</PanelTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={existingEntityValidationSchema}
        onSubmit={async (values: { entityId: string }, { resetForm }) => {
          onSubmit(values.entityId);
          resetForm({});
        }}
      >
        {(
          { setFieldValue } // isSubmitting
        ) => (
          <FormContent>
            <Field name="entityId">
              {({ field }: FieldProps<string>) => (
                <ControlLabels
                // label={formatMessage({
                //   id: `connectionForm.${type}Title`,
                // })}
                >
                  <FormSelect>
                    <DropDown
                      {...field}
                      placeholder="Select a Source"
                      options={dropDownData}
                      onChange={(item: { value: string }) => {
                        onChange(item.value);
                        setFieldValue(field.name, item.value);
                      }}
                    />
                  </FormSelect>
                </ControlLabels>
              )}
            </Field>
            {/* <BottomBlock>
                <Button disabled={isSubmitting} type="submit">
                  <FormattedMessage id={`connectionForm.${type}Use`} />
                </Button>
              </BottomBlock> */}
          </FormContent>
        )}
      </Formik>
      {/* </Card> */}
      <PaddingBlock>{/* <FormattedMessage id="onboarding.or" /> */}</PaddingBlock>
    </>
  );
};

export default ExistingEntityForm;
