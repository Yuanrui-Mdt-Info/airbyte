import React from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";

import { ConnectorIcon } from "components/ConnectorIcon";

import { useServiceForm } from "views/Connector/ServiceForm/serviceFormContext";

const FormHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 60px;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-left: 34px;
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 32px;
  line-height: 30px;
`;

const Text = styled.div`
  font-weight: 400;
  font-size: 18px;
  line-height: 22px;
  color: #6b6b6f;
  margin-top: 28px;
`;

const ImageBox = styled.div`
  width: 126px;
  height: 126px;
  background: #ffffff;
  box-shadow: 0px 10px 12px rgba(74, 74, 87, 0.1);
  border-radius: 18px;
  padding: 6px;
  box-sizing: border-box;
`;

export const Image = styled(ConnectorIcon)`
  width: 100%;
  height: 100%;
  border-radius: 18px;
`;

const FormHeaderBox: React.FC = () => {
  const { selectedService } = useServiceForm();
  return (
    <FormHeader>
      <ImageBox>
        <Image icon={selectedService?.icon || ""} />
      </ImageBox>
      <Content>
        <Title>{selectedService?.name}</Title>
        <Text>
          <FormattedMessage id="form.header.subTitle" />{" "}
        </Text>
      </Content>
    </FormHeader>
  );
};

export default FormHeaderBox;
