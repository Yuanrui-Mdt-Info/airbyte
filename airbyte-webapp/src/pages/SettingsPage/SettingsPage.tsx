import React, { Suspense } from "react";
import { FormattedMessage } from "react-intl";
import { Navigate, Route, Routes } from "react-router-dom";
import styled from "styled-components";

import HeadTitle from "components/HeadTitle";
import LoadingPage from "components/LoadingPage";
import MainPageWithScroll from "components/MainPageWithScroll";
import PageTitle from "components/PageTitle";
import { CategoryItem } from "components/SideMenu/SideMenu";
import TabMenu from "components/TabMenu";

// import useConnector from "hooks/services/useConnector";
import useRouter from "hooks/useRouter";

import AccountSettingsPage from "./pages/AccountSettingsPage";
import PlansBillingPage from "./pages/PlansBillingPage";
import UserManagementPage from "./pages/UserManagementPage";

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: transparent;
  display: flex;
  flex-direction: row;
`;

const Seperator = styled.div`
  width: 10px;
  background: transparent;
  min-height: 100vh;
`;

const ContentContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: white;
  padding: 26px;
`;

const TabContainer = styled.div`
  margin: 20px 0 40px 0;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

const MainView = styled.div`
  width: 100%;
`;

export interface PageConfig {
  menuConfig: CategoryItem[];
}

interface SettingsPageProps {
  pageConfig?: PageConfig;
}

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

const SettingsPage: React.FC<SettingsPageProps> = ({ pageConfig }) => {
  const { push, pathname } = useRouter();
  // const { countNewSourceVersion, countNewDestinationVersion } = useConnector();

  const menuItems: CategoryItem[] = pageConfig?.menuConfig || [
    {
      routes: [
        // {
        //   path: `${SettingsRoute.Destination}`,
        //   name: <FormattedMessage id="tables.destinations" />,
        //   indicatorCount: countNewDestinationVersion,
        //   component: DestinationsPage,
        // },
        // {
        {
          path: `${SettingsRoute.UserManagement}`,
          name: <FormattedMessage id="settings.user.management" />,
          component: UserManagementPage,
        },
        {
          path: `${SettingsRoute.AccountSettings}`,
          name: <FormattedMessage id="settings.account.settings" />,
          component: AccountSettingsPage,
        },
        {
          path: `${SettingsRoute.PlanAndBilling}`,
          name: <FormattedMessage id="settings.plan.billing" />,
          component: PlansBillingPage,
        },
      ],
    },
  ];

  const onSelectMenuItem = (newPath: string) => push(newPath);
  const firstRoute = menuItems[0].routes?.[0]?.path;

  return (
    <PageContainer>
      <Seperator />
      <ContentContainer>
        <MainPageWithScroll
          withPadding
          headTitle={<HeadTitle titles={[{ id: "sidebar.settings" }]} />}
          pageTitle={
            <div style={{ padding: "0 0 0 20px" }}>
              <PageTitle title={<FormattedMessage id="sidebar.settings" />} />
            </div>
          }
        >
          <Content>
            <TabContainer>
              <TabMenu data={menuItems} onSelect={onSelectMenuItem} activeItem={pathname} />
            </TabContainer>
            <MainView>
              <Suspense fallback={<LoadingPage />}>
                <Routes>
                  {menuItems
                    .flatMap((menuItem) => menuItem.routes)
                    .map(({ path, component: Component }) => (
                      <Route key={path} path={path} element={<Component />} />
                    ))}

                  <Route path="*" element={<Navigate to={firstRoute} replace />} />
                </Routes>
              </Suspense>
            </MainView>
          </Content>
        </MainPageWithScroll>
      </ContentContainer>
    </PageContainer>
  );
};

export default SettingsPage;
