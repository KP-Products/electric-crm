import { DEFAULT_PAGE_SIZE, K_SIZE_1 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import { showDialog } from 'components/dialog';
import { TYPE_ACTION, TYPE_MESSAGE } from 'components/dialog/type';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import { ErrorBase } from 'model/common';
import { Contract, UpdateContractReq } from 'model/contract';
import { useRouter } from 'next/navigation';
import { type Key, useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import contractServices from 'services/contract-services';
import {
  downloadBlobResponse,
  getBlobResponseError,
  isBlobFileResponse
} from 'utils/blob-response';
import { useAppTranslation } from 'utils/i18n';
import { z } from 'zod';
import useCustomerLookup from './hooks/useCustomerLookup';
import useMeterLookup from './hooks/useMeterLookup';
import useUserLookup from './hooks/useUserLookup';
import {
  buildSearchContractBody,
  CONTRACT_DATE_FORMAT,
  CONTRACT_STATUS,
  ContractFilter,
  ContractStats,
  DEFAULT_CONTRACT_FILTER,
  formatContractDate,
  getContractErrorMessage,
  getContractId,
  getContractStats
} from './utils';

const EMPTY_CONTRACT_STATS: ContractStats = {
  total: 0,
  active: 0,
  expiringSoon: 0,
  expired: 0
};

const extendSchema = z.object({
  expiryDate: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn ngày hết hạn mới' }),
  note: z.string().trim()
});

const statusSchema = z.object({
  status: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn trạng thái' }),
  note: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập lý do' })
});

export type ContractExtendForm = z.infer<typeof extendSchema>;
export type ContractStatusForm = z.infer<typeof statusSchema>;

export default function useManageContract() {
  const { t } = useAppTranslation();
  const router = useRouter();

  const [contractList, setContractList] = useState<Contract[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [contractStats, setContractStats] = useState<ContractStats>(EMPTY_CONTRACT_STATS);
  const [listLoading, setListLoading] = useState<boolean>(false);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);
  const [filter, setFilter] = useState<ContractFilter>(DEFAULT_CONTRACT_FILTER);
  const [filterApplied, setFilterApplied] = useState<ContractFilter>(DEFAULT_CONTRACT_FILTER);
  const [selectedContractKeys, setSelectedContractKeys] = useState<Key[]>([]);
  const [printingContracts, setPrintingContracts] = useState<boolean>(false);
  const [openExtend, setOpenExtend] = useState<boolean>(false);
  const [openStatus, setOpenStatus] = useState<boolean>(false);
  const [selectedExtendContract, setSelectedExtendContract] = useState<Contract>();
  const [selectedStatusContract, setSelectedStatusContract] = useState<Contract>();

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

  const pinnedCustomerIds = useMemo(
    () => [
      filter.customerId,
      filterApplied.customerId,
      ...contractList.map((item) => item.customerId)
    ],
    [contractList, filter.customerId, filterApplied.customerId]
  );

  const pinnedMeterIds = useMemo(
    () => [
      filter.meterId,
      filterApplied.meterId,
      ...contractList.flatMap((contract) => (contract.meters || []).map((meter) => meter.meterId))
    ],
    [contractList, filter.meterId, filterApplied.meterId]
  );

  const { customerOptions, getCustomerDisplay, onOpenCustomerDropdown, customerDropdownRender } =
    useCustomerLookup({
      autoLoad: false,
      pinnedIds: pinnedCustomerIds,
      showErrorToast: true
    });

  const { meterOptions, getMeterDisplay, onOpenMeterDropdown, meterDropdownRender } =
    useMeterLookup({
      autoLoad: false,
      pinnedIds: pinnedMeterIds,
      showErrorToast: true
    });

  const { userOptions, getUserDisplay, onOpenUserDropdown, userDropdownRender } = useUserLookup({
    autoLoad: false,
    showErrorToast: true
  });

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

  const fetchContracts = useCallback(async () => {
    setListLoading(true);
    const response = await contractServices.searchContract(
      buildSearchContractBody(filterApplied, currentPage)
    );
    setListLoading(false);

    if (!response || !response.data) {
      setContractList([]);
      setTotal(0);
      setContractStats(EMPTY_CONTRACT_STATS);
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getContractErrorMessage(response as ErrorBase, 'Tải danh sách hợp đồng thất bại')
      });
      return;
    }

    const nextList = Array.isArray(response.data.items) ? response.data.items : [];
    const nextTotal = response.data.total || 0;
    setContractList(nextList);
    setTotal(nextTotal);
    setContractStats(getContractStats(nextList, nextTotal));
  }, [currentPage, filterApplied]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  useEffect(() => {
    setSelectedContractKeys([]);
  }, [contractList]);

  const onChangeFilter = useCallback(
    (key: keyof ContractFilter, value: ContractFilter[keyof ContractFilter]) => {
      setFilter((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const onApplyFilter = useCallback(() => {
    setFilterApplied(filter);
    setCurrentPage(K_SIZE_1);
  }, [filter]);

  const onResetFilter = useCallback((key?: keyof ContractFilter) => {
    if (key) {
      setFilter((prev) => ({ ...prev, [key]: DEFAULT_CONTRACT_FILTER[key] }));
      setFilterApplied((prev) => ({ ...prev, [key]: DEFAULT_CONTRACT_FILTER[key] }));
    } else {
      setFilter(DEFAULT_CONTRACT_FILTER);
      setFilterApplied(DEFAULT_CONTRACT_FILTER);
    }
    setCurrentPage(K_SIZE_1);
  }, []);

  const refreshCurrentPage = useCallback(() => {
    fetchContracts();
  }, [fetchContracts]);

  const refreshAfterDelete = useCallback(() => {
    if (contractList.length === K_SIZE_1 && currentPage > K_SIZE_1) {
      setCurrentPage(currentPage - K_SIZE_1);
      return;
    }

    refreshCurrentPage();
  }, [contractList.length, currentPage, refreshCurrentPage]);

  const onOpenCreate = useCallback(() => {
    router.push(ROUTES.MANAGE_CONTRACT_ADD);
  }, [router]);

  const onOpenUpdate = useCallback(
    (contract: Contract) => {
      const contractId = getContractId(contract);
      if (!contractId) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: 'Không tìm thấy ID hợp đồng để cập nhật'
        });
        return;
      }

      router.push(`${ROUTES.MANAGE_CONTRACT_EDIT}?id=${contractId}`);
    },
    [router]
  );

  const onCopyContract = useCallback(
    (contract: Contract) => {
      const contractId = getContractId(contract);
      if (!contractId) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: 'Không tìm thấy ID hợp đồng để sao chép'
        });
        return;
      }

      router.push(`${ROUTES.MANAGE_CONTRACT_ADD}?copyId=${encodeURIComponent(contractId)}`);
    },
    [router]
  );

  const onOpenDetail = useCallback(
    (contract: Contract) => {
      const contractId = getContractId(contract);
      if (!contractId) {
        showToast({ type: TYPE_TOAST.ERROR, content: 'Không tìm thấy ID hợp đồng' });
        return;
      }

      router.push(`${ROUTES.MANAGE_CONTRACT_DETAIL}?id=${contractId}`);
    },
    [router]
  );

  const buildPayloadFromContract = useCallback(
    (contract: Contract, override?: Partial<UpdateContractReq>): UpdateContractReq => ({
      id: getContractId(contract),
      contractNumber: contract.contractNumber,
      customerId: contract.customerId as number,
      // Gia hạn / đổi trạng thái: không gửi meters → BE giữ nguyên danh sách công tơ.
      meters: undefined,
      signedDate: formatContractDate(contract.signedDate),
      effectiveDate: formatContractDate(contract.effectiveDate || contract.signedDate),
      expiryDate: formatContractDate(contract.expiryDate) || undefined,
      status: contract.status || undefined,
      note: contract.note || undefined,
      ...override
    }),
    []
  );

  const onOpenExtend = useCallback(
    (contract: Contract) => {
      const contractId = getContractId(contract);
      if (!contractId) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: 'Không tìm thấy ID hợp đồng để gia hạn'
        });
        return;
      }

      setSelectedExtendContract(contract);
      extendForm.reset({
        expiryDate: formatContractDate(contract.expiryDate),
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
    async (data: ContractExtendForm) => {
      if (!selectedExtendContract) return;
      setDetailLoading(true);
      const response = await contractServices.updateContract(
        buildPayloadFromContract(selectedExtendContract, {
          expiryDate: formatContractDate(data.expiryDate),
          note: data.note || selectedExtendContract.note || undefined,
          status: CONTRACT_STATUS.ACTIVE
        })
      );
      setDetailLoading(false);

      if (!response || !response.data) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getContractErrorMessage(response as ErrorBase, 'Gia hạn hợp đồng thất bại')
        });
        return;
      }

      onCloseExtend();
      refreshCurrentPage();
      showToast({ type: TYPE_TOAST.SUCCESS, content: 'Gia hạn hợp đồng thành công' });
    },
    [buildPayloadFromContract, onCloseExtend, refreshCurrentPage, selectedExtendContract]
  );

  const onOpenStatus = useCallback(
    (contract: Contract) => {
      const contractId = getContractId(contract);
      if (!contractId) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: 'Không tìm thấy ID hợp đồng để cập nhật trạng thái'
        });
        return;
      }

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
    async (data: ContractStatusForm) => {
      if (!selectedStatusContract) return;
      setDetailLoading(true);
      const response = await contractServices.updateContract(
        buildPayloadFromContract(selectedStatusContract, {
          status: data.status,
          note: data.note
        })
      );
      setDetailLoading(false);

      if (!response || !response.data) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getContractErrorMessage(response as ErrorBase, 'Cập nhật trạng thái thất bại')
        });
        return;
      }

      onCloseStatus();
      refreshCurrentPage();
      showToast({ type: TYPE_TOAST.SUCCESS, content: 'Cập nhật trạng thái thành công' });
    },
    [buildPayloadFromContract, onCloseStatus, refreshCurrentPage, selectedStatusContract]
  );

  const onDeleteSuccess = useCallback(() => {
    refreshAfterDelete();
    showToast({
      type: TYPE_TOAST.SUCCESS,
      content: 'Xoá hợp đồng thành công'
    });
  }, [refreshAfterDelete]);

  const onDelete = useCallback(
    (contract: Contract) => {
      const contractId = getContractId(contract);
      if (!contractId) {
        showToast({ type: TYPE_TOAST.ERROR, content: 'Không tìm thấy ID hợp đồng để xoá' });
        return;
      }

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
            onPress: async () => {
              const response = await contractServices.deleteContract({ id: contractId });
              if (!response || response.businessErrorMessage || response.systemErrorMessage) {
                showToast({
                  type: TYPE_TOAST.ERROR,
                  content: getContractErrorMessage(response as ErrorBase, 'Xoá hợp đồng thất bại')
                });
                return;
              }

              onDeleteSuccess();
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

  const onSelectContracts = useCallback((selectedRowKeys: Key[]) => {
    setSelectedContractKeys(selectedRowKeys);
  }, []);

  const onPrintContracts = useCallback(async () => {
    if (!selectedContractKeys.length) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: 'Vui lòng chọn hợp đồng cần in'
      });
      return;
    }

    setPrintingContracts(true);
    const response = await contractServices.exportContractsPdf({
      contractIds: selectedContractKeys.map(String)
    });
    setPrintingContracts(false);

    const responseError = await getBlobResponseError(response);
    if (!isBlobFileResponse(response) || responseError) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getContractErrorMessage(
          responseError || (response as ErrorBase),
          'In hợp đồng thất bại'
        )
      });
      return;
    }

    downloadBlobResponse(response, 'hop-dong-de-ky.zip');
    showToast({ type: TYPE_TOAST.SUCCESS, content: 'Đã tạo file hợp đồng để ký' });
  }, [selectedContractKeys]);

  return {
    t,
    contractList,
    total,
    listLoading,
    detailLoading,
    currentPage,
    pagination,
    filter,
    filterApplied,
    contractStats,
    selectedContractKeys,
    selectedContractCount: selectedContractKeys.length,
    printingContracts,
    customerOptions,
    meterOptions,
    userOptions,
    getCustomerDisplay,
    getMeterDisplay,
    getUserDisplay,
    onOpenCustomerDropdown,
    customerDropdownRender,
    onOpenMeterDropdown,
    meterDropdownRender,
    onOpenUserDropdown,
    userDropdownRender,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    onOpenCreate,
    onOpenUpdate,
    onCopyContract,
    onOpenDetail,
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
    onSelectContracts,
    onPrintContracts,
    isoDateFormat: CONTRACT_DATE_FORMAT
  };
}
