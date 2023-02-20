import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { Suspense, useState } from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";

import { Button, LoadingPage, MainPageWithScroll, PageTitle } from "components";
import Messagebox from "components/base/MessageBox";
import { EmptyResourceListView } from "components/EmptyResourceListView";
import HeadTitle from "components/HeadTitle";

import { useTrackPage, PageTrackingCodes } from "hooks/services/Analytics";
import { FeatureItem, useFeature } from "hooks/services/Feature";
import { useConnectionList } from "hooks/services/useConnectionHook";
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

  const allowCreateConnection = useFeature(FeatureItem.AllowCreateConnection);

  const onCreateClick = () => push(`${RoutePaths.SelectConnection}`); // ConnectionNew

  const onSetMessageId = (id: string) => setMessageId(id);

  return (
    <Suspense fallback={<LoadingPage />}>
      {connections.length ? (
        <MainPageWithScroll
          withPadding
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
