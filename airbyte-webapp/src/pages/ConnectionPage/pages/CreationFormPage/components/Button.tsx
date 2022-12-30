import classnames from "classnames";
import React from "react";

import styles from "./Button.module.scss";

interface CardProps {
  btnText: string;
  type: "cancel" | "disabled" | "active";
}

const Button: React.FC<CardProps> = ({ btnText, type }) => {
  const buttonClassName = classnames(
    styles.button,
    { [styles.active]: type === "active" },
    { [styles.disabled]: type === "disabled" }
  );
  return <div className={buttonClassName}>{btnText}</div>;
};

export default Button;
