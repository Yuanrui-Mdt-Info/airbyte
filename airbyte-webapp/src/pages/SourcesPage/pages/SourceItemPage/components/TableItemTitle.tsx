import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";

import { Button } from "components";

interface Iprops {
  onClick: () => void;
  num: number;
  type: "source" | "destination";
  btnText: React.ReactNode;
}

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
`;

const BtnInnerContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px 4px;
`;

const BtnText = styled.div`
  font-weight: 500;
  font-size: 16px;
  color: #ffffff;
`;

const LeftPanel = styled.div`
  font-weight: 500;
  font-size: 24px;
  line-height: 30px;
  color: #27272a;
`;

const BtnIcon = styled(FontAwesomeIcon)`
  font-size: 16px;
  margin-right: 10px;
`;

const TableItemTitle: React.FC<Iprops> = ({ onClick, type, num, btnText }) => {
  return (
    <Row>
      <LeftPanel>
        <FormattedMessage id={`tables.${type}ConnectWithNum`} values={{ num }} />
      </LeftPanel>
      <Button onClick={onClick} size="m">
        <BtnInnerContainer>
          <BtnIcon icon={faPlus} />
          <BtnText>{btnText}</BtnText>
        </BtnInnerContainer>
      </Button>
    </Row>
  );
};

export default TableItemTitle;
