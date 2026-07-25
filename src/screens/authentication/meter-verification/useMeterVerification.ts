import { DEFAULT_PAGE_SIZE, FILE_EXT, K_SIZE_0, K_SIZE_1, MAX_PAGE_SIZE } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CREATE_METER_VERIFICATION,
  DELETE_METER_VERIFICATION,
  DOWNLOAD_METER_VERIFICATION_FILE,
  SEARCH_METER_VERIFICATION,
  UPDATE_METER_VERIFICATION,
  VIEW_METER_VERIFICATION_FILE
} from '@redux-action-type/meter-verification';
import { dispatch } from '@redux-common';
import {
  selectMeterVerificationFileLoading,
  selectMeterVerificationList,
  selectMeterVerificationLoadingDetail,
  selectMeterVerificationLoadingList,
  selectMeterVerificationTotal
} from '@redux-selector/meter-verification';
import { showDialog } from 'components/dialog';
import { TYPE_ACTION, TYPE_MESSAGE } from 'components/dialog/type';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ErrorBase } from 'model/common';
import { Meter, normalizeMeterSearchItem } from 'model/meter';
import {
  MeterVerification,
  MeterVerificationConfig,
  MeterVerificationFileRes
} from 'model/meter-verification';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useSelector } from 'react-redux';
import meterServices from 'services/meter-services';
import {
  API_DATE_INPUT_FORMATS,
  FORMAT_DATE_TIME_DOWNLOAD,
  displayDateFromServer,
  normalizeDateToApi
} from 'utils/date';
import { useAppTranslation } from 'utils/i18n';
import { z } from 'zod';
import {
  calculateNextVerificationDate,
  DATE_API_FORMAT,
  DEFAULT_VERIFICATION_CONFIGS,
  EQUIPMENT_TYPE_OPTIONS,
  getConfigByType,
  getEquipmentTypeLabel,
  getResultStatusLabel,
  METER_VERIFICATION_CONFIG_STORAGE_KEY
} from './utils';

const verificationFormSchema = z.object({
  meterId: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn công tơ' }),
  deviceType: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn loại thiết bị' }),
  verificationDate: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn ngày kiểm định' }),
  nextVerificationDate: z.string().trim(),
  resultStatus: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn kết quả' }),
  certificateNo: z.string().trim(),
  notes: z.string().trim()
});

export type MeterVerificationForm = z.infer<typeof verificationFormSchema>;

const defaultFormValues: MeterVerificationForm = {
  meterId: '',
  deviceType: EQUIPMENT_TYPE_OPTIONS[0].value,
  verificationDate: moment().format(DATE_API_FORMAT),
  nextVerificationDate: '',
  resultStatus: 'PASS',
  certificateNo: '',
  notes: ''
};

export interface MeterVerificationFilterForm {
  meterId: string;
  resultStatus: string;
  certificateNoContains: string;
  dueSoonOnly: boolean;
}

const defaultFilterValues: MeterVerificationFilterForm = {
  meterId: '',
  resultStatus: '',
  certificateNoContains: '',
  dueSoonOnly: false
};

const loadStoredConfigs = () => {
  if (typeof window === 'undefined') return DEFAULT_VERIFICATION_CONFIGS;
  const stored = window.localStorage.getItem(METER_VERIFICATION_CONFIG_STORAGE_KEY);
  if (!stored) return DEFAULT_VERIFICATION_CONFIGS;
  try {
    const parsed = JSON.parse(stored) as MeterVerificationConfig[];
    if (!Array.isArray(parsed) || !parsed.length) return DEFAULT_VERIFICATION_CONFIGS;
    return DEFAULT_VERIFICATION_CONFIGS.map((config) => ({
      ...config,
      ...(parsed.find((item) => item.equipmentType === config.equipmentType) || {})
    }));
  } catch {
    return DEFAULT_VERIFICATION_CONFIGS;
  }
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const isValidBlobResponse = (
  response?: MeterVerificationFileRes
): response is MeterVerificationFileRes & { data: Blob } => response?.data instanceof Blob;

const getFileErrorMessage = (response: MeterVerificationFileRes | undefined, fallback: string) =>
  response?.businessErrorMessage ||
  response?.systemErrorMessage ||
  response?.detailMessage ||
  response?.message ||
  fallback;

export default function useMeterVerification() {
  const { t } = useAppTranslation();
  const verifications = useSelector(selectMeterVerificationList);
  const total = useSelector(selectMeterVerificationTotal);
  const listLoading = useSelector(selectMeterVerificationLoadingList);
  const detailLoading = useSelector(selectMeterVerificationLoadingDetail);
  const fileLoading = useSelector(selectMeterVerificationFileLoading);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [selectedVerification, setSelectedVerification] = useState<MeterVerification>();
  const [selectedFile, setSelectedFile] = useState<File>();
  const [configs, setConfigs] = useState<MeterVerificationConfig[]>(DEFAULT_VERIFICATION_CONFIGS);
  const [filterDraft, setFilterDraft] = useState<MeterVerificationFilterForm>(defaultFilterValues);
  const [filterApplied, setFilterApplied] =
    useState<MeterVerificationFilterForm>(defaultFilterValues);

  const form = useForm<MeterVerificationForm>({
    mode: 'onTouched',
    defaultValues: defaultFormValues,
    resolver: zodResolver(verificationFormSchema)
  });

  const selectedMeterId = useWatch({
    control: form.control,
    name: 'meterId'
  });

  const meterLabelMap = useMemo(
    () =>
      Object.fromEntries(
        meters.map((meter) => [
          meter.meterId,
          `${meter.meterCode}${meter.customerName ? ` - ${meter.customerName}` : ''}`
        ])
      ) as Record<string, string>,
    [meters]
  );

  const meterOptions = useMemo(
    () =>
      meters.map((meter) => ({
        value: meter.meterId,
        label: meterLabelMap[meter.meterId] || meter.meterCode
      })),
    [meterLabelMap, meters]
  );

  const selectedMeter = useMemo(() => {
    if (!selectedMeterId) return undefined;
    return meters.find((meter) => String(meter.meterId) === String(selectedMeterId));
  }, [meters, selectedMeterId]);

  const alertMeters = useMemo(() => {
    const maxWarningDays = Math.max(...configs.map((config) => config.warningDays), 30);
    return meters.filter((meter) => {
      const verification = meter.verification;
      if (!verification?.nextVerificationDate) return false;
      if (verification.dueSoon || verification.overdue) return true;
      if (verification.daysUntilNextVerification !== undefined) {
        return verification.daysUntilNextVerification <= maxWarningDays;
      }
      const days = moment(verification.nextVerificationDate, API_DATE_INPUT_FORMATS, true)
        .startOf('day')
        .diff(moment().startOf('day'), 'days');
      return days <= maxWarningDays;
    });
  }, [configs, meters]);

  const overdueCount = useMemo(
    () =>
      alertMeters.filter((meter) => {
        const days = meter.verification?.daysUntilNextVerification;
        return meter.verification?.overdue || (days !== undefined && days < K_SIZE_0);
      }).length,
    [alertMeters]
  );

  const dueSoonCount = alertMeters.length - overdueCount;

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

  const fetchMeters = useCallback(async () => {
    const response = await meterServices.getMeterSearchList({
      page: K_SIZE_0,
      size: MAX_PAGE_SIZE,
      meterCodeContains: '',
      customerId: '',
      voltageType: '',
      status: ''
    });

    if (!response || !response.data) {
      setMeters([]);
      showToast({
        type: TYPE_TOAST.ERROR,
        content:
          response?.businessErrorMessage ||
          response?.systemErrorMessage ||
          'Tải danh sách công tơ thất bại'
      });
      return;
    }

    setMeters((response.data.items || []).map(normalizeMeterSearchItem).filter(Boolean) as Meter[]);
  }, []);

  const buildSearchBody = useCallback((page: number, filter: MeterVerificationFilterForm) => {
    const body = {
      page: page - K_SIZE_1,
      size: DEFAULT_PAGE_SIZE
    };

    return {
      ...body,
      ...(filter.meterId ? { meterId: filter.meterId } : {}),
      ...(filter.resultStatus ? { resultStatus: filter.resultStatus } : {}),
      ...(filter.certificateNoContains
        ? { certificateNoContains: filter.certificateNoContains.trim() }
        : {}),
      ...(filter.dueSoonOnly ? { dueSoonOnly: true } : {})
    };
  }, []);

  const fetchVerifications = useCallback(
    (page: number) => {
      dispatch({
        type: SEARCH_METER_VERIFICATION,
        payload: {
          body: buildSearchBody(page, filterApplied),
          onFailed: (error?: ErrorBase) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content:
                error?.businessErrorMessage ||
                error?.systemErrorMessage ||
                'Tải lịch sử kiểm định thất bại'
            });
          }
        }
      });
    },
    [buildSearchBody, filterApplied]
  );

  useEffect(() => {
    setConfigs(loadStoredConfigs());
    fetchMeters();
  }, [fetchMeters]);

  useEffect(() => {
    fetchVerifications(currentPage);
  }, [currentPage, fetchVerifications]);

  const updateConfig = useCallback(
    (equipmentType: string, field: keyof MeterVerificationConfig, value: string | number) => {
      setConfigs((prev) =>
        prev.map((config) =>
          config.equipmentType === equipmentType
            ? {
                ...config,
                [field]:
                  field === 'cycleMonths' || field === 'warningDays' ? Number(value) || 0 : value
              }
            : config
        )
      );
    },
    []
  );

  const onSaveConfig = useCallback(() => {
    window.localStorage.setItem(METER_VERIFICATION_CONFIG_STORAGE_KEY, JSON.stringify(configs));
    showToast({ type: TYPE_TOAST.SUCCESS, content: 'Lưu cấu hình kiểm định thành công' });
  }, [configs]);

  const resetComputedNextDate = useCallback(
    (deviceType?: string, verificationDate?: string) => {
      const config = getConfigByType(configs, deviceType);
      form.setValue(
        'nextVerificationDate',
        calculateNextVerificationDate(verificationDate || '', config?.cycleMonths),
        { shouldDirty: true, shouldValidate: true }
      );
    },
    [configs, form]
  );

  const onOpenCreate = useCallback(
    (meter?: Meter) => {
      const values = {
        ...defaultFormValues,
        meterId: meter?.meterId || '',
        verificationDate: moment().format(DATE_API_FORMAT)
      };
      form.reset(values);
      resetComputedNextDate(values.deviceType, values.verificationDate);
      setSelectedVerification(undefined);
      setSelectedFile(undefined);
      setOpenForm(true);
    },
    [form, resetComputedNextDate]
  );

  const onOpenUpdate = useCallback(
    (verification: MeterVerification) => {
      const values: MeterVerificationForm = {
        meterId: verification.meterId || '',
        deviceType: verification.deviceType || defaultFormValues.deviceType,
        verificationDate:
          normalizeDateToApi(verification.verificationDate) || moment().format(DATE_API_FORMAT),
        nextVerificationDate: normalizeDateToApi(verification.nextVerificationDate),
        resultStatus: verification.resultStatus || 'PASS',
        certificateNo: verification.certificateNo || '',
        notes: verification.notes || ''
      };
      form.reset(values);
      setSelectedVerification(verification);
      setSelectedFile(undefined);
      setOpenForm(true);
    },
    [form]
  );

  const onCloseForm = useCallback(() => {
    setOpenForm(false);
    setSelectedVerification(undefined);
    setSelectedFile(undefined);
    form.reset(defaultFormValues);
  }, [form]);

  const refreshAfterMutation = useCallback(() => {
    fetchMeters();
    fetchVerifications(currentPage);
  }, [currentPage, fetchMeters, fetchVerifications]);

  const updateFilter = useCallback(
    <K extends keyof MeterVerificationFilterForm>(
      key: K,
      value: MeterVerificationFilterForm[K]
    ) => {
      setFilterDraft((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const onApplyHistoryFilter = useCallback(() => {
    setFilterApplied(filterDraft);
    setCurrentPage(K_SIZE_1);
  }, [filterDraft]);

  const onResetHistoryFilter = useCallback(() => {
    setFilterDraft(defaultFilterValues);
    setFilterApplied(defaultFilterValues);
    setCurrentPage(K_SIZE_1);
  }, []);

  const onSubmit = useCallback(
    (data: MeterVerificationForm) => {
      const baseRequest = {
        verificationDate: normalizeDateToApi(data.verificationDate),
        resultStatus: data.resultStatus,
        certificateNo: data.certificateNo || undefined,
        notes: data.notes || undefined,
        nextVerificationDate: normalizeDateToApi(data.nextVerificationDate) || undefined,
        file: selectedFile
      };

      dispatch({
        type: selectedVerification ? UPDATE_METER_VERIFICATION : CREATE_METER_VERIFICATION,
        payload: {
          body: selectedVerification
            ? {
                ...baseRequest,
                id: selectedVerification.id
              }
            : {
                ...baseRequest,
                meterId: data.meterId,
                deviceType: data.deviceType || undefined
              },
          onSuccess: () => {
            showToast({ type: TYPE_TOAST.SUCCESS, content: 'Lưu ngày kiểm định thành công' });
            onCloseForm();
            refreshAfterMutation();
          },
          onFailed: (error?: ErrorBase) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content:
                error?.businessErrorMessage ||
                error?.systemErrorMessage ||
                'Lưu ngày kiểm định thất bại'
            });
          }
        }
      });
    },
    [onCloseForm, refreshAfterMutation, selectedFile, selectedVerification]
  );

  const onDelete = useCallback(
    (verification: MeterVerification) => {
      showDialog({
        title: t('common:delete_confirm'),
        content: `Bạn có chắc chắn xoá lịch sử kiểm định ${verification.certificateNo || verification.id}?`,
        type: TYPE_MESSAGE.ALERT,
        actions: [
          {
            title: t('common:agree'),
            type: TYPE_ACTION.PRIMARY,
            onPress: () => {
              dispatch({
                type: DELETE_METER_VERIFICATION,
                payload: {
                  body: {
                    id: verification.id
                  },
                  onSuccess: () => {
                    showToast({
                      type: TYPE_TOAST.SUCCESS,
                      content: 'Xoá ngày kiểm định thành công'
                    });
                    refreshAfterMutation();
                  },
                  onFailed: () => {
                    showToast({ type: TYPE_TOAST.ERROR, content: 'Xoá ngày kiểm định thất bại' });
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
    [refreshAfterMutation, t]
  );

  const onViewFile = useCallback((verification: MeterVerification) => {
    if (!verification.id || !verification.fileName) {
      showToast({
        type: TYPE_TOAST.INFO,
        content: 'Chưa có file kết quả kiểm định'
      });
      return;
    }

    const targetWindow = window.open('about:blank', '_blank');
    if (targetWindow) {
      targetWindow.opener = null;
    }

    dispatch({
      type: VIEW_METER_VERIFICATION_FILE,
      payload: {
        body: verification.id,
        onSuccess: (response: MeterVerificationFileRes) => {
          if (!isValidBlobResponse(response)) {
            targetWindow?.close();
            showToast({
              type: TYPE_TOAST.ERROR,
              content: 'Xem file kết quả kiểm định thất bại'
            });
            return;
          }

          const fileUrl = URL.createObjectURL(response.data);
          if (targetWindow) {
            targetWindow.location.href = fileUrl;
          } else {
            window.open(fileUrl, '_blank', 'noopener,noreferrer');
          }
          window.setTimeout(() => URL.revokeObjectURL(fileUrl), 60000);
        },
        onFailed: (error?: MeterVerificationFileRes) => {
          targetWindow?.close();
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getFileErrorMessage(error, 'Xem file kết quả kiểm định thất bại')
          });
        }
      }
    });
  }, []);

  const onDownloadFile = useCallback((verification: MeterVerification) => {
    if (!verification.id || !verification.fileName) {
      showToast({
        type: TYPE_TOAST.INFO,
        content: 'Chưa có file kết quả kiểm định'
      });
      return;
    }

    dispatch({
      type: DOWNLOAD_METER_VERIFICATION_FILE,
      payload: {
        body: verification.id,
        onSuccess: (response: MeterVerificationFileRes) => {
          if (!isValidBlobResponse(response)) {
            showToast({
              type: TYPE_TOAST.ERROR,
              content: 'Tải file kết quả kiểm định thất bại'
            });
            return;
          }

          const fileUrl = URL.createObjectURL(response.data);
          const link = document.createElement('a');
          link.href = fileUrl;
          link.download = response.fileName || verification.fileName || 'ket-qua-kiem-dinh';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(fileUrl);
        },
        onFailed: (error?: MeterVerificationFileRes) => {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getFileErrorMessage(error, 'Tải file kết quả kiểm định thất bại')
          });
        }
      }
    });
  }, []);

  const exportRowsToExcel = useCallback((rows: Meter[]) => {
    const columns = [
      ['meterCode', 'Số công tơ'],
      ['installationDate', 'Ngày lắp'],
      ['latestVerificationDate', 'Ngày kiểm định gần nhất'],
      ['nextVerificationDate', 'Thời hạn kiểm định'],
      ['daysUntilNextVerification', 'Số ngày còn lại'],
      ['status', 'Cảnh báo']
    ];
    const getValue = (row: Meter, key: string) => {
      const verification = row.verification;
      switch (key) {
        case 'installationDate':
          return displayDateFromServer(row.installationDate || '');
        case 'latestVerificationDate':
          return displayDateFromServer(verification?.latestVerificationDate || '');
        case 'nextVerificationDate':
          return displayDateFromServer(verification?.nextVerificationDate || '');
        case 'daysUntilNextVerification':
          return String(verification?.daysUntilNextVerification ?? '');
        case 'status':
          return verification?.overdue ? 'Quá hạn' : verification?.dueSoon ? 'Sắp hết hạn' : '';
        default:
          return String((row as any)[key] || '');
      }
    };
    const headerHtml = columns.map(([, label]) => `<th>${escapeHtml(label)}</th>`).join('');
    const bodyHtml = rows
      .map(
        (row) =>
          `<tr>${columns
            .map(([key]) => `<td>${escapeHtml(getValue(row, key))}</td>`)
            .join('')}</tr>`
      )
      .join('');
    const html = `<html><head><meta charset="UTF-8" /></head><body><table border="1"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `METER_VERIFICATION_${moment().format(FORMAT_DATE_TIME_DOWNLOAD)}.${FILE_EXT.EXCEL2}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, []);

  const onExportAlerts = useCallback(() => {
    setExportLoading(true);
    exportRowsToExcel(alertMeters);
    setExportLoading(false);
    showToast({ type: TYPE_TOAST.SUCCESS, content: 'Xuất Excel cảnh báo kiểm định thành công' });
  }, [alertMeters, exportRowsToExcel]);

  const getMeterLabel = useCallback(
    (meterId?: string) => (meterId ? meterLabelMap[meterId] || meterId : '-'),
    [meterLabelMap]
  );

  return {
    t,
    configs,
    meters,
    meterOptions,
    alertMeters,
    overdueCount,
    dueSoonCount,
    verifications,
    filterDraft,
    total,
    currentPage,
    pagination,
    listLoading,
    detailLoading,
    fileLoading,
    exportLoading,
    openForm,
    selectedVerification,
    selectedMeter,
    form,
    selectedFile,
    setSelectedFile,
    updateFilter,
    onApplyHistoryFilter,
    onResetHistoryFilter,
    updateConfig,
    onSaveConfig,
    onOpenCreate,
    onOpenUpdate,
    onCloseForm,
    onSubmit,
    onDelete,
    onViewFile,
    onDownloadFile,
    onExportAlerts,
    resetComputedNextDate,
    getMeterLabel,
    getEquipmentTypeLabel,
    getResultStatusLabel
  };
}
