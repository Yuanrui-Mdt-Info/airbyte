import React from "react";
import { FormattedMessage } from "react-intl";

import { Row, Cell } from "components";
import { Separator } from "components/Separator";

import { NotificationItem } from "core/request/DaspireClient";

import { FirstHeaderText, HeaderText, FirstCellFlexValue, BodyCell } from "./StyledTable";
import { UsageTableRow } from "./UsageTableRow";

interface IProps {
  usageList: NotificationItem[];
}

export const UsageTable: React.FC<IProps> = ({ usageList }) => {
  return (
    <>
      {/* Table Header Row */}
      <Row>
        <Cell flex={FirstCellFlexValue}>
          <FirstHeaderText>
            <FormattedMessage id="usageTable.cell.usage" />
          </FirstHeaderText>
        </Cell>
        <BodyCell>
          <HeaderText>
            <FormattedMessage id="usageTable.cell.email" />
          </HeaderText>
        </BodyCell>
        <BodyCell>
          <HeaderText>
            <FormattedMessage id="usageTable.cell.inApp" />
          </HeaderText>
        </BodyCell>
      </Row>
      <Separator />
      {/* Table Body Rows */}
      {usageList.map((usageItem, index) => (
        <UsageTableRow usageItem={usageItem} index={index} />
      ))}
    </>
  );
};
