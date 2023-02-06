import { Form, useFormikContext } from "formik";
import React from "react";
import styled from "styled-components";

import { Spinner } from "components";

import { FormBlock } from "core/form/types";
import { SwitchStepParams } from "pages/SourcesPage/pages/CreateSourcePage/CreateSourcePage";

import CreateControls from "./components/CreateControls";
import EditControls from "./components/EditControls";
import FormButtonGroup from "./components/FormButtonGroup";
import FormHeaderBox from "./components/FormHeaderBox";
import { FormSection } from "./components/Sections/FormSection";
import ShowLoadingMessage from "./components/ShowLoadingMessage";
import { useServiceForm } from "./serviceFormContext";
import { ServiceFormValues } from "./types";

const FormContainer = styled(Form)`
  //padding: 22px 27px 23px 24px;
  padding: 34px 40px 34px 80px;
`;

const LoaderContainer = styled.div`
  text-align: center;
  padding: 22px 0 23px;
`;

const LoadingMessage = styled.div`
  margin-top: 10px;
`;

interface FormRootProps {
  formFields: FormBlock;
  hasSuccess?: boolean;
  isTestConnectionInProgress?: boolean;
  errorMessage?: React.ReactNode;
  fetchingConnectorError?: Error | null;
  successMessage?: React.ReactNode;
  onRetest?: () => void;
  onStopTestingConnector?: () => void;
  onClickBtn?: (params: SwitchStepParams) => void;
  formValues?: Partial<ServiceFormValues>;
}

const FormRoot: React.FC<FormRootProps> = ({
  isTestConnectionInProgress = false,
  onRetest,
  formFields,
  successMessage,
  errorMessage,
  fetchingConnectorError,
  hasSuccess,
  onStopTestingConnector,
  onClickBtn,
  formValues,
}) => {
  const { dirty, isSubmitting, isValid } = useFormikContext<ServiceFormValues>();
  const { resetServiceForm, isLoadingSchema, selectedService, isEditMode, formType } = useServiceForm();
  const useNewUI = true;

  console.log("!(isValid && dirty)", !(isValid && dirty));
  console.log("dirty", dirty);

  return (
    <FormContainer>
      <FormHeaderBox formType={formType} />
      <FormSection blocks={formFields} disabled={isSubmitting || isTestConnectionInProgress} />
      {isLoadingSchema && (
        <LoaderContainer>
          <Spinner />
          <LoadingMessage>
            <ShowLoadingMessage connector={selectedService?.name} />
          </LoadingMessage>
        </LoaderContainer>
      )}

      {useNewUI && (
        <FormButtonGroup
          currentStep="creating"
          onClickBtn={onClickBtn}
          isSubmitting={isSubmitting || isTestConnectionInProgress}
          hasSuccess={hasSuccess}
          errorMessage={dirty || !isValid ? "" : errorMessage}
          disabled={!(isValid && dirty)}
          formValues={formValues}
        />
      )}

      {useNewUI ? (
        ""
      ) : isEditMode ? (
        <EditControls
          isTestConnectionInProgress={isTestConnectionInProgress}
          onCancelTesting={onStopTestingConnector}
          isSubmitting={isSubmitting || isTestConnectionInProgress}
          errorMessage={errorMessage}
          formType={formType}
          onRetestClick={onRetest}
          isValid={isValid}
          dirty={dirty}
          onCancelClick={() => {
            resetServiceForm();
          }}
          successMessage={successMessage}
        />
      ) : (
        <CreateControls
          isTestConnectionInProgress={isTestConnectionInProgress}
          onCancelTesting={onStopTestingConnector}
          isSubmitting={isSubmitting || isTestConnectionInProgress}
          errorMessage={errorMessage}
          formType={formType}
          isLoadSchema={isLoadingSchema}
          fetchingConnectorError={fetchingConnectorError}
          hasSuccess={hasSuccess}
        />
      )}
    </FormContainer>
  );
};

export { FormRoot };
