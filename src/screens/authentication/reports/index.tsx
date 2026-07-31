'use client';

import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { AppDatePicker } from 'components/date-picker';
import { AppSelect, AppSelectOption } from 'components/select';
import ButtonBase from 'components/button';
import { TextBase } from 'components/text';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { Customer } from 'model/customer';
import { Meter, normalizeMeterSearchItem } from 'model/meter';
import { ExportReportRequest, ReportCatalog, ReportCode, ReportPeriodMode } from 'model/report';
import { useCallback, useEffect, useMemo, useState } from 'react';
import customerServices from 'services/customer-services';
import meterServices from 'services/meter-services';
import reportServices from 'services/report-services';

const DEFAULT_CATALOG: ReportCatalog = {
  reportTypes: [
    {
      code: 'SALES',
      name: 'Báo cáo tình hình bán điện',
      filters: []
    },
    {
      code: 'PURCHASE',
      name: 'Báo cáo tình hình mua điện',
      filters: ['feederCode']
    },
    {
      code: 'PURCHASE_SALES',
      name: 'Báo cáo tình hình mua bán điện',
      filters: ['feederCode']
    },
    {
      code: 'CUSTOMER_CONSUMPTION',
      name: 'Báo cáo tình hình tiêu thụ điện của khách hàng',
      filters: ['customerCode']
    }
  ],
  periodModes: [
    { code: 'THANG_NAY', name: 'Tháng này', isDefault: true },
    { code: 'THANG_TRUOC', name: 'Tháng trước' },
    { code: 'QUY_NAY', name: 'Quý này' },
    { code: 'NAM_NAY', name: 'Năm nay' },
    { code: 'TUY_CHON', name: 'Tùy chọn' }
  ]
};

const getErrorMessage = (error: any, fallback: string) =>
  error?.businessErrorMessage ||
  error?.systemErrorMessage ||
  error?.detailMessage ||
  error?.message ||
  fallback;

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const ReportScreen = () => {
  const [catalog, setCatalog] = useState<ReportCatalog>(DEFAULT_CATALOG);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [feeders, setFeeders] = useState<Meter[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingFeeders, setLoadingFeeders] = useState(false);
  const [reportCode, setReportCode] = useState<ReportCode | ''>('');
  const [periodMode, setPeriodMode] = useState<ReportPeriodMode>('THANG_NAY');
  const [fromDate, setFromDate] = useState(dayjs().startOf('month'));
  const [toDate, setToDate] = useState(dayjs().endOf('month'));
  const [customerCode, setCustomerCode] = useState('');
  const [feederCode, setFeederCode] = useState('');
  const [validationError, setValidationError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadCatalog = async () => {
      const response = await reportServices.getCatalog();
      if (response?.data?.reportTypes?.length && response?.data?.periodModes?.length) {
        setCatalog(response.data);
      }
    };
    loadCatalog();
  }, []);

  useEffect(() => {
    const loadCustomers = async () => {
      setLoadingCustomers(true);
      const response = await customerServices.getCustomerList();
      setLoadingCustomers(false);
      setCustomers(Array.isArray(response?.data) ? response.data : []);
    };
    loadCustomers();
  }, []);

  useEffect(() => {
    const loadFeeders = async () => {
      setLoadingFeeders(true);
      const response = await meterServices.getMeterSearchList({
        page: 0,
        size: 100,
        meterType: 'FEEDER'
      });
      setLoadingFeeders(false);
      setFeeders(
        (response?.data?.items || [])
          .map(normalizeMeterSearchItem)
          .filter((meter): meter is Meter => Boolean(meter?.meterCode))
      );
    };
    loadFeeders();
  }, []);

  const selectedReport = useMemo(
    () => catalog.reportTypes.find((report) => report.code === reportCode),
    [catalog.reportTypes, reportCode]
  );
  const reportOptions = useMemo<AppSelectOption[]>(
    () => catalog.reportTypes.map((report) => ({ value: report.code, label: report.name })),
    [catalog.reportTypes]
  );
  const periodOptions = useMemo<AppSelectOption[]>(
    () => catalog.periodModes.map((item) => ({ value: item.code, label: item.name })),
    [catalog.periodModes]
  );
  const customerOptions = useMemo<AppSelectOption[]>(
    () =>
      customers
        .filter((customer) => Boolean(customer.customerCode))
        .map((customer) => ({
          value: customer.customerCode || '',
          label: [customer.customerCode, customer.fullName].filter(Boolean).join(' - ')
        })),
    [customers]
  );
  const feederOptions = useMemo<AppSelectOption[]>(
    () =>
      feeders.map((meter) => ({
        value: meter.meterCode,
        label: [meter.meterCode, meter.customerName].filter(Boolean).join(' - ')
      })),
    [feeders]
  );

  const changeReport = useCallback((code: ReportCode) => {
    setReportCode(code);
    setCustomerCode('');
    setFeederCode('');
    setValidationError('');
  }, []);

  const exportFile = useCallback(async () => {
    if (!reportCode) {
      setValidationError('Vui lòng chọn loại báo cáo');
      return;
    }
    if (periodMode === 'TUY_CHON' && (!fromDate || !toDate)) {
      setValidationError('Vui lòng chọn từ ngày và đến ngày');
      return;
    }
    if (periodMode === 'TUY_CHON' && fromDate.isAfter(toDate, 'day')) {
      setValidationError('Từ ngày không được lớn hơn đến ngày');
      return;
    }
    if (selectedReport?.filters.includes('feederCode') && !feederCode.trim()) {
      setValidationError('Vui lòng chọn mã lộ');
      return;
    }
    setValidationError('');
    const request: ExportReportRequest = {
      reportType: reportCode,
      periodMode,
      fromDate: fromDate.format('DD-MM-YYYY'),
      toDate: toDate.format('DD-MM-YYYY'),
      customerCode: customerCode.trim() || undefined,
      feederCode: feederCode.trim() || undefined
    };
    setExporting(true);
    const response = await reportServices.exportReport(request);
    setExporting(false);
    if (!response?.data || !(response.data instanceof Blob)) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getErrorMessage(response, 'Không thể xuất báo cáo')
      });
      return;
    }
    downloadBlob(response.data, response.fileName || 'bao-cao.xlsx');
    showToast({ type: TYPE_TOAST.SUCCESS, content: 'Xuất báo cáo thành công' });
  }, [customerCode, feederCode, fromDate, periodMode, reportCode, selectedReport, toDate]);

  const showCustomerFilter = selectedReport?.filters.includes('customerCode');
  const showFeederFilter = selectedReport?.filters.includes('feederCode');

  return (
    <PageWithBreadcrumb
      breadcrumbList={[{ title: 'Trang chủ' }, { title: 'Báo cáo' }, { title: 'Xuất báo cáo' }]}
    >
      <section>
        <TextBase classNames="title4" text="Xuất báo cáo" />
        <div className="mt-16 rounded-radius-l border border-color-300 bg-color-50 p-16">
          <TextBase classNames="body3 font-semibold" text="1. Chọn báo cáo" />
          <div className="mt-16 grid grid-cols-6 gap-x-16 gap-y-12 tablet:grid-cols-2 mobile:grid-cols-1">
            <AppSelect
              name="reportCode"
              label="Loại báo cáo"
              labelSuffix={<span className="text-error-600">*</span>}
              placeholder="Chọn loại báo cáo"
              options={reportOptions}
              value={reportCode}
              wrapperClassName="col-span-3 tablet:col-span-1 mobile:col-span-1"
              onSelectOption={({ key }) => changeReport(String(key) as ReportCode)}
            />
            <AppSelect
              name="periodMode"
              label="Kỳ báo cáo"
              labelSuffix={<span className="text-error-600">*</span>}
              options={periodOptions}
              value={periodMode}
              wrapperClassName="col-span-3 tablet:col-span-1 mobile:col-span-1"
              onSelectOption={({ key }) => setPeriodMode(String(key) as ReportPeriodMode)}
            />
            <AppDatePicker
              name="fromDate"
              label="Từ ngày"
              labelSuffix={
                periodMode === 'TUY_CHON' ? <span className="text-error-600">*</span> : undefined
              }
              wrapperClassName="col-span-3 !w-full tablet:col-span-1 mobile:col-span-1"
              datePickerClassName="w-full"
              format="DD/MM/YYYY"
              value={fromDate}
              onChange={(value) => value && setFromDate(value)}
            />
            <AppDatePicker
              name="toDate"
              label="Đến ngày"
              labelSuffix={
                periodMode === 'TUY_CHON' ? <span className="text-error-600">*</span> : undefined
              }
              wrapperClassName="col-span-3 !w-full tablet:col-span-1 mobile:col-span-1"
              datePickerClassName="w-full"
              format="DD/MM/YYYY"
              value={toDate}
              onChange={(value) => value && setToDate(value)}
            />
            {showCustomerFilter && (
              <AppSelect
                name="customerCode"
                label="Mã khách hàng"
                placeholder="Chọn khách hàng"
                options={customerOptions}
                value={customerCode}
                disabled={loadingCustomers}
                onSelectOption={({ key }) => setCustomerCode(String(key))}
                wrapperClassName="col-span-2 tablet:col-span-1 mobile:col-span-1"
              />
            )}
            {showFeederFilter && (
              <AppSelect
                name="feederCode"
                label="Mã lộ"
                labelSuffix={<span className="text-error-600">*</span>}
                placeholder="Chọn mã lộ"
                options={feederOptions}
                value={feederCode}
                disabled={loadingFeeders}
                onSelectOption={({ key }) => setFeederCode(String(key))}
                wrapperClassName="col-span-2 tablet:col-span-1 mobile:col-span-1"
              />
            )}
          </div>
          {validationError && (
            <TextBase classNames="mt-8 body3 !text-error-600" text={validationError} />
          )}
        </div>
        <div className="mt-16 flex justify-end">
          <ButtonBase
            type="primary"
            disabled={exporting}
            onClick={exportFile}
            customContent={
              <>
                <UploadOutlined className="mr-8" />
                {exporting ? 'Đang xuất...' : 'Xuất báo cáo'}
              </>
            }
          />
        </div>
      </section>
    </PageWithBreadcrumb>
  );
};

export default ReportScreen;
