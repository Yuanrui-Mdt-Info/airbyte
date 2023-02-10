import classnames from "classnames";
import React from "react";
import { FormattedMessage } from "react-intl";

import styles from "./Button.module.scss";

interface CardProps {
  btnText: string;
  type: "cancel" | "disabled" | "active";
  disabled?: boolean;
  onClick: (btnType: string) => void;
}

const Button: React.FC<CardProps> = ({ btnText, type, onClick, disabled }) => {
  const buttonClassName = classnames(
    styles.button,
    { [styles.active]: type === "active" },
    { [styles.disabled]: type === "disabled" || disabled }
  );
  return (
    <div
      aria-hidden="true"
      className={buttonClassName}
      onClick={() => {
        if (type === "disabled") {
          return;
        }
        onClick(type);
      }}
    >
      <FormattedMessage id={`form.button.${btnText}`} />
    </div>
  );
};

export default Button;
