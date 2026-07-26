import { DEFAULT_PAGE_SIZE, K_SIZE_0, K_SIZE_1 } from '@constant';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import remoteMeterReadingServices from 'services/remote-meter-reading-services';
import {
  RemoteMeterReadingImportResult,
  RemoteMeterReadingPeriod,
  SearchRemoteMeterReadingsReq
} from 'model/remote-meter-reading';
import { getUploadFileSizeError, isValidUploadFileSize } from 'utils/upload';

const REMOTE_READING_TYPE_INPUT = '2';

const getErrorMessage = (error?: any, fallback = 'Thao tác thất bại') => {
  return (
    error?.businessErrorMessage ||
    error?.systemErrorMessage ||
    error?.detailMessage ||
    error?.message ||
    fallback
  );
};

export default function useRemoteMeterReading() {
  const [rows, setRows] = useState<RemoteMeterReadingPeriod[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);
  const [total, setTotal] = useState<number>(K_SIZE_0);
  const [loading, setLoading] = useState<boolean>(false);
  const [importing, setImporting] = useState<boolean>(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<RemoteMeterReadingImportResult>();
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>('');

  const buildSearchBody = useCallback(
    (page: number): SearchRemoteMeterReadingsReq => ({
      page: page - K_SIZE_1,
      size: DEFAULT_PAGE_SIZE,
      typeInput: REMOTE_READING_TYPE_INPUT
    }),
    []
  );

  const fetchRemoteReadings = useCallback(
    async (page = currentPage) => {
      setLoading(true);

      const response = await remoteMeterReadingServices.searchRemoteReadingPeriods(
        buildSearchBody(page)
      );

      setLoading(false);

      if (!response?.data) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getErrorMessage(response, 'Tải danh sách chỉ số đo xa thất bại')
        });
        return;
      }

      setRows(response.data.items || []);
      setTotal(response.data.total || K_SIZE_0);
      setLastUpdatedAt(moment().format('HH:mm DD/MM/YYYY'));
    },
    [buildSearchBody, currentPage]
  );

  useEffect(() => {
    fetchRemoteReadings(currentPage);
  }, [currentPage, fetchRemoteReadings]);

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

  const onImportFile = useCallback(
    async (file: File) => {
      if (importing) return;

      if (!isValidUploadFileSize(file)) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getUploadFileSizeError()
        });
        return;
      }

      setImportResult(undefined);
      setImporting(true);
      const response = await remoteMeterReadingServices.importRemoteMeterReadings({
        file
      });
      setImporting(false);

      if (!response?.data) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getErrorMessage(response, 'Import dữ liệu đo xa thất bại')
        });
        return;
      }

      setImportResult(response.data);

      if (!response.data.success) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content:
            response.data.errors?.[K_SIZE_0] ||
            getErrorMessage(response, 'File Excel có dữ liệu không hợp lệ')
        });
        return;
      }

      showToast({
        type: TYPE_TOAST.SUCCESS,
        content: `Import thành công ${response.data.rowCount || K_SIZE_0} dòng chỉ số`
      });

      if (currentPage === K_SIZE_1) {
        fetchRemoteReadings(K_SIZE_1);
      } else {
        setCurrentPage(K_SIZE_1);
      }
    },
    [currentPage, fetchRemoteReadings, importing]
  );

  const onDownloadTemplate = useCallback(async () => {
    setDownloadingTemplate(true);
    const response = await remoteMeterReadingServices.downloadRemoteMeterReadingTemplate();
    setDownloadingTemplate(false);

    if (!response?.data) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getErrorMessage(response, 'Tải file mẫu thất bại')
      });
      return;
    }

    const link = document.createElement('a');
    link.href = URL.createObjectURL(response.data);
    link.download = response.fileName || 'mau-nhap-chi-so-do-xa.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, []);

  return {
    rows,
    total,
    loading,
    importing,
    downloadingTemplate,
    importResult,
    lastUpdatedAt,
    pagination,
    currentPage,
    onImportFile,
    onDownloadTemplate
  };
}
