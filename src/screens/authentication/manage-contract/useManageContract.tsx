import { DEFAULT_PAGE_SIZE, FILE_EXT, K_SIZE_1, MAX_PAGE_SIZE } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import { CUSTOMER_LIST } from '@redux-action-type/customer-type';
import {
  CREATE_CONTRACT,
  DELETE_CONTRACT,
  SEARCH_CONTRACT,
  UPDATE_CONTRACT
} from '@redux-action-type/contract';
import { dispatch } from '@redux-common';
import {
  selectContractList,
  selectContractLoadingDetail,
  selectContractLoadingList,
  selectContractTotal
} from '@redux-selector/contract';
import { showDialog } from 'components/dialog';
import { TYPE_ACTION, TYPE_MESSAGE } from 'components/dialog/type';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ErrorBase } from 'model/common';
import {
  Contract,
  ContractSearchReq,
  CreateContractReq,
  DeleteContractReq,
  UpdateContractReq
} from 'model/contract';
import { Customer } from 'model/customer';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import contractServices from 'services/contract-services';
import type {
  ContractFilterDrawerRef,
  ContractFilterForm
} from 'screens/authentication/manage-contract/components/ContractFilterDrawer';
import { FORMAT_DATE_TIME_DOWNLOAD } from 'utils/date';
import { useAppTranslation } from 'utils/i18n';
import { z } from 'zod';

const ISO_DATE_FORMAT = 'YYYY-MM-DD';

const contractSchema = z.object({
  contractNumber: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập số hợp đồng' }),
  customerId: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn khách hàng' }),
  customerType: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn loại khách hàng' }),
  voltageLevelId: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn cấp điện áp' }),
  capacityKva: z
    .string()
    .trim()
    .min(K_SIZE_1, { message: 'Vui lòng nhập công suất' })
    .refine((value) => Number(value) > 0, { message: 'Công suất phải lớn hơn 0' }),
  signedDate: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn ngày ký' }),
  effectiveDate: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn ngày hiệu lực' }),
  expiryDate: z.string().trim(),
  note: z.string().trim()
});

const extendSchema = z.object({
  expiryDate: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn ngày hết hạn mới' }),
  note: z.string().trim()
});

const statusSchema = z.object({
  status: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn trạng thái' }),
  note: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập lý do' })
});

export type ContractForm = z.infer<typeof contractSchema>;
export type ContractExtendForm = z.infer<typeof extendSchema>;
export type ContractStatusForm = z.infer<typeof statusSchema>;

const VOLTAGE_LEVEL_API_VALUE_MAP: Record<string, string> = {
  V_0_4_KV: 'V_0_4_KV',
  V_6_KV: 'V_6_KV',
  V_22_KV: 'V_22_KV',
  V_110_KV: 'V_110_KV',
  '0.4kV': 'V_0_4_KV',
  '6kV': 'V_6_KV',
  '22kV': 'V_22_KV',
  '110kV': 'V_110_KV'
};

const normalizeVoltageLevel = (voltageLevel?: string) =>
  voltageLevel ? VOLTAGE_LEVEL_API_VALUE_MAP[voltageLevel] || voltageLevel : undefined;

const escapeHtml = (value?: string | number) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export default function useManageContract() {
  const { t } = useAppTranslation();
  const contractList = useSelector(selectContractList);
  const total = useSelector(selectContractTotal);
  const listLoading = useSelector(selectContractLoadingList);
  const detailLoading = useSelector(selectContractLoadingDetail);

  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [openExtend, setOpenExtend] = useState<boolean>(false);
  const [openStatus, setOpenStatus] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [selectedContract, setSelectedContract] = useState<Contract>();
  const [selectedExtendContract, setSelectedExtendContract] = useState<Contract>();
  const [selectedStatusContract, setSelectedStatusContract] = useState<Contract>();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const filterDrawerRef = useRef<ContractFilterDrawerRef>(null);

  const defaultFilter: ContractFilterForm = useMemo(
    () => ({
      contractNumber: '',
      customerId: '',
      customerType: '',
      status: ''
    }),
    []
  );
  const [filterApplied, setFilterApplied] = useState<ContractFilterForm>(defaultFilter);

  const form = useForm<ContractForm>({
    mode: 'onTouched',
    defaultValues: {
      contractNumber: '',
      customerId: '',
      customerType: '',
      voltageLevelId: '',
      capacityKva: '',
      signedDate: '',
      effectiveDate: '',
      expiryDate: '',
      note: ''
    },
    resolver: zodResolver(contractSchema)
  });

  const extendForm = useForm<ContractExtendForm>({
    mode: 'onTouched',
    defaultValues: {
      expiryDate: '',
      note: ''
    },
    resolver: zodResolver(extendSchema)
  });

  const statusForm = useForm<ContractStatusForm>({
    mode: 'onTouched',
    defaultValues: {
      status: '',
      note: ''
    },
    resolver: zodResolver(statusSchema)
  });

  const customerOptions = useMemo(
    () =>
      customers.map((customer) => ({
        value: customer.id,
        label: `${customer.customerCode || customer.id} - ${customer.fullName || customer.id}`
      })),
    [customers]
  );

  const customerLabelMap = useMemo(
    () => Object.fromEntries(customerOptions.map((option) => [option.value, option.label])),
    [customerOptions]
  );

  const buildSearchBody = useCallback(
    (filter: ContractFilterForm, page: number): ContractSearchReq => {
      const normalizedFilter = Object.fromEntries(
        Object.entries(filter)
          .map(([key, value]) => [key, value.trim()])
          .filter(([, value]) => Boolean(value))
      );

      return {
        page: page - K_SIZE_1,
        size: DEFAULT_PAGE_SIZE,
        ...normalizedFilter
      };
    },
    []
  );

  const fetchList = useCallback(
    (page: number) => {
      dispatch({
        type: SEARCH_CONTRACT,
        payload: {
          body: buildSearchBody(filterApplied, page),
          onFailed: (error?: ErrorBase) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content:
                error?.businessErrorMessage ||
                error?.systemErrorMessage ||
                'Tải danh sách hợp đồng thất bại'
            });
          }
        }
      });
    },
    [buildSearchBody, filterApplied]
  );

  const fetchCustomers = useCallback(() => {
    dispatch({
      type: CUSTOMER_LIST,
      payload: {
        onSuccess: (data?: Customer[]) => setCustomers(data || []),
        onFailed: () => {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: 'Tải danh sách khách hàng thất bại'
          });
        }
      }
    });
  }, []);

  useEffect(() => {
    fetchList(currentPage);
  }, [currentPage, fetchList]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

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

  const onApplyFilter = useCallback((data: ContractFilterForm) => {
    setFilterApplied(data);
    setCurrentPage(K_SIZE_1);
  }, []);

  const onResetFilter = useCallback(
    (key?: keyof ContractFilterForm) => {
      if (key) {
        setFilterApplied((prev) => ({ ...prev, [key]: '' }));
      } else {
        setFilterApplied(defaultFilter);
      }
      setCurrentPage(K_SIZE_1);
    },
    [defaultFilter]
  );

  const buildDefaultContractNumber = useCallback(() => {
    const currentYear = new Date().getFullYear();
    const nextNumber = String(total + K_SIZE_1).padStart(3, '0');
    return `HD-${currentYear}-${nextNumber}`;
  }, [total]);

  const onOpenCreate = useCallback(() => {
    setSelectedContract(undefined);
    form.reset({
      contractNumber: buildDefaultContractNumber(),
      customerId: '',
      customerType: '',
      voltageLevelId: '',
      capacityKva: '',
      signedDate: '',
      effectiveDate: '',
      expiryDate: '',
      note: ''
    });
    setOpenForm(true);
  }, [buildDefaultContractNumber, form]);

  const onOpenUpdate = useCallback(
    (contract: Contract) => {
      setSelectedContract(contract);
      form.reset({
        contractNumber: contract.contractNumber || '',
        customerId: contract.customerId || '',
        customerType: contract.customerType || '',
        voltageLevelId: normalizeVoltageLevel(contract.voltageLevelId) || '',
        capacityKva:
          contract.capacityKva !== undefined && contract.capacityKva !== null
            ? String(contract.capacityKva)
            : '',
        signedDate: contract.signedDate || '',
        effectiveDate: contract.effectiveDate || '',
        expiryDate: contract.expiryDate || '',
        note: contract.note || ''
      });
      setOpenForm(true);
    },
    [form]
  );

  const onCloseForm = useCallback(() => {
    setOpenForm(false);
    setSelectedContract(undefined);
    form.reset();
  }, [form]);

  const onSubmitSuccess = useCallback(
    (content: string) => {
      onCloseForm();
      if (currentPage === K_SIZE_1) {
        fetchList(K_SIZE_1);
      } else {
        setCurrentPage(K_SIZE_1);
      }
      showToast({
        type: TYPE_TOAST.SUCCESS,
        content
      });
    },
    [currentPage, fetchList, onCloseForm]
  );

  const buildBasePayloadFromRecord = useCallback(
    (contract: Contract, override?: Partial<UpdateContractReq>): UpdateContractReq => ({
      id: contract.id,
      contractNumber: contract.contractNumber,
      customerId: contract.customerId,
      voltageLevelId: normalizeVoltageLevel(contract.voltageLevelId),
      customerType: contract.customerType || undefined,
      capacityKva: Number(contract.capacityKva || 0),
      signedDate: contract.signedDate || '',
      effectiveDate: contract.effectiveDate || contract.signedDate || '',
      expiryDate: contract.expiryDate || undefined,
      status: contract.status || undefined,
      note: contract.note || undefined,
      ...override
    }),
    []
  );

  const handleSubmit = useCallback(
    (data: ContractForm) => {
      const body: CreateContractReq = {
        contractNumber: data.contractNumber,
        customerId: data.customerId,
        voltageLevelId: normalizeVoltageLevel(data.voltageLevelId),
        customerType: data.customerType,
        capacityKva: Number(data.capacityKva),
        signedDate: data.signedDate,
        effectiveDate: data.effectiveDate,
        expiryDate: data.expiryDate || undefined,
        note: data.note || undefined,
        status: selectedContract?.status || undefined
      };

      if (selectedContract) {
        dispatch({
          type: UPDATE_CONTRACT,
          payload: {
            body: {
              id: selectedContract.id,
              ...body
            },
            onSuccess: () => onSubmitSuccess('Cập nhật hợp đồng thành công'),
            onFailed: (error?: ErrorBase) => {
              showToast({
                type: TYPE_TOAST.ERROR,
                content:
                  error?.businessErrorMessage ||
                  error?.systemErrorMessage ||
                  'Cập nhật hợp đồng thất bại'
              });
            }
          }
        });
        return;
      }

      dispatch({
        type: CREATE_CONTRACT,
        payload: {
          body,
          onSuccess: () => onSubmitSuccess('Tạo hợp đồng thành công'),
          onFailed: (error?: ErrorBase) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content:
                error?.businessErrorMessage || error?.systemErrorMessage || 'Tạo hợp đồng thất bại'
            });
          }
        }
      });
    },
    [onSubmitSuccess, selectedContract]
  );

  const onOpenExtend = useCallback(
    (contract: Contract) => {
      setSelectedExtendContract(contract);
      extendForm.reset({
        expiryDate: contract.expiryDate || '',
        note: contract.note || ''
      });
      setOpenExtend(true);
    },
    [extendForm]
  );

  const onCloseExtend = useCallback(() => {
    setOpenExtend(false);
    setSelectedExtendContract(undefined);
    extendForm.reset();
  }, [extendForm]);

  const handleExtendSubmit = useCallback(
    (data: ContractExtendForm) => {
      if (!selectedExtendContract) return;
      const body = buildBasePayloadFromRecord(selectedExtendContract, {
        expiryDate: data.expiryDate,
        note: data.note || selectedExtendContract.note || undefined,
        status: 'HIEU_LUC'
      });

      dispatch({
        type: UPDATE_CONTRACT,
        payload: {
          body,
          onSuccess: () => {
            onCloseExtend();
            fetchList(currentPage);
            showToast({ type: TYPE_TOAST.SUCCESS, content: 'Gia hạn hợp đồng thành công' });
          },
          onFailed: (error?: ErrorBase) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content:
                error?.businessErrorMessage ||
                error?.systemErrorMessage ||
                'Gia hạn hợp đồng thất bại'
            });
          }
        }
      });
    },
    [buildBasePayloadFromRecord, currentPage, fetchList, onCloseExtend, selectedExtendContract]
  );

  const onOpenStatus = useCallback(
    (contract: Contract) => {
      setSelectedStatusContract(contract);
      statusForm.reset({
        status: contract.status || '',
        note: contract.note || ''
      });
      setOpenStatus(true);
    },
    [statusForm]
  );

  const onCloseStatus = useCallback(() => {
    setOpenStatus(false);
    setSelectedStatusContract(undefined);
    statusForm.reset();
  }, [statusForm]);

  const handleStatusSubmit = useCallback(
    (data: ContractStatusForm) => {
      if (!selectedStatusContract) return;
      const body = buildBasePayloadFromRecord(selectedStatusContract, {
        status: data.status,
        note: data.note
      });

      dispatch({
        type: UPDATE_CONTRACT,
        payload: {
          body,
          onSuccess: () => {
            onCloseStatus();
            fetchList(currentPage);
            showToast({ type: TYPE_TOAST.SUCCESS, content: 'Cập nhật trạng thái thành công' });
          },
          onFailed: (error?: ErrorBase) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content:
                error?.businessErrorMessage ||
                error?.systemErrorMessage ||
                'Cập nhật trạng thái thất bại'
            });
          }
        }
      });
    },
    [buildBasePayloadFromRecord, currentPage, fetchList, onCloseStatus, selectedStatusContract]
  );

  const onDeleteSuccess = useCallback(() => {
    fetchList(currentPage);
    showToast({
      type: TYPE_TOAST.SUCCESS,
      content: 'Xoá hợp đồng thành công'
    });
  }, [currentPage, fetchList]);

  const onDelete = useCallback(
    (contract: Contract) => {
      showDialog({
        title: t('common:delete_confirm'),
        content: (
          <>
            Bạn có chắc chắn xoá hợp đồng <strong>{contract.contractNumber}</strong> này?
          </>
        ),
        type: TYPE_MESSAGE.ALERT,
        actions: [
          {
            title: t('common:agree'),
            type: TYPE_ACTION.PRIMARY,
            onPress: () => {
              const body: DeleteContractReq = { id: contract.id };
              dispatch({
                type: DELETE_CONTRACT,
                payload: {
                  body,
                  onSuccess: onDeleteSuccess,
                  onFailed: (error?: ErrorBase) => {
                    showToast({
                      type: TYPE_TOAST.ERROR,
                      content:
                        error?.businessErrorMessage ||
                        error?.systemErrorMessage ||
                        'Xoá hợp đồng thất bại'
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
    (rows: Contract[], getDisplayValue: (contract: Contract, key: string) => string) => {
      const columns = [
        ['contractNumber', 'Số hợp đồng'],
        ['customerId', 'Khách hàng'],
        ['customerType', 'Loại khách hàng'],
        ['voltageLevelId', 'Cấp điện áp'],
        ['capacityKva', 'Công suất (kVA)'],
        ['signedDate', 'Ngày ký'],
        ['effectiveDate', 'Ngày hiệu lực'],
        ['expiryDate', 'Ngày hết hạn'],
        ['status', 'Trạng thái'],
        ['note', 'Ghi chú']
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
      link.download = `CONTRACT_${moment().format(FORMAT_DATE_TIME_DOWNLOAD)}.${FILE_EXT.EXCEL2}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    },
    []
  );

  const onExport = useCallback(
    async (getDisplayValue: (contract: Contract, key: string) => string) => {
      setExportLoading(true);
      const response = await contractServices.searchContract({
        ...buildSearchBody(filterApplied, K_SIZE_1),
        size: MAX_PAGE_SIZE
      });
      setExportLoading(false);

      if (!response || !response.data) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content:
            response?.businessErrorMessage ||
            response?.systemErrorMessage ||
            'Xuất Excel hợp đồng thất bại'
        });
        return;
      }

      exportRowsToExcel(response.data.items || [], getDisplayValue);
      showToast({ type: TYPE_TOAST.SUCCESS, content: 'Xuất Excel hợp đồng thành công' });
    },
    [buildSearchBody, exportRowsToExcel, filterApplied]
  );

  return {
    t,
    contractList,
    total,
    listLoading,
    detailLoading,
    exportLoading,
    currentPage,
    pagination,
    defaultFilter,
    filterApplied,
    filterDrawerRef,
    customerOptions,
    customerLabelMap,
    onApplyFilter,
    onResetFilter,
    openForm,
    selectedContract,
    form,
    handleSubmit,
    onOpenCreate,
    onOpenUpdate,
    onCloseForm,
    openExtend,
    extendForm,
    handleExtendSubmit,
    onOpenExtend,
    onCloseExtend,
    openStatus,
    statusForm,
    handleStatusSubmit,
    onOpenStatus,
    onCloseStatus,
    onDelete,
    onExport,
    isoDateFormat: ISO_DATE_FORMAT
  };
}
