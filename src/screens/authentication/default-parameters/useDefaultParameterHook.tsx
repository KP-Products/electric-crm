import { useSelector } from 'react-redux';
import { selectParamList, selectParamListLoading } from '@redux-selector/sys-parameter-selector';
import { useEffect, useMemo, useState } from 'react';
import { SystemParameter } from 'model/system-parameter';
import { DEFAULT_PAGE_SIZE } from '@constant';
import { dispatch } from '@redux-common';
import {
  SYSTEM_PARAMETER_LIST,
  SYSTEM_PARAMETER_UPDATE
} from '@redux-action-type/sys-parameter-type';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DebugUtils } from 'utils/debug-utils';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { useAppTranslation } from 'utils/i18n';

export default function useDefaultParameterHook() {
  const { t } = useAppTranslation();
  const paramList = useSelector(selectParamList);
  const paramListLoading = useSelector(selectParamListLoading);
  const [dataFilter, setDataFilter] = useState<SystemParameter[]>([]);
  const [selectedItem, setSelectedItem] = useState<SystemParameter>();
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [loadingEdit, setLoadingEdit] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const onCloseEdit = () => {
    setOpenEdit(false);
    setSelectedItem(undefined);
  };

  const pagination = useMemo(
    () => ({
      current: currentPage,
      total: dataFilter.length,
      pageSize: DEFAULT_PAGE_SIZE,
      onChange: (page: number) => setCurrentPage(page),
      showSizeChanger: false
    }),
    [dataFilter, currentPage]
  );

  const fetchList = (props?: {
    onSuccess?: (res?: SystemParameter[]) => void;
    onFailed?: (e?: any) => void;
  }) => {
    dispatch({
      type: SYSTEM_PARAMETER_LIST,
      payload: {
        onSuccess: props?.onSuccess,
        onFailed: () => {
          props?.onFailed?.();
          showToast({
            type: TYPE_TOAST.ERROR,
            content: t('common:msg_failed', { action: t('param:get_list') })
          });
        }
      }
    });
  };

  const updateSchema = z.object({
    paramValue: z
      .string()
      .trim()
      .min(1, { message: t('validate:required', { name: t('param:param_value') }) }),
    description: z
      .string()
      .trim()
      .min(1, { message: t('validate:required', { name: t('common:description') }) })
  });

  type UpdateForm = z.infer<typeof updateSchema>;

  const updateForm = useForm<UpdateForm>({
    mode: 'onTouched',
    defaultValues: {
      paramValue: selectedItem?.paramValue || '',
      description: selectedItem?.description || ''
    },
    resolver: zodResolver(updateSchema)
  });

  const handleUpdateSubmit = (data: UpdateForm) => {
    if (selectedItem) {
      setLoadingEdit(true);
      const body: SystemParameter = {
        ...selectedItem,
        paramValue: data.paramValue,
        description: data.description
      };

      dispatch({
        type: SYSTEM_PARAMETER_UPDATE,
        payload: {
          body,
          onSuccess: (res: SystemParameter) => {
            DebugUtils.logS(['SYSTEM_PARAMETER_UPDATE: ', res]);
            setLoadingEdit(false);
            onCloseEdit();
            showToast({
              type: TYPE_TOAST.SUCCESS,
              content: t('common:msg_done', { action: t('common:edit') })
            });
            fetchList();
          },
          onFailed: () => {
            setLoadingEdit(false);
            showToast({
              type: TYPE_TOAST.ERROR,
              content: t('common:msg_failed', { action: t('common:edit') })
            });
          }
        }
      });
    }
  };

  const { control, handleSubmit, reset, formState } = updateForm;

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    setDataFilter(paramList);
  }, [paramList]);

  useEffect(() => {
    if (selectedItem?.id) {
      reset({
        paramValue: selectedItem?.paramValue || '',
        description: selectedItem?.description || ''
      });
    }
  }, [selectedItem]);

  return {
    t,
    paramList,
    paramListLoading,
    pagination,
    currentPage,
    dataFilter,
    selectedItem,
    setSelectedItem,
    openEdit,
    setOpenEdit,
    onCloseEdit,
    loadingEdit,
    setLoadingEdit,
    updateForm,
    control,
    handleSubmit,
    formState,
    handleUpdateSubmit
  };
}
