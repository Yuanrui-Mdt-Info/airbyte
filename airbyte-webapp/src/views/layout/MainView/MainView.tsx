import React, { useEffect, useState } from "react";
import styled from "styled-components";
// import { useParams } from "react-router-dom";

import { theme } from "theme";

import { LoadingPage } from "components";
import { CreateStepTypes } from "components/ConnectionStep";

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

const MainContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  min-height: 680px;
`;

const Content = styled.div<{
  isBlack?: boolean;
}>`
  background: ${({ isBlack }) => (isBlack ? theme.backgroundColor : theme.white)};
  overflow-y: auto;
  width: 100%;
  height: 100%;
`;

const hasCurrentStep = (state: unknown): state is { currentStep: string } => {
  return (
    typeof state === "object" && state !== null && typeof (state as { currentStep?: string }).currentStep === "string"
  );
};

const MainView: React.FC = (props) => {
  const { user } = useUser();
  const { pathname, push, location } = useRouter();
  const [isSidebar, setIsSidebar] = useState<boolean>(true);
  const [isBlack, setIsBlack] = useState<boolean>(false);
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
  ];

  // TODO: not the propersolution but works for now
  //  const isSideBar =
  // !pathname.split("/").includes(RoutePaths.Payment) &&
  // !pathname.split("/").includes(RoutePaths.PaymentError) &&
  // !pathname.split("/").includes(RoutePaths.SourceNew) &&
  // !pathname.split("/").includes(RoutePaths.ConnectionNew);

  useEffect(() => {
    const pathnames = pathname.split("/");
    const lastPathName = pathnames[pathnames.length - 1];
    let isSidebarBol = false;
    if (lastPathName === RoutePaths.DangerZone) {
      isSidebarBol = pathnames.includes(RoutePaths.Connections);
    } else if (lastPathName === RoutePaths.ConnectionNew) {
      if (hasCurrentStep(location.state) && location.state.currentStep === CreateStepTypes.CREATE_CONNECTION) {
        setIsBlack(true);
        isSidebarBol = false;
      } else {
        setIsBlack(false);
      }
    } else {
      isSidebarBol = hasSidebarRoutes.includes(lastPathName);
    }

    setIsSidebar(isSidebarBol);
  }, [pathname, hasSidebarRoutes]);

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
      <Content isBlack={isBlack || isSidebar}>
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
