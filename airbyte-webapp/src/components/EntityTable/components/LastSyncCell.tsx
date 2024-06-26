import React from "react";
import { FormattedRelativeTime } from "react-intl";
import styled from "styled-components";

// TODO: @Abi mention this to make font style same even in diabled mode
// color: ${({ theme, enabled }) => (!enabled ? theme.greyColor40 : "inherit")};
const Content = styled.div<{ enabled?: boolean }>`
  color: inherit;
`;

interface IProps {
  timeInSecond: number;
  enabled?: boolean;
}

const LastSyncCell: React.FC<IProps> = ({ timeInSecond, enabled }) => {
  if (!timeInSecond) {
    return null;
  }

  return (
    <Content enabled={enabled}>
      <FormattedRelativeTime value={timeInSecond - Date.now() / 1000} updateIntervalInSeconds={60} />
    </Content>
  );
};

export default LastSyncCell;
