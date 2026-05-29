import { K_SIZE_1 } from '@constant';
import { ApprovalLevel, MatrixUser } from 'model/approval-matrix';
import { UserSearchItem } from 'model/user';
import { ApprovalMatrixForm } from 'screens/authentication/approval-matrix/hooks/useApprovalMatrixForm';

export const mapUserToServer = (data: UserSearchItem): MatrixUser => {
  return { approverId: data.id };
};

export const mapLevelToServer = (
  data: ApprovalMatrixForm['approvalLevel'][number],
  index: number
): ApprovalLevel => {
  return {
    approvalLevel: (index + K_SIZE_1).toString(),
    matrixUsers: data.user.map(mapUserToServer)
  };
};

export const mapUserFromServer = (
  data: MatrixUser,
  userList?: UserSearchItem[]
): UserSearchItem => {
  return (
    userList?.find((u) => u.id === data.approverId) ||
    ({ id: data.approverId, username: data.approverId } as UserSearchItem)
  );
};

export const mapLevelFromServer = (
  data: ApprovalLevel,
  userList?: UserSearchItem[]
): ApprovalMatrixForm['approvalLevel'][number] => {
  return {
    user: data.matrixUsers.map((item) => mapUserFromServer(item, userList))
  };
};
