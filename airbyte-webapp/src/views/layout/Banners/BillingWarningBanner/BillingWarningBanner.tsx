import React from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";

import { Button } from "components";

import styles from "../banners.module.scss";

interface IProps {
  onBillingPage: () => void;
}

const Banner = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 8px 5%;
`;

const TextContainer = styled.div`
  display: flex;
  align-items: flex-start;
  font-weight: 500;
  font-size: 13px;
  line-height: 20px;
  margin-right: 50px;
  color: ${({ theme }) => theme.white};
`;

const Text = styled.span`
  padding-left: 4px;
`;

export const BillingWarningBanner: React.FC<IProps> = ({ onBillingPage }) => {
  return (
    <Banner className={styles.banner}>
      <TextContainer>
        <FormattedMessage id="billing.warning.banner.text1" />
        <Text>
          <FormattedMessage id="billing.warning.banner.text2" />
        </Text>
      </TextContainer>
      <Button size="m" black onClick={onBillingPage}>
        <FormattedMessage id="upgrade.plan.btn" />
      </Button>
    </Banner>
  );
};
