'use client';

import { useSearchParams } from 'next/navigation';
import ManualMeterReadingScreen from 'screens/authentication/manual-meter-reading';

/** Nhập chỉ số theo lộ: mở từ danh sách lô (kèm lô + kỳ) hoặc từ menu (tự chọn lộ, kỳ). */
const EvnReadingInputScreen = () => {
  const searchParams = useSearchParams();
  const param = (key: string) => searchParams.get(key) || undefined;

  return (
    <ManualMeterReadingScreen
      scope="feeder"
      feederId={param('feederId') || ''}
      batchPeriod={{
        periodCode: param('periodCode'),
        periodNo: param('periodNo'),
        periodFrom: param('periodFrom'),
        periodTo: param('periodTo'),
        readingDate: param('readingDate')
      }}
    />
  );
};

export default EvnReadingInputScreen;
