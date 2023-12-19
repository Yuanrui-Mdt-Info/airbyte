import React, { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

import { LoadingPage } from "components";

const OnBoardingPage = lazy(() => import("./pages/OnBoardingPage"));

export const NewOnBoardingPage: React.FC = () => (
  <Suspense fallback={<LoadingPage position="relative" />}>
    <Routes>
      <Route index element={<OnBoardingPage />} />
    </Routes>
  </Suspense>
);
