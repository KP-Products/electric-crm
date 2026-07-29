import { PaginationReq, PaginationRes, ResultBase } from './common';

export interface MeasuringDevice {
  id?: string | number;
  deviceId?: string | number;
  deviceCode?: string;
  code?: string;
  deviceName?: string;
  name?: string;
  serialNumber?: string;
}

export interface SearchMeasuringDevicesReq extends PaginationReq {
  filter?: string;
}

export interface SearchMeasuringDevicesRes extends ResultBase<PaginationRes<MeasuringDevice>> {}
