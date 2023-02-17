import React, { useEffect, useState } from "react";
import styled from "styled-components";
// import { useParams } from "react-router-dom";

import { theme } from "theme";

import { LoadingPage } from "components";

import { useUser } from "core/AuthContext";
import { getRoleAgainstRoleNumber, ROLES } from "core/Constants/roles";
import { getStatusAgainstStatusNumber, STATUSES } from "core/Constants/statuses";
import useRouter from "hooks/useRouter";
import { UnauthorizedModal } from "pages/ConnectionPage/pages/AllConnectionsPage/components/UnauthorizedModal";
import { UpgradePlanBar } from "pages/ConnectionPage/pages/AllConnectionsPage/components/UpgradePlanBar";
import { RoutePaths } from "pages/routePaths";
import { SettingsRoute } from "pages/SettingsPage/SettingsPage";
import { ResourceNotFoundErrorBoundary } from "views/common/ResorceNotFoundErrorBoundary";
import { StartOverErrorView } from "views/common/StartOverErrorView";
import SideBar from "views/layout/SideBar";
// import { useMainViewContext } from "./mainViewContext";

const MainContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  min-height: 680px;
`;

const Content = styled.div<{
  backgroundColor?: string;
}>`
  background: ${({ backgroundColor }) => backgroundColor};
  overflow-y: auto;
  width: 100%;
  height: 100%;
`;

const MainView: React.FC = (props) => {
  const { user } = useUser();
  const { pathname, push } = useRouter();
  const [backgroundColor, setBackgroundColor] = useState<string>("");
  const [isSidebar, setIsSidebar] = useState<boolean>(true);
  // const { backgroundColor, hasSidebar } = useMainViewContext();
  // const params = useParams<{
  //   connectionId?: string;
  //   id?: string;
  // }>();

  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  const hasSidebarRoutes: string[] = [
    RoutePaths.Source,
    RoutePaths.SelectSource,
    RoutePaths.Connections,
    RoutePaths.Status,
    RoutePaths.SelectConnection,
    RoutePaths.Destination,
    RoutePaths.SelectDestination,
    RoutePaths.UserManagement,
    RoutePaths.AccountSettings,
    RoutePaths.PlanAndBilling,
    RoutePaths.Notifications,
    RoutePaths.Configurations,
    RoutePaths.DangerZone,
  ];
  const blackBackgroundRoutes: string[] = [
    RoutePaths.Source,
    RoutePaths.Connections,
    RoutePaths.Destination,
    RoutePaths.SelectConnection,
    RoutePaths.SelectSource,
    RoutePaths.Status,
    RoutePaths.SelectDestination,
    RoutePaths.UserManagement,
    RoutePaths.Configurations,
    RoutePaths.DangerZone,
  ];

  console.log(pathname);
  console.log(hasSidebarRoutes);

  // console.log(hasSidebarRoutes)

  // console.log(endsWith(pathname))

  const pathnames = pathname.split("/");

  // const isSidebar = hasSidebarRoutes.includes(pathname);
  // const isBlack = blackBackgroundRoutes.includes(pathname);

  // TODO: not the propersolution but works for now
  //  const isSideBar =
  // !pathname.split("/").includes(RoutePaths.Payment) &&
  // !pathname.split("/").includes(RoutePaths.PaymentError) &&
  // !pathname.split("/").includes(RoutePaths.SourceNew) &&
  // !pathname.split("/").includes(RoutePaths.ConnectionNew);

  useEffect(() => {
    const backgroundColorBol: boolean = blackBackgroundRoutes.includes(pathnames[pathnames.length - 1]);
    const isSidebarBol: boolean = hasSidebarRoutes.includes(pathnames[pathnames.length - 1]);
    setIsSidebar(isSidebarBol);
    setBackgroundColor(backgroundColorBol ? theme.backgroundColor : theme.white);
    console.log(`isSidebar---->${isSidebar}`, `backgroundColor------${backgroundColor}`);
  }, [pathname, blackBackgroundRoutes, hasSidebarRoutes]);

  const isUpgradePlanBar = (): boolean => {
    let showUpgradePlanBar = false;
    if (getStatusAgainstStatusNumber(user.status) === STATUSES.Free_Trial) {
      if (!pathname.split("/").includes(RoutePaths.Payment)) {
        showUpgradePlanBar = true;
      }
    }
    return showUpgradePlanBar;
  };

  const onUpgradePlan = () => {
    if (
      getRoleAgainstRoleNumber(user.role) === ROLES.Administrator_Owner ||
      getRoleAgainstRoleNumber(user.role) === ROLES.Administrator
    ) {
      push(`/${RoutePaths.Settings}/${SettingsRoute.PlanAndBilling}`);
    } else {
      setIsAuthorized(true);
    }
  };

  return (
    <MainContainer>
      {isSidebar && <SideBar />}
      <Content backgroundColor={backgroundColor}>
        <ResourceNotFoundErrorBoundary errorComponent={<StartOverErrorView />}>
          <React.Suspense fallback={<LoadingPage />}>
            {isAuthorized && <UnauthorizedModal onClose={() => setIsAuthorized(false)} />}
            {isUpgradePlanBar() && <UpgradePlanBar onUpgradePlan={onUpgradePlan} />}
            {props.children}
          </React.Suspense>
        </ResourceNotFoundErrorBoundary>
      </Content>
    </MainContainer>
  );
};

export default MainView;
