import { createDeepEqualSelector } from '@redux-common';
import { initialElectricTariff } from '@redux-slice/electric-tariff';
import { RootState } from '@store/all-reducers';

const selectDomain = (state: RootState) => state?.electricTariff || initialElectricTariff;

export const selectElectricTariffList = createDeepEqualSelector(
  selectDomain,
  (state) => state.tariffList
);

export const selectElectricTariffTotal = createDeepEqualSelector(
  selectDomain,
  (state) => state.total
);

export const selectElectricTariffLoadingList = createDeepEqualSelector(
  selectDomain,
  (state) => state.loadingList
);

export const selectElectricTariffLoadingDetail = createDeepEqualSelector(
  selectDomain,
  (state) => state.loadingDetail
);
