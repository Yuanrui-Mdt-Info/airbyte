import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import { useUpdateEffect } from "react-use";
import styled from "styled-components";

import { Switch } from "components";

import { Action, Namespace } from "core/analytics";
import { buildConnectionUpdate } from "core/domain/connection";
import { useAnalyticsService } from "hooks/services/Analytics";
import { useUpdateConnection } from "hooks/services/useConnectionHook";
import { UpdateStatusError } from "pages/ConnectionPage/pages/AllConnectionsPage/components/UpdateStatusError";

import { ConnectionStatus, WebBackendConnectionRead } from "../../../../../core/request/AirbyteClient";

const ToggleLabel = styled.label`
  //text-transform: uppercase;
  font-size: 15px;
  line-height: 19px;
  font-weight: 500;
  color: ${({ theme }) => theme.black};
  display: inline-block;
  text-align: right;
  cursor: pointer;
  margin-left: 12px;
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d1d5db;
  width: 100%;
  height: 40px;
  border-radius: 6px;

  &:hover {
    box-shadow: 0 1px 3px rgba(53, 53, 66, 0.2), 0 1px 2px rgba(53, 53, 66, 0.12), 0 1px 1px rgba(53, 53, 66, 0.14);
  }
`;

interface EnabledControlProps {
  connection: WebBackendConnectionRead;
  disabled?: boolean;
  frequencyType?: string;
  onStatusUpdating?: (updating: boolean) => void;
}

const EnabledControl: React.FC<EnabledControlProps> = ({ connection, disabled, frequencyType, onStatusUpdating }) => {
  const { mutateAsync: updateConnection, isLoading } = useUpdateConnection();
  const [statusCode, setStatusCode] = useState<number | undefined>(200);
  const [enabledStatus, setEnabledStatus] = useState<string>(connection.status);
  const analyticsService = useAnalyticsService();

  const onChangeStatus = async () => {
    setStatusCode(undefined);
    const _status = connection.status === ConnectionStatus.active ? ConnectionStatus.inactive : ConnectionStatus.active;
    try {
      await updateConnection(
        buildConnectionUpdate(connection, {
          status: _status,
        })
      );
      setEnabledStatus(_status);
      const trackableAction = connection.status === ConnectionStatus.active ? Action.DISABLE : Action.REENABLE;

      analyticsService.track(Namespace.CONNECTION, trackableAction, {
        actionDescription: `${trackableAction} connection`,
        connector_source: connection.source?.sourceName,
        connector_source_definition_id: connection.source?.sourceDefinitionId,
        connector_destination: connection.destination?.destinationName,
        connector_destination_definition_id: connection.destination?.destinationDefinitionId,
        frequency: frequencyType,
      });
    } catch (err) {
      setEnabledStatus(connection.status);

      setStatusCode(708);
    }
  };

  useUpdateEffect(() => {
    onStatusUpdating?.(isLoading);
  }, [isLoading]);

  return (
    <>
      <UpdateStatusError statusCode={statusCode} />
      <Content
        onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          onChangeStatus();
          e.preventDefault();
        }}
      >
        <Switch
          swithSize="medium"
          disabled={disabled}
          checked={enabledStatus === ConnectionStatus.active}
          loading={isLoading}
          key={`enabled-${enabledStatus}`}
          id="toggle-enabled-source"
        />
        <ToggleLabel htmlFor="toggle-enabled-source">
          <FormattedMessage id={enabledStatus === ConnectionStatus.active ? "tables.enabled" : "tables.disabled"} />
        </ToggleLabel>
      </Content>
    </>
  );
};

export default EnabledControl;
