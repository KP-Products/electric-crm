import { GET_CONTRACT_DETAIL } from '@redux-action-type/contract';
import { dispatch } from '@redux-common';
import { selectContractLoadingDetail } from '@redux-selector/contract';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import { ErrorBase } from 'model/common';
import { Contract, ContractRes } from 'model/contract';
import { DocumentFileRes, DocumentItem } from 'model/document';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import documentServices from 'services/document-services';
import { CONTRACT_DOCUMENT_OWNER_TYPE, getContractErrorMessage, getContractId } from '../utils';
import useCustomerLookup from './useCustomerLookup';

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
  response?.fileName || document.originalFileName || 'tai-lieu-hop-dong';

export default function useContractDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const detailLoading = useSelector(selectContractLoadingDetail);

  const [selectedContract, setSelectedContract] = useState<Contract>();
  const [documentList, setDocumentList] = useState<DocumentItem[]>([]);
  const [documentLoading, setDocumentLoading] = useState<boolean>(false);

  const pinnedCustomerIds = useMemo(
    () => [selectedContract?.customerId],
    [selectedContract?.customerId]
  );

  const { getCustomerDisplay } = useCustomerLookup({
    autoLoad: false,
    pinnedIds: pinnedCustomerIds
  });

  const onBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.replace(ROUTES.MANAGE_CONTRACT);
  }, [router]);

  const onEdit = useCallback(() => {
    const contractId = getContractId(selectedContract);
    if (!contractId) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: 'Không tìm thấy ID hợp đồng để cập nhật'
      });
      return;
    }

    router.push(`${ROUTES.MANAGE_CONTRACT_EDIT}?id=${contractId}`);
  }, [router, selectedContract]);

  const fetchDocuments = useCallback(async (contractId: string) => {
    setDocumentLoading(true);
    try {
      const response = await documentServices.listDocuments({
        ownerType: CONTRACT_DOCUMENT_OWNER_TYPE,
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
      showToast({ type: TYPE_TOAST.ERROR, content: 'Không tìm thấy hợp đồng' });
      onBack();
      return;
    }

    dispatch({
      type: GET_CONTRACT_DETAIL,
      payload: {
        body: { id },
        onSuccess: (response: ContractRes) => {
          if (!response.data) return;
          setSelectedContract(response.data);
          fetchDocuments(getContractId(response.data) || id);
        },
        onFailed: (error?: ErrorBase) => {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getContractErrorMessage(error, 'Tải chi tiết hợp đồng thất bại')
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
        content: getContractErrorMessage(fileError as ErrorBase, 'Xem tài liệu thất bại')
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
        content: getContractErrorMessage(fileError as ErrorBase, 'Tải tài liệu thất bại')
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
    getCustomerDisplay,
    onBack,
    onEdit,
    onViewDocument,
    onDownloadDocument
  };
}
