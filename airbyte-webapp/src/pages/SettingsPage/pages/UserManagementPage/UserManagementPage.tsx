import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useCallback, useState } from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";

import { Button, DropDownRow } from "components";
import { Separator } from "components/Separator";

import { ROLES } from "core/Constants/roles";
import { useRoleOptions } from "services/roles/RolesService";
import { useListUsers, useUserAsyncAction } from "services/users/UsersService";

import ChangeRoleModal from "./components/ChangeRoleModal";
import DeleteUserModal from "./components/DeleteUserModal";
import InviteUserModal from "./components/InviteUserModal";
import UserTable from "./components/UserTable";

interface IProps {
  setMessageId: React.Dispatch<React.SetStateAction<string>>;
}

const HeaderContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
`;

const BtnInnerContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px 25px;
`;

const BtnIcon = styled(FontAwesomeIcon)`
  font-size: 16px;
  margin-right: 10px;
`;

const BtnText = styled.div`
  font-weight: 500;
  font-size: 16px;
  color: #ffffff;
`;

const UserManagementPage: React.FC<IProps> = ({ setMessageId }) => {
  const roleOptions = useRoleOptions().filter((role) => role.label !== ROLES.Administrator_Owner);
  const users = useListUsers();
  const { onDeleteUser, onResendInvite, onUpdateRole } = useUserAsyncAction();

  const [userId, setUserId] = useState<string>("");
  const [userRole, setUserRole] = useState<number | undefined>();

  // Delete user functionality
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const toggleDeleteModal = () => setDeleteModal(!deleteModal);
  const onDelete = (userId: string) => {
    setUserId(userId);
    toggleDeleteModal();
  };
  const onConfirmDelete = useCallback(async () => {
    setDeleteLoading(true);
    onDeleteUser(userId)
      .then(() => {
        setDeleteLoading(false);
        onCancelDelete();
      })
      .catch(() => {
        setDeleteLoading(false);
      });
  }, [userId]);
  const onCancelDelete = () => {
    setUserId("");
    toggleDeleteModal();
  };

  // Resend invite functionality
  const resendInvite = useCallback(async (userId: string) => {
    onResendInvite(userId)
      .then(() => {
        setMessageId("user.resendInvite.message");
      })
      .catch((err: any) => {
        console.log(err);
      });
  }, []);

  // Change role user functionality
  const [changeRoleModal, setChangeRoleModal] = useState<boolean>(false);
  const [changeRoleLoading, setChangeRoleLoading] = useState<boolean>(false);
  const toggleChangeRoleModal = () => setChangeRoleModal(!changeRoleModal);
  const onChangeRole = (userId: string, option: DropDownRow.IDataItem) => {
    if (users.find((user) => user.id === userId)?.roleIndex !== option.value) {
      toggleChangeRoleModal();
      setUserId(userId);
      setUserRole(option.value);
    }
  };
  const onConfirmChangeRole = useCallback(async () => {
    setChangeRoleLoading(true);
    onUpdateRole({ id: userId, roleIndex: userRole as number })
      .then(() => {
        setChangeRoleLoading(false);
        onCancelChangeRole();
      })
      .catch(() => {
        setChangeRoleLoading(false);
      });
  }, [userId, userRole]);
  const onCancelChangeRole = () => {
    toggleChangeRoleModal();
    setUserId("");
    setUserRole(undefined);
  };

  // Add user funcationality
  const [addUserModal, setAddUserModal] = useState<boolean>(false);
  const toggleAddUserModal = () => setAddUserModal(!addUserModal);

  return (
    <>
      <HeaderContainer>
        <Button onClick={toggleAddUserModal}>
          <BtnInnerContainer>
            <BtnIcon icon={faPlus} />
            <BtnText>
              <FormattedMessage id="user.newUser" />
            </BtnText>
          </BtnInnerContainer>
        </Button>
      </HeaderContainer>
      <Separator />
      <UserTable
        users={users}
        roles={roleOptions}
        onDelete={onDelete}
        onChangeRole={onChangeRole}
        onResendInvite={resendInvite}
      />
      {addUserModal && <InviteUserModal roles={roleOptions} onClose={toggleAddUserModal} />}
      {changeRoleModal && (
        <ChangeRoleModal
          onClose={toggleChangeRoleModal}
          onChangeRole={onConfirmChangeRole}
          onCancel={onCancelChangeRole}
          isLoading={changeRoleLoading}
        />
      )}
      {deleteModal && (
        <DeleteUserModal
          onClose={toggleDeleteModal}
          onDelete={onConfirmDelete}
          onCancel={onCancelDelete}
          isLoading={deleteLoading}
        />
      )}
    </>
  );
};

export default UserManagementPage;
