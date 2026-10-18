import { CONSTANTS, DEFAULT_PAGE_SIZE } from '@constant';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import CustomDropSearchMore from 'components/select/CustomDropSearchMore';
import { ErrorBase } from 'model/common';
import { Meter, normalizeMeterSearchItem } from 'model/meter';
import { debounce } from 'lodash';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import meterServices from 'services/meter-services';
import {
  buildMeterLabelMap,
  buildMeterOptions,
  displayText,
  getContractErrorMessage,
  getMeterValue
} from '../utils';

const METER_DETAIL_CHUNK_SIZE = 5;

interface UseMeterLookupProps {
  autoLoad?: boolean;
  pinnedIds?: Array<string | undefined>;
  showErrorToast?: boolean;
  meterType?: string | string[];
}

const mergeByMeterValue = (meters: Meter[]) => {
  const meterMap = new Map<string, Meter>();
  meters.forEach((meter) => {
    const value = getMeterValue(meter);
    if (value) meterMap.set(value, meter);
  });
  return Array.from(meterMap.values());
};

export default function useMeterLookup({
  autoLoad = true,
  pinnedIds = [],
  showErrorToast = false,
  meterType
}: UseMeterLookupProps = {}) {
  const meterTypeKey = Array.isArray(meterType) ? meterType.join('|') : meterType || '';
  const [dropdownMeters, setDropdownMeters] = useState<Meter[]>([]);
  const [meterMap, setMeterMap] = useState<Record<string, Meter>>({});
  const [meterLoading, setMeterLoading] = useState<boolean>(false);
  const [meterSearch, setMeterSearch] = useState<string>('');
  const meterMapRef = useRef<Record<string, Meter>>({});
  const mountedRef = useRef<boolean>(true);
  const searchRequestIdRef = useRef<number>(0);

  const pinnedIdsKey = pinnedIds.filter(Boolean).join('|');
  const normalizedPinnedIds = useMemo(
    () => Array.from(new Set(pinnedIdsKey.split('|').filter(Boolean))),
    [pinnedIdsKey]
  );

  const mergeMeters = useCallback((meters: Meter[]) => {
    const validMeters = meters.filter((meter) => Boolean(getMeterValue(meter)));
    if (!validMeters.length) return;

    setMeterMap((prev) => {
      const next = { ...prev };
      let changed = false;

      validMeters.forEach((meter) => {
        const value = getMeterValue(meter);
        if (value && next[value] !== meter) {
          next[value] = meter;
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, []);

  useEffect(() => {
    meterMapRef.current = meterMap;
  }, [meterMap]);

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    []
  );

  const searchMeters = useCallback(
    async (search = '') => {
      const normalizedSearch = search.trim();
      const requestId = searchRequestIdRef.current + 1;
      searchRequestIdRef.current = requestId;
      setMeterLoading(true);

      const responses = await Promise.all(
        (meterTypeKey ? meterTypeKey.split('|') : [undefined]).map((type) =>
          meterServices.getMeterSearchList({
            page: 0,
            size: DEFAULT_PAGE_SIZE,
            meterCodeContains: normalizedSearch || undefined,
            filter: normalizedSearch || undefined,
            meterType: type
          })
        )
      );
      const response = responses.find((item) => !item?.data) || responses[0];

      if (!mountedRef.current || requestId !== searchRequestIdRef.current) return;
      setMeterLoading(false);

      if (!response || !response.data) {
        setDropdownMeters([]);
        if (showErrorToast) {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getContractErrorMessage(
              response as ErrorBase,
              'Tải danh sách công tơ thất bại'
            )
          });
        }
        return;
      }

      const meters = mergeByMeterValue(
        responses
          .flatMap((item) => item.data?.items || [])
          .map(normalizeMeterSearchItem)
          .filter(Boolean) as Meter[]
      );
      setDropdownMeters(meters);
      mergeMeters(meters);
    },
    [mergeMeters, meterTypeKey, showErrorToast]
  );

  const debouncedSearchMeters = useMemo(
    () => debounce(searchMeters, CONSTANTS.TIME_DEBOUNCE),
    [searchMeters]
  );

  useEffect(
    () => () => {
      debouncedSearchMeters.cancel();
    },
    [debouncedSearchMeters]
  );

  const onSearchMeters = useCallback(
    (search: string) => {
      setMeterSearch(search);
      debouncedSearchMeters(search);
    },
    [debouncedSearchMeters]
  );

  const ensureMeters = useCallback(
    async (ids: Array<string | undefined>) => {
      const missingIds = Array.from(new Set(ids.filter(Boolean) as string[])).filter(
        (id) => !meterMapRef.current[id]
      );
      if (!missingIds.length) return;

      const loadedMeters: Meter[] = [];
      for (let index = 0; index < missingIds.length; index += METER_DETAIL_CHUNK_SIZE) {
        const idChunk = missingIds.slice(index, index + METER_DETAIL_CHUNK_SIZE);
        const responses = await Promise.all(
          idChunk.map((id) => meterServices.getMeterDetail({ meterId: id }))
        );
        if (!mountedRef.current) return;

        responses.forEach((response) => {
          const meter = normalizeMeterSearchItem(response?.data);
          if (meter && getMeterValue(meter)) loadedMeters.push(meter);
        });
      }

      mergeMeters(loadedMeters);
    },
    [mergeMeters]
  );

  useEffect(() => {
    if (autoLoad) searchMeters();
  }, [autoLoad, searchMeters]);

  useEffect(() => {
    ensureMeters(normalizedPinnedIds);
  }, [ensureMeters, normalizedPinnedIds]);

  const meterLabelMap = useMemo(() => buildMeterLabelMap(Object.values(meterMap)), [meterMap]);

  const meterOptions = useMemo(() => {
    const optionMap = new Map<string, Meter>();

    dropdownMeters.forEach((meter) => {
      const value = getMeterValue(meter);
      if (value) optionMap.set(value, meter);
    });
    normalizedPinnedIds.forEach((id) => {
      const meter = meterMap[id];
      if (meter) optionMap.set(id, meter);
    });

    return buildMeterOptions(Array.from(optionMap.values()));
  }, [dropdownMeters, meterMap, normalizedPinnedIds]);

  const getMeterDisplay = useCallback(
    (meterId?: string) => (meterId ? meterLabelMap[meterId] || meterId : displayText()),
    [meterLabelMap]
  );
  const getMeterById = useCallback(
    (meterId?: string) => (meterId ? meterMap[meterId] : undefined),
    [meterMap]
  );

  const onOpenMeterDropdown = useCallback(
    (open?: boolean) => {
      if (open && !dropdownMeters.length && !meterLoading) {
        searchMeters(meterSearch);
      }
    },
    [dropdownMeters.length, meterLoading, meterSearch, searchMeters]
  );

  const meterDropdownRender = useCallback(
    (menuInstance: ReactNode) => (
      <CustomDropSearchMore
        menuInstance={menuInstance}
        searchValue={meterSearch}
        onChangeSearch={onSearchMeters}
        onMore={() => {}}
        totalList={meterOptions.length}
        total={meterOptions.length}
        loading={meterLoading}
      />
    ),
    [meterLoading, meterOptions.length, meterSearch, onSearchMeters]
  );

  return {
    meterOptions,
    meterLoading,
    getMeterDisplay,
    getMeterById,
    ensureMeters,
    onOpenMeterDropdown,
    meterDropdownRender
  };
}
