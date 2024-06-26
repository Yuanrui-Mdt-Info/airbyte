import { useQuery } from "react-query";

import { useUser } from "core/AuthContext";
import { DestinationDefinitionSpecificationService } from "core/domain/connector/DestinationDefinitionSpecificationService";
import { useDefaultRequestMiddlewares } from "services/useDefaultRequestMiddlewares";
import { useInitService } from "services/useInitService";
import { useCurrentWorkspace } from "services/workspaces/WorkspacesService";
import { isDefined } from "utils/common";

import { DestinationDefinitionSpecificationRead } from "../../core/request/AirbyteClient";
import { SCOPE_WORKSPACE } from "../Scope";
import { useSuspenseQuery } from "./useSuspenseQuery";

export const destinationDefinitionSpecificationKeys = {
  all: [SCOPE_WORKSPACE, "destinationDefinitionSpecification"] as const,
  detail: (id: string | number) => [...destinationDefinitionSpecificationKeys.all, "details", id] as const,
};

function useGetService() {
  const requestAuthMiddleware = useDefaultRequestMiddlewares();
  const { removeUser } = useUser();

  return useInitService(
    () =>
      new DestinationDefinitionSpecificationService(
        process.env.REACT_APP_API_URL as string,
        requestAuthMiddleware,
        removeUser
      ),
    [process.env.REACT_APP_API_URL as string, requestAuthMiddleware]
  );
}

export const useGetDestinationDefinitionSpecification = (id: string): DestinationDefinitionSpecificationRead => {
  const service = useGetService();
  const { workspaceId } = useCurrentWorkspace();

  return useSuspenseQuery(destinationDefinitionSpecificationKeys.detail(id), () => service.get(id, workspaceId));
};

export const useGetDestinationDefinitionSpecificationAsync = (id: string | null) => {
  const service = useGetService();
  const { workspaceId } = useCurrentWorkspace();

  const escapedId = id ?? "";
  return useQuery(destinationDefinitionSpecificationKeys.detail(escapedId), () => service.get(escapedId, workspaceId), {
    enabled: isDefined(id),
  });
};
