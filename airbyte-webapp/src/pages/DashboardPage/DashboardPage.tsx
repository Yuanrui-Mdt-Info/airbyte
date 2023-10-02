import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

import { LoadingPage } from "components";
const AllDashboardPage = lazy(() => import("./pages/AllDashboardPage"));
export const DashboardPage: React.FC = () => {
  return (
    <Suspense fallback={<LoadingPage position="relative" />}>
      <Routes>
        <Route index element={<AllDashboardPage />} />
      </Routes>
    </Suspense>
  );
};
