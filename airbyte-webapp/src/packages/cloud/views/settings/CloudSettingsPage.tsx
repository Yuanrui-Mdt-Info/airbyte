import React, { useMemo } from "react";
import { FormattedMessage } from "react-intl";

import { AccountSettingsView } from "packages/cloud/views/users/AccountSettingsView";
import { UsersSettingsView } from "packages/cloud/views/users/UsersSettingsView";
import { WorkspaceSettingsView } from "packages/cloud/views/workspaces/WorkspaceSettingsView";
import { SettingsPage } from "pages/SettingsPage";
import {
  DestinationsPage as SettingsDestinationPage,
  SourcesPage as SettingsSourcesPage,
} from "pages/SettingsPage/pages/ConnectorsPage";
import NotificationPage from "pages/SettingsPage/pages/NotificationPage";
import { PageConfig, SettingsRoute } from "pages/SettingsPage/SettingsPage";

const CloudSettingsRoutes = {
  Configuration: SettingsRoute.Configuration,
  Notifications: SettingsRoute.Notifications,
  Account: SettingsRoute.Account,
  Source: SettingsRoute.Source,
  Destination: SettingsRoute.Destination,

  Workspace: "workspaces",
  AccessManagement: "access-management",
} as const;

export const CloudSettingsPage: React.FC = () => {
  const pageConfig = useMemo<PageConfig>(
    () => ({
      menuConfig: [
        {
          category: <FormattedMessage id="settings.userSettings" />,
          routes: [
            {
              path: CloudSettingsRoutes.Account,
              name: <FormattedMessage id="settings.account" />,
              component: AccountSettingsView,
            },
          ],
        },
        {
          category: <FormattedMessage id="settings.workspaceSettings" />,
          routes: [
            {
              path: CloudSettingsRoutes.Workspace,
              name: <FormattedMessage id="settings.generalSettings" />,
              component: WorkspaceSettingsView,
              id: "workspaceSettings.generalSettings",
            },
            {
              path: CloudSettingsRoutes.Source,
              name: <FormattedMessage id="tables.sources" />,
              component: SettingsSourcesPage,
            },
            {
              path: CloudSettingsRoutes.Destination,
              name: <FormattedMessage id="tables.destinations" />,
              component: SettingsDestinationPage,
            },
            {
              path: CloudSettingsRoutes.AccessManagement,
              name: <FormattedMessage id="settings.accessManagementSettings" />,
              component: UsersSettingsView,
              id: "workspaceSettings.accessManagementSettings",
            },
            {
              path: CloudSettingsRoutes.Notifications,
              name: <FormattedMessage id="settings.notifications" />,
              component: NotificationPage,
            },
          ],
        },
      ],
    }),
    []
  );

  return <SettingsPage pageConfig={pageConfig} />;
};
