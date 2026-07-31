import { PaginationReq, PaginationRes, ResultBase } from './common';

export interface MeasuringDevice {
  id: number;
  /** Legacy aliases retained for the meter-change-event selector. */
  deviceId?: string | number;
  deviceCode: string;
  code?: string;
  deviceName?: string;
  name?: string;
  serialNumber?: string;
  deviceType?: 'TU' | 'TI';
  manufacturer?: string;
  model?: string;
  ratio?: string;
  accuracyClass?: string;
  purchaseDate?: string;
  installedDate?: string;
  inspectionDate?: string;
  inspectionDueDate?: string;
  status?: string;
  note?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface SearchMeasuringDevicesReq extends PaginationReq {
  deviceCode?: string;
  serialNumber?: string;
  deviceType?: 'TU' | 'TI';
  status?: string;
}

export interface SearchMeasuringDevicesRes extends ResultBase<PaginationRes<MeasuringDevice>> {}

export interface MeasuringDeviceIdReq {
  id: number;
}

export interface CreateMeasuringDeviceReq {
  deviceCode: string;
  serialNumber?: string;
  deviceType?: 'TU' | 'TI';
  manufacturer?: string;
  model?: string;
  ratio: string;
  accuracyClass?: string;
  purchaseDate?: string;
  installedDate?: string;
  inspectionDate?: string;
  inspectionDueDate?: string;
  status?: string;
  note?: string;
}

export interface UpdateMeasuringDeviceReq extends Partial<CreateMeasuringDeviceReq> {
  id: number;
}

export interface MeasuringDeviceRes extends ResultBase<MeasuringDevice> {}
export interface DeleteMeasuringDeviceRes extends ResultBase<void> {}
