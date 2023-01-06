import React from "react";
import styled from "styled-components";

import { ConnectorIcon } from "components/ConnectorIcon";
import { useDataCardContext } from "components/DataPanel/DataCardContext";

interface BoxProps {
  formType?: "source" | "destination";
}

const FormHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
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

const FormHeaderBox: React.FC<BoxProps> = () => {
  const { selectDefinition } = useDataCardContext();

  return (
    <FormHeader>
      <ImageBox>
        <Image icon={selectDefinition.icon || ""} />
      </ImageBox>
      <Content>
        <Title>{selectDefinition.name}</Title>
        <Text>Following the setup guide on the right to connect your data source to Daspire. </Text>
      </Content>
    </FormHeader>
  );
};

export default FormHeaderBox;
