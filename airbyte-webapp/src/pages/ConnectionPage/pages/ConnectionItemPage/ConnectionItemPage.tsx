import React, { Suspense, useState } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";

import { LoadingPage, MainPageWithScroll } from "components";
// import HeadTitle from "components/HeadTitle";

import { getFrequencyType } from "config/utils";
import { Action, Namespace } from "core/analytics";
import { ConnectionStatus } from "core/request/AirbyteClient";
import { useAnalyticsService, useTrackPage, PageTrackingCodes } from "hooks/services/Analytics";
import { useGetConnection } from "hooks/services/useConnectionHook";
// import TransformationView from "pages/ConnectionPage/pages/ConnectionItemPage/components/TransformationView";

import ConnectionPageTitle from "./components/ConnectionPageTitle";
import { ReplicationView } from "./components/ReplicationView";
import SettingsView from "./components/SettingsView";
import StatusView from "./components/StatusView";
import { ConnectionSettingsRoutes } from "./ConnectionSettingsRoutes";

const ConnectionItemPage: React.FC = () => {
  const params = useParams<{
    connectionId: string;
    "*": ConnectionSettingsRoutes;
  }>();
  const connectionId = params.connectionId || "";
  const currentStep = params["*"] || ConnectionSettingsRoutes.STATUS;
  const connection = useGetConnection(connectionId);
  const [isStatusUpdating, setStatusUpdating] = useState(false);
  const [isSync, setSyncStatus] = useState<boolean | undefined>(undefined);
  const [disabled, setButtonStatus] = useState<boolean | undefined>(false);
  const [lastSyncTime, setLastSyncTime] = useState<number>();
  const analyticsService = useAnalyticsService();

  useTrackPage(PageTrackingCodes.CONNECTIONS_ITEM);
  const { source, destination } = connection;

  const onAfterSaveSchema = () => {
    analyticsService.track(Namespace.CONNECTION, Action.EDIT_SCHEMA, {
      actionDescription: "Connection saved with catalog changes",
      connector_source: source.sourceName,
      connector_source_definition_id: source.sourceDefinitionId,
      connector_destination: destination.destinationName,
      connector_destination_definition_id: destination.destinationDefinitionId,
      frequency: getFrequencyType(connection.scheduleData?.basicSchedule),
    });
  };

  const isConnectionDeleted = connection.status === ConnectionStatus.deprecated;

  const onSync = () => {
    setSyncStatus(true);
    setButtonStatus(true);
  };

  const afterSync = (disabled?: boolean) => {
    setButtonStatus(disabled);
  };

  const getLastSyncTime = (dateTime?: number) => {
    setLastSyncTime(dateTime);
  };

  return (
    <MainPageWithScroll
      withPadding
      // headTitle={
      //   <HeadTitle
      //     titles={[
      //       { id: "sidebar.connections" },
      //       {
      //         id: "connection.fromTo",
      //         values: {
      //           source: source.name,
      //           destination: destination.name,
      //         },
      //       },
      //     ]}
      //   />
      // }
      // pageTitle={
      //   <ConnectionPageTitle
      //     source={source}
      //     destination={destination}
      //     connection={connection}
      //     currentStep={currentStep}
      //     onStatusUpdating={setStatusUpdating}
      //   />
      // }
    >
      <ConnectionPageTitle
        source={source}
        destination={destination}
        connection={connection}
        currentStep={currentStep}
        onStatusUpdating={setStatusUpdating}
        onSync={onSync}
        disabled={disabled}
        lastSyncTime={lastSyncTime}
      />
      <Suspense fallback={<LoadingPage />}>
        <Routes>
          <Route
            path={ConnectionSettingsRoutes.STATUS}
            element={
              <StatusView
                connection={connection}
                isStatusUpdating={isStatusUpdating}
                isSync={isSync}
                afterSync={afterSync}
                getLastSyncTime={getLastSyncTime}
              />
            }
          />
          <Route
            path={ConnectionSettingsRoutes.CONFIGURATIONS}
            element={<ReplicationView onAfterSaveSchema={onAfterSaveSchema} connectionId={connectionId} />}
          />
          {/* <Route
            path={ConnectionSettingsRoutes.TRANSFORMATION}
            element={<TransformationView connection={connection} />}
          /> */}
          <Route
            path={ConnectionSettingsRoutes.DANGERZONE}
            element={isConnectionDeleted ? <Navigate replace to=".." /> : <SettingsView connection={connection} />}
          />
          <Route index element={<Navigate to={ConnectionSettingsRoutes.STATUS} replace />} />
        </Routes>
      </Suspense>
    </MainPageWithScroll>
  );
};

export default ConnectionItemPage;
