import { CONSTANTS, DEFAULT_PAGE_SIZE } from '@constant';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import CustomDropSearchMore from 'components/select/CustomDropSearchMore';
import { ErrorBase } from 'model/common';
import { OperationUnit } from 'model/operation-unit';
import { debounce } from 'lodash';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import operationUnitServices from 'services/operation-unit-services';
import {
  buildOperationUnitLabelMap,
  buildOperationUnitOptions,
  displayText,
  getOperationContractErrorMessage
} from '../utils';

const OPERATION_UNIT_DETAIL_CHUNK_SIZE = 5;

interface UseOperationUnitLookupProps {
  autoLoad?: boolean;
  pinnedIds?: Array<string | undefined>;
  showErrorToast?: boolean;
}

export default function useOperationUnitLookup({
  autoLoad = true,
  pinnedIds = [],
  showErrorToast = false
}: UseOperationUnitLookupProps = {}) {
  const [dropdownOperationUnits, setDropdownOperationUnits] = useState<OperationUnit[]>([]);
  const [operationUnitMap, setOperationUnitMap] = useState<Record<string, OperationUnit>>({});
  const [operationUnitLoading, setOperationUnitLoading] = useState<boolean>(false);
  const [operationUnitSearch, setOperationUnitSearch] = useState<string>('');
  const operationUnitMapRef = useRef<Record<string, OperationUnit>>({});
  const mountedRef = useRef<boolean>(true);
  const searchRequestIdRef = useRef<number>(0);

  const pinnedIdsKey = pinnedIds.filter(Boolean).join('|');
  const normalizedPinnedIds = useMemo(
    () => Array.from(new Set(pinnedIdsKey.split('|').filter(Boolean))),
    [pinnedIdsKey]
  );

  const mergeOperationUnits = useCallback((operationUnits: OperationUnit[]) => {
    const validOperationUnits = operationUnits.filter((operationUnit) =>
      Boolean(operationUnit.operationUnitId)
    );
    if (!validOperationUnits.length) return;

    setOperationUnitMap((prev) => {
      const next = { ...prev };
      let changed = false;

      validOperationUnits.forEach((operationUnit) => {
        if (next[operationUnit.operationUnitId] !== operationUnit) {
          next[operationUnit.operationUnitId] = operationUnit;
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, []);

  useEffect(() => {
    operationUnitMapRef.current = operationUnitMap;
  }, [operationUnitMap]);

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    []
  );

  const searchOperationUnits = useCallback(
    async (search = '') => {
      const normalizedSearch = search.trim();
      const requestId = searchRequestIdRef.current + 1;
      searchRequestIdRef.current = requestId;
      setOperationUnitLoading(true);
      const response = await operationUnitServices.searchOperationUnits({
        page: 0,
        size: DEFAULT_PAGE_SIZE,
        unitName: normalizedSearch || undefined
      });
      if (!mountedRef.current || requestId !== searchRequestIdRef.current) return;
      setOperationUnitLoading(false);

      if (!response || !response.data) {
        setDropdownOperationUnits([]);
        if (showErrorToast) {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getOperationContractErrorMessage(
              response as ErrorBase,
              'Tải danh sách đơn vị vận hành thất bại'
            )
          });
        }
        return;
      }

      const operationUnits = Array.isArray(response.data.items) ? response.data.items : [];
      setDropdownOperationUnits(operationUnits);
      mergeOperationUnits(operationUnits);
    },
    [mergeOperationUnits, showErrorToast]
  );

  const debouncedSearchOperationUnits = useMemo(
    () => debounce(searchOperationUnits, CONSTANTS.TIME_DEBOUNCE),
    [searchOperationUnits]
  );

  useEffect(
    () => () => {
      debouncedSearchOperationUnits.cancel();
    },
    [debouncedSearchOperationUnits]
  );

  const onSearchOperationUnits = useCallback(
    (search: string) => {
      setOperationUnitSearch(search);
      debouncedSearchOperationUnits(search);
    },
    [debouncedSearchOperationUnits]
  );

  const ensureOperationUnits = useCallback(
    async (ids: Array<string | undefined>) => {
      const missingIds = Array.from(new Set(ids.filter(Boolean) as string[])).filter(
        (id) => !operationUnitMapRef.current[id]
      );
      if (!missingIds.length) return;

      const loadedOperationUnits: OperationUnit[] = [];
      for (let index = 0; index < missingIds.length; index += OPERATION_UNIT_DETAIL_CHUNK_SIZE) {
        const idChunk = missingIds.slice(index, index + OPERATION_UNIT_DETAIL_CHUNK_SIZE);
        const responses = await Promise.all(
          idChunk.map((id) => operationUnitServices.getOperationUnitDetail({ id }))
        );
        if (!mountedRef.current) return;

        responses.forEach((response) => {
          if (response?.data?.operationUnitId) loadedOperationUnits.push(response.data);
        });
      }

      mergeOperationUnits(loadedOperationUnits);
    },
    [mergeOperationUnits]
  );

  useEffect(() => {
    if (autoLoad) searchOperationUnits();
  }, [autoLoad, searchOperationUnits]);

  useEffect(() => {
    ensureOperationUnits(normalizedPinnedIds);
  }, [ensureOperationUnits, normalizedPinnedIds]);

  const operationUnitLabelMap = useMemo(
    () => buildOperationUnitLabelMap(Object.values(operationUnitMap)),
    [operationUnitMap]
  );

  const operationUnitOptions = useMemo(() => {
    const optionMap = new Map<string, OperationUnit>();

    dropdownOperationUnits.forEach((operationUnit) => {
      if (operationUnit.operationUnitId)
        optionMap.set(operationUnit.operationUnitId, operationUnit);
    });
    normalizedPinnedIds.forEach((id) => {
      const operationUnit = operationUnitMap[id];
      if (operationUnit) optionMap.set(id, operationUnit);
    });

    return buildOperationUnitOptions(Array.from(optionMap.values()));
  }, [dropdownOperationUnits, normalizedPinnedIds, operationUnitMap]);

  const getOperationUnitDisplay = useCallback(
    (operationUnitId?: string) =>
      operationUnitId ? operationUnitLabelMap[operationUnitId] || operationUnitId : displayText(),
    [operationUnitLabelMap]
  );

  const onOpenOperationUnitDropdown = useCallback(
    (open?: boolean) => {
      if (open && !dropdownOperationUnits.length && !operationUnitLoading) {
        searchOperationUnits(operationUnitSearch);
      }
    },
    [dropdownOperationUnits.length, operationUnitLoading, operationUnitSearch, searchOperationUnits]
  );

  const operationUnitDropdownRender = useCallback(
    (menuInstance: ReactNode) => (
      <CustomDropSearchMore
        menuInstance={menuInstance}
        searchValue={operationUnitSearch}
        onChangeSearch={onSearchOperationUnits}
        onMore={() => {}}
        totalList={operationUnitOptions.length}
        total={operationUnitOptions.length}
        loading={operationUnitLoading}
      />
    ),
    [onSearchOperationUnits, operationUnitLoading, operationUnitOptions.length, operationUnitSearch]
  );

  return {
    operationUnitOptions,
    operationUnitLoading,
    getOperationUnitDisplay,
    ensureOperationUnits,
    onOpenOperationUnitDropdown,
    operationUnitDropdownRender
  };
}
