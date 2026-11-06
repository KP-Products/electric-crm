import { PaginationReq, PaginationRes, ResultBase } from './common';

export type ElectricalDeviceVerificationStatus = 'OVERDUE' | 'DUE_SOON' | 'VALID' | string;

export interface ElectricalDevice {
  id: string;
  deviceCode?: string;
  deviceName?: string;
  deviceTypeName?: string;
  deviceType?: string;
  serialNumber?: string;
  manufacturer?: string;
  supplier?: string;
  locationId?: number;
  status?: string;
  notes?: string;
  inspectionCycleMonths?: number;
  nextVerificationDate?: string;
  daysUntilVerification?: number;
  verificationStatus?: ElectricalDeviceVerificationStatus;
}

export interface ElectricalDeviceSearchReq extends PaginationReq {
  deviceCode?: string;
  deviceName?: string;
  deviceType?: string;
  serialNumber?: string;
  manufacturer?: string;
  supplier?: string;
  locationId?: number;
  status?: string;
}

export interface ElectricalDeviceSearchRes extends ResultBase<PaginationRes<ElectricalDevice>> {}
export interface ElectricalDeviceRes extends ResultBase<ElectricalDevice> {}

export interface ElectricalDeviceIdReq {
  id: string;
}

export interface UpdateElectricalDeviceReq extends ElectricalDeviceIdReq {
  deviceCode?: string;
  deviceName?: string;
  deviceType?: string;
  serialNumber?: string;
  manufacturer?: string;
  supplier?: string;
  locationId?: number;
  status?: string;
  notes?: string;
}

export interface CreateElectricalDeviceReq {
  deviceCode?: string;
  deviceName?: string;
  deviceType: string;
  serialNumber?: string;
  manufacturer?: string;
  supplier?: string;
  locationId?: number;
  status?: string;
  notes?: string;
  verificationDate?: string;
  certificateNo?: string;
  resultStatus?: string;
  nextVerificationDate?: string;
  verificationNotes?: string;
  file?: File;
}

export interface InspectionLocation {
  id: number;
  locationName?: string;
  locationType?: string;
  description?: string;
  status?: string;
  electricalDevices?: ElectricalDevice[];
}

export interface SearchInspectionLocationsReq extends PaginationReq {
  id?: number;
  locationName?: string;
  locationType?: string;
  status?: string;
  deviceType?: string;
  verificationDateFrom?: string;
  verificationDateTo?: string;
  nextVerificationDateFrom?: string;
  nextVerificationDateTo?: string;
  verificationStatus?: ElectricalDeviceVerificationStatus;
}

export interface SearchInspectionLocationsRes
  extends ResultBase<PaginationRes<InspectionLocation>> {}
export interface InspectionLocationRes extends ResultBase<InspectionLocation> {}
export interface InspectionLocationIdReq {
  id: number;
}
export interface CreateInspectionLocationReq {
  locationName: string;
  locationType: string;
  description?: string;
  status?: string;
}
export interface UpdateInspectionLocationReq extends InspectionLocationIdReq {
  locationName?: string;
  locationType?: string;
  description?: string;
  status?: string;
}

export interface MasterDevice {
  id: string;
  deviceName?: string;
  hasVerification?: boolean | string;
  hasverification?: boolean | string;
  inspectionCycleMonths?: number;
  status?: string;
}
export interface MasterDeviceSearchReq extends PaginationReq {
  id?: string;
  deviceName?: string;
  hasverification?: string;
  status?: string;
}
export interface MasterDeviceSearchRes extends ResultBase<PaginationRes<MasterDevice>> {}
export interface MasterDeviceRes extends ResultBase<MasterDevice> {}
export interface MasterDeviceIdReq {
  id: string;
}
export interface CreateMasterDeviceReq {
  deviceName: string;
  hasverification: string;
  inspectionCycleMonths: number;
  status: string;
}
export interface UpdateMasterDeviceReq extends MasterDeviceIdReq {
  deviceName?: string;
  hasverification?: string;
  inspectionCycleMonths?: number;
  status?: string;
}
