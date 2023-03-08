import React from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";

import { Row, DropDown, DropDownRow, Button } from "components";
import { Tooltip } from "components/base/Tooltip";

import { NotificationItem } from "core/request/DaspireClient";

import { AddIcon } from "../icons";
import { NotificationFlag } from "./NotificationFlag";
import { FirstCellFlexValue, FirstCell, BodyCell } from "./StyledTable";

interface IProps {
  usageItem: NotificationItem;
  index?: number;
}

const DDContainer = styled.div`
  min-width: 150px;
  margin: 0 22px;
`;

const AddRemoveBtn = styled(Button)`
  background-color: transparent;
  padding: 0;
  margin: 0;
  width: 23px;
  height: 23px;
  cursor: pointer;
  border-radius: 50%;
  border: 1px solid transparent;
`;

export const UsageOptions: DropDownRow.IDataItem[] = [
  { label: "30%", value: 0.3 },
  { label: "50%", value: 0.5 },
  { label: "60%", value: 0.6 },
  { label: "70%", value: 0.7 },
  { label: "80%", value: 0.8 },
  { label: "90%", value: 0.9 },
  { label: "100%", value: 1.0 },
];

export const UsageTableRow: React.FC<IProps> = ({ usageItem, index }) => {
  return (
    <Row>
      <FirstCell flex={FirstCellFlexValue}>
        <FormattedMessage id="usageTable.cell.limit" />
        <DDContainer>
          <DropDown
            $withBorder
            $background="#FFFFFF"
            options={UsageOptions}
            value={usageItem.value}
            onChange={(option: DropDownRow.IDataItem) => console.log(option.value)}
          />
        </DDContainer>
        {index === 0 && (
          <Tooltip
            control={
              <AddRemoveBtn>
                <AddIcon />
              </AddRemoveBtn>
            }
            placement="top"
          >
            <FormattedMessage id="usageTable.cell.addBtn.text" />
          </Tooltip>
        )}
      </FirstCell>
      <BodyCell>
        <NotificationFlag isActive={usageItem.emailFlag} />
      </BodyCell>
      <BodyCell>
        <NotificationFlag isActive={usageItem.appsFlag} />
      </BodyCell>
    </Row>
  );
};
