import { DEFAULT_PAGE_SIZE, K_SIZE_0, K_SIZE_1 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CREATE_ELECTRIC_TARIFF,
  DELETE_ELECTRIC_TARIFF_DOCUMENT,
  DELETE_ELECTRIC_TARIFF,
  GET_ELECTRIC_TARIFF_DETAIL,
  SEARCH_ELECTRIC_TARIFF,
  UPLOAD_ELECTRIC_TARIFF_DOCUMENT,
  UPDATE_ELECTRIC_TARIFF
} from '@redux-action-type/electric-tariff';
import { dispatch } from '@redux-common';
import {
  selectElectricTariffList,
  selectElectricTariffLoadingDetail,
  selectElectricTariffLoadingList,
  selectElectricTariffTotal
} from '@redux-selector/electric-tariff';
import { showDialog } from 'components/dialog';
import { TYPE_ACTION, TYPE_MESSAGE } from 'components/dialog/type';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ErrorBase } from 'model/common';
import {
  CreateTariffReq,
  ElectricTariff,
  ElectricTariffTouPrice,
  GetTariffDetailRes,
  SearchTariffsReq,
  TariffDetail,
  TariffPriceInput,
  UpdateTariffReq
} from 'model/electric-tariff';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import electricTariffServices from 'services/electric-tariff-services';
import {
  canViewBlobInline,
  downloadBlobResponse,
  getBlobResponseError,
  isBlobFileResponse
} from 'utils/blob-response';
import { FORMAT_DATE_API, normalizeDateToApi } from 'utils/date';
import { useAppTranslation } from 'utils/i18n';
import { getUploadFileSizeError, isValidUploadFileSize } from 'utils/upload';
import { z } from 'zod';

export const TARIFF_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

export const TARIFF_PRICE_TYPE = {
  SELL: '0',
  BUY: '1'
};

const DEFAULT_PRICE_TYPE = TARIFF_PRICE_TYPE.SELL;
const DEFAULT_VOLTAGE_LEVEL = 'HA_AP';
const TOU_PRICE_ROWS = [
  { tou: 'BT', touName: 'Bình thường' },
  { tou: 'TD', touName: 'Thấp điểm' },
  { tou: 'CD', touName: 'Cao điểm' }
] as const;

export const DEFAULT_TARIFF_FILTER: ElectricTariffFilter = {
  tariffCode: '',
  tariffName: '',
  priceType: '',
  voltageLevel: '',
  status: ''
};

const DATE_API_FORMAT = FORMAT_DATE_API;
const VAT_RATE = 0.1;
const optionalTextSchema = z.preprocess((value) => value ?? '', z.string().trim());
const INLINE_TARIFF_DOCUMENT_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];

const tariffSchema = z.object({
  tariffCode: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập mã giá' }),
  tariffName: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập tên giá' }),
  priceType: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn loại đơn giá' }),
  voltageLevel: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn cấp điện áp' }),
  effectiveFrom: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn ngày hiệu lực' }),
  effectiveTo: optionalTextSchema
});

const parseNumber = (value: string) => Number(value.trim().replace(',', '.'));

const getErrorMessage = (error?: ErrorBase, fallback = 'Thao tác thất bại') => {
  return (
    error?.businessErrorMessage ||
    error?.systemErrorMessage ||
    error?.detailMessage ||
    error?.message ||
    fallback
  );
};

const getTariffDocumentFileName = (tariff?: ElectricTariff, responseFileName?: string) =>
  responseFileName ||
  tariff?.fileName ||
  tariff?.filePath?.split(/[\\/]/).pop() ||
  'van-ban-ap-gia';

const hasTariffDocument = (tariff?: ElectricTariff) =>
  Boolean(tariff?.fileName || tariff?.filePath);

export interface ElectricTariffFilter {
  tariffCode: string;
  tariffName: string;
  priceType: string;
  voltageLevel: string;
  status: string;
}

export type ElectricTariffForm = z.infer<typeof tariffSchema>;

export interface TariffTouPriceRow {
  id?: number;
  tariffId?: number;
  tou: string;
  touName?: string;
  unitPrice?: number;
  voltageLevel?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  createdAt?: string;
  draftUnitPrice: string;
}

type RawTouPrice = Partial<ElectricTariffTouPrice> & {
  draftUnitPrice?: string;
};

export const getPriceWithVat = (unitPrice?: number) =>
  typeof unitPrice === 'number' && Number.isFinite(unitPrice)
    ? Math.round(unitPrice * (K_SIZE_1 + VAT_RATE))
    : undefined;

const getDetailPrices = (detail?: TariffDetail) => detail?.prices || detail?.touPrices || [];

const getDraftUnitPrice = (unitPrice?: number) =>
  typeof unitPrice === 'number' && Number.isFinite(unitPrice) ? String(unitPrice) : '';

const getParsedTouPrice = (value: string) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return undefined;

  const parsedValue = parseNumber(trimmedValue);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

const normalizeTouPrices = (prices: RawTouPrice[] = []): TariffTouPriceRow[] =>
  TOU_PRICE_ROWS.map((row) => {
    const matchedPrice = prices.find((price) => price.tou === row.tou);

    return {
      ...matchedPrice,
      tou: row.tou,
      touName: matchedPrice?.touName || row.touName,
      unitPrice: matchedPrice?.unitPrice,
      draftUnitPrice: matchedPrice?.draftUnitPrice ?? getDraftUnitPrice(matchedPrice?.unitPrice)
    };
  });

const buildTouPriceInputs = (prices: TariffTouPriceRow[]): TariffPriceInput[] =>
  TOU_PRICE_ROWS.map((row) => {
    const matchedPrice = prices.find((price) => price.tou === row.tou);

    return {
      tou: row.tou,
      unitPrice: getParsedTouPrice(matchedPrice?.draftUnitPrice || '') ?? K_SIZE_0
    };
  });

const validateTouPrices = (prices: TariffTouPriceRow[]) => {
  const normalizedPrices = normalizeTouPrices(prices);

  const missingPrice = normalizedPrices.find((price) => !price.draftUnitPrice.trim());
  if (missingPrice) {
    return `Vui lòng nhập đơn giá cho bậc ${missingPrice.touName || missingPrice.tou}`;
  }

  const invalidPrice = normalizedPrices.find((price) => {
    const parsedPrice = getParsedTouPrice(price.draftUnitPrice);
    return parsedPrice === undefined || parsedPrice < K_SIZE_0;
  });

  if (invalidPrice) {
    return `Đơn giá bậc ${invalidPrice.touName || invalidPrice.tou} không hợp lệ`;
  }

  return '';
};

export default function useElectricTariff() {
  const { t } = useAppTranslation();
  const tariffList = useSelector(selectElectricTariffList);
  const total = useSelector(selectElectricTariffTotal);
  const listLoading = useSelector(selectElectricTariffLoadingList);
  const detailLoading = useSelector(selectElectricTariffLoadingDetail);
  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);
  const [filterDraft, setFilterDraft] = useState<ElectricTariffFilter>(DEFAULT_TARIFF_FILTER);
  const [filterApplied, setFilterApplied] = useState<ElectricTariffFilter>(DEFAULT_TARIFF_FILTER);
  const [openCreate, setOpenCreate] = useState<boolean>(false);
  const [openDetail, setOpenDetail] = useState<boolean>(false);
  const [selectedDetail, setSelectedDetail] = useState<TariffDetail>();
  const [touPrices, setTouPrices] = useState<TariffTouPriceRow[]>(normalizeTouPrices());
  const [selectedTariffDocumentFile, setSelectedTariffDocumentFile] = useState<File>();

  const tariffForm = useForm<ElectricTariffForm>({
    mode: 'onTouched',
    defaultValues: {
      tariffCode: '',
      tariffName: '',
      priceType: DEFAULT_PRICE_TYPE,
      voltageLevel: DEFAULT_VOLTAGE_LEVEL,
      effectiveFrom: moment().format(DATE_API_FORMAT),
      effectiveTo: ''
    },
    resolver: zodResolver(tariffSchema)
  });

  const buildSearchBody = useCallback(
    (filter: ElectricTariffFilter, page: number): SearchTariffsReq => {
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
    (page: number, filter: ElectricTariffFilter) => {
      dispatch({
        type: SEARCH_ELECTRIC_TARIFF,
        payload: {
          body: buildSearchBody(filter, page),
          onFailed: (error?: ErrorBase) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getErrorMessage(error, 'Tải danh mục giá điện thất bại')
            });
          }
        }
      });
    },
    [buildSearchBody]
  );

  useEffect(() => {
    fetchList(currentPage, filterApplied);
  }, [currentPage, fetchList, filterApplied]);

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

  const onChangeFilter = useCallback((key: keyof ElectricTariffFilter, value: string) => {
    setFilterDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  const onApplyFilter = useCallback(() => {
    setFilterApplied(filterDraft);
    setCurrentPage(K_SIZE_1);
  }, [filterDraft]);

  const onResetFilter = useCallback(() => {
    setFilterDraft(DEFAULT_TARIFF_FILTER);
    setFilterApplied(DEFAULT_TARIFF_FILTER);
    setCurrentPage(K_SIZE_1);
  }, []);

  const onOpenCreate = useCallback(() => {
    tariffForm.reset({
      tariffCode: '',
      tariffName: '',
      priceType: DEFAULT_PRICE_TYPE,
      voltageLevel: DEFAULT_VOLTAGE_LEVEL,
      effectiveFrom: moment().format(DATE_API_FORMAT),
      effectiveTo: ''
    });
    setOpenCreate(true);
  }, [tariffForm]);

  const onCloseCreate = useCallback(() => {
    setOpenCreate(false);
    tariffForm.reset();
  }, [tariffForm]);

  const refreshFirstPage = useCallback(() => {
    if (currentPage === K_SIZE_1) {
      fetchList(K_SIZE_1, filterApplied);
    } else {
      setCurrentPage(K_SIZE_1);
    }
  }, [currentPage, fetchList, filterApplied]);

  const refreshAfterDelete = useCallback(() => {
    if (tariffList.length === K_SIZE_1 && currentPage > K_SIZE_1) {
      setCurrentPage(currentPage - K_SIZE_1);
      return;
    }

    fetchList(currentPage, filterApplied);
  }, [currentPage, fetchList, filterApplied, tariffList.length]);

  const handleCreateTariff = useCallback(
    (data: ElectricTariffForm) => {
      const body: CreateTariffReq = {
        tariffCode: data.tariffCode.trim(),
        tariffName: data.tariffName.trim(),
        voltageLevel: data.voltageLevel,
        effectiveFrom: normalizeDateToApi(data.effectiveFrom),
        effectiveTo: normalizeDateToApi(data.effectiveTo) || undefined,
        priceType: data.priceType
      };

      dispatch({
        type: CREATE_ELECTRIC_TARIFF,
        payload: {
          body,
          onSuccess: () => {
            showToast({
              type: TYPE_TOAST.SUCCESS,
              content: 'Thêm biểu giá điện thành công'
            });
            onCloseCreate();
            refreshFirstPage();
          },
          onFailed: (error?: ErrorBase) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getErrorMessage(error, 'Thêm biểu giá điện thất bại')
            });
          }
        }
      });
    },
    [onCloseCreate, refreshFirstPage]
  );

  const loadTariffDetail = useCallback((id: number) => {
    dispatch({
      type: GET_ELECTRIC_TARIFF_DETAIL,
      payload: {
        body: { id },
        onSuccess: (response: GetTariffDetailRes) => {
          setSelectedDetail(response.data);
          setTouPrices(normalizeTouPrices(getDetailPrices(response.data)));
        },
        onFailed: (error?: ErrorBase) => {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getErrorMessage(error, 'Tải chi tiết biểu giá thất bại')
          });
        }
      }
    });
  }, []);

  const onOpenDetail = useCallback(
    (tariff: ElectricTariff) => {
      setSelectedDetail({ tariff, prices: [] });
      setTouPrices(normalizeTouPrices());
      setSelectedTariffDocumentFile(undefined);
      setOpenDetail(true);
      loadTariffDetail(tariff.id);
    },
    [loadTariffDetail]
  );

  const onCloseDetail = useCallback(() => {
    setOpenDetail(false);
    setSelectedDetail(undefined);
    setTouPrices(normalizeTouPrices());
    setSelectedTariffDocumentFile(undefined);
  }, []);

  const tariffDocumentFileName = useMemo(
    () => getTariffDocumentFileName(selectedDetail?.tariff, ''),
    [selectedDetail?.tariff]
  );

  const onSelectTariffDocumentFile = useCallback((file: File) => {
    if (!isValidUploadFileSize(file)) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getUploadFileSizeError('văn bản áp giá')
      });
      return false;
    }

    setSelectedTariffDocumentFile(file);
    return true;
  }, []);

  const onRemoveSelectedTariffDocumentFile = useCallback(() => {
    setSelectedTariffDocumentFile(undefined);
    return true;
  }, []);

  const onChangeTouPrice = useCallback((tou: string, value: string) => {
    setTouPrices((prev) =>
      normalizeTouPrices(prev).map((price) =>
        price.tou === tou
          ? {
              ...price,
              draftUnitPrice: value,
              unitPrice: getParsedTouPrice(value)
            }
          : price
      )
    );
  }, []);

  const handleSaveTouPrices = useCallback(() => {
    if (!selectedDetail?.tariff?.id) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: 'Không tìm thấy ID biểu giá điện để cập nhật bậc giá'
      });
      return;
    }

    const validationError = validateTouPrices(touPrices);
    if (validationError) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: validationError
      });
      return;
    }

    const body: UpdateTariffReq = {
      id: selectedDetail.tariff.id,
      prices: buildTouPriceInputs(touPrices)
    };

    dispatch({
      type: UPDATE_ELECTRIC_TARIFF,
      payload: {
        body,
        onSuccess: () => {
          showToast({
            type: TYPE_TOAST.SUCCESS,
            content: 'Cập nhật bậc giá thành công'
          });
          loadTariffDetail(selectedDetail.tariff?.id || body.id);
          onCloseDetail();
        },
        onFailed: (error?: ErrorBase) => {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getErrorMessage(error, 'Cập nhật bậc giá thất bại')
          });
          onCloseDetail();
        }
      }
    });
  }, [loadTariffDetail, onCloseDetail, selectedDetail?.tariff?.id, touPrices]);

  const handleUploadTariffDocument = useCallback(() => {
    const tariffId = selectedDetail?.tariff?.id;
    if (!tariffId) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: 'Không tìm thấy ID biểu giá điện để tải văn bản áp giá'
      });
      return;
    }

    if (!selectedTariffDocumentFile) {
      showToast({
        type: TYPE_TOAST.INFO,
        content: 'Vui lòng chọn văn bản áp giá'
      });
      return;
    }

    dispatch({
      type: UPLOAD_ELECTRIC_TARIFF_DOCUMENT,
      payload: {
        body: { id: tariffId, file: selectedTariffDocumentFile },
        onSuccess: () => {
          setSelectedTariffDocumentFile(undefined);
          loadTariffDetail(tariffId);
          showToast({
            type: TYPE_TOAST.SUCCESS,
            content: 'Tải văn bản áp giá thành công'
          });
        },
        onFailed: (error?: ErrorBase) => {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getErrorMessage(error, 'Tải văn bản áp giá thất bại')
          });
        }
      }
    });
  }, [loadTariffDetail, selectedDetail?.tariff?.id, selectedTariffDocumentFile]);

  const ensureTariffDocument = useCallback(() => {
    if (hasTariffDocument(selectedDetail?.tariff)) return true;

    showToast({
      type: TYPE_TOAST.INFO,
      content: 'Biểu giá điện chưa có văn bản áp giá'
    });
    return false;
  }, [selectedDetail?.tariff]);

  const onViewTariffDocument = useCallback(async () => {
    const tariff = selectedDetail?.tariff;
    if (!tariff?.id || !ensureTariffDocument()) return;

    const targetWindow = window.open('about:blank', '_blank');
    if (targetWindow) {
      targetWindow.opener = null;
    }

    const response = await electricTariffServices.viewTariffDocument(tariff.id);
    const fileError = await getBlobResponseError(response);
    if (fileError || !isBlobFileResponse(response)) {
      targetWindow?.close();
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getErrorMessage(fileError as ErrorBase, 'Xem văn bản áp giá thất bại')
      });
      return;
    }

    if (!canViewBlobInline(response, INLINE_TARIFF_DOCUMENT_MIME_TYPES)) {
      targetWindow?.close();
      downloadBlobResponse(response, getTariffDocumentFileName(tariff, response.fileName));
      showToast({
        type: TYPE_TOAST.INFO,
        content: 'Định dạng này không hỗ trợ xem trực tiếp, hệ thống đã tải file xuống'
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
  }, [ensureTariffDocument, selectedDetail?.tariff]);

  const onDownloadTariffDocument = useCallback(async () => {
    const tariff = selectedDetail?.tariff;
    if (!tariff?.id || !ensureTariffDocument()) return;

    const response = await electricTariffServices.downloadTariffDocument(tariff.id);
    const fileError = await getBlobResponseError(response);
    if (fileError || !isBlobFileResponse(response)) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getErrorMessage(fileError as ErrorBase, 'Tải văn bản áp giá thất bại')
      });
      return;
    }

    downloadBlobResponse(response, getTariffDocumentFileName(tariff, response.fileName));
  }, [ensureTariffDocument, selectedDetail?.tariff]);

  const deleteTariffDocument = useCallback(() => {
    const tariffId = selectedDetail?.tariff?.id;
    if (!tariffId) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: 'Không tìm thấy ID biểu giá điện để gỡ văn bản áp giá'
      });
      return;
    }

    dispatch({
      type: DELETE_ELECTRIC_TARIFF_DOCUMENT,
      payload: {
        body: { id: tariffId },
        onSuccess: () => {
          setSelectedTariffDocumentFile(undefined);
          loadTariffDetail(tariffId);
          showToast({
            type: TYPE_TOAST.SUCCESS,
            content: 'Gỡ văn bản áp giá thành công'
          });
        },
        onFailed: (error?: ErrorBase) => {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getErrorMessage(error, 'Gỡ văn bản áp giá thất bại')
          });
        }
      }
    });
  }, [loadTariffDetail, selectedDetail?.tariff]);

  const onDeleteTariffDocument = useCallback(() => {
    if (!ensureTariffDocument()) return;

    showDialog({
      title: 'Xác nhận gỡ văn bản',
      content: `Bạn có chắc chắn gỡ văn bản áp giá ${tariffDocumentFileName} không?`,
      type: TYPE_MESSAGE.ALERT,
      actions: [
        {
          title: 'Đồng ý',
          type: TYPE_ACTION.PRIMARY,
          onPress: deleteTariffDocument
        },
        {
          title: 'Hủy bỏ',
          type: TYPE_ACTION.SECONDARY
        }
      ]
    });
  }, [deleteTariffDocument, ensureTariffDocument, tariffDocumentFileName]);

  const onDeleteSuccess = useCallback(() => {
    refreshAfterDelete();
    showToast({
      type: TYPE_TOAST.SUCCESS,
      content: 'Xoá biểu giá điện thành công'
    });
  }, [refreshAfterDelete]);

  const onDelete = useCallback(
    (tariff: ElectricTariff) => {
      if (!tariff.id) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: 'Không tìm thấy ID biểu giá điện để xoá'
        });
        return;
      }

      const tariffLabel = tariff.tariffCode || tariff.tariffName || 'đã chọn';

      showDialog({
        title: t('common:delete_confirm'),
        content: `Bạn có chắc chắn xoá biểu giá điện ${tariffLabel} này?`,
        type: TYPE_MESSAGE.ALERT,
        actions: [
          {
            title: t('common:agree'),
            type: TYPE_ACTION.PRIMARY,
            onPress: () => {
              dispatch({
                type: DELETE_ELECTRIC_TARIFF,
                payload: {
                  body: { id: tariff.id },
                  onSuccess: onDeleteSuccess,
                  onFailed: (error?: ErrorBase) => {
                    showToast({
                      type: TYPE_TOAST.ERROR,
                      content: getErrorMessage(error, 'Xoá biểu giá điện thất bại')
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

  return {
    tariffList,
    total,
    currentPage,
    pagination,
    filterDraft,
    filterApplied,
    listLoading,
    detailLoading,
    openCreate,
    openDetail,
    selectedDetail,
    touPrices,
    selectedTariffDocumentFile,
    tariffDocumentFileName,
    tariffForm,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    onOpenCreate,
    onCloseCreate,
    handleCreateTariff,
    onOpenDetail,
    onCloseDetail,
    onChangeTouPrice,
    handleSaveTouPrices,
    onSelectTariffDocumentFile,
    onRemoveSelectedTariffDocumentFile,
    handleUploadTariffDocument,
    onViewTariffDocument,
    onDownloadTariffDocument,
    onDeleteTariffDocument,
    onDelete
  };
}
