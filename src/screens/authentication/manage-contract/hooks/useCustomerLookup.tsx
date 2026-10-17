import { CONSTANTS, DEFAULT_PAGE_SIZE } from '@constant';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import CustomDropSearchMore from 'components/select/CustomDropSearchMore';
import { ErrorBase } from 'model/common';
import { Customer } from 'model/customer';
import { debounce } from 'lodash';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { hasApiError } from 'utils/api-response';
import customerServices from 'services/customer-services';
import {
  buildCustomerLabelMap,
  buildCustomerOptions,
  displayText,
  getContractErrorMessage
} from '../utils';

const CUSTOMER_DETAIL_CHUNK_SIZE = 5;

interface UseCustomerLookupProps {
  autoLoad?: boolean;
  pinnedIds?: Array<number | undefined>;
  showErrorToast?: boolean;
}

const mergeById = (customers: Customer[]) => {
  const customerMap = new Map<number, Customer>();
  customers.forEach((customer) => {
    if (customer.id !== undefined) customerMap.set(customer.id, customer);
  });
  return Array.from(customerMap.values());
};

export default function useCustomerLookup({
  autoLoad = true,
  pinnedIds = [],
  showErrorToast = false
}: UseCustomerLookupProps = {}) {
  const [dropdownCustomers, setDropdownCustomers] = useState<Customer[]>([]);
  const [customerMap, setCustomerMap] = useState<Record<string, Customer>>({});
  const [customerLoading, setCustomerLoading] = useState<boolean>(false);
  const [customerPage, setCustomerPage] = useState(0);
  const [hasMoreCustomers, setHasMoreCustomers] = useState(false);
  const loadingRef = useRef(false);
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const customerMapRef = useRef<Record<string, Customer>>({});
  const mountedRef = useRef<boolean>(true);
  const searchRequestIdRef = useRef<number>(0);

  const pinnedIdsKey = pinnedIds.filter((id) => id !== undefined).join('|');
  const normalizedPinnedIds = useMemo(
    () =>
      Array.from(
        new Set(pinnedIdsKey.split('|').filter(Boolean).map(Number).filter(Number.isFinite))
      ),
    [pinnedIdsKey]
  );

  const mergeCustomers = useCallback((customers: Customer[]) => {
    const validCustomers = customers.filter((customer) => Boolean(customer.id));
    if (!validCustomers.length) return;

    setCustomerMap((prev) => {
      const next = { ...prev };
      let changed = false;

      validCustomers.forEach((customer) => {
        if (next[customer.id] !== customer) {
          next[customer.id] = customer;
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, []);

  useEffect(() => {
    customerMapRef.current = customerMap;
  }, [customerMap]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const searchCustomers = useCallback(
    async (search = '', page = 0) => {
      const normalizedSearch = search.trim();
      const requestId = searchRequestIdRef.current + 1;
      searchRequestIdRef.current = requestId;
      setCustomerLoading(true);
      loadingRef.current = true;

      const responses = normalizedSearch
        ? await Promise.all([
            customerServices.searchCustomer({
              page,
              size: DEFAULT_PAGE_SIZE,
              customerCodeContains: normalizedSearch
            }),
            customerServices.searchCustomer({
              page,
              size: DEFAULT_PAGE_SIZE,
              fullNameContains: normalizedSearch
            })
          ])
        : [
            await customerServices.searchCustomer({
              page,
              size: DEFAULT_PAGE_SIZE
            })
          ];

      if (!mountedRef.current || requestId !== searchRequestIdRef.current) return;
      setCustomerLoading(false);
      loadingRef.current = false;

      const hasError = responses.some((response) => hasApiError(response) || !response.data);
      const customers = mergeById(
        responses.flatMap((response) =>
          Array.isArray(response?.data?.items) ? response.data.items : []
        )
      );

      if (hasError && showErrorToast) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getContractErrorMessage(
            responses.find((response) => hasApiError(response) || !response?.data) as ErrorBase,
            'Tải danh sách khách hàng thất bại'
          )
        });
      }

      if (hasError) {
        // Keep the current page so retrying does not skip failed results.
        if (page === 0) setDropdownCustomers([]);
        return;
      }
      setCustomerPage(page);
      setHasMoreCustomers(
        responses.some((response) => (response.data?.total ?? 0) > (page + 1) * DEFAULT_PAGE_SIZE)
      );
      setDropdownCustomers((previous) =>
        page === 0 ? customers : mergeById([...previous, ...customers])
      );
      mergeCustomers(customers);
    },
    [mergeCustomers, showErrorToast]
  );

  const debouncedSearchCustomers = useMemo(
    () => debounce(searchCustomers, CONSTANTS.TIME_DEBOUNCE),
    [searchCustomers]
  );

  useEffect(
    () => () => {
      debouncedSearchCustomers.cancel();
    },
    [debouncedSearchCustomers]
  );

  const onSearchCustomers = useCallback(
    (search: string) => {
      searchRequestIdRef.current += 1;
      setCustomerSearch(search);
      setCustomerPage(0);
      setHasMoreCustomers(false);
      setDropdownCustomers([]);
      setCustomerLoading(true);
      loadingRef.current = true;
      debouncedSearchCustomers(search);
    },
    [debouncedSearchCustomers]
  );

  const ensureCustomers = useCallback(
    async (ids: Array<number | undefined>) => {
      const missingIds = Array.from(
        new Set(ids.filter((id): id is number => id !== undefined))
      ).filter((id) => !customerMapRef.current[String(id)]);
      if (!missingIds.length) return;

      const loadedCustomers: Customer[] = [];
      for (let index = 0; index < missingIds.length; index += CUSTOMER_DETAIL_CHUNK_SIZE) {
        const idChunk = missingIds.slice(index, index + CUSTOMER_DETAIL_CHUNK_SIZE);
        const responses = await Promise.all(
          idChunk.map((id) => customerServices.getCustomerDetail({ id }))
        );
        if (!mountedRef.current) return;

        responses.forEach((response) => {
          const customer = response?.data?.customer;
          if (customer?.id) loadedCustomers.push(customer);
        });
      }

      mergeCustomers(loadedCustomers);
    },
    [mergeCustomers]
  );

  useEffect(() => {
    if (autoLoad) searchCustomers();
  }, [autoLoad, searchCustomers]);

  useEffect(() => {
    ensureCustomers(normalizedPinnedIds);
  }, [ensureCustomers, normalizedPinnedIds]);

  const customerLabelMap = useMemo(
    () => buildCustomerLabelMap(Object.values(customerMap)),
    [customerMap]
  );

  const customerOptions = useMemo(() => {
    const optionMap = new Map<number, Customer>();

    dropdownCustomers.forEach((customer) => {
      if (customer.id !== undefined) optionMap.set(customer.id, customer);
    });
    normalizedPinnedIds.forEach((id) => {
      const customer = customerMap[id];
      if (customer) optionMap.set(Number(id), customer);
    });

    return buildCustomerOptions(Array.from(optionMap.values()));
  }, [customerMap, dropdownCustomers, normalizedPinnedIds]);

  const getCustomerDisplay = useCallback(
    (customerId?: number) =>
      customerId !== undefined
        ? customerLabelMap[String(customerId)] || String(customerId)
        : displayText(),
    [customerLabelMap]
  );

  const onOpenCustomerDropdown = useCallback(
    (open?: boolean) => {
      if (open && !dropdownCustomers.length && !customerLoading) {
        searchCustomers(customerSearch);
      }
    },
    [customerLoading, customerSearch, dropdownCustomers.length, searchCustomers]
  );

  const customerDropdownRender = useCallback(
    (menuInstance: ReactNode) => (
      <CustomDropSearchMore
        menuInstance={menuInstance}
        searchValue={customerSearch}
        onChangeSearch={onSearchCustomers}
        onMore={() => {
          if (!loadingRef.current && hasMoreCustomers)
            void searchCustomers(customerSearch, customerPage + 1);
        }}
        totalList={customerOptions.length}
        total={customerOptions.length + (hasMoreCustomers ? 1 : 0)}
        loading={customerLoading}
      />
    ),
    [
      customerLoading,
      customerOptions.length,
      customerSearch,
      onSearchCustomers,
      hasMoreCustomers,
      customerPage,
      searchCustomers
    ]
  );

  return {
    customerOptions,
    customerLoading,
    getCustomerDisplay,
    ensureCustomers,
    onOpenCustomerDropdown,
    customerDropdownRender
  };
}
