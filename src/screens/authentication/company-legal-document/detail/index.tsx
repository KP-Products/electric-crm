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
import { CompanyLegalDocument } from 'model/company-legal-document';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import companyLegalDocumentServices from 'services/company-legal-document-services';
import { displayDateFromServer } from 'utils/date';
import {
  getAttachmentFileName,
  getAttachmentResponseError,
  getCompanyLegalDocumentStatusLabel,
  getCompanyLegalDocumentTypeLabel,
  getErrorContent,
  isAttachmentFileResponse,
  getStatusType
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

export default function CompanyLegalDocumentDetailScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = Number(searchParams.get('id'));
  const [document, setDocument] = useState<CompanyLegalDocument>();
  const [loading, setLoading] = useState(false);

  const onBack = useCallback(() => router.push(ROUTES.COMPANY_LEGAL_DOCUMENTS), [router]);
  const fetchDetail = useCallback(async () => {
    if (!Number.isInteger(id) || id <= 0) {
      onBack();
      return;
    }
    setLoading(true);
    const response = await companyLegalDocumentServices.getCompanyLegalDocumentDetail({ id });
    setLoading(false);
    if (!response?.data) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getErrorContent(response, 'Tải chi tiết văn bản thất bại')
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
    if (!document?.attachmentFilePath) {
      showToast({ type: TYPE_TOAST.INFO, content: 'Văn bản chưa có file đính kèm' });
      return;
    }

    const targetWindow = window.open('about:blank', '_blank');
    if (targetWindow) targetWindow.opener = null;
    const response = await companyLegalDocumentServices.viewCompanyLegalDocumentAttachment(
      document.id
    );
    const attachmentError = await getAttachmentResponseError(response);
    if (attachmentError || !isAttachmentFileResponse(response)) {
      targetWindow?.close();
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getErrorContent(attachmentError || response, 'Xem file đính kèm thất bại')
      });
      return;
    }

    const viewUrl = URL.createObjectURL(response.blob);
    if (targetWindow) targetWindow.location.href = viewUrl;
    else window.open(viewUrl, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(viewUrl), 60000);
  }, [document]);

  const onDownloadAttachment = useCallback(async () => {
    if (!document?.attachmentFilePath) {
      showToast({ type: TYPE_TOAST.INFO, content: 'Văn bản chưa có file đính kèm' });
      return;
    }

    const response = await companyLegalDocumentServices.downloadCompanyLegalDocumentAttachment(
      document.id
    );
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
    link.download = getAttachmentFileName(document.attachmentFilePath);
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  }, [document]);

  return (
    <PageWithBreadcrumb
      breadcrumbList={[
        { title: 'Văn bản pháp lý' },
        { title: 'Văn bản pháp lý công ty' },
        { title: 'Chi tiết văn bản pháp lý' }
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
            <TextBase classNames="title4" text="Chi tiết văn bản pháp lý" />
          </div>
          <ButtonBase
            type="primary"
            leftIcon="ICON_EDIT"
            customContent="Chỉnh sửa"
            disabled={!document?.id}
            onClick={() =>
              document && router.push(`${ROUTES.COMPANY_LEGAL_DOCUMENT_EDIT}?id=${document.id}`)
            }
          />
        </Flex>
        <Divider className="my-16" />
        <Spin spinning={loading}>
          <section className="rounded-radius-l border border-color-300 bg-color-50 p-16">
            <TextBase classNames="sub-title3 mb-16 !text-primary-700" text="Thông tin văn bản" />
            <div className="grid grid-cols-3 gap-x-24 gap-y-20 tablet:grid-cols-2 mobile:grid-cols-1">
              <InfoItem label="Mã văn bản">{value(document?.id)}</InfoItem>
              <InfoItem label="Số/Ký hiệu">{value(document?.documentNumber)}</InfoItem>
              <InfoItem label="Loại văn bản">
                {getCompanyLegalDocumentTypeLabel(document?.documentType) || NULL_VALUE}
              </InfoItem>
              <InfoItem label="Tên văn bản">{value(document?.documentName)}</InfoItem>
              <InfoItem label="Ngày văn bản">{date(document?.documentDate)}</InfoItem>
              <InfoItem label="Trạng thái">
                <Status
                  kind={KIND_STATUS.SECONDARY}
                  type={getStatusType(document?.status)}
                  content={getCompanyLegalDocumentStatusLabel(document?.status) || NULL_VALUE}
                />
              </InfoItem>
              <InfoItem label="Ngày hiệu lực">{date(document?.effectiveDate)}</InfoItem>
              <InfoItem label="Ngày hết hiệu lực">{date(document?.expiryDate)}</InfoItem>
              <InfoItem label="Người soạn thảo">
                {value(document?.draftedByName || document?.draftedBy)}
              </InfoItem>
              <InfoItem label="Người ký duyệt">
                {value(document?.approvedByName || document?.approvedBy)}
              </InfoItem>
              <InfoItem label="Người tạo">
                {value(
                  document?.createdByName || document?.createdByUsername || document?.createdBy
                )}
              </InfoItem>
              <InfoItem label="Ngày tạo">{date(document?.createdAt)}</InfoItem>
              <InfoItem label="Nội dung trích yếu">
                <span className="whitespace-pre-wrap">{value(document?.summary)}</span>
              </InfoItem>
              <InfoItem label="Ghi chú">
                <span className="whitespace-pre-wrap">{value(document?.note)}</span>
              </InfoItem>
              <InfoItem label="File đính kèm">
                {document?.attachmentFilePath ? (
                  <Flex align="center" wrap gap={K_SIZE_8}>
                    <span className="max-w-[260px] truncate" title={document.attachmentFilePath}>
                      {document.attachmentFilePath}
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
