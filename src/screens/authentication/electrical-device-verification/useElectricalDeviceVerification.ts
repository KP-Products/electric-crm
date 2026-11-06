import { DEFAULT_PAGE_SIZE, K_SIZE_1 } from '@constant';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ErrorBase } from 'model/common';
import { InspectionLocation, MasterDevice } from 'model/electrical-device';
import { useCallback, useEffect, useMemo, useState } from 'react';
import electricalDeviceServices from 'services/electrical-device-services';
import {
  buildLocationSearchBody,
  DEFAULT_FILTER,
  ElectricalDeviceVerificationFilter,
  getElectricalDeviceError
} from './utils';

export default function useElectricalDeviceVerification() {
  const [draft, setDraft] = useState(DEFAULT_FILTER);
  const [applied, setApplied] = useState(DEFAULT_FILTER);
  const [locations, setLocations] = useState<InspectionLocation[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<MasterDevice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(K_SIZE_1);
  const [loading, setLoading] = useState(false);

  const fetchLocations = useCallback(
    async (nextPage: number, filter: ElectricalDeviceVerificationFilter) => {
      setLoading(true);
      const response = await electricalDeviceServices.searchInspectionLocations(
        buildLocationSearchBody(filter, nextPage)
      );
      setLoading(false);
      if (!response?.data) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getElectricalDeviceError(
            response as ErrorBase,
            'Tải danh sách kiểm định thất bại'
          )
        });
        setLocations([]);
        setTotal(0);
        return;
      }
      setLocations(response.data.items || []);
      setTotal(response.data.total || 0);
    },
    []
  );

  useEffect(() => {
    void fetchLocations(page, applied);
  }, [applied, fetchLocations, page]);

  useEffect(() => {
    let active = true;
    const loadDeviceTypes = async () => {
      const response = await electricalDeviceServices.searchMasterDevices({
        page: 0,
        size: DEFAULT_PAGE_SIZE,
        status: 'ACTIVE'
      });
      if (active && response?.data) setDeviceTypes(response.data.items || []);
    };
    void loadDeviceTypes();
    return () => {
      active = false;
    };
  }, []);

  const deviceTypeLabels = useMemo(
    () => Object.fromEntries(deviceTypes.map((item) => [item.id, item.deviceName || item.id])),
    [deviceTypes]
  );

  const updateFilter = useCallback(
    <K extends keyof ElectricalDeviceVerificationFilter>(
      key: K,
      value: ElectricalDeviceVerificationFilter[K]
    ) => setDraft((current) => ({ ...current, [key]: value })),
    []
  );

  const applyFilter = useCallback(() => {
    setApplied(draft);
    setPage(K_SIZE_1);
  }, [draft]);

  const resetFilter = useCallback(() => {
    setDraft(DEFAULT_FILTER);
    setApplied(DEFAULT_FILTER);
    setPage(K_SIZE_1);
  }, []);

  const pagination = useMemo(
    () => ({
      current: page,
      total,
      pageSize: DEFAULT_PAGE_SIZE,
      onChange: setPage,
      showSizeChanger: false
    }),
    [page, total]
  );

  return {
    draft,
    locations,
    deviceTypes,
    deviceTypeLabels,
    total,
    page,
    loading,
    pagination,
    updateFilter,
    applyFilter,
    resetFilter,
    refresh: () => fetchLocations(page, applied)
  };
}
