import { PaginationReq, PaginationRes, ResultBase } from './common';

export interface ElectricTariff {
  id: number;
  tariffCode?: string;
  tariffName?: string;
  customerType?: string;
  voltageLevel?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  status?: string;
  priceType?: string;
  createdAt?: string;
  updatedAt?: string;
  filePath?: string;
  fileName?: string;
}

export interface ElectricTariffTouPrice {
  id: number;
  tariffId?: number;
  tou?: string;
  touName?: string;
  unitPrice?: number;
  voltageLevel?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  createdAt?: string;
}

export interface SearchTariffsReq extends PaginationReq {
  tariffCode?: string;
  tariffName?: string;
  customerType?: string;
  voltageLevel?: string;
  status?: string;
}

export interface GetTariffDetailReq {
  id: number;
}

export interface TariffDetail {
  tariff?: ElectricTariff;
  voltageLabel?: string;
  prices?: ElectricTariffTouPrice[];
  touPrices?: ElectricTariffTouPrice[];
}

export interface SearchTariffsRes extends ResultBase<PaginationRes<TariffDetail>> {}

export interface GetTariffDetailRes extends ResultBase<TariffDetail> {}

export interface TariffPriceInput {
  tou: string;
  unitPrice: number;
}

export interface CreateTariffReq {
  tariffCode: string;
  tariffName: string;
  customerType: string;
  voltageLevel: string;
  effectiveFrom: string;
  effectiveTo?: string;
  status?: string;
  priceType?: string;
  prices?: TariffPriceInput[];
}

export interface CreateTariffRes extends ResultBase<ElectricTariff> {}

export interface UpdateTariffReq {
  id: number;
  tariffCode?: string;
  tariffName?: string;
  customerType?: string;
  voltageLevel?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  status?: string;
  priceType?: string;
  prices?: TariffPriceInput[];
}

export interface UpdateTariffRes extends ResultBase<ElectricTariff> {}
