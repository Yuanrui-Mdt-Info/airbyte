import { Field, FieldProps, Formik } from "formik";
import React, { useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import * as yup from "yup";

import { LabeledInput, Link, LoadingButton } from "components";

import { useConfig } from "config";

import { BottomBlock, FieldItem, Form, RowFieldItem } from "../../components/FormComponents";
import styles from "./SignupForm.module.scss";

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const FirstNameField: React.FC = () => {
  const { formatMessage } = useIntl();

  return (
    <Field name="firstName">
      {({ field, meta }: FieldProps<string>) => (
        <LabeledInput
          {...field}
          label={<FormattedMessage id="user.signup.firstName" />}
          type="text"
          error={!!meta.error && meta.touched}
          message={meta.touched && meta.error && formatMessage({ id: meta.error })}
        />
      )}
    </Field>
  );
};

export const LastNameField: React.FC = () => {
  const { formatMessage } = useIntl();

  return (
    <Field name="lastName">
      {({ field, meta }: FieldProps<string>) => (
        <LabeledInput
          {...field}
          label={<FormattedMessage id="user.signup.lastName" />}
          type="text"
          error={!!meta.error && meta.touched}
          message={meta.touched && meta.error && formatMessage({ id: meta.error })}
        />
      )}
    </Field>
  );
};

export const EmailField: React.FC<{ label?: React.ReactNode }> = ({ label }) => {
  const { formatMessage } = useIntl();

  return (
    <Field name="email">
      {({ field, meta }: FieldProps<string>) => (
        <LabeledInput
          {...field}
          label={label || <FormattedMessage id="user.signup.email" />}
          type="text"
          error={!!meta.error && meta.touched}
          message={meta.touched && meta.error && formatMessage({ id: meta.error })}
        />
      )}
    </Field>
  );
};

export const PasswordField: React.FC<{ label?: React.ReactNode }> = ({ label }) => {
  const { formatMessage } = useIntl();

  return (
    <Field name="password">
      {({ field, meta }: FieldProps<string>) => (
        <LabeledInput
          {...field}
          label={label || <FormattedMessage id="user.signup.password" />}
          type="password"
          error={!!meta.error && meta.touched}
          message={meta.touched && meta.error && formatMessage({ id: meta.error })}
        />
      )}
    </Field>
  );
};

export const ConfirmPasswordField: React.FC<{ label?: React.ReactNode }> = ({ label }) => {
  const { formatMessage } = useIntl();

  return (
    <Field name="confirmPassword">
      {({ field, meta }: FieldProps<string>) => (
        <LabeledInput
          {...field}
          label={label || <FormattedMessage id="user.signup.confirmPassword" />}
          type="password"
          error={!!meta.error && meta.touched}
          message={meta.touched && meta.error && formatMessage({ id: meta.error })}
        />
      )}
    </Field>
  );
};

interface SignupButtonProps {
  isLoading: boolean;
  disabled: boolean;
  buttonMessageId?: string;
}

export const SignupButton: React.FC<SignupButtonProps> = ({
  isLoading,
  disabled,
  buttonMessageId = "user.signup.submitButton",
}) => (
  <LoadingButton white className={styles.signUpButton} type="submit" isLoading={isLoading} disabled={disabled}>
    <FormattedMessage id={buttonMessageId} />
  </LoadingButton>
);

export const SignupFormStatusMessage: React.FC = ({ children }) => (
  <div className={styles.statusMessage}>{children}</div>
);

export const SignupForm: React.FC = () => {
  const validationSchema = useMemo(() => {
    const shape = {
      firstName: yup.string().min(2, "user.signup.firstName.minLength").required("user.signupfirstName.empty.error"),
      lastName: yup.string().min(2, "user.signup.lastName.minLength").required("user.signuplastName.empty.error"),
      email: yup.string().email("user.signup.email.error").required("user.signupemail.empty.error"),
      password: yup.string().min(8, "user.signup.password.minLength").required("user.signuppassword.empty.error"),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref("password"), null], "user.signup.matchPassword")
        .min(8, "user.signup.confirmPassword.minLength")
        .required("user.signup.confirmPassword.empty.error"),
    };
    return yup.object().shape(shape);
  }, []);

  const config = useConfig();
  return (
    <Formik<FormValues>
      initialValues={{
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => console.log(values)}
      validateOnBlur
      validateOnChange
    >
      {({ isValid, dirty, isSubmitting, status }) => (
        <Form className={styles.form}>
          <RowFieldItem>
            <FirstNameField />
            <LastNameField />
          </RowFieldItem>
          <FieldItem>
            <EmailField />
          </FieldItem>
          <FieldItem>
            <PasswordField />
          </FieldItem>
          <FieldItem>
            <ConfirmPasswordField />
          </FieldItem>
          <BottomBlock>
            <SignupButton isLoading={isSubmitting} disabled={!(isValid && dirty)} />
            {status && <SignupFormStatusMessage>{status}</SignupFormStatusMessage>}
          </BottomBlock>
          <div className={styles.termsAndPrivacy}>
            <FormattedMessage id="user.signup.description" />
            <Link target="_blank" href={config.links.termsLink} as="a" $clear className={styles.link}>
              <FormattedMessage id="user.signup.terms" />
            </Link>
            <br />
            <FormattedMessage id="user.signup.and" />
            <Link target="_blank" href={config.links.privacyLink} as="a" $clear className={styles.link}>
              <FormattedMessage id="user.signup.privacy" />
            </Link>
          </div>
        </Form>
      )}
    </Formik>
  );
};
