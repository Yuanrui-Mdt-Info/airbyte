import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box } from "@mui/material";
import _ from "lodash";
import React, { Suspense, useCallback, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";

import { Button, LoadingPage, MainPageWithScroll, PageTitle, DropDown, DropDownRow } from "components";
import MessageBox from "components/base/MessageBox";
import { EmptyResourceListView } from "components/EmptyResourceListView";
import HeadTitle from "components/HeadTitle";
import { PageSize } from "components/PageSize";
import { Pagination } from "components/Pagination";
import { Separator } from "components/Separator";

import { FilterConnectionRequestBody } from "core/request/DaspireClient";
import { useTrackPage, PageTrackingCodes } from "hooks/services/Analytics";
import { FeatureItem, useFeature } from "hooks/services/Feature";
import { useFilteredConnectionList, useConnectionFilterOptions } from "hooks/services/useConnectionHook";
import { usePageConfig } from "hooks/services/usePageConfig";
import useRouter from "hooks/useRouter";
import { useCurrentWorkspace } from "services/workspaces/WorkspacesService";

import NewConnectionsTable from "./components/NewConnectionsTable";
import { RoutePaths } from "../../../routePaths";

const BtnInnerContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px 4px;
`;

const BtnIcon = styled(FontAwesomeIcon)`
  font-size: 16px;
  margin-right: 10px;
`;

const BtnText = styled.div`
  font-weight: 500;
  font-size: 16px;
  color: #ffffff;
`;

const DDsContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 32px;
`;

const DDContainer = styled.div<{
  margin?: string;
}>`
  width: 216px;
  margin: ${({ margin }) => margin};
`;

const Footer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const AllConnectionsPage: React.FC = () => {
  // const CONNECTION_PAGE_SIZE = 10;
  const { push, pathname, query } = useRouter();
  const [messageId, setMessageId] = useState<string | undefined>("");
  const [pageConfig, updatePageSize] = usePageConfig();
  const [currentPageSize, setCurrentPageSize] = useState<number>(pageConfig.connection.pageSize);

  useTrackPage(PageTrackingCodes.CONNECTIONS_LIST);
  const workspace = useCurrentWorkspace();
  const { statusOptions, sourceOptions, destinationOptions } = useConnectionFilterOptions(workspace.workspaceId);

  const initialFiltersState = {
    workspaceId: workspace.workspaceId,
    pageSize: currentPageSize,
    pageCurrent: query.pageCurrent ? JSON.parse(query.pageCurrent) : 1,
    status: statusOptions[0].value,
    sourceDefinitionId: sourceOptions[0].value,
    destinationDefinitionId: destinationOptions[0].value,
  };

  const [filters, setFilters] = useState<FilterConnectionRequestBody>(initialFiltersState);

  const { connections, total, pageSize } = useFilteredConnectionList(filters);
  // const connectionIds = connections?.map((con: any) => con?.connectionId);
  // const apiData = {
  //   connectionIds,
  // };

  // const { connectionStatusList } = useConnectionStatusList(apiData) || [];

  const onSelectFilter = useCallback(
    (
      filterType: "pageCurrent" | "status" | "sourceDefinitionId" | "destinationDefinitionId" | "pageSize",
      filterValue: number | string
    ) => {
      if (
        filterType === "status" ||
        filterType === "sourceDefinitionId" ||
        filterType === "destinationDefinitionId" ||
        filterType === "pageSize"
      ) {
        setFilters({ ...filters, [filterType]: filterValue, pageCurrent: 1 });
      } else if (filterType === "pageCurrent") {
        setFilters({ ...filters, [filterType]: filterValue as number });
      }
    },
    [filters]
  );

  const hasConnections = useCallback((): boolean => {
    if (_.isEqual(initialFiltersState, filters) && total === 0) {
      return false;
    }
    return true;
  }, [filters, total]);

  const onChangePageSize = useCallback(
    (size: number) => {
      setCurrentPageSize(size);
      updatePageSize("connection", size);
      onSelectFilter("pageSize", size);
    },
    [onSelectFilter]
  );

  useEffect(() => {
    if (hasConnections()) {
      push({ pathname, search: `?pageCurrent=${filters.pageCurrent}` });
    }
  }, [filters.pageCurrent]);

  useEffect(() => {
    if (Object.keys(query).length > 2 && query?.pageCurrent !== undefined) {
      setFilters({ ...filters, pageCurrent: JSON.parse(query.pageCurrent) });
    }
  }, [query]);

  const allowCreateConnection = useFeature(FeatureItem.AllowCreateConnection);

  const onCreateClick = () => push(`${RoutePaths.SelectConnection}`);
  const onSetMessageId = (id: string) => setMessageId(id);

  return (
    <Suspense fallback={<LoadingPage position="relative" />}>
      {hasConnections() ? (
        <>
          <MessageBox message={messageId} onClose={() => setMessageId("")} type="info" position="center" />
          <MainPageWithScroll
            headTitle={<HeadTitle titles={[{ id: "connection.pageTitle" }]} />}
            pageTitle={
              <PageTitle
                withPadding
                title=""
                endComponent={
                  <Button onClick={onCreateClick} disabled={!allowCreateConnection} size="m">
                    <BtnInnerContainer>
                      <BtnIcon icon={faPlus} />
                      <BtnText>
                        <FormattedMessage id="connection.newConnection" />
                      </BtnText>
                    </BtnInnerContainer>
                  </Button>
                }
              />
            }
          >
            <DDsContainer>
              <DDContainer margin="0 24px 0 0">
                <DropDown
                  $withBorder
                  $background="white"
                  value={filters.status}
                  options={statusOptions}
                  onChange={(option: DropDownRow.IDataItem) => onSelectFilter("status", option.value)}
                />
              </DDContainer>
              <DDContainer margin="0 24px 0 0">
                <DropDown
                  $withBorder
                  $background="white"
                  value={filters.sourceDefinitionId}
                  options={sourceOptions}
                  onChange={(option: DropDownRow.IDataItem) => onSelectFilter("sourceDefinitionId", option.value)}
                />
              </DDContainer>
              <DDContainer>
                <DropDown
                  $withBorder
                  $background="white"
                  value={filters.destinationDefinitionId}
                  options={destinationOptions}
                  onChange={(option: DropDownRow.IDataItem) => onSelectFilter("destinationDefinitionId", option.value)}
                />
              </DDContainer>
            </DDsContainer>

            <Separator height="10px" />

            <NewConnectionsTable
              connections={connections as any}
              onSetMessageId={onSetMessageId}
              // connectionStatus={connectionStatusList as any}
            />
            <Separator height="24px" />
            <Footer>
              <PageSize currentPageSize={currentPageSize} totalPage={total / pageSize} onChange={onChangePageSize} />
              <Box paddingLeft="20px">
                <Pagination
                  pages={total / pageSize}
                  value={filters.pageCurrent}
                  onChange={(value: number) => onSelectFilter("pageCurrent", value)}
                />
              </Box>
            </Footer>
            <Separator height="24px" />
          </MainPageWithScroll>
        </>
      ) : (
        <EmptyResourceListView
          resourceType="connections"
          onCreateClick={onCreateClick}
          disableCreateButton={!allowCreateConnection}
        />
      )}
    </Suspense>
  );
};

export default AllConnectionsPage;
