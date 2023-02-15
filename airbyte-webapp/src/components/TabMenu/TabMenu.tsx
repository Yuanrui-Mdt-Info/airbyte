import React from "react";
import styled from "styled-components";

import TabItem from "./components/TabItem";

export interface SideMenuItem {
  path: string;
  name: string | React.ReactNode;
  indicatorCount?: number;
  component: React.ReactNode;
  id?: string;
  show?: boolean;
}

export interface CategoryItem {
  category?: string | React.ReactNode;
  routes: SideMenuItem[];
}

interface IProps {
  data: CategoryItem[];
  activeItem?: string;
  activeTabIndex?: number;
  onSelect: (id: string, routeIndex: number) => void;
}

const Content = styled.div`
  width: 100%;
  // background-color: red;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Tab = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-bottom: 1px solid #eff0f5;
`;

const TabName = styled.div`
  padding: 5px 8px;
  font-weight: 500;
  line-height: 12px;
  opacity: 0.5;
  text-transform: uppercase;
`;

export const TabMenu: React.FC<IProps> = ({ data, activeItem, onSelect, activeTabIndex }) => {
  // TODO: When bool is true, use the tabItem key(`activeTabIndex`) to determine the value of isActive
  // Compatible with the `overview` option of the Source/Destination details page
  const bol: boolean = typeof activeTabIndex !== "number" && activeTabIndex === undefined;
  return (
    <Content>
      {data.map((tabItem, index) => (
        <Tab key={index}>
          {tabItem.category && <TabName>{tabItem.category}</TabName>}
          {tabItem.routes.map(
            (route, routeIndex) =>
              route.show && (
                <TabItem
                  id={route.id}
                  key={route.path}
                  name={route.name}
                  isActive={bol ? activeItem?.endsWith(route.path) : routeIndex === activeTabIndex}
                  onClick={() => onSelect(route.path, routeIndex)}
                />
              )
          )}
        </Tab>
      ))}
    </Content>
  );
};
