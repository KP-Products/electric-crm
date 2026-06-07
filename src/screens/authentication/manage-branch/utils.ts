import { DEFAULT_PAGE_SIZE, K_SIZE_1, MAX_PAGE_SIZE } from '@constant';
import type { AppSelectOption } from 'components/select';
import { BRANCH_STATUS } from 'model/branch';
import type {
  Branch,
  BranchSearchReq,
  BranchUser,
  BranchUsersReq,
  CreateBranchReq,
  UpdateBranchReq
} from 'model/branch';
import type { ErrorBase } from 'model/common';

export interface BranchFormValues {
  code: string;
  name: string;
  address: string;
  managerId: string;
  status: string;
}

export const DEFAULT_BRANCH_FORM_VALUES: BranchFormValues = {
  code: '',
  name: '',
  address: '',
  managerId: '',
  status: BRANCH_STATUS.ACTIVE
};

export const getBranchErrorMessage = (error?: ErrorBase, fallback = 'Có lỗi xảy ra') =>
  error?.businessErrorMessage || error?.systemErrorMessage || error?.detailMessage || fallback;

export const buildBranchSearchBody = (page: number): BranchSearchReq => ({
  page: page - K_SIZE_1,
  size: DEFAULT_PAGE_SIZE
});

export const buildBranchUsersBody = (branchId?: string): BranchUsersReq => ({
  page: 0,
  size: MAX_PAGE_SIZE,
  status: BRANCH_STATUS.ACTIVE,
  ...(branchId ? { branchId, includeUnassigned: true } : {})
});

export const buildManagerOptions = (
  branchUsers: BranchUser[] = [],
  selectedBranch?: Branch
): AppSelectOption[] => {
  const options: AppSelectOption[] = branchUsers
    .filter((user) => user?.id)
    .map((user) => ({
      value: user.id,
      label: user.fullName || user.username || user.email || user.id,
      rawData: user
    }));

  if (
    selectedBranch?.managerId &&
    !options.some((option) => option.value === selectedBranch.managerId)
  ) {
    options.unshift({
      value: selectedBranch.managerId,
      label: selectedBranch.managerName || selectedBranch.managerId
    });
  }

  return options;
};

export const buildBranchFormValues = (branch: Branch): BranchFormValues => ({
  code: branch.code || '',
  name: branch.name || '',
  address: branch.address || '',
  managerId: branch.managerId || '',
  status: branch.status || BRANCH_STATUS.ACTIVE
});

export const buildCreateBranchBody = (data: BranchFormValues): CreateBranchReq => ({
  code: data.code || undefined,
  name: data.name,
  address: data.address,
  managerId: data.managerId || undefined,
  status: data.status || BRANCH_STATUS.ACTIVE
});

export const buildUpdateBranchBody = (
  branchId: string,
  data: BranchFormValues
): UpdateBranchReq => ({
  id: branchId,
  name: data.name,
  address: data.address,
  managerId: data.managerId || undefined,
  status: data.status
});
