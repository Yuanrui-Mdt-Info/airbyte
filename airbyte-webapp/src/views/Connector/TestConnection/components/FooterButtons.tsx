import React from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";

import { Button } from "components";

interface Iprops {
  isLoading: boolean;
  onBack: () => void;
  onFinish: () => void;
}

const Rows = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 200px;
  width: 100%;
`;

const BtnContainer = styled(Button)`
  box-sizing: border-box;
  width: 264px;
  height: 68px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  // color: #6b6b6f;
  font-size: 18px;
`;

const FooterButtons: React.FC<Iprops> = ({ isLoading, onBack, onFinish }) => {
  return (
    <Rows>
      <BtnContainer white type="button" onClick={onBack}>
        <FormattedMessage id="form.button.cancel" />
      </BtnContainer>
      <BtnContainer onClick={onFinish} disabled={isLoading}>
        <FormattedMessage id="form.button.finish" />
      </BtnContainer>
    </Rows>
  );
};

export default FooterButtons;
