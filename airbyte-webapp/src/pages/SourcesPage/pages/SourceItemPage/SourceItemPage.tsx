import React, { Suspense } from "react"; // useMemo
import { FormattedMessage } from "react-intl";
import { Route, Routes, Navigate } from "react-router-dom";
import styled from "styled-components";

import ApiErrorBoundary from "components/ApiErrorBoundary";
import DeleteBlock from "components/DeleteBlock";
import LoadingPage from "components/LoadingPage";
import { TabMenu, CategoryItem } from "components/TabMenu";

import { useTrackPage, PageTrackingCodes } from "hooks/services/Analytics";
import { useConnectionList } from "hooks/services/useConnectionHook";
import { useGetSource } from "hooks/services/useSourceHook";
import { useDeleteSource } from "hooks/services/useSourceHook";
import useRouter from "hooks/useRouter";
// import { useDestinationDefinitionList } from "services/connector/DestinationDefinitionService";
import SourceDetailsBox from "pages/SourcesPage/pages/SourceItemPage/components/SourceDetailsBox";
import SourceDetailsNav from "pages/SourcesPage/pages/SourceItemPage/components/SourceDetailsNav";
import TableItemTitle from "pages/SourcesPage/pages/SourceItemPage/components/TableItemTitle";
import { useSourceDefinition } from "services/connector/SourceDefinitionService";
import { ConnectorDocumentationWrapper } from "views/Connector/ConnectorDocumentationLayout";

// import { useDestinationList } from "../../../../hooks/services/useDestinationHook";
import { RoutePaths } from "../../../routePaths";
import SourceConnectionTable from "./components/SourceConnectionTable";
import SourceSettings from "./components/SourceSettings";

export interface PageConfig {
  menuConfig: CategoryItem[];
}

interface SettingsPageProps {
  pageConfig?: PageConfig;
}

const Container = styled.div`
  padding: 10px 70px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
`;

const TabContainer = styled.div`
  margin: 20px 0 40px 0;
`;

export const SettingsRoute = {
  Account: "account",
  Destination: "destination",
  Source: "source",
  Configuration: "configuration",
  Notifications: "notifications",
  Metrics: "metrics",
  UserManagement: "user-management",
  AccountSettings: "account-settings",
  PlanAndBilling: "plan-and-billing",
} as const;

const SourceItemPage: React.FC<SettingsPageProps> = ({ pageConfig }) => {
  useTrackPage(PageTrackingCodes.SOURCE_ITEM);
  const { query, push, pathname } = useRouter<{ id: string }, { id: string; "*": string }>(); // params
  // const currentStep = useMemo<string>(() => (params["*"] === "" ? StepsTypes.OVERVIEW : params["*"]), [params]);

  // const { destinations } = useDestinationList();

  // const { destinationDefinitions } = useDestinationDefinitionList();

  const source = useGetSource(query.id);
  const sourceDefinition = useSourceDefinition(source?.sourceDefinitionId);

  const { connections } = useConnectionList();
  const { mutateAsync: deleteSource } = useDeleteSource();

  // const breadcrumbsData = [
  //   {
  //     name: <FormattedMessage id="sidebar.sources" />,
  //     onClick: () => push(".."),
  //   },
  //   { name: source.name },
  // ];

  const connectionsWithSource = connections.filter((connectionItem) => connectionItem.sourceId === source.sourceId);

  // const destinationsDropDownData = useMemo(
  //   () =>
  //     destinations.map((item) => {
  //       const destinationDef = destinationDefinitions.find(
  //         (dd) => dd.destinationDefinitionId === item.destinationDefinitionId
  //       );
  //       return {
  //         label: item.name,
  //         value: item.destinationId,
  //         img: <ConnectorIcon icon={destinationDef?.icon} />,
  //       };
  //     }),
  //   [destinations, destinationDefinitions]
  // );

  // const onSelectStep = (id: string) => {
  //   const path = id === StepsTypes.OVERVIEW ? "." : id.toLowerCase();
  //   push(path);
  // };

  // const onSelect = (data: DropDownRow.IDataItem) => {
  //   const path = `../${RoutePaths.ConnectionNew}`;
  //   const state =
  //     data.value === "create-new-item"
  //       ? { sourceId: source.sourceId }
  //       : {
  //           destinationId: data.value,
  //           sourceId: source.sourceId,
  //         };

  //   push(path, { state });
  // };

  const goBack = () => {
    push(`/${RoutePaths.Source}`);
  };

  const onDelete = async () => {
    // clearFormChange(formId);
    await deleteSource({ connectionsWithSource, source });
  };

  const onCreateClick = () => {
    push(`/${RoutePaths.Destination}/${RoutePaths.SelectDestination}`);
  };

  const menuItems: CategoryItem[] = pageConfig?.menuConfig || [
    {
      routes: [
        {
          path: "status",
          name: <FormattedMessage id="tables.overview" />,
          component: (
            <>
              <TableItemTitle
                onClick={onCreateClick}
                type="source"
                num={connectionsWithSource.length}
                btnText={<FormattedMessage id="destinations.newDestinationTitle" />}
              />
              {connectionsWithSource.length > 0 && <SourceConnectionTable connections={connectionsWithSource} />}
            </>
          ),
          show: true,
        },
        {
          path: "settings",
          name: <FormattedMessage id="tables.settings" />,
          component: <SourceSettings currentSource={source} onBack={goBack} />,
          show: true,
        },
        {
          path: "delete",
          name: <FormattedMessage id="tables.dangerZone" />,
          component: <DeleteBlock type="source" onDelete={onDelete} />,
          show: true,
        },
      ],
    },
  ];

  const onSelectMenuItem = (newPath: string) => push(newPath);
  const firstRoute = (): string => {
    const { routes } = menuItems[0];
    const filteredRoutes = routes.filter((route) => route.show === true);
    if (filteredRoutes.length > 0) {
      return filteredRoutes[0]?.path;
    }
    return "";
  };

  return (
    <Container>
      <SourceDetailsNav name={source.name} linkName="All Sources" goBack={goBack} />
      <ConnectorDocumentationWrapper>
        <SourceDetailsBox name={source.name} icon={sourceDefinition.icon} />
        <TabContainer>
          <TabMenu data={menuItems} onSelect={onSelectMenuItem} activeItem={pathname} />
        </TabContainer>

        <Suspense fallback={<LoadingPage />}>
          <ApiErrorBoundary>
            <Suspense fallback={<LoadingPage />}>
              <Routes>
                {menuItems
                  .flatMap((menuItem) => menuItem.routes)
                  .map(
                    ({ path, component: Component, show }) =>
                      show && <Route key={path} path={path} element={Component} />
                  )}
                <Route path="*" element={<Navigate to={firstRoute()} replace />} />
              </Routes>
            </Suspense>

            {/* <Routes>
              <Route
                path="/settings"
                element={<SourceSettings currentSource={source} connectionsWithSource={connectionsWithSource} />}
              />
              <Route
                index
                element={
                  <>
                    <TableItemTitle
                    type="destination"
                    dropDownData={destinationsDropDownData}
                    onSelect={onSelect}
                    entity={source.sourceName}
                    entityName={source.name}
                    entityIcon={sourceDefinition ? getIcon(sourceDefinition.icon) : null}
                    releaseStage={sourceDefinition.releaseStage}
                  />
                    {connectionsWithSource.length ? (
                      <SourceConnectionTable connections={connectionsWithSource} />
                    ) : (
                      <Placeholder resource={ResourceTypes.Destinations} />
                    )}
                  </>
                }
              />
            </Routes> */}
          </ApiErrorBoundary>
        </Suspense>
      </ConnectorDocumentationWrapper>
    </Container>
  );
};

export default SourceItemPage;
