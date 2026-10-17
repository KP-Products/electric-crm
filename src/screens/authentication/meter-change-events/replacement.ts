import { MeterChangeDetailInput } from 'model/meter-change-event';

export interface ReplacementMeter {
  value: string;
  meterCode?: string;
  source: 'METER' | 'MEASURING_DEVICE';
}

// The replacement API identifies meters by meterCode, not their database UUID.
export const buildReplacementDetails = (
  details: MeterChangeDetailInput[],
  devices: ReplacementMeter[]
): MeterChangeDetailInput[] => {
  const used = new Set<string>();
  return details.map((detail, index) => {
    const findMeter = (id?: string) =>
      devices.find(
        (device) => device.source === 'METER' && (device.value === id || device.meterCode === id)
      );
    const oldCode = findMeter(detail.oldDeviceId)?.meterCode;
    const newCode = findMeter(detail.newDeviceId)?.meterCode;
    if (!oldCode || !newCode) {
      throw new Error(`Dòng ${index + 1}: vui lòng chọn công tơ cũ và công tơ mới hợp lệ`);
    }
    if (oldCode === newCode || used.has(oldCode) || used.has(newCode)) {
      throw new Error(
        `Dòng ${index + 1}: công tơ cũ/mới không được trùng nhau hoặc trùng dòng khác`
      );
    }
    used.add(oldCode);
    used.add(newCode);
    return { ...detail, oldDeviceId: oldCode, newDeviceId: newCode };
  });
};
