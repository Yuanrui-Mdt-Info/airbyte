import React, { useEffect } from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";

import { CrossIcon } from "components/icons/CrossIcon";

interface IProps {
  message?: string;
  onClose?: () => void;
  type: "info" | "error";
}

const Container = styled.div<{ type: "info" | "error" }>`
  min-width: 60%;
  max-width: 90%;
  background: ${({ type }) => (type === "error" ? "#FEF2F2" : "#eff6ff")};
  border-radius: 6px;
  top: 22px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  z-index: 3;
  top: 4%;
  right: 5%;
  z-index: 10003;
  &:last-child {
    top: 80px;
  }
`;

const Message = styled.div<{ type: "info" | "error" }>`
  font-weight: 400;
  font-size: 12px;
  line-height: 20px;
  color: ${({ type }) => (type === "error" ? "#991B1B" : "#1e40af")};
  padding: 17px;
`;

const CrossButton = styled.button`
  margin-right: 17px;
  cursor: pointer;
  padding: 0;
  border: none;
  background-color: transparent;
  color: #1e40af;
`;

export const MessageBox: React.FC<IProps> = ({ message, onClose, type }) => {
  useEffect(() => {
    const intervalID = setTimeout(() => onClose?.(), 3000);
    return () => clearInterval(intervalID);
  }, [message]);

  if (!message) {
    return null;
  }

  return (
    <Container type={type}>
      <Message type={type}>
        <FormattedMessage id={message} />
      </Message>
      <CrossButton onClick={onClose}>
        <CrossIcon color={type === "error" ? "#991B1B" : "currentColor"} />
      </CrossButton>
    </Container>
  );
};
