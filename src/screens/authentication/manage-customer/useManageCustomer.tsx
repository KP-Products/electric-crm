import { useAppTranslation } from 'utils/i18n';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CONSTANTS, DEFAULT_PAGE_SIZE, FILE_EXT, K_SIZE_0, K_SIZE_1 } from '@constant';
import { DebugUtils } from 'utils/debug-utils';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import lod from 'lodash';
import { dispatch } from '@redux-common';
import { ErrorBase } from 'model/common';
import {
  CUSTOMER_CREATE,
  CUSTOMER_DOWNLOAD,
  CUSTOMER_LIST,
  CUSTOMER_UPDATE
} from '@redux-action-type/customer-type';
import { CreateCustomerGroupReq, Customer, CustomerGroup } from 'model/customer';
import { DownloadUtils } from 'utils/download.utils';
import moment from 'moment/moment';
import { FORMAT_DATE_TIME_DOWNLOAD } from 'utils/date';
import { appCodes } from 'utils/constant/appCodes';
import { STATUS } from '../../../model/user';

interface Props {}
function useManageCustomer(props?: Props) {
  const { t } = useAppTranslation();
  const [custListDefault, setCustListDefault] = useState<Customer[]>([]);
  const [custList, setCustList] = useState<Customer[]>([]);
  const listLoading = false;
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);
  const [moreAction, setMoreAction] = useState<string>();
  const [selectedItem, setSelectedItem] = useState<CustomerGroup>();
  const [openCreate, setOpenCreate] = useState<boolean>(false);
  const [loadingEdit, setLoadingEdit] = useState<boolean>(false);
  const [loadingDP, setLoadingDP] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(K_SIZE_0);

  const fetchList = () => {
    dispatch({
      type: CUSTOMER_LIST,
      payload: {
        onSuccess: (data: Customer[]) => {
          DebugUtils.logS(['CUSTOMER_GROUP_LIST data', data]);
          setTotal(data?.length || K_SIZE_0);
          setCustList(data || []);
          setCustListDefault(data || []);
        },
        onFailed: (error?: ErrorBase) => {
          DebugUtils.logS(['CUSTOMER_GROUP_LIST error', error]);
        }
      }
    });
  };

  const optionStatus = [
    { value: STATUS.ACTIVE, label: t('common:status_active') },
    { value: STATUS.INACTIVE, label: t('common:status_inactive') }
  ];

  const pagination = useMemo(
    () => ({
      current: currentPage,
      total: total,
      pageSize: DEFAULT_PAGE_SIZE,
      onChange: (page: number) => setCurrentPage(page),
      showSizeChanger: false
    }),
    [currentPage, total]
  );

  const updateSchema = z.object({
    name: z
      .string()
      .trim()
      .min(1, { message: t('validate:required', { name: 'Tên khách hàng' }) }),
    customerCode: z
      .string()
      .trim()
      .min(1, { message: t('validate:required', { name: 'Mã khách hàng' }) }),
    taxNo: z
      .string()
      .trim()
      .min(1, { message: t('validate:required', { name: 'Mã số thuế' }) }),
    phone: z
      .string()
      .trim()
      .min(1, { message: t('validate:required', { name: 'Số điện thoại' }) }),
    email: z
      .string()
      .trim()
      .min(1, { message: t('validate:required', { name: 'Email' }) }),
    address: z
      .string()
      .trim()
      .min(1, { message: t('validate:required', { name: 'Địa chỉ' }) }),
    status: z.string().trim(),
    note: z.string().trim()
  });

  type UpdateForm = z.infer<typeof updateSchema>;

  const updateForm = useForm<UpdateForm>({
    mode: 'onTouched',
    defaultValues: {
      name: selectedItem?.fullName || '',
      customerCode: selectedItem?.customerCode || '',
      taxNo: selectedItem?.taxNo || '',
      phone: selectedItem?.phone || '',
      email: selectedItem?.email || '',
      address: selectedItem?.address || '',
      status: selectedItem?.status || '',
      note: selectedItem?.note || ''
    },
    resolver: zodResolver(updateSchema)
  });

  const handleUpdateSubmit = (dataF: UpdateForm) => {
    const bodyCreate: CreateCustomerGroupReq = {
      fullName: dataF.name,
      customerCode: dataF?.customerCode || '',
      taxNo: dataF?.taxNo || '',
      phone: dataF?.phone || '',
      email: dataF?.email || '',
      address: dataF?.address || '',
      note: dataF.note
    };
    // edit
    if (selectedItem) {
      setLoadingEdit(true);
      dispatch({
        type: CUSTOMER_UPDATE,
        payload: {
          body: {
            id: selectedItem.id,
            ...bodyCreate
          },
          onSuccess: (res?: CustomerGroup) => {
            DebugUtils.logS(['CUSTOMER_GROUP_UPDATE: ', res]);
            setLoadingEdit(false);

            onCloseCreate();
            showToast({
              type: TYPE_TOAST.SUCCESS,
              content: t('common:msg_done', { action: t('common:edit') })
            });
            fetchList();
          },
          onFailed: (err: ErrorBase) => {
            DebugUtils.logS(['CUSTOMER_GROUP_UPDATE error: ', err]);
            setLoadingEdit(false);
            onCloseCreate();
            showToast({
              type: TYPE_TOAST.ERROR,
              content: t('common:msg_failed', { action: t('common:edit') })
            });
          }
        }
      });
      return;
    }

    dispatch({
      type: CUSTOMER_CREATE,
      payload: {
        body: bodyCreate,
        onSuccess: (res?: CustomerGroup) => {
          DebugUtils.logS(['CUSTOMER_GROUP_CREATE:', res]);
          setLoadingEdit(false);
          onCloseCreate();
          showToast({
            type: TYPE_TOAST.SUCCESS,
            content: t('common:msg_done', { action: t('common:add_new') })
          });
          fetchList();
        },
        onFailed: (err: ErrorBase) => {
          DebugUtils.logS(['CUSTOMER_GROUP_CREATE error: ', err]);
          let msg = t('common:msg_failed', { action: t('common:add_new') });
          let isClose = true;
          setLoadingEdit(false);
          switch (err.systemErrorCode) {
            case appCodes.MANAGE_CUSTOMER_GROUP.EXIST:
              msg = t('validate:exist_obj', { name: t('fee:cust_group') });
              isClose = false;
              break;
          }
          if (isClose) {
            onCloseCreate();
          }
          showToast({
            type: TYPE_TOAST.ERROR,
            content: msg
          });
        }
      }
    });
  };

  const onCloseCreate = () => {
    setOpenCreate(false);
    updateForm.reset();
    setSelectedItem(undefined);
  };

  const debounceSearch = useCallback(
    lod.debounce((searchValue: string) => {
      const searchF = searchValue.trim();
      const dataFil = custListDefault.filter((cus) => {
        if (!searchF) return true;
        return (
          cus.fullName.toLowerCase().includes(searchF.toLowerCase()) ||
          cus.contactName.toLowerCase().includes(searchF.toLowerCase())
        );
      });
      setCustList(dataFil);
      setTotal(dataFil.length);
      setCurrentPage(K_SIZE_1);
    }, CONSTANTS.TIME_DEBOUNCE),
    []
  );

  const onDownload = () => {
    setLoadingDP(true);
    dispatch({
      type: CUSTOMER_DOWNLOAD,
      payload: {
        body: search,
        onSuccess: (res: string) => {
          setLoadingDP(false);
          if (res) {
            DownloadUtils.downloadBase64Excel(
              res,
              `CUSTOMER_GROUP_DOWNLOAD_${moment().format(FORMAT_DATE_TIME_DOWNLOAD)}.${FILE_EXT.EXCEL}`
            );
            showToast({
              type: TYPE_TOAST.SUCCESS,
              content: t('common:download_success')
            });
          }
        },
        onFailed: (error?: ErrorBase) => {
          setLoadingDP(false);
          DebugUtils.logS(['CUSTOMER_GROUP_DOWNLOAD error', error]);
          showToast({
            type: TYPE_TOAST.ERROR,
            content: t('common:msg_failed', { action: t('common:download') })
          });
        }
      }
    });
  };

  useEffect(() => {
    updateForm.reset({
      name: selectedItem?.fullName || '',
      customerCode: selectedItem?.customerCode || '',
      taxNo: selectedItem?.taxNo || '',
      phone: selectedItem?.phone || '',
      email: selectedItem?.email || '',
      address: selectedItem?.address || '',
      status: selectedItem?.status || '',
      note: selectedItem?.note || ''
    });
  }, [selectedItem]);

  return {
    t,
    fetchList,
    moreAction,
    setMoreAction,
    selectedItem,
    setSelectedItem,
    openCreate,
    setOpenCreate,
    currentPage,
    setCurrentPage,
    pagination,
    optionStatus,
    onCloseCreate,
    listLoading,
    handleUpdateSubmit,
    updateForm,
    loadingEdit,
    debounceSearch,
    total,
    search,
    setSearch,
    custList,
    // fetchCustomeType,
    loadingDP,
    onDownload
  };
}

export default useManageCustomer;
