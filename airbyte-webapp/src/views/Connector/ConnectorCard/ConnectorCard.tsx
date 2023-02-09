import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import { Card } from "components";
// import { JobItem } from "components/JobItem/JobItem";

import { useDataCardContext } from "components/DataPanel/DataCardContext";

import { Action, Namespace } from "core/analytics";
import { Connector, ConnectorT } from "core/domain/connector";
import { SynchronousJobRead } from "core/request/AirbyteClient";
// import { LogsRequestError } from "core/request/LogsRequestError";
import { useAnalyticsService } from "hooks/services/Analytics";
import { SwitchStepParams } from "pages/SourcesPage/pages/CreateSourcePage/CreateSourcePage";
import { generateMessageFromError } from "utils/errorStatusMessage";
import { ServiceForm, ServiceFormProps, ServiceFormValues } from "views/Connector/ServiceForm";

import { useTestConnector } from "./useTestConnector";

type ConnectorCardProvidedProps = Omit<
  ServiceFormProps,
  "isKeyConnectionInProgress" | "isSuccess" | "onStopTesting" | "testConnector"
>;

interface ConnectorCardBaseProps extends ConnectorCardProvidedProps {
  title?: React.ReactNode;
  full?: boolean;
  jobInfo?: SynchronousJobRead | null;
  onClickBtn?: (params: SwitchStepParams) => void;
  onBack?: () => void;
}

interface ConnectorCardCreateProps extends ConnectorCardBaseProps {
  isEditMode?: false;
}

interface ConnectorCardEditProps extends ConnectorCardBaseProps {
  isEditMode: true;
  connector: ConnectorT;
}

export const ConnectorCard: React.VFC<ConnectorCardCreateProps | ConnectorCardEditProps> = ({
  title,
  full,
  jobInfo,
  onSubmit,
  onClickBtn,
  onBack,
  ...props
}) => {
  const [saved, setSaved] = useState(false);
  // const [errorStatusRequest, setErrorStatusRequest] = useState<Error | null>(null);

  const { testConnector, isTestConnectionInProgress, onStopTesting, error, reset } = useTestConnector(props);
  const { setSourceServiceValues, setDestinationServiceValues } = useDataCardContext();
  // const { push } = useRouter();

  useEffect(() => {
    // Whenever the selected connector changed, reset the check connection call and other errors
    reset();
    // setErrorStatusRequest(null);
  }, [props.selectedConnectorDefinitionSpecification, reset]);

  const analyticsService = useAnalyticsService();

  const onHandleSubmit = async (values: ServiceFormValues) => {
    onClickBtn &&
      onClickBtn({
        isLoading: true,
        currentStep: "testing",
      });

    if (props.formType === "source") {
      setSourceServiceValues(values);
    } else {
      setDestinationServiceValues(values);
    }

    // setErrorStatusRequest(null);

    const connector = props.availableServices.find((item) => Connector.id(item) === values.serviceType);

    const trackAction = (actionType: Action, actionDescription: string) => {
      if (!connector) {
        return;
      }

      const namespace = props.formType === "source" ? Namespace.SOURCE : Namespace.DESTINATION;

      analyticsService.track(namespace, actionType, {
        actionDescription,
        connector: connector?.name,
        connector_definition_id: Connector.id(connector),
      });
    };

    const testConnectorWithTracking = async () => {
      trackAction(Action.TEST, "Test a connector");
      try {
        await testConnector(values);
        trackAction(Action.SUCCESS, "Tested connector - success");
      } catch (e) {
        trackAction(Action.FAILURE, "Tested connector - failure");
        throw e;
      }
    };

    try {
      await testConnectorWithTracking();
      await onSubmit(values);
      setSaved(true);
    } catch (e) {
      // Testing failed and return create from page
      onClickBtn &&
        onClickBtn({
          currentStep: "creating",
          isLoading: false,
          fetchingConnectorError: e,
        });
      // setErrorStatusRequest(e);
    }
  };

  // const job = jobInfo || LogsRequestError.extractJobInfo(errorStatusRequest);

  const useNewUI = true;

  return (
    <Card fullWidth={full} title={useNewUI ? "" : title}>
      <ServiceForm
        {...props}
        errorMessage={props.errorMessage || (error && generateMessageFromError(error))}
        isTestConnectionInProgress={isTestConnectionInProgress}
        onStopTesting={onStopTesting}
        testConnector={testConnector}
        onSubmit={onHandleSubmit}
        onBack={onBack}
        successMessage={
          props.successMessage || (saved && props.isEditMode && <FormattedMessage id="form.changesSaved" />)
        }
      />
      {/* {job && <JobItem job={job} />} */}
    </Card>
  );
};
