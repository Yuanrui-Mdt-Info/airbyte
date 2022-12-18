import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import HeadTitle from "components/HeadTitle";
import MainPageWithScroll from "components/MainPageWithScroll";

import { useUser } from "core/AuthContext";
import { GetUpgradeSubscriptionDetail } from "core/domain/payment";
import { ProductItem } from "core/domain/product";
import useRouter from "hooks/useRouter";
import { RoutePaths } from "pages/routePaths";
import { SettingsRoute } from "pages/SettingsPage/SettingsPage";
import { useAuthenticationService } from "services/auth/AuthSpecificationService";
import { useAsyncAction, useUserPlanDetail } from "services/payments/PaymentsService";
import { usePackagesDetail, usePackagesMap } from "services/products/ProductsService";

import PaymentNav from "./components/PaymentNav";
import styles from "./PaymentPage.module.scss";
import BillingPaymentStep from "./steps/BillingPaymentStep";
import SelectPlanStep from "./steps/SelectPlanStep";

const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

const MainView = styled.div`
  width: 100%;
`;

export const PaymentSteps = {
  SelectPlan: "Select Plan",
  BillingPayment: "Billing Payment",
} as const;

const PaymentPage: React.FC = () => {
  const { push } = useRouter();

  const [currentStep, setCurrentStep] = useState<string>(PaymentSteps.SelectPlan);
  const [product, setProduct] = useState<ProductItem | undefined>();
  const [paymentLoading, setPaymentLoading] = useState<boolean>(false);
  const [planDetail, setPlanDetail] = useState<GetUpgradeSubscriptionDetail>();
  const [updatePlanLoading, setUpdatePlanLoading] = useState<boolean>(false);

  const authService = useAuthenticationService();
  const { onCreateSubscriptionURL, onGetUpgradeSubscription, onUpgradeSubscription } = useAsyncAction();

  const { updateUserStatus } = useUser();
  const userPlanDetail = useUserPlanDetail();
  const { selectedProduct } = userPlanDetail;
  const packagesDetail = usePackagesDetail();
  const packagesMap = usePackagesMap();

  useEffect(() => {
    if (selectedProduct) {
      setProduct(selectedProduct);
    }
  }, [selectedProduct]);

  const onSelectPlan = useCallback(async () => {
    setPaymentLoading(true);
    if (selectedProduct) {
      onGetUpgradeSubscription({ productItemId: product?.id as string })
        .then((response: any) => {
          const detail: GetUpgradeSubscriptionDetail = response?.data;
          setPlanDetail(detail);
          setPaymentLoading(false);
          setCurrentStep(PaymentSteps.BillingPayment);
        })
        .catch(() => {
          setPaymentLoading(false);
        });
    } else {
      onCreateSubscriptionURL(product?.id as string)
        .then((response: any) => {
          setPaymentLoading(false);
          window.open(response.data, "_blank");
        })
        .catch(() => {
          setPaymentLoading(false);
        });
    }
  }, [product, selectedProduct]);

  const onUpdadePlan = useCallback(async () => {
    setUpdatePlanLoading(true);
    onUpgradeSubscription()
      .then(() => {
        updateUserStatus?.(2);
        authService
          .get()
          .then(() => {
            setUpdatePlanLoading(false);
            push(`/${RoutePaths.Settings}/${SettingsRoute.PlanAndBilling}`);
          })
          .catch(() => {
            setUpdatePlanLoading(false);
          });
      })
      .catch(() => {
        setUpdatePlanLoading(false);
      });
  }, []);

  return (
    <MainPageWithScroll headTitle={<HeadTitle titles={[{ id: "payment.tabTitle" }]} />}>
      <PaymentNav steps={Object.values(PaymentSteps)} currentStep={currentStep} />
      <Content className={styles.pageContainer}>
        <MainView>
          {currentStep === PaymentSteps.SelectPlan && (
            <SelectPlanStep
              product={product}
              setProduct={setProduct}
              selectedProduct={selectedProduct}
              paymentLoading={paymentLoading}
              productItems={packagesDetail.productItem}
              packagesMap={packagesMap}
              onSelectPlan={onSelectPlan}
            />
          )}
          {currentStep === PaymentSteps.BillingPayment && (
            <BillingPaymentStep
              productPrice={product?.price as number}
              selectedProductPrice={selectedProduct?.price as number}
              planDetail={planDetail}
              onUpdadePlan={onUpdadePlan}
              updatePlanLoading={updatePlanLoading}
            />
          )}
        </MainView>
      </Content>
    </MainPageWithScroll>
  );
};

export default PaymentPage;
