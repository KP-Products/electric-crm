import { DEFAULT_PAGE_SIZE, FILE_EXT, K_SIZE_1, MAX_PAGE_SIZE } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CREATE_OPERATION_UNIT,
  DELETE_OPERATION_UNIT,
  GET_OPERATION_UNIT_DETAIL,
  SEARCH_OPERATION_UNIT,
  UPDATE_OPERATION_UNIT
} from '@redux-action-type/operation-unit';
import { dispatch } from '@redux-common';
import {
  selectOperationUnitList,
  selectOperationUnitLoadingDetail,
  selectOperationUnitLoadingList,
  selectOperationUnitTotal
} from '@redux-selector/operation-unit';
import { showDialog } from 'components/dialog';
import { TYPE_ACTION, TYPE_MESSAGE } from 'components/dialog/type';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ErrorBase } from 'model/common';
import {
  CreateOperationUnitReq,
  OperationUnit,
  OperationUnitRes,
  OPERATION_UNIT_STATUS,
  SearchOperationUnitsReq,
  UpdateOperationUnitReq
} from 'model/operation-unit';
import moment from 'moment';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import operationUnitServices from 'services/operation-unit-services';
import { FORMAT_DATE_TIME_DOWNLOAD } from 'utils/date';
import { useAppTranslation } from 'utils/i18n';
import { z } from 'zod';

export interface OperationUnitFilter {
  unitCode: string;
  unitName: string;
  status: string;
}

export const DEFAULT_OPERATION_UNIT_FILTER: OperationUnitFilter = {
  unitCode: '',
  unitName: '',
  status: ''
};

const optionalTextSchema = z.preprocess((value) => value ?? '', z.string().trim());

const emailSchema = optionalTextSchema.refine(
  (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  {
    message: 'Email không hợp lệ'
  }
);

const operationUnitSchema = z.object({
  unitCode: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập mã đơn vị' }),
  unitName: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập tên đơn vị' }),
  shortName: optionalTextSchema,
  taxNo: optionalTextSchema,
  phone: optionalTextSchema,
  email: emailSchema,
  contactName: optionalTextSchema,
  contractIdNo: optionalTextSchema,
  contactIsueDate: optionalTextSchema,
  address: optionalTextSchema,
  status: optionalTextSchema
});

export type OperationUnitForm = z.infer<typeof operationUnitSchema>;

export const getOperationUnitErrorMessage = (
  error?: ErrorBase & { message?: string },
  fallback = 'Thao tác thất bại'
) =>
  error?.businessErrorMessage ||
  error?.systemErrorMessage ||
  error?.detailMessage ||
  error?.message ||
  fallback;

const optionalValue = (value?: string) => {
  const trimmedValue = value?.trim();
  return trimmedValue || undefined;
};

const updateTextValue = (value?: string) => value?.trim() || '';

const sanitizeExcelValue = (value?: string | number) => {
  const stringValue = String(value ?? '');
  if (stringValue !== '-' && /^[\t\r\n ]*[=+\-@]/.test(stringValue)) {
    return `'${stringValue}`;
  }
  return stringValue;
};

const escapeHtml = (value?: string | number) =>
  sanitizeExcelValue(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const normalizeStatusValue = (status?: string) => {
  if (!status) return OPERATION_UNIT_STATUS.ACTIVE;
  if (status === OPERATION_UNIT_STATUS.ACTIVE || status.toUpperCase() === 'ACTIVE') {
    return OPERATION_UNIT_STATUS.ACTIVE;
  }
  if (status === OPERATION_UNIT_STATUS.INACTIVE || status.toUpperCase() === 'INACTIVE') {
    return OPERATION_UNIT_STATUS.INACTIVE;
  }
  return status;
};

const buildFormValues = (operationUnit?: OperationUnit): OperationUnitForm => ({
  unitCode: operationUnit?.unitCode || '',
  unitName: operationUnit?.unitName || '',
  shortName: operationUnit?.shortName || '',
  taxNo: operationUnit?.taxNo || '',
  phone: operationUnit?.phone || '',
  email: operationUnit?.email || '',
  contactName: operationUnit?.contactName || '',
  contractIdNo: operationUnit?.contractIdNo || '',
  contactIsueDate: operationUnit?.contactIsueDate || '',
  address: operationUnit?.address || '',
  status: normalizeStatusValue(operationUnit?.status)
});

export default function useManageOperationUnit() {
  const { t } = useAppTranslation();
  const operationUnitList = useSelector(selectOperationUnitList);
  const total = useSelector(selectOperationUnitTotal);
  const listLoading = useSelector(selectOperationUnitLoadingList);
  const detailLoading = useSelector(selectOperationUnitLoadingDetail);

  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);
  const [filter, setFilter] = useState<OperationUnitFilter>(DEFAULT_OPERATION_UNIT_FILTER);
  const [filterApplied, setFilterApplied] = useState<OperationUnitFilter>(
    DEFAULT_OPERATION_UNIT_FILTER
  );
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [openDetail, setOpenDetail] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [selectedOperationUnit, setSelectedOperationUnit] = useState<OperationUnit>();
  const [selectedDetail, setSelectedDetail] = useState<OperationUnit>();
  const submittingRef = useRef<boolean>(false);

  const form = useForm<OperationUnitForm>({
    mode: 'onTouched',
    defaultValues: buildFormValues(),
    resolver: zodResolver(operationUnitSchema)
  });

  const buildSearchBody = useCallback(
    (appliedFilter: OperationUnitFilter, page: number): SearchOperationUnitsReq => ({
      page: page - K_SIZE_1,
      size: DEFAULT_PAGE_SIZE,
      unitCode: optionalValue(appliedFilter.unitCode),
      unitName: optionalValue(appliedFilter.unitName),
      status: optionalValue(appliedFilter.status)
    }),
    []
  );

  const fetchList = useCallback(
    (page: number) => {
      dispatch({
        type: SEARCH_OPERATION_UNIT,
        payload: {
          body: buildSearchBody(filterApplied, page),
          onFailed: (error?: ErrorBase) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getOperationUnitErrorMessage(error, 'Tải danh sách đơn vị vận hành thất bại')
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

  const refreshFirstPage = useCallback(() => {
    if (currentPage === K_SIZE_1) {
      fetchList(K_SIZE_1);
      return;
    }

    setCurrentPage(K_SIZE_1);
  }, [currentPage, fetchList]);

  const refreshAfterDelete = useCallback(() => {
    if (operationUnitList.length === K_SIZE_1 && currentPage > K_SIZE_1) {
      setCurrentPage(currentPage - K_SIZE_1);
      return;
    }

    fetchList(currentPage);
  }, [currentPage, fetchList, operationUnitList.length]);

  const onChangeFilter = useCallback(
    (key: keyof OperationUnitFilter, value: OperationUnitFilter[keyof OperationUnitFilter]) => {
      setFilter((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const onApplyFilter = useCallback(() => {
    setFilterApplied(filter);
    setCurrentPage(K_SIZE_1);
  }, [filter]);

  const onResetFilter = useCallback((key?: keyof OperationUnitFilter) => {
    if (key) {
      setFilter((prev) => ({ ...prev, [key]: DEFAULT_OPERATION_UNIT_FILTER[key] }));
      setFilterApplied((prev) => ({ ...prev, [key]: DEFAULT_OPERATION_UNIT_FILTER[key] }));
    } else {
      setFilter(DEFAULT_OPERATION_UNIT_FILTER);
      setFilterApplied(DEFAULT_OPERATION_UNIT_FILTER);
    }
    setCurrentPage(K_SIZE_1);
  }, []);

  const onOpenCreate = useCallback(() => {
    setSelectedOperationUnit(undefined);
    form.reset(buildFormValues());
    setOpenForm(true);
  }, [form]);

  const onOpenUpdate = useCallback(
    (operationUnit: OperationUnit) => {
      setSelectedOperationUnit(operationUnit);
      form.reset(buildFormValues(operationUnit));
      setOpenForm(true);
    },
    [form]
  );

  const onCloseForm = useCallback(() => {
    setOpenForm(false);
    setSelectedOperationUnit(undefined);
    submittingRef.current = false;
    form.reset(buildFormValues());
  }, [form]);

  const onSubmitSuccess = useCallback(
    (content: string) => {
      submittingRef.current = false;
      onCloseForm();
      refreshFirstPage();
      showToast({ type: TYPE_TOAST.SUCCESS, content });
    },
    [onCloseForm, refreshFirstPage]
  );

  const buildCreateBody = useCallback(
    (data: OperationUnitForm): CreateOperationUnitReq => ({
      unitCode: data.unitCode.trim(),
      unitName: data.unitName.trim(),
      shortName: optionalValue(data.shortName),
      taxNo: optionalValue(data.taxNo),
      phone: optionalValue(data.phone),
      email: optionalValue(data.email),
      contactName: optionalValue(data.contactName),
      contractIdNo: optionalValue(data.contractIdNo),
      contactIsueDate: optionalValue(data.contactIsueDate),
      address: optionalValue(data.address),
      status: optionalValue(data.status)
    }),
    []
  );

  const buildUpdateBody = useCallback(
    (id: string, data: OperationUnitForm): UpdateOperationUnitReq => ({
      id,
      unitName: data.unitName.trim(),
      shortName: updateTextValue(data.shortName),
      taxNo: updateTextValue(data.taxNo),
      phone: updateTextValue(data.phone),
      email: updateTextValue(data.email),
      contactName: updateTextValue(data.contactName),
      contractIdNo: updateTextValue(data.contractIdNo),
      contactIsueDate: updateTextValue(data.contactIsueDate),
      address: updateTextValue(data.address),
      status: optionalValue(data.status)
    }),
    []
  );

  const handleSubmit = useCallback(
    (data: OperationUnitForm) => {
      if (submittingRef.current) return;
      submittingRef.current = true;

      if (selectedOperationUnit) {
        if (!selectedOperationUnit.operationUnitId) {
          submittingRef.current = false;
          showToast({
            type: TYPE_TOAST.ERROR,
            content: 'Không tìm thấy ID đơn vị vận hành để cập nhật'
          });
          return;
        }

        dispatch({
          type: UPDATE_OPERATION_UNIT,
          payload: {
            body: buildUpdateBody(selectedOperationUnit.operationUnitId, data),
            onSuccess: () => onSubmitSuccess('Cập nhật đơn vị vận hành thành công'),
            onFailed: (error?: ErrorBase) => {
              submittingRef.current = false;
              showToast({
                type: TYPE_TOAST.ERROR,
                content: getOperationUnitErrorMessage(error, 'Cập nhật đơn vị vận hành thất bại')
              });
            }
          }
        });
        return;
      }

      dispatch({
        type: CREATE_OPERATION_UNIT,
        payload: {
          body: buildCreateBody(data),
          onSuccess: () => onSubmitSuccess('Thêm mới đơn vị vận hành thành công'),
          onFailed: (error?: ErrorBase) => {
            submittingRef.current = false;
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getOperationUnitErrorMessage(error, 'Thêm mới đơn vị vận hành thất bại')
            });
          }
        }
      });
    },
    [buildCreateBody, buildUpdateBody, onSubmitSuccess, selectedOperationUnit]
  );

  const onChangeUnitCode = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      form.setValue('unitCode', event.target.value, {
        shouldDirty: true,
        shouldValidate: true
      });
    },
    [form]
  );

  const onOpenDetail = useCallback((operationUnit: OperationUnit) => {
    setSelectedDetail(undefined);
    setOpenDetail(true);

    if (!operationUnit.operationUnitId) {
      setSelectedDetail(operationUnit);
      return;
    }

    dispatch({
      type: GET_OPERATION_UNIT_DETAIL,
      payload: {
        body: { id: operationUnit.operationUnitId },
        onSuccess: (response: OperationUnitRes) => {
          setSelectedDetail(response.data);
        },
        onFailed: (error?: ErrorBase) => {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getOperationUnitErrorMessage(error, 'Tải chi tiết đơn vị vận hành thất bại')
          });
        }
      }
    });
  }, []);

  const onCloseDetail = useCallback(() => {
    setOpenDetail(false);
    setSelectedDetail(undefined);
  }, []);

  const onDeleteSuccess = useCallback(() => {
    refreshAfterDelete();
    showToast({
      type: TYPE_TOAST.SUCCESS,
      content: 'Xoá đơn vị vận hành thành công'
    });
  }, [refreshAfterDelete]);

  const onDelete = useCallback(
    (operationUnit: OperationUnit) => {
      if (!operationUnit.operationUnitId) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: 'Không tìm thấy ID đơn vị vận hành để xoá'
        });
        return;
      }

      showDialog({
        title: t('common:delete_confirm'),
        content: (
          <>
            Bạn có chắc chắn xoá đơn vị vận hành{' '}
            <strong>{operationUnit.unitCode || operationUnit.unitName}</strong> này?
          </>
        ),
        type: TYPE_MESSAGE.ALERT,
        actions: [
          {
            title: t('common:agree'),
            type: TYPE_ACTION.PRIMARY,
            onPress: () => {
              dispatch({
                type: DELETE_OPERATION_UNIT,
                payload: {
                  body: { id: operationUnit.operationUnitId },
                  onSuccess: onDeleteSuccess,
                  onFailed: (error?: ErrorBase) => {
                    showToast({
                      type: TYPE_TOAST.ERROR,
                      content: getOperationUnitErrorMessage(error, 'Xoá đơn vị vận hành thất bại')
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

  const exportRowsToExcel = useCallback(
    (
      rows: OperationUnit[],
      getDisplayValue: (operationUnit: OperationUnit, key: string) => string
    ) => {
      const columns = [
        ['unitCode', 'Mã đơn vị'],
        ['unitName', 'Tên đơn vị'],
        ['signedDate', 'Ngày ký'],
        ['effectiveDate', 'Ngày hiệu lực'],
        ['expiryDate', 'Ngày hết hiệu lực'],
        ['status', 'Trạng thái'],
        ['createdBy', 'Người tạo'],
        ['updateBy', 'Người cập nhật'],
        ['createdAt', 'Ngày tạo'],
        ['updatedAt', 'Ngày cập nhật']
      ];
      const headerHtml = columns.map(([, label]) => `<th>${escapeHtml(label)}</th>`).join('');
      const bodyHtml = rows
        .map(
          (row) =>
            `<tr>${columns
              .map(([key]) => `<td>${escapeHtml(getDisplayValue(row, key))}</td>`)
              .join('')}</tr>`
        )
        .join('');
      const html = `<html><head><meta charset="UTF-8" /></head><body><table border="1"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></body></html>`;
      const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `OPERATION_UNIT_${moment().format(FORMAT_DATE_TIME_DOWNLOAD)}.${FILE_EXT.EXCEL2}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    },
    []
  );

  const onExport = useCallback(
    async (getDisplayValue: (operationUnit: OperationUnit, key: string) => string) => {
      setExportLoading(true);
      const response = await operationUnitServices.searchOperationUnits({
        ...buildSearchBody(filterApplied, K_SIZE_1),
        size: MAX_PAGE_SIZE
      });
      setExportLoading(false);

      if (!response || !response.data) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getOperationUnitErrorMessage(response, 'Xuất Excel đơn vị vận hành thất bại')
        });
        return;
      }

      exportRowsToExcel(response.data.items || [], getDisplayValue);
      showToast({ type: TYPE_TOAST.SUCCESS, content: 'Xuất Excel đơn vị vận hành thành công' });
    },
    [buildSearchBody, exportRowsToExcel, filterApplied]
  );

  return {
    t,
    operationUnitList,
    total,
    listLoading,
    detailLoading,
    exportLoading,
    currentPage,
    pagination,
    filter,
    filterApplied,
    openForm,
    openDetail,
    selectedOperationUnit,
    selectedDetail,
    form,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    onOpenCreate,
    onOpenUpdate,
    onCloseForm,
    handleSubmit,
    onChangeUnitCode,
    onOpenDetail,
    onCloseDetail,
    onDelete,
    onExport
  };
}
