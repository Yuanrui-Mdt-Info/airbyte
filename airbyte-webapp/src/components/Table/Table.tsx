import React, { memo, useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { Cell, Column, ColumnInstance, SortingRule, useSortBy, useTable } from "react-table";
import styled from "styled-components";

import { Card } from "components";

interface PaddingProps {
  left?: number;
  right?: number;
}

type IHeaderProps = {
  headerHighlighted?: boolean;
  collapse?: boolean;
  customWidth?: number;
  customPadding?: PaddingProps;
} & ColumnInstance;

type ICellProps = {
  column: IHeaderProps;
} & Cell;

type IThProps = {
  highlighted?: boolean;
  collapse?: boolean;
  customWidth?: number;
  customPadding?: PaddingProps;
  light?: boolean;
} & React.ThHTMLAttributes<HTMLTableHeaderCellElement>;

const TableView = styled(Card).attrs({ as: "table" })<{ light?: boolean }>`
border-spacing: 0;
width: 100%;
max-width: 100%;
border: 1px solid #E5E7EB;
border-radius: 8px;
};
`;

const Tr = styled.tr<{
  hasClick?: boolean;
  erroredRows?: boolean;
}>`
  background: ${({ theme, erroredRows }) => (erroredRows ? theme.dangerTransparentColor : theme.whiteColor)};
  cursor: ${({ hasClick }) => (hasClick ? "pointer" : "auto")};
  &:hover {
  }

  &:nth-child(2n) {
    background: #f8f8fe;
  }
`;

const Td = styled.td<{
  collapse?: boolean;
  customWidth?: number;
  customPadding?: PaddingProps;
}>`
  padding: ${({ customPadding }) => `14px ${customPadding?.right ?? 13}px 14px ${customPadding?.left ?? 13}px`};
  font-size: 12px;
  line-height: 15px;
  font-weight: normal;
  color: ${({ theme }) => theme.darkPrimaryColor};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: ${({ collapse, customWidth }) => (customWidth ? `${customWidth}%` : collapse ? "0.0000000001%" : "auto")};

  tr:last-child > & {
    border-bottom: none;

    &:first-child {
      border-radius: 0 0 0 10px;
    }

    &:last-child {
      border-radius: 0 0 10px 0;
    }
  }
`;

const Th = styled.th<IThProps>`
  background: ${({ theme, light }) => (light ? "none" : theme.whiteColor)};
  padding: ${({ customPadding }) => `20px ${customPadding?.right ?? 13}px 20px ${customPadding?.left ?? 13}px`};
  text-align: left;
  font-size: ${({ light }) => (light ? 11 : 14)}px;
  line-height: 16px;
  color: ${({ highlighted }) => (highlighted ? "#6b6b6f" : "#6b6b6f")};
  border-bottom: ${({ theme, light }) => (light ? "none" : ` 1px solid ${theme.borderTableColor}`)};
  width: ${({ collapse, customWidth }) => (customWidth ? `${customWidth}%` : collapse ? "0.0000000001%" : "auto")};
  font-weight: ${({ light }) => (light ? 400 : 600)};

  &:first-child {
    padding-left: ${({ light }) => (light ? 13 : 32)}px;
    border-radius: 10px 0 0;
  }

  &:last-child {
    padding-left: 15px;
    border-radius: 0 10px 0 0;
  }
`;

const EmptyListRow = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.05em;
  color: #6b6b6f;
`;

interface IProps {
  light?: boolean;
  columns: Array<IHeaderProps | Column<Record<string, unknown>>>;
  erroredRows?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClickRow?: (data: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sortBy?: Array<SortingRule<any>>;
}

const Table: React.FC<IProps> = React.memo(({ columns, data, onClickRow, erroredRows, sortBy, light }) => {
  const [plugins, config] = useMemo(() => {
    const pl = [];
    const plConfig: Record<string, unknown> = {};

    if (sortBy) {
      pl.push(useSortBy);
      plConfig.initialState = { sortBy };
    }
    return [pl, plConfig];
  }, [sortBy]);
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      ...config,
      columns,
      data,
    },
    ...plugins
  );

  return (
    <TableView {...getTableProps()} light={light}>
      <thead>
        {headerGroups.map((headerGroup, key) => (
          <tr {...headerGroup.getHeaderGroupProps()} key={`table-header-${key}`}>
            {headerGroup.headers.map((column: IHeaderProps, columnKey) => (
              <Th
                {...column.getHeaderProps()}
                highlighted={column.headerHighlighted}
                collapse={column.collapse}
                customPadding={column.customPadding}
                customWidth={column.customWidth}
                key={`table-column-${key}-${columnKey}`}
                light={light}
              >
                {column.render("Header")}
              </Th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.length > 0 ? (
          rows.map((row) => {
            prepareRow(row);
            return (
              <Tr
                {...row.getRowProps()}
                key={`table-row-${row.id}`}
                hasClick={!!onClickRow}
                onClick={() => onClickRow?.(row.original)}
                erroredRows={erroredRows && !!row.original.error}
              >
                {row.cells.map((cell: ICellProps, key) => {
                  return (
                    <Td
                      {...cell.getCellProps()}
                      collapse={cell.column.collapse}
                      customPadding={cell.column.customPadding}
                      customWidth={cell.column.customWidth}
                      key={`table-cell-${row.id}-${key}`}
                    >
                      {cell.render("Cell")}
                    </Td>
                  );
                })}
              </Tr>
            );
          })
        ) : (
          <Tr>
            <Td colSpan={7} style={{ borderRadius: "0 0 10px 10px" }}>
              <EmptyListRow>
                <FormattedMessage id="tables.emptyList" />
              </EmptyListRow>
            </Td>
          </Tr>
        )}
      </tbody>
    </TableView>
  );
});

export default memo(Table);
