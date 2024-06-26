import { AirbyteRequestService } from "core/request/AirbyteRequestService";
import { CommonRequestError } from "core/request/CommonRequestError";
import { FilterSourceItemRequestBody, FilterSourceRequestBody } from "core/request/DaspireClient";
import { LogsRequestError } from "core/request/LogsRequestError";

import {
  CheckConnectionRead,
  CheckConnectionReadStatus,
  checkConnectionToSource,
  checkConnectionToSourceForUpdate,
  createSource,
  deleteSource,
  cloneSource,
  discoverSchemaForSource,
  executeSourceCheckConnection,
  getSource,
  listSourcesForWorkspace,
  SourceCoreConfig,
  SourceCreate,
  SourceUpdate,
  updateSource,
  SourceCloneRequestBody,
  paginatedSources,
  getSingleSourceItem,
} from "../../request/AirbyteClient";
import { ConnectionConfiguration } from "../connection";

export class SourceService extends AirbyteRequestService {
  public async check_connection(
    params: {
      sourceId?: string;
      sourceDefinitionId?: string;
      connectionConfiguration?: ConnectionConfiguration;
      workspaceId?: any;
    },
    requestParams?: RequestInit
  ) {
    let result: CheckConnectionRead;
    if (!params.sourceId) {
      result = await executeSourceCheckConnection(params as SourceCoreConfig, {
        ...this.requestOptions,
        signal: requestParams?.signal,
      });
    } else if (params.connectionConfiguration || params.sourceDefinitionId) {
      result = await checkConnectionToSourceForUpdate(params as SourceUpdate, {
        ...this.requestOptions,
        signal: requestParams?.signal,
      });
    } else {
      result = await checkConnectionToSource(
        { sourceId: params.sourceId },
        { ...this.requestOptions, signal: requestParams?.signal }
      );
    }

    if (result.status === CheckConnectionReadStatus.failed) {
      const jobInfo = {
        ...result.jobInfo,
        status: result.status,
      };

      throw new LogsRequestError(jobInfo, result.message);
    }

    return result;
  }

  public get(sourceId: string) {
    return getSource({ sourceId }, this.requestOptions);
  }
  public getSingleSource(filters: FilterSourceItemRequestBody) {
    return getSingleSourceItem(filters, this.requestOptions);
  }
  public list(workspaceId: string) {
    return listSourcesForWorkspace({ workspaceId }, this.requestOptions);
  }
  public filteredList(filters: FilterSourceRequestBody) {
    return paginatedSources(filters, this.requestOptions);
  }

  public create(body: SourceCreate) {
    return createSource(body, this.requestOptions);
  }

  public update(body: SourceUpdate) {
    return updateSource(body, this.requestOptions);
  }

  public delete(sourceId: string) {
    return deleteSource({ sourceId }, this.requestOptions);
  }

  public clone(sourceCloneData: SourceCloneRequestBody) {
    return cloneSource(sourceCloneData, this.requestOptions);
  }

  public async discoverSchema(sourceId: string, disableCache?: boolean) {
    const result = await discoverSchemaForSource({ sourceId, disable_cache: disableCache }, this.requestOptions);

    if (!result?.jobInfo?.succeeded || !result.catalog) {
      // @ts-expect-error TODO: address this case
      const e = result?.jobInfo?.logs ? new LogsRequestError(result?.jobInfo) : new CommonRequestError(result);
      // Generate error with failed status and received logs
      e._status = 400;
      // @ts-expect-error address this case
      e.response = result?.jobInfo;
      throw e;
    }

    return {
      catalog: result?.catalog,
      jobInfo: result?.jobInfo,
      catalogId: result?.catalogId,
      id: sourceId,
    };
  }
}
