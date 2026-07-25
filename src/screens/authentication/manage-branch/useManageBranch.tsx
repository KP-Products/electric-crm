import { DEFAULT_PAGE_SIZE, K_SIZE_1 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CREATE_BRANCH,
  GET_BRANCH_USERS,
  SEARCH_BRANCH,
  UPDATE_BRANCH
} from '@redux-action-type/branch';
import { dispatch } from '@redux-common';
import {
  selectBranchList,
  selectBranchLoadingDetail,
  selectBranchLoadingList,
  selectBranchLoadingUsers,
  selectBranchTotal,
  selectBranchUsers
} from '@redux-selector/branch';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { AppSelectOption } from 'components/select';
import { Branch } from 'model/branch';
import { ErrorBase } from 'model/common';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useAppTranslation } from 'utils/i18n';
import { z } from 'zod';
import {
  DEFAULT_BRANCH_FORM_VALUES,
  buildBranchFormValues,
  buildBranchSearchBody,
  buildBranchUsersBody,
  buildCreateBranchBody,
  buildManagerOptions,
  buildUpdateBranchBody,
  getBranchErrorMessage
} from './utils';

const branchSchema = z.object({
  code: z.string().trim().max(50, { message: 'Mã chi nhánh tối đa 50 ký tự' }),
  name: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập tên chi nhánh' }).max(200, {
    message: 'Tên chi nhánh tối đa 200 ký tự'
  }),
  address: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập địa chỉ chi nhánh' }),
  managerId: z.string().trim(),
  status: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn trạng thái' })
});

export type BranchForm = z.infer<typeof branchSchema>;

export default function useManageBranch() {
  const { t } = useAppTranslation();
  const branchList = useSelector(selectBranchList);
  const total = useSelector(selectBranchTotal);
  const branchUsers = useSelector(selectBranchUsers);
  const listLoading = useSelector(selectBranchLoadingList);
  const detailLoading = useSelector(selectBranchLoadingDetail);
  const usersLoading = useSelector(selectBranchLoadingUsers);

  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);
  const [selectedBranch, setSelectedBranch] = useState<Branch>();
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const submittingRef = useRef<boolean>(false);

  const form = useForm<BranchForm>({
    mode: 'onTouched',
    defaultValues: DEFAULT_BRANCH_FORM_VALUES,
    resolver: zodResolver(branchSchema)
  });

  const fetchList = useCallback((page: number) => {
    dispatch({
      type: SEARCH_BRANCH,
      payload: {
        body: buildBranchSearchBody(page),
        onFailed: (error?: ErrorBase) => {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getBranchErrorMessage(error, 'Tải danh sách chi nhánh thất bại')
          });
        }
      }
    });
  }, []);

  const fetchBranchUsers = useCallback((branchId?: string) => {
    dispatch({
      type: GET_BRANCH_USERS,
      payload: {
        body: buildBranchUsersBody(branchId),
        onFailed: (error?: ErrorBase) => {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getBranchErrorMessage(error, 'Tải danh sách nhân sự thất bại')
          });
        }
      }
    });
  }, []);

  useEffect(() => {
    fetchList(currentPage);
  }, [currentPage, fetchList]);

  const pagination = useMemo(
    () => ({
      current: currentPage,
      total,
      pageSize: DEFAULT_PAGE_SIZE,
      onChange: (page: number) => setCurrentPage(page),
      showSizeChanger: false
    }),
    [currentPage, total]
  );

  const managerOptions = useMemo<AppSelectOption[]>(
    () => buildManagerOptions(branchUsers, selectedBranch),
    [branchUsers, selectedBranch]
  );

  const onOpenCreate = useCallback(() => {
    setSelectedBranch(undefined);
    form.reset(DEFAULT_BRANCH_FORM_VALUES);
    setIsDrawerOpen(true);
    fetchBranchUsers();
  }, [fetchBranchUsers, form]);

  const onOpenUpdate = useCallback(
    (branch: Branch) => {
      setSelectedBranch(branch);
      form.reset(buildBranchFormValues(branch));
      setIsDrawerOpen(true);
      fetchBranchUsers(branch.id);
    },
    [fetchBranchUsers, form]
  );

  const onCancel = useCallback(() => {
    setSelectedBranch(undefined);
    form.reset(DEFAULT_BRANCH_FORM_VALUES);
    setIsDrawerOpen(false);
  }, [form]);

  const onSubmitSuccess = useCallback(
    (content: string) => {
      submittingRef.current = false;
      showToast({
        type: TYPE_TOAST.SUCCESS,
        content
      });

      setSelectedBranch(undefined);
      setIsDrawerOpen(false);
      form.reset(DEFAULT_BRANCH_FORM_VALUES);
      if (currentPage === K_SIZE_1) {
        fetchList(K_SIZE_1);
      } else {
        setCurrentPage(K_SIZE_1);
      }
    },
    [currentPage, fetchList, form]
  );

  const handleSubmit = useCallback(
    (data: BranchForm) => {
      if (submittingRef.current) return;
      submittingRef.current = true;

      if (selectedBranch) {
        if (!selectedBranch.id) {
          submittingRef.current = false;
          showToast({
            type: TYPE_TOAST.ERROR,
            content: 'Không tìm thấy ID chi nhánh để cập nhật'
          });
          return;
        }

        dispatch({
          type: UPDATE_BRANCH,
          payload: {
            body: buildUpdateBranchBody(selectedBranch.id, data),
            onSuccess: () => onSubmitSuccess('Cập nhật chi nhánh thành công'),
            onFailed: (error?: ErrorBase) => {
              submittingRef.current = false;
              showToast({
                type: TYPE_TOAST.ERROR,
                content: getBranchErrorMessage(error, 'Cập nhật chi nhánh thất bại')
              });
            }
          }
        });
        return;
      }

      dispatch({
        type: CREATE_BRANCH,
        payload: {
          body: buildCreateBranchBody(data),
          onSuccess: () => onSubmitSuccess('Thêm chi nhánh thành công'),
          onFailed: (error?: ErrorBase) => {
            submittingRef.current = false;
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getBranchErrorMessage(error, 'Thêm chi nhánh thất bại')
            });
          }
        }
      });
    },
    [onSubmitSuccess, selectedBranch]
  );

  return {
    t,
    branchList,
    total,
    listLoading,
    detailLoading,
    usersLoading,
    currentPage,
    pagination,
    selectedBranch,
    isDrawerOpen,
    form,
    managerOptions,
    onOpenCreate,
    onOpenUpdate,
    onCancel,
    handleSubmit
  };
}
