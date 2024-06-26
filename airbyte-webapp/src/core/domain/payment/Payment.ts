import { ProductItem } from "../product";

export const PlanItemTypeEnum = {
  Features: "Features",
  Data_Replication: "Data Replication",
  Support: "Support",
} as const;

export type PlanItemType = (typeof PlanItemTypeEnum)[keyof typeof PlanItemTypeEnum];

export interface PlanItem {
  planItemid?: string;
  planItemType?: PlanItemType;
  planItemTypeLang?: string;
  planItemName?: string;
  planItemScope?: string | boolean;
  planItemScopeLang?: string;
}

export interface PlanDetail {
  name?: string;
  expiresTime: number;
  selectedProduct?: ProductItem;
  planDetail?: PlanItem[];
}

export interface UserPlanDetail {
  data: PlanDetail;
}

export interface CreateSunscriptionUrl {
  data: string;
}

export interface GetUpgradeSubscriptionParams {
  cloudPackageId: string;
  testProrationDate?: number;
}

export interface GetUpgradeSubscriptionDetail {
  totalDueToday: number;
  planName: string;
  productItemName: string;
  productItemPrice: number;
  expiresTime: number;
  regions?: any;
  cloudProviderName?: string;
  region?: string;
  instanceSizeName?: string;
  paymentOrderId?: any;
}

export interface GetFailedPaymentDetail extends GetUpgradeSubscriptionDetail {
  paymentOrderId: string;
}

export interface UpgradeSubscription {
  data: GetUpgradeSubscriptionDetail;
}

export interface failedPaymentDetail {
  data: GetFailedPaymentDetail;
}

export interface PauseSubscription {
  data: any;
}
