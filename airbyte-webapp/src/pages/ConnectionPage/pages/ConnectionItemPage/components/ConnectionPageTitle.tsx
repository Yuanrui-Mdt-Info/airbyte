import { faTrash } from "@fortawesome/free-solid-svg-icons";
import React, { useCallback, useMemo } from "react";
import { FormattedMessage } from "react-intl";

import { InfoBox } from "components/InfoBox";
import StepsMenu from "components/StepsMenu";

import { ConnectionStatus, DestinationRead, SourceRead, WebBackendConnectionRead } from "core/request/AirbyteClient";
import useRouter from "hooks/useRouter";

import styles from "./ConnectionPageTitle.module.scss";
import { StatusMainInfo } from "./StatusMainInfo";
import { ConnectionSettingsRoutes } from "../ConnectionSettingsRoutes";

interface ConnectionPageTitleProps {
  source: SourceRead;
  destination: DestinationRead;
  connection: WebBackendConnectionRead;
  currentStep: ConnectionSettingsRoutes;
  onStatusUpdating?: (updating: boolean) => void;
  onSync: () => void;
  disabled?: boolean;
  lastSyncTime?: number;
  healthData?: any;
}

const ConnectionPageTitle: React.FC<ConnectionPageTitleProps> = ({
  source,
  destination,
  connection,
  currentStep,
  disabled,
  lastSyncTime,
  onStatusUpdating,
  onSync,
  healthData,
}) => {
  const { push } = useRouter<{ id: string }>();
  const isConfigurationsStepDisabled = healthData?.connectionUpdate === "INPROGRESS";
  const steps = useMemo(() => {
    const steps = [
      {
        id: ConnectionSettingsRoutes.STATUS,
        name: <FormattedMessage id="sources.status" />,
      },
      {
        id: ConnectionSettingsRoutes.CONFIGURATIONS,
        name: <FormattedMessage id="onboarding.configurations" />,
      },
    ];

    connection.status !== ConnectionStatus.deprecated &&
      steps.push({
        id: ConnectionSettingsRoutes.DANGERZONE,
        name: <FormattedMessage id="tables.dangerZone" />,
      });

    return steps;
  }, [connection.status]);

  const onSelectStep = useCallback(
    (id: string) => {
      if (id === ConnectionSettingsRoutes.STATUS) {
        push("");
      } else if (id === ConnectionSettingsRoutes.CONFIGURATIONS && isConfigurationsStepDisabled) {
        // Prevent navigation if configurations step is disabled
        // You can add a notification or any other behavior to inform the user
        console.log("Configurations step is disabled.");
      } else {
        push(id);
      }
    },
    [push]
  );

  return (
    <div className={styles.container}>
      <StepsMenu lightMode data={steps} onSelect={onSelectStep} activeStep={currentStep} />
      {connection.status === ConnectionStatus.deprecated && (
        <InfoBox className={styles.connectionDeleted} icon={faTrash}>
          <FormattedMessage id="connection.connectionDeletedView" />
        </InfoBox>
      )}

      <div className={styles.statusContainer}>
        <StatusMainInfo
          connection={connection}
          source={source}
          destination={destination}
          onStatusUpdating={onStatusUpdating}
          onSync={onSync}
          disabled={disabled}
          lastSyncTime={lastSyncTime}
        />
      </div>
    </div>
  );
};

export default ConnectionPageTitle;
