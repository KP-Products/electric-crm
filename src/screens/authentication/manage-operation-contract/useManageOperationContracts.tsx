import { DEFAULT_PAGE_SIZE, FILE_EXT, K_SIZE_1, MAX_PAGE_SIZE } from '@constant';
import {
  DELETE_OPERATION_CONTRACT,
  SEARCH_OPERATION_CONTRACT
} from '@redux-action-type/operation-contract';
import { dispatch } from '@redux-common';
import {
  selectOperationContractList,
  selectOperationContractLoadingList,
  selectOperationContractTotal
} from '@redux-selector/operation-contract';
import { showDialog } from 'components/dialog';
import { TYPE_ACTION, TYPE_MESSAGE } from 'components/dialog/type';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import { ErrorBase } from 'model/common';
import { OperationContract } from 'model/operation-contract';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import operationContractServices from 'services/operation-contract-services';
import { FORMAT_DATE_TIME_DOWNLOAD } from 'utils/date';
import { useAppTranslation } from 'utils/i18n';
import {
  buildSearchOperationContractsBody,
  DEFAULT_OPERATION_CONTRACT_FILTER,
  displayText,
  escapeHtml,
  getOperationContractErrorMessage,
  getOperationContractId,
  getOperationContractStatusMeta,
  OperationContractFilter,
  renderOperationContractDate
} from './utils';
import useCustomerLookup from '../manage-contract/hooks/useCustomerLookup';

export default function useManageOperationContracts() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const operationContractList = useSelector(selectOperationContractList);
  const total = useSelector(selectOperationContractTotal);
  const listLoading = useSelector(selectOperationContractLoadingList);

  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);
  const [filter, setFilter] = useState<OperationContractFilter>(DEFAULT_OPERATION_CONTRACT_FILTER);
  const [filterApplied, setFilterApplied] = useState<OperationContractFilter>(
    DEFAULT_OPERATION_CONTRACT_FILTER
  );
  const [exportLoading, setExportLoading] = useState<boolean>(false);

  const pinnedCustomerIds = useMemo(
    () => [filter.customerId, filterApplied.customerId].filter(Boolean).map(Number),
    [filter.customerId, filterApplied.customerId]
  );

  const { customerOptions, getCustomerDisplay, onOpenCustomerDropdown, customerDropdownRender } =
    useCustomerLookup({
      autoLoad: false,
      pinnedIds: pinnedCustomerIds,
      showErrorToast: true
    });

  const fetchList = useCallback(
    (page: number) => {
      dispatch({
        type: SEARCH_OPERATION_CONTRACT,
        payload: {
          body: buildSearchOperationContractsBody(filterApplied, page),
          onFailed: (error?: ErrorBase) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getOperationContractErrorMessage(
                error,
                'Tải danh sách hợp đồng vận hành thất bại'
              )
            });
          }
        }
      });
    },
    [filterApplied]
  );

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

  const onChangeFilter = useCallback(
    (
      key: keyof OperationContractFilter,
      value: OperationContractFilter[keyof OperationContractFilter]
    ) => {
      setFilter((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const onApplyFilter = useCallback(() => {
    setFilterApplied(filter);
    setCurrentPage(K_SIZE_1);
  }, [filter]);

  const onResetFilter = useCallback((key?: keyof OperationContractFilter) => {
    if (key) {
      setFilter((prev) => ({ ...prev, [key]: DEFAULT_OPERATION_CONTRACT_FILTER[key] }));
      setFilterApplied((prev) => ({ ...prev, [key]: DEFAULT_OPERATION_CONTRACT_FILTER[key] }));
    } else {
      setFilter(DEFAULT_OPERATION_CONTRACT_FILTER);
      setFilterApplied(DEFAULT_OPERATION_CONTRACT_FILTER);
    }
    setCurrentPage(K_SIZE_1);
  }, []);

  const refreshAfterDelete = useCallback(() => {
    if (operationContractList.length === K_SIZE_1 && currentPage > K_SIZE_1) {
      setCurrentPage(currentPage - K_SIZE_1);
      return;
    }

    fetchList(currentPage);
  }, [currentPage, fetchList, operationContractList.length]);

  const onOpenCreate = useCallback(() => {
    router.push(ROUTES.MANAGE_OPERATION_CONTRACT_ADD);
  }, [router]);

  const onOpenUpdate = useCallback(
    (contract: OperationContract) => {
      const contractId = getOperationContractId(contract);
      if (!contractId) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: 'Không tìm thấy ID hợp đồng vận hành để cập nhật'
        });
        return;
      }

      router.push(`${ROUTES.MANAGE_OPERATION_CONTRACT_EDIT}?id=${contractId}`);
    },
    [router]
  );

  const onOpenDetail = useCallback(
    (contract: OperationContract) => {
      const contractId = getOperationContractId(contract);
      if (!contractId) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: 'Không tìm thấy ID hợp đồng vận hành'
        });
        return;
      }

      router.push(`${ROUTES.MANAGE_OPERATION_CONTRACT_DETAIL}?id=${contractId}`);
    },
    [router]
  );

  const onDeleteSuccess = useCallback(() => {
    refreshAfterDelete();
    showToast({
      type: TYPE_TOAST.SUCCESS,
      content: 'Xoá hợp đồng vận hành thành công'
    });
  }, [refreshAfterDelete]);

  const onDelete = useCallback(
    (contract: OperationContract) => {
      const contractId = getOperationContractId(contract);
      if (!contractId) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: 'Không tìm thấy ID hợp đồng vận hành để xoá'
        });
        return;
      }

      showDialog({
        title: t('common:delete_confirm'),
        content: (
          <>
            Bạn có chắc chắn xoá hợp đồng vận hành{' '}
            <strong>{contract.contractNumber || contract.contractName}</strong> này?
          </>
        ),
        type: TYPE_MESSAGE.ALERT,
        actions: [
          {
            title: t('common:agree'),
            type: TYPE_ACTION.PRIMARY,
            onPress: () => {
              dispatch({
                type: DELETE_OPERATION_CONTRACT,
                payload: {
                  body: { id: contractId },
                  onSuccess: onDeleteSuccess,
                  onFailed: (error?: ErrorBase) => {
                    showToast({
                      type: TYPE_TOAST.ERROR,
                      content: getOperationContractErrorMessage(
                        error,
                        'Xoá hợp đồng vận hành thất bại'
                      )
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

  const exportRowsToExcel = useCallback((rows: OperationContract[]) => {
    const columns = [
      ['contractNumber', 'Số hợp đồng'],
      ['contractName', 'Tên hợp đồng'],
      ['customerId', 'Khách hàng'],
      ['contractType', 'Loại hợp đồng'],
      ['signedDate', 'Ngày ký'],
      ['effectiveDate', 'Ngày hiệu lực'],
      ['expiryDate', 'Ngày hết hạn'],
      ['status', 'Trạng thái'],
      ['createdBy', 'Người tạo'],
      ['createdAt', 'Ngày tạo']
    ];
    const headerHtml = columns.map(([, label]) => `<th>${escapeHtml(label)}</th>`).join('');
    const bodyHtml = rows
      .map(
        (row) =>
          `<tr>${columns
            .map(([key]) => {
              const value = (() => {
                if (key === 'customerId')
                  return (
                    [row.customerCode, row.customerName].filter(Boolean).join(' - ') ||
                    displayText(row.customerId)
                  );
                if (key === 'signedDate' || key === 'effectiveDate' || key === 'expiryDate') {
                  return renderOperationContractDate(row[key]);
                }
                if (key === 'status') return getOperationContractStatusMeta(row.status).label;
                return displayText(row[key as keyof OperationContract] as string | number);
              })();
              return `<td>${escapeHtml(value)}</td>`;
            })
            .join('')}</tr>`
      )
      .join('');
    const html = `<html><head><meta charset="UTF-8" /></head><body><table border="1"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `OPERATION_CONTRACT_${moment().format(FORMAT_DATE_TIME_DOWNLOAD)}.${FILE_EXT.EXCEL2}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, []);

  const onExport = useCallback(async () => {
    setExportLoading(true);
    const response = await operationContractServices.searchOperationContracts({
      ...buildSearchOperationContractsBody(filterApplied, K_SIZE_1, MAX_PAGE_SIZE)
    });
    setExportLoading(false);

    if (!response || !response.data) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getOperationContractErrorMessage(response, 'Xuất Excel hợp đồng vận hành thất bại')
      });
      return;
    }

    exportRowsToExcel(Array.isArray(response.data.items) ? response.data.items : []);
    showToast({ type: TYPE_TOAST.SUCCESS, content: 'Xuất Excel hợp đồng vận hành thành công' });
  }, [exportRowsToExcel, filterApplied]);

  return {
    t,
    operationContractList,
    total,
    listLoading,
    exportLoading,
    currentPage,
    pagination,
    filter,
    filterApplied,
    customerOptions,
    getCustomerDisplay,
    onOpenCustomerDropdown,
    customerDropdownRender,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    onOpenCreate,
    onOpenUpdate,
    onOpenDetail,
    onDelete,
    onExport
  };
}
