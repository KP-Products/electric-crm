'use client';

import { useSearchParams } from 'next/navigation';
import ManualMeterReadingScreen from 'screens/authentication/manual-meter-reading';

const EvnReadingInputScreen = () => {
  const searchParams = useSearchParams();

  return <ManualMeterReadingScreen scope="feeder" feederId={searchParams.get('feederId') || ''} />;
};

export default EvnReadingInputScreen;
