import { DEFAULT_PAGE_SIZE, K_SIZE_1 } from '@constant';
import {
  SYSTEM_PARAMETER_CREATE,
  SYSTEM_PARAMETER_DELETE,
  SYSTEM_PARAMETER_LIST,
  SYSTEM_PARAMETER_UPDATE
} from '@redux-action-type/sys-parameter-type';
import { dispatch } from '@redux-common';
import {
  selectParamList,
  selectParamListLoading,
  selectParamSubmitting,
  selectParamTotal
} from '@redux-selector/sys-parameter-selector';
import { zodResolver } from '@hookform/resolvers/zod';
import { showDialog } from 'components/dialog';
import { TYPE_ACTION, TYPE_MESSAGE } from 'components/dialog/type';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ErrorBase } from 'model/common';
import { SearchSystemParameterReq, SystemParameter } from 'model/system-parameter';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useAppTranslation } from 'utils/i18n';
import { z } from 'zod';

export type SystemParameterDrawerMode = 'create' | 'edit' | 'view';

export interface SystemParameterFilterForm {
  paramKey: string;
  paramValue: string;
}

const PARAM_KEY_MAX_LENGTH = 20;
const PARAM_VALUE_MAX_LENGTH = 200;
const DESCRIPTION_MAX_LENGTH = 300;

const emptyFilter: SystemParameterFilterForm = {
  paramKey: '',
  paramValue: ''
};

const emptyForm = { paramKey: '', paramValue: '', description: '' };

const getErrorContent = (error: ErrorBase | undefined, fallback: string) =>
  error?.businessErrorMessage || error?.detailMessage || error?.message || fallback;

export default function useDefaultParameterHook() {
  const { t } = useAppTranslation();
  // useAppTranslation trả về hàm t MỚI mỗi lần render; để t vào deps sẽ làm useEffect tải danh
  // sách bắn lại vô hạn (màn hình quay mãi). Giữ qua ref để các callback không đổi định danh.
  const tRef = useRef(t);
  tRef.current = t;

  const paramList = useSelector(selectParamList);
  const total = useSelector(selectParamTotal);
  const paramListLoading = useSelector(selectParamListLoading);
  const submitting = useSelector(selectParamSubmitting);

  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);
  const [filter, setFilter] = useState<SystemParameterFilterForm>(emptyFilter);
  const [filterApplied, setFilterApplied] = useState<SystemParameterFilterForm>(emptyFilter);
  const [drawerMode, setDrawerMode] = useState<SystemParameterDrawerMode | undefined>();
  const [selectedItem, setSelectedItem] = useState<SystemParameter>();

  const buildSearchBody = useCallback(
    (applied: SystemParameterFilterForm, page: number): SearchSystemParameterReq => ({
      page: page - K_SIZE_1,
      size: DEFAULT_PAGE_SIZE,
      paramKey: applied.paramKey.trim() || undefined,
      paramValue: applied.paramValue.trim() || undefined
    }),
    []
  );

  const fetchList = useCallback(
    (page: number) => {
      dispatch({
        type: SYSTEM_PARAMETER_LIST,
        payload: {
          body: buildSearchBody(filterApplied, page),
          onFailed: (error?: ErrorBase) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getErrorContent(error, 'Lấy danh sách tham số thất bại')
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

  const onChangeFilter = useCallback((key: keyof SystemParameterFilterForm, value: string) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  }, []);

  const onApplyFilter = useCallback(() => {
    setFilterApplied(filter);
    setCurrentPage(K_SIZE_1);
  }, [filter]);

  const onResetFilter = useCallback((key?: keyof SystemParameterFilterForm) => {
    if (key) {
      setFilter((prev) => ({ ...prev, [key]: '' }));
      setFilterApplied((prev) => ({ ...prev, [key]: '' }));
    } else {
      setFilter(emptyFilter);
      setFilterApplied(emptyFilter);
    }
    setCurrentPage(K_SIZE_1);
  }, []);

  const refreshAfterMutation = useCallback(() => {
    if (currentPage === K_SIZE_1) {
      fetchList(K_SIZE_1);
      return;
    }
    setCurrentPage(K_SIZE_1);
  }, [currentPage, fetchList]);

  const paramSchema = useMemo(
    () =>
      z.object({
        paramKey: z
          .string()
          .trim()
          .min(K_SIZE_1, {
            message: tRef.current('validate:required', { name: tRef.current('param:code') })
          })
          .max(PARAM_KEY_MAX_LENGTH, {
            message: `Mã tham số tối đa ${PARAM_KEY_MAX_LENGTH} ký tự`
          }),
        paramValue: z
          .string()
          .trim()
          .max(PARAM_VALUE_MAX_LENGTH, {
            message: `Giá trị tham số tối đa ${PARAM_VALUE_MAX_LENGTH} ký tự`
          }),
        description: z
          .string()
          .trim()
          .min(K_SIZE_1, {
            message: tRef.current('validate:required', { name: tRef.current('common:description') })
          })
          .max(DESCRIPTION_MAX_LENGTH, {
            message: `Mô tả tối đa ${DESCRIPTION_MAX_LENGTH} ký tự`
          })
      }),
    []
  );

  type ParamForm = z.infer<typeof paramSchema>;

  const paramForm = useForm<ParamForm>({
    mode: 'onTouched',
    defaultValues: emptyForm,
    resolver: zodResolver(paramSchema)
  });

  const { control, handleSubmit, reset, formState } = paramForm;

  const onCloseDrawer = useCallback(() => {
    setDrawerMode(undefined);
    setSelectedItem(undefined);
    reset(emptyForm);
  }, [reset]);

  const openDrawer = useCallback(
    (mode: SystemParameterDrawerMode, item?: SystemParameter) => {
      setSelectedItem(item);
      setDrawerMode(mode);
      reset({
        paramKey: item?.paramKey || '',
        paramValue: item?.paramValue || '',
        description: item?.description || ''
      });
    },
    [reset]
  );

  const onOpenCreate = useCallback(() => openDrawer('create'), [openDrawer]);
  const onOpenEdit = useCallback((item: SystemParameter) => openDrawer('edit', item), [openDrawer]);
  const onOpenView = useCallback((item: SystemParameter) => openDrawer('view', item), [openDrawer]);

  const onSubmit = useCallback(
    (data: ParamForm) => {
      const isEdit = drawerMode === 'edit' && Boolean(selectedItem?.id);
      const body = {
        ...(isEdit ? { id: selectedItem?.id } : {}),
        // Mã tham số khoá cứng khi sửa vì code đọc cấu hình theo đúng khoá này.
        paramKey: isEdit ? selectedItem!.paramKey : data.paramKey.trim(),
        // Màn hình không quản lý kiểu dữ liệu, nhưng vẫn gửi lại giá trị cũ để API update
        // không ghi đè para_type trong DB thành null.
        paraType: isEdit ? selectedItem?.paraType : undefined,
        paramValue: data.paramValue.trim(),
        description: data.description.trim()
      };

      dispatch({
        type: isEdit ? SYSTEM_PARAMETER_UPDATE : SYSTEM_PARAMETER_CREATE,
        payload: {
          body,
          onSuccess: () => {
            onCloseDrawer();
            showToast({
              type: TYPE_TOAST.SUCCESS,
              content: isEdit ? 'Cập nhật tham số thành công' : 'Thêm tham số thành công'
            });
            refreshAfterMutation();
          },
          onFailed: (error?: ErrorBase) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getErrorContent(
                error,
                isEdit ? 'Cập nhật tham số thất bại' : 'Thêm tham số thất bại'
              )
            });
          }
        }
      });
    },
    [drawerMode, onCloseDrawer, refreshAfterMutation, selectedItem]
  );

  const onDelete = useCallback(
    (item: SystemParameter) => {
      showDialog({
        title: tRef.current('common:delete_confirm'),
        content: (
          <>
            Bạn có chắc chắn xoá tham số <strong>{item.paramKey}</strong>? Nghiệp vụ đang đọc tham
            số này sẽ quay về giá trị mặc định trong hệ thống.
          </>
        ),
        type: TYPE_MESSAGE.ALERT,
        actions: [
          {
            title: tRef.current('common:agree'),
            type: TYPE_ACTION.PRIMARY,
            onPress: () => {
              dispatch({
                type: SYSTEM_PARAMETER_DELETE,
                payload: {
                  body: { id: item.id },
                  onSuccess: () => {
                    showToast({
                      type: TYPE_TOAST.SUCCESS,
                      content: 'Xoá tham số thành công'
                    });
                    refreshAfterMutation();
                  },
                  onFailed: (error?: ErrorBase) => {
                    showToast({
                      type: TYPE_TOAST.ERROR,
                      content: getErrorContent(error, 'Xoá tham số thất bại')
                    });
                  }
                }
              });
            }
          },
          {
            title: tRef.current('common:cancel'),
            type: TYPE_ACTION.SECONDARY
          }
        ]
      });
    },
    [refreshAfterMutation]
  );

  return {
    t,
    paramList,
    total,
    paramListLoading,
    submitting,
    currentPage,
    pagination,
    filter,
    filterApplied,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    drawerMode,
    selectedItem,
    onOpenCreate,
    onOpenEdit,
    onOpenView,
    onCloseDrawer,
    onDelete,
    control,
    handleSubmit,
    formState,
    onSubmit,
    descriptionMaxLength: DESCRIPTION_MAX_LENGTH,
    paramKeyMaxLength: PARAM_KEY_MAX_LENGTH
  };
}
