import React from "react";
import styled from "styled-components";

import TabItem from "./components/TabItem";

export interface SideMenuItem {
  path: string;
  name: string | React.ReactNode;
  indicatorCount?: number;
  component: React.ComponentType;
  id?: string;
}

export interface CategoryItem {
  category?: string | React.ReactNode;
  routes: SideMenuItem[];
}

interface IProps {
  data: CategoryItem[];
  activeItem?: string;
  onSelect: (id: string) => void;
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
  font-size: 10px;
  line-height: 12px;
  opacity: 0.5;
  text-transform: uppercase;
`;

const TabMenu: React.FC<IProps> = ({ data, activeItem, onSelect }) => {
  return (
    <Content>
      {data.map((tabItem, index) => (
        <Tab key={index}>
          {tabItem.category && <TabName>{tabItem.category}</TabName>}
          {tabItem.routes.map((route) => (
            <TabItem
              id={route.id}
              key={route.path}
              name={route.name}
              isActive={activeItem?.endsWith(route.path)}
              onClick={() => onSelect(route.path)}
            />
          ))}
        </Tab>
      ))}
    </Content>
  );
};

export default TabMenu;
