import { DEFAULT_PAGE_SIZE, K_SIZE_1 } from '@constant';
import { DELETE_EMPLOYEE, SEARCH_EMPLOYEES } from '@redux-action-type/employee';
import { dispatch } from '@redux-common';
import {
  selectEmployeeList,
  selectEmployeeLoadingList,
  selectEmployeeTotal
} from '@redux-selector/employee';
import { showDialog } from 'components/dialog';
import { TYPE_ACTION, TYPE_MESSAGE } from 'components/dialog/type';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import { ErrorBase } from 'model/common';
import { Employee, SearchEmployeesReq } from 'model/employee';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import employeeServices from 'services/employee-services';
import {
  canViewBlobInline,
  downloadBlobResponse,
  getBlobResponseError,
  isBlobFileResponse
} from 'utils/blob-response';
import { useAppTranslation } from 'utils/i18n';
import {
  INLINE_AVATAR_MIME_TYPES,
  INLINE_CONTRACT_MIME_TYPES,
  getContractFileName,
  getEmployeeDisplayName,
  getEmployeeErrorContent
} from './utils';

export interface EmployeeFilterForm {
  employeeCode: string;
  fullName: string;
  employmentStatus: string;
}

const normalizeFilter = (filter: EmployeeFilterForm): EmployeeFilterForm => ({
  employeeCode: filter.employeeCode.trim(),
  fullName: filter.fullName.trim(),
  employmentStatus: filter.employmentStatus.trim()
});

export default function useManageEmployees() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const employeeList = useSelector(selectEmployeeList);
  const total = useSelector(selectEmployeeTotal);
  const listLoading = useSelector(selectEmployeeLoadingList);

  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);
  const defaultFilter: EmployeeFilterForm = useMemo(
    () => ({
      employeeCode: '',
      fullName: '',
      employmentStatus: ''
    }),
    []
  );
  const [filter, setFilter] = useState<EmployeeFilterForm>(defaultFilter);
  const [filterApplied, setFilterApplied] = useState<EmployeeFilterForm>(defaultFilter);
  const [avatarUrlMap, setAvatarUrlMap] = useState<Record<number, string>>({});
  const avatarObjectUrlMapRef = useRef<Record<number, { source: string; url: string }>>({});
  const activeAvatarSourceMapRef = useRef<Record<number, string>>({});

  const buildSearchBody = useCallback(
    (appliedFilter: EmployeeFilterForm, page: number): SearchEmployeesReq => {
      const normalizedFilter = normalizeFilter(appliedFilter);

      return {
        page: page - K_SIZE_1,
        size: DEFAULT_PAGE_SIZE,
        employeeCode: normalizedFilter.employeeCode || undefined,
        fullName: normalizedFilter.fullName || undefined,
        employmentStatus: normalizedFilter.employmentStatus || undefined
      };
    },
    []
  );

  const fetchList = useCallback(
    (page: number) => {
      dispatch({
        type: SEARCH_EMPLOYEES,
        payload: {
          body: buildSearchBody(filterApplied, page),
          onFailed: (error?: ErrorBase) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getEmployeeErrorContent(error, 'Tải danh sách nhân sự thất bại')
            });
          }
        }
      });
    },
    [buildSearchBody, filterApplied]
  );

  useEffect(() => {
    fetchList(currentPage);
  }, [currentPage, fetchList]);

  useEffect(() => {
    const activeAvatarSourceMap: Record<number, string> = {};

    employeeList.forEach((employee) => {
      if (!employee.id || !employee.avatarUrl) return;
      activeAvatarSourceMap[employee.id] = employee.avatarUrl;
    });

    activeAvatarSourceMapRef.current = activeAvatarSourceMap;

    Object.entries(avatarObjectUrlMapRef.current).forEach(([employeeId, entry]) => {
      const activeSource = activeAvatarSourceMap[Number(employeeId)];
      if (activeSource === entry.source) return;

      URL.revokeObjectURL(entry.url);
      delete avatarObjectUrlMapRef.current[Number(employeeId)];
    });

    setAvatarUrlMap(
      Object.fromEntries(
        Object.entries(avatarObjectUrlMapRef.current).map(([employeeId, entry]) => [
          Number(employeeId),
          entry.url
        ])
      )
    );

    let disposed = false;
    Object.entries(activeAvatarSourceMap).forEach(([employeeId, source]) => {
      const numericEmployeeId = Number(employeeId);
      if (avatarObjectUrlMapRef.current[numericEmployeeId]?.source === source) return;

      employeeServices.viewEmployeeAvatar(numericEmployeeId).then(async (response) => {
        const fileError = await getBlobResponseError(response);
        if (
          disposed ||
          activeAvatarSourceMapRef.current[numericEmployeeId] !== source ||
          fileError ||
          !isBlobFileResponse(response) ||
          !canViewBlobInline(response, INLINE_AVATAR_MIME_TYPES)
        ) {
          return;
        }

        const avatarUrl = URL.createObjectURL(response.blob);
        if (disposed || activeAvatarSourceMapRef.current[numericEmployeeId] !== source) {
          URL.revokeObjectURL(avatarUrl);
          return;
        }

        avatarObjectUrlMapRef.current[numericEmployeeId] = { source, url: avatarUrl };
        setAvatarUrlMap((prev) => ({ ...prev, [numericEmployeeId]: avatarUrl }));
      });
    });

    return () => {
      disposed = true;
    };
  }, [employeeList]);

  useEffect(
    () => () => {
      Object.values(avatarObjectUrlMapRef.current).forEach((entry) => {
        URL.revokeObjectURL(entry.url);
      });
      avatarObjectUrlMapRef.current = {};
      activeAvatarSourceMapRef.current = {};
    },
    []
  );

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

  const onChangeFilter = useCallback((key: keyof EmployeeFilterForm, value: string) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  }, []);

  const onApplyFilter = useCallback(() => {
    setFilterApplied(normalizeFilter(filter));
    setCurrentPage(K_SIZE_1);
  }, [filter]);

  const onResetFilter = useCallback(
    (key?: keyof EmployeeFilterForm) => {
      if (key) {
        setFilter((prev) => ({ ...prev, [key]: '' }));
        setFilterApplied((prev) => ({ ...prev, [key]: '' }));
      } else {
        setFilter(defaultFilter);
        setFilterApplied(defaultFilter);
      }
      setCurrentPage(K_SIZE_1);
    },
    [defaultFilter]
  );

  const refreshAfterMutation = useCallback(() => {
    if (currentPage === K_SIZE_1) {
      fetchList(K_SIZE_1);
      return;
    }
    setCurrentPage(K_SIZE_1);
  }, [currentPage, fetchList]);

  const onOpenCreate = useCallback(() => {
    router.push(ROUTES.EMPLOYEE_ADD);
  }, [router]);

  const onOpenDetail = useCallback(
    (employee: Employee) => {
      router.push(`${ROUTES.EMPLOYEE_DETAIL}?id=${employee.id}`);
    },
    [router]
  );

  const onOpenUpdate = useCallback(
    (employee: Employee) => {
      router.push(`${ROUTES.EMPLOYEE_EDIT}?id=${employee.id}`);
    },
    [router]
  );

  const onDeleteSuccess = useCallback(() => {
    refreshAfterMutation();
    showToast({
      type: TYPE_TOAST.SUCCESS,
      content: 'Xoá nhân sự thành công'
    });
  }, [refreshAfterMutation]);

  const onDelete = useCallback(
    (employee: Employee) => {
      showDialog({
        title: t('common:delete_confirm'),
        content: (
          <>
            Bạn có chắc chắn xoá nhân sự <strong>{getEmployeeDisplayName(employee)}</strong> này?
          </>
        ),
        type: TYPE_MESSAGE.ALERT,
        actions: [
          {
            title: t('common:agree'),
            type: TYPE_ACTION.PRIMARY,
            onPress: () => {
              dispatch({
                type: DELETE_EMPLOYEE,
                payload: {
                  body: { id: employee.id },
                  onSuccess: onDeleteSuccess,
                  onFailed: (error?: ErrorBase) => {
                    showToast({
                      type: TYPE_TOAST.ERROR,
                      content: getEmployeeErrorContent(error, 'Xoá nhân sự thất bại')
                    });
                  }
                }
              });
            }
          },
          {
            title: t('common:cancel'),
            type: TYPE_ACTION.SECONDARY
          }
        ]
      });
    },
    [onDeleteSuccess, t]
  );

  const ensureContractFile = useCallback((employee: Employee) => {
    if (employee.contractFilePath || employee.contractFileName) return true;
    showToast({
      type: TYPE_TOAST.INFO,
      content: 'Nhân sự chưa có file hợp đồng'
    });
    return false;
  }, []);

  const onViewContractFile = useCallback(
    async (employee: Employee) => {
      if (!ensureContractFile(employee)) return;

      const targetWindow = window.open('about:blank', '_blank');
      if (targetWindow) {
        targetWindow.opener = null;
      }

      const response = await employeeServices.viewEmployeeContractFile(employee.id);
      const fileError = await getBlobResponseError(response);
      if (fileError || !isBlobFileResponse(response)) {
        targetWindow?.close();
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getEmployeeErrorContent(fileError || response, 'Xem hợp đồng thất bại')
        });
        return;
      }

      if (!canViewBlobInline(response, INLINE_CONTRACT_MIME_TYPES)) {
        targetWindow?.close();
        showToast({
          type: TYPE_TOAST.INFO,
          content: 'Định dạng file này chỉ hỗ trợ tải xuống'
        });
        return;
      }

      const viewUrl = URL.createObjectURL(response.blob);
      if (targetWindow) {
        targetWindow.location.href = viewUrl;
      } else {
        window.open(viewUrl, '_blank', 'noopener,noreferrer');
      }
      window.setTimeout(() => URL.revokeObjectURL(viewUrl), 60000);
    },
    [ensureContractFile]
  );

  const onDownloadContractFile = useCallback(
    async (employee: Employee) => {
      if (!ensureContractFile(employee)) return;

      const response = await employeeServices.downloadEmployeeContractFile(employee.id);
      const fileError = await getBlobResponseError(response);
      if (fileError || !isBlobFileResponse(response)) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getEmployeeErrorContent(fileError || response, 'Tải hợp đồng thất bại')
        });
        return;
      }

      downloadBlobResponse(response, getContractFileName(employee, response.fileName));
    },
    [ensureContractFile]
  );

  return {
    t,
    router,
    employeeList,
    total,
    listLoading,
    currentPage,
    pagination,
    filter,
    filterApplied,
    avatarUrlMap,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    onOpenCreate,
    onOpenDetail,
    onOpenUpdate,
    onDelete,
    onViewContractFile,
    onDownloadContractFile
  };
}
