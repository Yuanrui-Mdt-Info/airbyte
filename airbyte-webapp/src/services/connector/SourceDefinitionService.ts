import { useMutation, useQueryClient } from "react-query";

import { useUser } from "core/AuthContext";
import { SourceDefinitionService } from "core/domain/connector/SourceDefinitionService";
import { useDefaultRequestMiddlewares } from "services/useDefaultRequestMiddlewares";
import { useInitService } from "services/useInitService";
import { isDefined } from "utils/common";

import { SourceDefinitionCreate, SourceDefinitionRead } from "../../core/request/AirbyteClient";
import { SCOPE_WORKSPACE } from "../Scope";
import { useSuspenseQuery } from "./useSuspenseQuery";

export const sourceDefinitionKeys = {
  all: [SCOPE_WORKSPACE, "sourceDefinition"] as const,
  lists: () => [...sourceDefinitionKeys.all, "list"] as const,
  detail: (id: string) => [...sourceDefinitionKeys.all, "details", id] as const,
};

function useGetSourceDefinitionService(): SourceDefinitionService {
  const { removeUser } = useUser();
  const requestAuthMiddleware = useDefaultRequestMiddlewares();

  return useInitService(
    () => new SourceDefinitionService(process.env.REACT_APP_API_URL as string, requestAuthMiddleware, removeUser),
    [process.env.REACT_APP_API_URL as string, requestAuthMiddleware, removeUser]
  );
}

export interface SourceDefinitionReadWithLatestTag extends SourceDefinitionRead {
  latestDockerImageTag?: string;
}

const useSourceDefinitionList = (): {
  sourceDefinitions: SourceDefinitionReadWithLatestTag[];
} => {
  const service = useGetSourceDefinitionService();
  const { user } = useUser();

  return useSuspenseQuery(sourceDefinitionKeys.lists(), async () => {
    const [latestDefinition] = await Promise.all([service.listLatestForWorkspace({ workspaceId: user.workspaceId })]);

    const sourceDefinitions = latestDefinition.sourceDefinitions.map((source) => {
      return {
        ...source,
        latestDockerImageTag: undefined,
      };
    });

    return { sourceDefinitions };
  });
};

const useSourceDefinition = <T extends string | undefined>(
  id: T
): T extends string ? SourceDefinitionRead : SourceDefinitionRead | undefined => {
  const service = useGetSourceDefinitionService();

  return useSuspenseQuery(sourceDefinitionKeys.detail(id || ""), () => service.get(id || ""), {
    enabled: isDefined(id),
  });
};

const useCreateSourceDefinition = () => {
  const service = useGetSourceDefinitionService();
  const queryClient = useQueryClient();

  return useMutation<SourceDefinitionRead, Error, SourceDefinitionCreate>(
    (sourceDefinition) => service.create(sourceDefinition),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(
          sourceDefinitionKeys.lists(),
          (oldData: { sourceDefinitions: SourceDefinitionRead[] } | undefined) => ({
            sourceDefinitions: [data, ...(oldData?.sourceDefinitions ?? [])],
          })
        );
      },
    }
  );
};

const useUpdateSourceDefinition = () => {
  const service = useGetSourceDefinitionService();
  const queryClient = useQueryClient();

  return useMutation<
    SourceDefinitionRead,
    Error,
    {
      sourceDefinitionId: string;
      dockerImageTag: string;
    }
  >((sourceDefinition) => service.update(sourceDefinition), {
    onSuccess: (data) => {
      queryClient.setQueryData(sourceDefinitionKeys.detail(data.sourceDefinitionId), data);

      queryClient.setQueryData(
        sourceDefinitionKeys.lists(),
        (oldData: { sourceDefinitions: SourceDefinitionRead[] } | undefined) => ({
          sourceDefinitions:
            oldData?.sourceDefinitions.map((sd) => (sd.sourceDefinitionId === data.sourceDefinitionId ? data : sd)) ??
            [],
        })
      );
    },
  });
};

export { useSourceDefinition, useSourceDefinitionList, useCreateSourceDefinition, useUpdateSourceDefinition };
