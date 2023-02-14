import React from "react";
import styled from "styled-components";

import { LeftArrowHeadIcon } from "components/icons/LeftArrowHeadIcon";

interface IProps {
  name: string;
  linkName: React.ReactNode;
  goBack: () => void;
}

const Navbar = styled.nav`
  width: 100%;
  height: 100px;
  background-color: ${({ theme }) => theme.white};
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const StepsContent = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Step = styled.div<{ isActive?: boolean }>`
  font-weight: 400;
  font-size: 14px;
  margin-left: 12px;
  color: ${({ theme, isActive }) => (isActive ? theme.primaryColor : "#6B6B6F")};
`;

const PaddingContainer = styled.div`
  padding: 0 12px;
`;

const SourceDetailsNav: React.FC<IProps> = ({ name, linkName, goBack }) => {
  return (
    <Navbar>
      <StepsContent onClick={goBack}>
        <LeftArrowHeadIcon />
        <Step isActive>{linkName}</Step>
        <PaddingContainer>/</PaddingContainer>
        {name}
      </StepsContent>
    </Navbar>
  );
};

export default SourceDetailsNav;
