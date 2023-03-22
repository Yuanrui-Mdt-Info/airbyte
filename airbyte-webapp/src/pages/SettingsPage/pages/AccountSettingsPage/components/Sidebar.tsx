import { faSignOut } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";
import { theme } from "theme";

import { GlobIcon } from "components/icons/GlobIcon";
import { LockIcon } from "components/icons/LockIcon";
import { NotificationIcon } from "components/icons/NotificationIcon";
import { UserIcon } from "components/icons/UserIcon";
import { SideMenuItem } from "components/TabMenu";

import { useUser } from "core/AuthContext";
import { useConfirmationModalService } from "hooks/services/ConfirmationModal";
import useRouter from "hooks/useRouter";
import { RoutePaths } from "pages/routePaths";

import { AccountSettingsRoute } from "../AccountSettingsPage";

interface IProps {
  menuItems: SideMenuItem[];
  onSelectItem: (path: string) => void;
}

const SidebarContainer = styled.div`
  min-width: 300px;
  border-radius: 6px 0 0 6px;
  background: ${({ theme }) => theme.grey40};
  padding: 32px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const SidebarItem = styled.div`
  margin: 36px 0;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 0 0 78px;
`;

const ItemText = styled.div<{
  isSelected?: boolean;
}>`
  cursor: pointer;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  color: ${({ isSelected, theme }) => (isSelected ? theme.blue400 : "#6B6B6F")};
  margin-left: 12px;
`;

const SidebarItemIcon = (path: string, color: string) => {
  switch (path) {
    case AccountSettingsRoute.Account:
      return <UserIcon color={color} />;

    case AccountSettingsRoute.Language:
      return <GlobIcon color={color} />;

    case AccountSettingsRoute.Notifications:
      return <NotificationIcon color={color} />;

    case AccountSettingsRoute.Password:
      return <LockIcon color={color} />;

    default:
      return null;
  }
};

export const Sidebar: React.FC<IProps> = ({ menuItems, onSelectItem }) => {
  const { pathname, push } = useRouter();
  const { removeUser } = useUser();
  const { openConfirmationModal, closeConfirmationModal } = useConfirmationModalService();

  const toggleSignOutConfirmModal = () => {
    openConfirmationModal({
      title: "settings.logout.modal.title",
      text: "settings.logout.modal.content",
      submitButtonText: "settings.logout.modal.confirmText",
      onSubmit: () => {
        closeConfirmationModal();
        removeUser!();
        push(`/${RoutePaths.Signin}`);
      },
    });
  };

  return (
    <SidebarContainer>
      {menuItems.map(({ name, path }) => (
        <SidebarItem onClick={() => onSelectItem(path)}>
          {SidebarItemIcon(path, pathname.split("/").at(-1) === path ? theme.blue400 : "#6B6B6F")}
          <ItemText isSelected={pathname.split("/").at(-1) === path}>{name}</ItemText>
        </SidebarItem>
      ))}
      <div style={{ marginTop: "auto" }} />
      <SidebarItem onClick={toggleSignOutConfirmModal}>
        <FontAwesomeIcon icon={faSignOut} />
        <ItemText>
          <FormattedMessage id="sidebar.DaspireSignOut" />
        </ItemText>
      </SidebarItem>
    </SidebarContainer>
  );
};
