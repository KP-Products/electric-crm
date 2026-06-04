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
  createdAt?: string;
  updatedAt?: string;
}

export interface ElectricTariffTouPrice {
  id: number;
  tariffId: number;
  tou?: string;
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

export interface SearchTariffsRes extends ResultBase<PaginationRes<ElectricTariff>> {}

export interface GetTariffDetailReq {
  id: number;
}

export interface TariffDetail {
  tariff?: ElectricTariff;
  touPrices?: ElectricTariffTouPrice[];
}

export interface GetTariffDetailRes extends ResultBase<TariffDetail> {}

export interface CreateTariffReq {
  tariffCode: string;
  tariffName: string;
  customerType: string;
  voltageLevel: string;
  effectiveFrom: string;
  effectiveTo?: string;
  status?: string;
}

export interface CreateTariffRes extends ResultBase<ElectricTariff> {}

export interface ListTouPricesReq {
  tariffId: number;
}

export interface ListTouPricesRes extends ResultBase<ElectricTariffTouPrice[]> {}

export interface CreateTouPriceReq {
  tariffId: number;
  tou: string;
  unitPrice: number;
  voltageLevel?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface CreateTouPriceRes extends ResultBase<ElectricTariffTouPrice> {}
