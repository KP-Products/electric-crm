import { PaginationReq, PaginationRes, ResultBase } from './common';

export interface MeterChangeDetailInput {
  oldDeviceId?: string;
  newDeviceId?: string;
  removeReading?: number;
  installReading?: number;
  multiplier?: number;
  note?: string;
}

export interface MeterChangeDetail extends MeterChangeDetailInput {
  id?: number;
  eventId?: number;
}

export interface MeterChangeEvent {
  id: number;
  eventNo?: string;
  eventType?: string;
  customerId?: number;
  eventDate?: string;
  reason?: string;
  status?: string;
  performedBy?: string;
  updatedBy?: string;
  approvedBy?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
  approvedAt?: string;
}

export interface MeterChangeEventWithDetails {
  event?: MeterChangeEvent;
  details?: MeterChangeDetail[];
}

export interface SearchMeterChangeEventsReq extends PaginationReq {
  eventNo?: string;
  eventType?: string;
  customerId?: number;
  status?: string;
}

export interface CreateMeterChangeEventReq {
  eventNo: string;
  eventType: string;
  customerId?: number;
  eventDate: string;
  reason?: string;
  status?: string;
  note?: string;
  details?: MeterChangeDetailInput[];
}

export interface UpdateMeterChangeEventReq {
  id: number;
  eventType?: string;
  customerId?: number;
  eventDate?: string;
  reason?: string;
  status?: string;
  note?: string;
  details?: MeterChangeDetailInput[];
}

export interface MeterChangeEventIdReq {
  id: number;
}

export interface SearchMeterChangeEventsRes
  extends ResultBase<PaginationRes<MeterChangeEventWithDetails>> {}

export interface MeterChangeEventRes extends ResultBase<MeterChangeEventWithDetails> {}

export interface DeleteMeterChangeEventRes extends ResultBase<void> {}
