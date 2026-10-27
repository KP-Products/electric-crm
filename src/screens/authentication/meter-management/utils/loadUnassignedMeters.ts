import type { ApiResponse } from 'model/common';
import { GetListMeterRes, Meter, normalizeMeterSearchItem } from 'model/meter';
import { isUnassignedMeter } from './constant';

/** Search has no "without parent" filter, so scan its pages only when the group opens. */
export const loadUnassignedMeters = async (
  searchPage: (page: number) => Promise<ApiResponse<GetListMeterRes>>,
  isCurrent: () => boolean
): Promise<Meter[] | undefined> => {
  const rows: Meter[] = [];
  let page = 1;
  let fetchedCount = 0;

  while (isCurrent()) {
    const response = await searchPage(page);
    if (!isCurrent()) return;
    if (!response?.data) throw response;

    const items = response.data.items || [];
    const meters = items.map(normalizeMeterSearchItem).filter(Boolean) as Meter[];
    rows.push(...meters.filter(isUnassignedMeter));
    fetchedCount += items.length;
    if (fetchedCount >= response.data.total) return rows;
    if (!items.length) {
      throw new Error('Không tải được đầy đủ danh sách công tơ không thuộc lộ');
    }
    page += 1;
  }
};
