// import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useIntl } from "react-intl";
import { Link } from "react-router-dom";

import ConnectorCard from "components/ConnectorCard";
import { RightArrowIcon } from "components/icons/RightArrowIcon";

import { getFrequencyType } from "config/utils";
import { ConnectionStatus, SourceRead, DestinationRead, WebBackendConnectionRead } from "core/request/AirbyteClient";
import { FeatureItem, useFeature } from "hooks/services/Feature";
import { RoutePaths } from "pages/routePaths";
import { useDestinationDefinition } from "services/connector/DestinationDefinitionService";
import { useSourceDefinition } from "services/connector/SourceDefinitionService";

import EnabledControl from "./EnabledControl";
import styles from "./StatusMainInfo.module.scss";
import SyncNowButton from "./SyncNowButton";

interface StatusMainInfoProps {
  connection: WebBackendConnectionRead;
  source: SourceRead;
  destination: DestinationRead;
  disabled?: boolean;
  lastSyncTime?: number;
  onStatusUpdating?: (updating: boolean) => void;
  onSync: () => void;
}

const lastSyncTimeFormat = (time?: number): string => {
  if (!time && typeof time !== "number") {
    return "";
  }
  const months: string[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
  const date: Date = new Date(time * 1000);
  const day: string = date.getDate() > 9 ? `${date.getDate()}` : `0${date.getDate()}`;
  const month: number = date.getMonth();
  const year: number = date.getFullYear();
  const hour: string = date.getHours() > 9 ? `${date.getHours()}` : `0${date.getHours()}`;
  const minute: string = date.getMinutes() > 9 ? `${date.getMinutes()}` : `0${date.getMinutes()}`;

  return `${hour}:${minute} UTC ${day}-${months[month]}-${year}`;
};

export const StatusMainInfo: React.FC<StatusMainInfoProps> = ({
  onStatusUpdating,
  onSync,
  connection,
  source,
  destination,
  disabled,
  lastSyncTime,
}) => {
  const sourceDefinition = useSourceDefinition(source.sourceDefinitionId);
  const destinationDefinition = useDestinationDefinition(destination.destinationDefinitionId);
  const { formatMessage } = useIntl();

  const allowSync = useFeature(FeatureItem.AllowSync);

  const sourceConnectionPath = `../../${RoutePaths.Source}/${source.sourceId}`;
  const destinationConnectionPath = `../../${RoutePaths.Destination}/${destination.destinationId}`;

  const lastSyncTimeText = `${formatMessage({ id: "sources.lastSync" })} ${lastSyncTimeFormat(lastSyncTime)} `;

  return (
    <div className={styles.container}>
      <div className={styles.leftContainer}>
        <div className={styles.pathContainer}>
          <Link to={sourceConnectionPath} className={styles.connectorLink}>
            <ConnectorCard
              connectionName={source.sourceName}
              icon={sourceDefinition?.icon}
              connectorName={source.name}
              releaseStage={sourceDefinition?.releaseStage}
            />
          </Link>
          {/* <FontAwesomeIcon icon={faArrowRight} /> */}
          <RightArrowIcon />
          <Link to={destinationConnectionPath} className={styles.connectorLink}>
            <ConnectorCard
              connectionName={destination.destinationName}
              icon={destinationDefinition?.icon}
              connectorName={destination.name}
              releaseStage={destinationDefinition?.releaseStage}
            />
          </Link>
        </div>
        <div className={styles.syncDate}>{lastSyncTimeText}</div>
      </div>
      {connection.status !== ConnectionStatus.deprecated && (
        <div className={styles.enabledControlContainer}>
          <EnabledControl
            onStatusUpdating={onStatusUpdating}
            disabled={!allowSync}
            connection={connection}
            frequencyType={getFrequencyType(connection.scheduleData?.basicSchedule)}
          />
          {connection.status === ConnectionStatus.active && <SyncNowButton onSync={onSync} disabled={disabled} />}
        </div>
      )}
    </div>
  );
};
