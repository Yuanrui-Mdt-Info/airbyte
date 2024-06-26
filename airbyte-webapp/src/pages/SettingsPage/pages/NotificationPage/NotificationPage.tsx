import React, { useMemo, useState, useCallback } from "react";
import { FormattedMessage } from "react-intl";

import { useTrackPage, PageTrackingCodes } from "hooks/services/Analytics";
import useWorkspace, { useCurrentWorkspace, WebhookPayload } from "hooks/services/useWorkspace";

import { Content } from "../SettingsComponents";
import WebHookForm from "./components/WebHookForm";

function useAsyncWithTimeout<K, T>(f: (data: K) => Promise<T>) {
  const [errorMessage, setErrorMessage] = useState<React.ReactNode>(null);
  const [successMessage, setSuccessMessage] = useState<React.ReactNode>(null);
  const call = useCallback(
    async (data: K) => {
      setSuccessMessage(null);
      setErrorMessage(null);
      try {
        await f(data);
        setSuccessMessage(<FormattedMessage id="settings.changeSaved" />);

        setTimeout(() => {
          setSuccessMessage(null);
        }, 2000);
      } catch (e) {
        setErrorMessage(<FormattedMessage id="form.someError" />);

        setTimeout(() => {
          setErrorMessage(null);
        }, 2000);
      }
    },
    [f]
  );

  return {
    call,
    successMessage,
    errorMessage,
  };
}

const NotificationPage: React.FC = () => {
  useTrackPage(PageTrackingCodes.SETTINGS_NOTIFICATION);

  const { updateWebhook, testWebhook } = useWorkspace();
  const workspace = useCurrentWorkspace();

  const {
    call: onSubmitWebhook,
    errorMessage,
    successMessage,
  } = useAsyncWithTimeout(async (data: WebhookPayload) => updateWebhook(data));

  const firstNotification = workspace.notifications?.[0];

  const initialValues = useMemo(
    () => ({
      webhook: firstNotification?.slackConfiguration?.webhook,
      sendOnSuccess: firstNotification?.sendOnSuccess,
      sendOnFailure: firstNotification?.sendOnFailure,
    }),
    [firstNotification]
  );

  return (
    <Content>
      <WebHookForm
        webhook={initialValues}
        onSubmit={onSubmitWebhook}
        onTest={testWebhook}
        errorMessage={errorMessage}
        successMessage={successMessage}
      />
    </Content>
  );
};

export default NotificationPage;
