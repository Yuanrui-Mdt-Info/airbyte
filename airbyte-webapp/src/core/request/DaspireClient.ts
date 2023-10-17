import { WebBackendConnectionRead } from "./AirbyteClient";
import { apiOverride } from "./apiOverride";
import { UserInfo } from "../AuthContext/authenticatedUser";
import {
  UserPlanDetail,
  CreateSunscriptionUrl,
  GetUpgradeSubscriptionParams,
  UpgradeSubscription,
  PauseSubscription,
} from "../domain/payment";
import { ProductItemsList, PackagesDetail } from "../domain/product";
import { RolesList, UpdateRoleRequestBody } from "../domain/role";
import { UsersList, NewUser, NewUserRegisterBody } from "../domain/user";

export interface FilterConnectionRequestBody {
  workspaceId: string;
  pageSize: number;
  pageCurrent: number;
  sourceDefinitionId: string;
  destinationDefinitionId: string;
  status: string;
}
export interface FilterSourceRequestBody {
  workspaceId: string;
  pageSize: number;
  pageCurrent: number;
}

export interface WebBackendFilteredConnectionReadList {
  connections: WebBackendConnectionRead[];
  total: number;
  pageSize: number;
  pageCurrent: number;
}

export const NotificationType = {
  USAGE: "USAGE",
  SYNC_FAIL: "SYNC_FAIL",
  SYNC_SUCCESS: "SYNC_SUCCESS",
  PAYMENT_FAIL: "PAYMENT_FAIL",
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export interface NotificationItem {
  id: string;
  type: NotificationType;
  value: number;
  emailFlag: boolean;
  appsFlag: boolean;
  defaultFlag?: boolean;
}

export interface NotificationSetting {
  usageList: NotificationItem[];
  syncFail: NotificationItem;
  syncSuccess: NotificationItem;
  paymentFail: NotificationItem;
}

export interface NotificationSettingRead {
  data: NotificationSetting;
}

export interface SaveNotificationUsageBody {
  value: number;
  emailFlag: boolean;
  appsFlag: boolean;
}
export interface SaveNotificationUsageRead {
  data: NotificationItem;
}

export interface EditNotificationBody {
  id: string;
  value?: number;
  emailFlag: boolean;
  appsFlag: boolean;
}

export interface EditNotificationRead {
  data: NotificationItem;
}

export interface DeleteNotificationRead {
  data: boolean;
}

export interface IgnoreNotificationBody {
  noPrompt: boolean;
}

export interface IgnoreNotificationRead {
  data: boolean;
}

type SecondParameter<T extends (...args: any) => any> = T extends (config: any, args: infer P) => any ? P : never;

export const userInfo = (options?: SecondParameter<typeof apiOverride>) => {
  return apiOverride<UserInfo>(
    { url: `/user/info`, method: "get", headers: { "Content-Type": "application/json", ...options?.headers } },
    options
  );
};

export const listProducts = (options?: SecondParameter<typeof apiOverride>) => {
  return apiOverride<ProductItemsList>({ url: `/product/item/rows`, method: "get" }, options);
};

export const packagesInfo = (options?: SecondParameter<typeof apiOverride>) => {
  return apiOverride<PackagesDetail>({ url: `/product/package/page/info`, method: "get" }, options);
};

/**
 * @summary payment apis in current Daspire deployment
 */
export const userPlan = (options?: SecondParameter<typeof apiOverride>) => {
  return apiOverride<UserPlanDetail>(
    {
      url: `/user/plan`,
      method: "post",
      headers: { "Content-Type": "application/json" },
    },
    options
  );
};

export const createSubscription = (productItemId: string, options?: SecondParameter<typeof apiOverride>) => {
  return apiOverride<CreateSunscriptionUrl>(
    {
      url: `/sub/create?productItemId=${productItemId}`,
      method: "get",
      headers: { "Content-Type": "application/json" },
    },
    options
  );
};

export const getUpgradeSubscription = (
  params: GetUpgradeSubscriptionParams,
  options?: SecondParameter<typeof apiOverride>
) => {
  return apiOverride<UpgradeSubscription>(
    {
      url: `/sub/get/upgrade?productItemId=${params.productItemId}&testProrationDate=${
        params?.testProrationDate ? params?.testProrationDate : ""
      }`,
      method: "get",
      headers: { "Content-Type": "application/json" },
    },
    options
  );
};

export const upgradeSubscription = (options?: SecondParameter<typeof apiOverride>) => {
  return apiOverride<UpgradeSubscription>(
    {
      url: `/sub/upgrade`,
      method: "post",
      headers: { "Content-Type": "application/json" },
    },
    options
  );
};

export const failedPaymentDetails = (options?: SecondParameter<typeof apiOverride>) => {
  return apiOverride<UpgradeSubscription>(
    {
      url: `/sub/getFailedPaymentDetails?`,
      method: "get",
      headers: { "Content-Type": "application/json" },
    },
    options
  );
};

export const updatePaymentMethod = (paymentOrderId: string, options?: SecondParameter<typeof apiOverride>) => {
  return apiOverride<UpgradeSubscription>(
    {
      url: `/sub/updatePaymentMethod?paymentOrderId=${paymentOrderId}`,
      method: "get",
      headers: { "Content-Type": "application/json" },
    },
    options
  );
};

export const pauseSubscription = (options?: SecondParameter<typeof apiOverride>) => {
  return apiOverride<PauseSubscription>(
    {
      url: `/sub/pause`,
      method: "post",
      headers: { "Content-Type": "application/json" },
    },
    options
  );
};

/**
 * @summary role apis in current Daspire deployment
 */

export const listRoles = (options?: SecondParameter<typeof apiOverride>) => {
  return apiOverride<RolesList>({ url: `/user/management/role/list`, method: "get" }, options);
};

/**
 * @summary user management apis in current Daspire deployment
 */

export const listUser = (options?: SecondParameter<typeof apiOverride>) => {
  return apiOverride<UsersList>({ url: `/user/management/list`, method: "get" }, options);
};

export const addUsers = (users: NewUser[], options?: SecondParameter<typeof apiOverride>) => {
  return apiOverride<UsersList>(
    {
      url: `/user/management/add`,
      method: "post",
      headers: { "Content-Type": "application/json" },
      data: users,
    },
    options
  );
};

export const deleteUser = (userId: string, options?: SecondParameter<typeof apiOverride>) => {
  return apiOverride(
    {
      url: `/user/management/del/${userId}`,
      method: "post",
      headers: { "Content-Type": "application/json" },
    },
    options
  );
};

export const resendInviteToUser = (userId: string, options?: SecondParameter<typeof apiOverride>) => {
  return apiOverride(
    {
      url: `/user/management/resend/${userId}`,
      method: "post",
      headers: { "Content-Type": "application/json" },
    },
    options
  );
};

export const updateUserRole = (
  UpdateRoleBody: UpdateRoleRequestBody,
  options?: SecondParameter<typeof apiOverride>
) => {
  return apiOverride(
    {
      url: `/user/management/edit/role`,
      method: "post",
      headers: { "Content-Type": "application/json" },
      data: UpdateRoleBody,
    },
    options
  );
};

export const updateUserLang = (lang: string, options?: SecondParameter<typeof apiOverride>) => {
  return apiOverride(
    {
      url: `/user/language`,
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": lang,
      },
    },
    options
  );
};

export const registerNewUser = (
  newUserRegisterBody: NewUserRegisterBody,
  options?: SecondParameter<typeof apiOverride>
) => {
  return apiOverride(
    {
      url: `/user/management/register`,
      method: "post",
      headers: { "Content-Type": "application/json" },
      data: newUserRegisterBody,
    },
    options
  );
};

/**
 * @summary Returns all non-deleted connections for a workspace.
 */
export const webBackendListFilteredConnectionsForWorkspace = (
  filterConnectionRequestBody: FilterConnectionRequestBody,
  options?: SecondParameter<typeof apiOverride>
) => {
  return apiOverride<WebBackendFilteredConnectionReadList>(
    {
      url: `/etl/web_backend/connections/page`,
      method: "post",
      headers: { "Content-Type": "application/json" },
      data: filterConnectionRequestBody,
    },
    options
  );
};

/**
 * @summary Returns all filters for connections
 */
export interface KeyValuePair {
  key: string;
  value: string;
}
export type FilterItem = KeyValuePair;
export interface ReadConnectionFilters {
  status: FilterItem[];
  sources: FilterItem[];
  destinations: FilterItem[];
}

export const getConnectionFilterParams = (options?: SecondParameter<typeof apiOverride>) => {
  return apiOverride<ReadConnectionFilters>(
    {
      url: `/etl/web_backend/connections/filter/param`,
      method: "post",
      headers: { "Content-Type": "application/json" },
    },
    options
  );
};

/**
 * @summary Returns notification settings
 */
export const getNotificationSetting = (options?: SecondParameter<typeof apiOverride>) => {
  return apiOverride<NotificationSettingRead>(
    {
      url: `/notification/get`,
      method: "get",
      headers: { "Content-Type": "application/json" },
    },
    options
  );
};

export const createNotificationUsageSetting = (
  saveNotificationUsageBody: SaveNotificationUsageBody,
  options?: SecondParameter<typeof apiOverride>
) => {
  return apiOverride<SaveNotificationUsageRead>(
    {
      url: `/notification/save`,
      method: "post",
      headers: { "Content-Type": "application/json" },
      data: saveNotificationUsageBody,
    },
    options
  );
};

export const editNotificationSetting = (
  editNotificationBody: EditNotificationBody,
  options?: SecondParameter<typeof apiOverride>
) => {
  return apiOverride<EditNotificationRead>(
    {
      url: `/notification/edit`,
      method: "post",
      headers: { "Content-Type": "application/json" },
      data: editNotificationBody,
    },
    options
  );
};

export const deleteNotificationSetting = (
  notificationSettingId: string,
  options?: SecondParameter<typeof apiOverride>
) => {
  return apiOverride<DeleteNotificationRead>(
    {
      url: `/notification/del/${notificationSettingId}`,
      method: "post",
      headers: { "Content-Type": "application/json" },
    },
    options
  );
};

export const ignoreNotification = (
  ignoreNotificationBody: IgnoreNotificationBody,
  options?: SecondParameter<typeof apiOverride>
) => {
  return apiOverride<IgnoreNotificationRead>(
    {
      url: `/notification/ignore`,
      method: "post",
      headers: { "Content-Type": "application/json" },
      data: ignoreNotificationBody,
    },
    options
  );
};
