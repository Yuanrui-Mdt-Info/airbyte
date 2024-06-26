import { useMemo } from "react";
import { useMutation } from "react-query";

import { useUser } from "core/AuthContext";
import { ConnectionConfiguration } from "core/domain/connection";
import { Connector } from "core/domain/connector";
import { DestinationService } from "core/domain/connector/DestinationService";
import { SourceService } from "core/domain/connector/SourceService";
import {
  useDestinationDefinitionList,
  useUpdateDestinationDefinition,
} from "services/connector/DestinationDefinitionService";
import { useSourceDefinitionList, useUpdateSourceDefinition } from "services/connector/SourceDefinitionService";
import { useDefaultRequestMiddlewares } from "services/useDefaultRequestMiddlewares";
import { useInitService } from "services/useInitService";

import { CheckConnectionRead } from "../../core/request/AirbyteClient";

interface ConnectorService {
  hasNewVersions: boolean;
  hasNewSourceVersion: boolean;
  hasNewDestinationVersion: boolean;
  countNewSourceVersion: number;
  countNewDestinationVersion: number;
  updateAllSourceVersions: () => Promise<void>;
  updateAllDestinationVersions: () => Promise<void>;
}

const useConnector = (): ConnectorService => {
  const { sourceDefinitions } = useSourceDefinitionList();
  const { destinationDefinitions } = useDestinationDefinitionList();

  const { mutateAsync: updateSourceDefinition } = useUpdateSourceDefinition();
  const { mutateAsync: updateDestinationDefinition } = useUpdateDestinationDefinition();

  const newSourceDefinitions = useMemo(() => sourceDefinitions.filter(Connector.hasNewerVersion), [sourceDefinitions]);

  const newDestinationDefinitions = useMemo(
    () => destinationDefinitions.filter(Connector.hasNewerVersion),
    [destinationDefinitions]
  );

  const updateAllSourceVersions = async () => {
    await Promise.all(
      newSourceDefinitions?.map((item) =>
        updateSourceDefinition({
          sourceDefinitionId: item.sourceDefinitionId,
          dockerImageTag: item.latestDockerImageTag ?? "",
        })
      )
    );
  };

  const updateAllDestinationVersions = async () => {
    await Promise.all(
      newDestinationDefinitions?.map((item) =>
        updateDestinationDefinition({
          destinationDefinitionId: item.destinationDefinitionId,
          dockerImageTag: item.latestDockerImageTag ?? "",
        })
      )
    );
  };

  const hasNewSourceVersion = newSourceDefinitions.length > 0;
  const hasNewDestinationVersion = newDestinationDefinitions.length > 0;
  const hasNewVersions = hasNewSourceVersion || hasNewDestinationVersion;

  return {
    hasNewVersions,
    hasNewSourceVersion,
    hasNewDestinationVersion,
    updateAllSourceVersions,
    updateAllDestinationVersions,
    countNewSourceVersion: newSourceDefinitions.length,
    countNewDestinationVersion: newDestinationDefinitions.length,
  };
};

function useGetDestinationService(): DestinationService {
  const { removeUser } = useUser();
  const requestAuthMiddleware = useDefaultRequestMiddlewares();

  return useInitService(
    () => new DestinationService(process.env.REACT_APP_API_URL as string, requestAuthMiddleware, removeUser),
    [process.env.REACT_APP_API_URL as string, requestAuthMiddleware]
  );
}

function useGetSourceService(): SourceService {
  const { removeUser } = useUser();
  const requestAuthMiddleware = useDefaultRequestMiddlewares();

  return useInitService(
    () => new SourceService(process.env.REACT_APP_API_URL as string, requestAuthMiddleware, removeUser),
    [process.env.REACT_APP_API_URL as string, requestAuthMiddleware]
  );
}

export type CheckConnectorParams = { signal: AbortSignal } & (
  | { selectedConnectorId: string; workspaceId?: any }
  | {
      selectedConnectorId: string;
      name: string;
      connectionConfiguration: ConnectionConfiguration;
      workspaceId?: any;
    }
  | {
      selectedConnectorDefinitionId: string;
      connectionConfiguration: ConnectionConfiguration;
      workspaceId?: any;
    }
);

export const useCheckConnector = (formType: "source" | "destination") => {
  const destinationService = useGetDestinationService();
  const sourceService = useGetSourceService();

  return useMutation<CheckConnectionRead, Error, CheckConnectorParams>(async (params: CheckConnectorParams) => {
    const payload: Record<string, unknown> = {};

    if ("connectionConfiguration" in params) {
      payload.connectionConfiguration = params.connectionConfiguration;
    }

    if ("name" in params) {
      payload.name = params.name;
    }

    if (formType === "destination") {
      if ("selectedConnectorId" in params) {
        payload.destinationId = params.selectedConnectorId;
      }
      if ("workspaceId" in params) {
        payload.workspaceId = params.workspaceId;
      }
      if ("selectedConnectorDefinitionId" in params) {
        payload.destinationDefinitionId = params.selectedConnectorDefinitionId;
      }

      return await destinationService.check_connection(payload, {
        signal: params.signal,
      });
    }

    if ("selectedConnectorId" in params) {
      payload.sourceId = params.selectedConnectorId;
    }
    if ("workspaceId" in params) {
      payload.workspaceId = params.workspaceId;
    }
    if ("selectedConnectorDefinitionId" in params) {
      payload.sourceDefinitionId = params.selectedConnectorDefinitionId;
    }

    return await sourceService.check_connection(payload, {
      signal: params.signal,
    });
  });
};

export default useConnector;
