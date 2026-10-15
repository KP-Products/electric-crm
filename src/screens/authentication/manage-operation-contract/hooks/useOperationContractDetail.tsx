import { GET_OPERATION_CONTRACT_DETAIL } from '@redux-action-type/operation-contract';
import { dispatch } from '@redux-common';
import { selectOperationContractLoadingDetail } from '@redux-selector/operation-contract';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import { ErrorBase } from 'model/common';
import { DocumentFileRes, DocumentItem } from 'model/document';
import { OperationContract, OperationContractRes } from 'model/operation-contract';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import documentServices from 'services/document-services';
import {
  getOperationContractErrorMessage,
  getOperationContractId,
  OPERATION_CONTRACT_DOCUMENT_OWNER_TYPE
} from '../utils';

const getDocumentFileContentType = (response: DocumentFileRes) =>
  (response.contentType || response.blob.type || '').toLowerCase();

const isJsonContentType = (contentType: string) => {
  const normalizedContentType = contentType.split(';')[0]?.trim();
  return (
    normalizedContentType === 'application/json' ||
    normalizedContentType === 'text/json' ||
    normalizedContentType.endsWith('+json')
  );
};

const looksLikeApiError = (value: unknown) => {
  const error = value as
    | (ErrorBase & { error?: string; message?: string; status?: number })
    | null
    | undefined;

  return Boolean(
    error &&
      typeof error === 'object' &&
      (error.businessErrorMessage ||
        error.systemErrorMessage ||
        error.detailMessage ||
        error.message ||
        error.error ||
        error.status)
  );
};

const isDocumentFileResponse = (response: unknown): response is DocumentFileRes => {
  const fileResponse = response as DocumentFileRes | undefined;
  if (!fileResponse?.blob || !(fileResponse.blob instanceof Blob)) return false;
  return !isJsonContentType(getDocumentFileContentType(fileResponse));
};

const getDocumentFileResponseError = async (response: unknown) => {
  const fileResponse = response as DocumentFileRes | undefined;
  if (!fileResponse?.blob || !(fileResponse.blob instanceof Blob)) {
    return response;
  }

  const contentType = getDocumentFileContentType(fileResponse);
  const shouldParseBlob = !contentType || isJsonContentType(contentType);
  if (!shouldParseBlob) return undefined;

  try {
    const text = await fileResponse.blob.text();
    const parsed = JSON.parse(text);
    if (isJsonContentType(contentType) || looksLikeApiError(parsed)) return parsed;
    return undefined;
  } catch {
    return isJsonContentType(contentType) ? response : undefined;
  }
};

const getDownloadFileName = (document: DocumentItem, response?: DocumentFileRes) =>
  response?.fileName || document.originalFileName || 'tai-lieu-hop-dong-van-hanh';

export default function useOperationContractDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const detailLoading = useSelector(selectOperationContractLoadingDetail);

  const [selectedContract, setSelectedContract] = useState<OperationContract>();
  const [documentList, setDocumentList] = useState<DocumentItem[]>([]);
  const [documentLoading, setDocumentLoading] = useState<boolean>(false);

  const onBack = useCallback(() => {
    router.push(ROUTES.MANAGE_OPERATION_CONTRACT);
  }, [router]);

  const onEdit = useCallback(() => {
    const contractId = getOperationContractId(selectedContract);
    if (!contractId) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: 'Không tìm thấy ID hợp đồng vận hành để cập nhật'
      });
      return;
    }

    router.push(`${ROUTES.MANAGE_OPERATION_CONTRACT_EDIT}?id=${contractId}`);
  }, [router, selectedContract]);

  const fetchDocuments = useCallback(async (contractId: string) => {
    setDocumentLoading(true);
    try {
      const response = await documentServices.listDocuments({
        ownerType: OPERATION_CONTRACT_DOCUMENT_OWNER_TYPE,
        ownerId: contractId
      });

      if (!response || !response.data) {
        setDocumentList([]);
        return;
      }

      setDocumentList(Array.isArray(response.data) ? response.data : []);
    } catch {
      setDocumentList([]);
    } finally {
      setDocumentLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) {
      showToast({ type: TYPE_TOAST.ERROR, content: 'Không tìm thấy hợp đồng vận hành' });
      onBack();
      return;
    }

    dispatch({
      type: GET_OPERATION_CONTRACT_DETAIL,
      payload: {
        body: { id },
        onSuccess: (response: OperationContractRes) => {
          if (!response.data) return;
          setSelectedContract(response.data);
          fetchDocuments(response.data.contractId || id);
        },
        onFailed: (error?: ErrorBase) => {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getOperationContractErrorMessage(
              error,
              'Tải chi tiết hợp đồng vận hành thất bại'
            )
          });
          onBack();
        }
      }
    });
  }, [fetchDocuments, id, onBack]);

  const onViewDocument = useCallback(async (document: DocumentItem) => {
    const targetWindow = window.open('about:blank', '_blank');
    if (targetWindow) {
      targetWindow.opener = null;
    }

    const response = await documentServices.viewDocumentFile(document.id);
    const fileError = await getDocumentFileResponseError(response);
    if (fileError || !isDocumentFileResponse(response)) {
      targetWindow?.close();
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getOperationContractErrorMessage(fileError as ErrorBase, 'Xem tài liệu thất bại')
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
  }, []);

  const onDownloadDocument = useCallback(async (document: DocumentItem) => {
    const response = await documentServices.downloadDocumentFile(document.id);
    const fileError = await getDocumentFileResponseError(response);
    if (fileError || !isDocumentFileResponse(response)) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getOperationContractErrorMessage(fileError as ErrorBase, 'Tải tài liệu thất bại')
      });
      return;
    }

    const downloadUrl = URL.createObjectURL(response.blob);
    const link = window.document.createElement('a');
    link.href = downloadUrl;
    link.download = getDownloadFileName(document, response);
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  }, []);

  return {
    selectedContract,
    detailLoading,
    documentList,
    documentLoading,
    onBack,
    onEdit,
    onViewDocument,
    onDownloadDocument
  };
}
