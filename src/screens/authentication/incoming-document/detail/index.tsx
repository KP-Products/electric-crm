'use client';

import { K_SIZE_24, K_SIZE_8, NULL_VALUE } from '@constant';
import { Divider, Flex, Spin } from 'antd';
import ButtonBase from 'components/button';
import { IconSvgLocal } from 'components/icon-vec-local';
import IconHover from 'components/icon-vec-local/icon-hover';
import Status, { KIND_STATUS } from 'components/status';
import { TextBase } from 'components/text';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { IncomingDocument } from 'model/incoming-document';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import incomingDocumentServices from 'services/incoming-document-services';
import { displayDateFromServer } from 'utils/date';
import {
  canViewAttachmentInline,
  getAttachmentFileName,
  getAttachmentResponseError,
  getConfidentialityLevelLabel,
  getConfidentialityLevelStatusType,
  getErrorContent,
  getIncomingDocumentTypeLabel,
  getUrgencyLevelLabel,
  getUrgencyLevelStatusType,
  isAttachmentFileResponse
} from '../utils';

const value = (data?: string | number) =>
  data === undefined || data === null || data === '' ? NULL_VALUE : String(data);
const date = (data?: string) => (data ? displayDateFromServer(data) : NULL_VALUE);

const InfoItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="min-w-0">
    <TextBase classNames="body3 !text-color-600" text={label} />
    <div className="mt-4 break-words text-14 font-semibold text-color-900">{children}</div>
  </div>
);

export default function IncomingDocumentDetailScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = Number(searchParams.get('id'));
  const [document, setDocument] = useState<IncomingDocument>();
  const [loading, setLoading] = useState(false);

  const onBack = useCallback(() => router.push(ROUTES.INCOMING_DOCUMENTS), [router]);
  const fetchDetail = useCallback(async () => {
    if (!Number.isInteger(id) || id <= 0) {
      onBack();
      return;
    }

    setLoading(true);
    const response = await incomingDocumentServices.getIncomingDocumentDetail({ id });
    setLoading(false);
    if (!response?.data) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getErrorContent(response, 'Tải chi tiết văn bản đến thất bại')
      });
      onBack();
      return;
    }
    setDocument(response.data);
  }, [id, onBack]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  const onViewAttachment = useCallback(async () => {
    if (!document?.filePath) {
      showToast({ type: TYPE_TOAST.INFO, content: 'Văn bản chưa có file đính kèm' });
      return;
    }

    const targetWindow = window.open('about:blank', '_blank');
    if (targetWindow) targetWindow.opener = null;
    const response = await incomingDocumentServices.viewIncomingDocumentAttachment(document.id);
    const attachmentError = await getAttachmentResponseError(response);
    if (attachmentError || !isAttachmentFileResponse(response)) {
      targetWindow?.close();
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getErrorContent(attachmentError || response, 'Xem file đính kèm thất bại')
      });
      return;
    }
    if (!canViewAttachmentInline(response)) {
      targetWindow?.close();
      showToast({ type: TYPE_TOAST.INFO, content: 'Định dạng file này chỉ hỗ trợ tải xuống' });
      return;
    }

    const viewUrl = URL.createObjectURL(response.blob);
    if (targetWindow) targetWindow.location.href = viewUrl;
    else window.open(viewUrl, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(viewUrl), 60000);
  }, [document]);

  const onDownloadAttachment = useCallback(async () => {
    if (!document?.filePath) {
      showToast({ type: TYPE_TOAST.INFO, content: 'Văn bản chưa có file đính kèm' });
      return;
    }

    const response = await incomingDocumentServices.downloadIncomingDocumentAttachment(document.id);
    const attachmentError = await getAttachmentResponseError(response);
    if (attachmentError || !isAttachmentFileResponse(response)) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getErrorContent(attachmentError || response, 'Tải file đính kèm thất bại')
      });
      return;
    }

    const downloadUrl = URL.createObjectURL(response.blob);
    const link = window.document.createElement('a');
    link.href = downloadUrl;
    link.download = getAttachmentFileName(document.filePath);
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  }, [document]);

  return (
    <PageWithBreadcrumb
      breadcrumbList={[
        { title: 'Văn bản pháp lý' },
        { title: 'Văn bản đến' },
        { title: 'Chi tiết văn bản đến' }
      ]}
    >
      <section>
        <Flex
          justify="space-between"
          align="center"
          gap={K_SIZE_8}
          className="mobile:flex-col mobile:items-start"
        >
          <div className="flex items-center gap-8">
            <IconSvgLocal
              name="ICON_ARROW_LINE_LEFT"
              height={K_SIZE_24}
              width={K_SIZE_24}
              classNames="cursor-pointer"
              onClick={onBack}
            />
            <TextBase classNames="title4" text="Chi tiết văn bản đến" />
          </div>
          <ButtonBase
            type="primary"
            leftIcon="ICON_EDIT"
            customContent="Chỉnh sửa"
            disabled={!document?.id}
            onClick={() =>
              document && router.push(`${ROUTES.INCOMING_DOCUMENT_EDIT}?id=${document.id}`)
            }
          />
        </Flex>
        <Divider className="my-16" />
        <Spin spinning={loading}>
          <section className="rounded-radius-l border border-color-300 bg-color-50 p-16">
            <TextBase classNames="sub-title3 mb-16 !text-primary-700" text="Thông tin văn bản" />
            <div className="grid grid-cols-3 gap-x-24 gap-y-20 tablet:grid-cols-2 mobile:grid-cols-1">
              <InfoItem label="Mã văn bản">{value(document?.id)}</InfoItem>
              <InfoItem label="Số đến">{value(document?.incomingNumber)}</InfoItem>
              <InfoItem label="Ngày đến">{date(document?.incomingDate)}</InfoItem>
              <InfoItem label="Số/Ký hiệu văn bản">{value(document?.documentNumber)}</InfoItem>
              <InfoItem label="Ngày văn bản">{date(document?.documentDate)}</InfoItem>
              <InfoItem label="Cơ quan ban hành">{value(document?.issuingAgency)}</InfoItem>
              <InfoItem label="Loại văn bản">
                {getIncomingDocumentTypeLabel(document?.documentType) || NULL_VALUE}
              </InfoItem>
              <InfoItem label="Độ khẩn">
                <Status
                  kind={KIND_STATUS.SECONDARY}
                  type={getUrgencyLevelStatusType(document?.urgencyLevel)}
                  content={getUrgencyLevelLabel(document?.urgencyLevel) || NULL_VALUE}
                />
              </InfoItem>
              <InfoItem label="Độ mật">
                <Status
                  kind={KIND_STATUS.SECONDARY}
                  type={getConfidentialityLevelStatusType(document?.confidentialityLevel)}
                  content={
                    getConfidentialityLevelLabel(document?.confidentialityLevel) || NULL_VALUE
                  }
                />
              </InfoItem>
              <InfoItem label="Số trang">{value(document?.pageCount)}</InfoItem>
              <InfoItem label="Hạn xử lý">{date(document?.dueDate)}</InfoItem>
              <InfoItem label="Người duyệt">{value(document?.approvedBy)}</InfoItem>
              <InfoItem label="Ngày duyệt">{date(document?.approvalDate)}</InfoItem>
              <InfoItem label="Người tạo">{value(document?.createdBy)}</InfoItem>
              <InfoItem label="Ngày tạo">{date(document?.createdAt)}</InfoItem>
              <InfoItem label="Trích yếu nội dung">
                <span className="whitespace-pre-wrap">{value(document?.summary)}</span>
              </InfoItem>
              <InfoItem label="Ý kiến duyệt">
                <span className="whitespace-pre-wrap">{value(document?.approvalNote)}</span>
              </InfoItem>
              <InfoItem label="Ghi chú">
                <span className="whitespace-pre-wrap">{value(document?.note)}</span>
              </InfoItem>
              <InfoItem label="File đính kèm">
                {document?.filePath ? (
                  <Flex align="center" wrap gap={K_SIZE_8}>
                    <span className="max-w-[260px] truncate" title={document.filePath}>
                      {document.filePath}
                    </span>
                    <IconHover
                      rootClassName="text-color-800"
                      title="Xem file"
                      icon="ICON_EYE_OPEN"
                      onClick={onViewAttachment}
                    />
                    <IconHover
                      rootClassName="text-color-800"
                      title="Tải file"
                      icon="IC_DOWNLOAD_OUTLINE"
                      onClick={onDownloadAttachment}
                    />
                  </Flex>
                ) : (
                  NULL_VALUE
                )}
              </InfoItem>
            </div>
          </section>
        </Spin>
      </section>
    </PageWithBreadcrumb>
  );
}
