import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import { LoadingPage } from "components";

import SelectConnectionCard from "pages/ConnectionPage/pages/CreationFormPage/SelectConnectionPage";
import { ResourceNotFoundErrorBoundary } from "views/common/ResorceNotFoundErrorBoundary";
import { StartOverErrorView } from "views/common/StartOverErrorView";

import { RoutePaths } from "../routePaths";
import AllConnectionsPage from "./pages/AllConnectionsPage";
import ConnectionItemPage from "./pages/ConnectionItemPage";
import { CreationFormPage } from "./pages/CreationFormPage/CreationFormPage";

export const ConnectionPage: React.FC = () => (
  <Suspense fallback={<LoadingPage position="relative" />}>
    <Routes>
      <Route path={RoutePaths.ConnectionNew} element={<CreationFormPage />} />
      <Route path={RoutePaths.SelectConnection} element={<SelectConnectionCard />} />
      <Route
        path=":connectionId/*"
        element={
          <ResourceNotFoundErrorBoundary errorComponent={<StartOverErrorView />}>
            <ConnectionItemPage />
          </ResourceNotFoundErrorBoundary>
        }
      />
      <Route index element={<AllConnectionsPage />} />
    </Routes>
  </Suspense>
);
