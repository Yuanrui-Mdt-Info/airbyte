import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import React, { Suspense, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";

import { Button, LoadingPage, MainPageWithScroll, PageTitle } from "components";
import Messagebox from "components/base/MessageBox";
import { EmptyResourceListView } from "components/EmptyResourceListView";
import HeadTitle from "components/HeadTitle";

import { useTrackPage, PageTrackingCodes } from "hooks/services/Analytics";
import { FeatureItem, useFeature } from "hooks/services/Feature";
import { useConnectionList } from "hooks/services/useConnectionHook";
import { useFilteredConnectionList, useConnectionFilterOptions } from "hooks/services/useConnectionHook";
import useRouter from "hooks/useRouter";

import { RoutePaths } from "../../../routePaths";
import ConnectionsTable from "./components/ConnectionsTable";

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

const AllConnectionsPage: React.FC = () => {

  const { push } = useRouter();

  useTrackPage(PageTrackingCodes.CONNECTIONS_LIST);
  const { connections } = useConnectionList();
  const [messageId, setMessageId] = useState<string | undefined>("");

  const CONNECTION_PAGE_SIZE = 10;
  const { push, pathname, query } = useRouter();

  useTrackPage(PageTrackingCodes.CONNECTIONS_LIST);
  const workspace = useCurrentWorkspace();
  const { statusOptions, sourceOptions, destinationOptions } = useConnectionFilterOptions();

  const initialFiltersState = {
    workspaceId: workspace.workspaceId,
    pageSize: CONNECTION_PAGE_SIZE,
    pageCurrent: query.pageCurrent ? JSON.parse(query.pageCurrent) : 1,
    status: statusOptions[0].value,
    sourceDefinitionId: sourceOptions[0].value,
    destinationDefinitionId: destinationOptions[0].value,
  };

  const [filters, setFilters] = useState<FilterConnectionRequestBody>(initialFiltersState);

  const { connections, total, pageSize } = useFilteredConnectionList(filters);

  const onSelectFilter = (
    filterType: "pageCurrent" | "status" | "sourceDefinitionId" | "destinationDefinitionId",
    filterValue: number | string
  ) => {
    if (filterType === "status" || filterType === "sourceDefinitionId" || filterType === "destinationDefinitionId") {
      setFilters({ ...filters, [filterType]: filterValue, pageCurrent: 1 });
    } else if (filterType === "pageCurrent") {
      setFilters({ ...filters, [filterType]: filterValue as number });
    }
  };

  const hasConnections = (): boolean => {
    if (_.isEqual(initialFiltersState, filters) && total === 0) {
      return false;
    }
    return true;
  };

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

  const onCreateClick = () => push(`${RoutePaths.SelectConnection}`); // ConnectionNew

  const onSetMessageId = (id: string) => setMessageId(id);

  return (
    <Suspense fallback={<LoadingPage position="relative" />}>
      {hasConnections() ? (
        <MainPageWithScroll
          // withPadding
          headTitle={<HeadTitle titles={[{ title: "Connections" }]} />}
          pageTitle={
            <>
              <PageTitle
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
              <Messagebox message={messageId} onClose={() => setMessageId("")} />
            </>
          }
        >
          <ConnectionsTable connections={connections} onSetMessageId={onSetMessageId} />
        </MainPageWithScroll>
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
