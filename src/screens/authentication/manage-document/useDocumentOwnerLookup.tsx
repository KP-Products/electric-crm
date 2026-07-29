import { CONSTANTS, DEFAULT_PAGE_SIZE } from '@constant';
import { debounce } from 'lodash';
import { Customer } from 'model/customer';
import { Contract } from 'model/contract';
import { DOCUMENT_OWNER_TYPE } from 'model/document';
import { OperationContract } from 'model/operation-contract';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import customerServices from 'services/customer-services';
import contractServices from 'services/contract-services';
import operationContractServices from 'services/operation-contract-services';
import CustomDropSearchMore from 'components/select/CustomDropSearchMore';
import { AppSelectOption } from 'components/select';

type OwnerSearchResponse<T> = {
  data?: {
    items?: T[];
  };
};

type CustomerOwner = Customer & {
  customerId?: number;
  customerName?: string;
  name?: string;
};

type ContractOwner = Contract & {
  contractId?: string;
  contractName?: string;
};

type OperationContractOwner = OperationContract & {
  id?: string;
};

const toSearchText = (value?: string) => value?.trim() || undefined;

const compactOption = (option: AppSelectOption) => (option.value ? option : undefined);

const mergeById = <T,>(items: T[], getId: (item: T) => string | undefined) => {
  const itemMap = new Map<string, T>();

  items.forEach((item) => {
    const id = getId(item);
    if (id) itemMap.set(id, item);
  });

  return Array.from(itemMap.values());
};

const getItems = <T,>(response: OwnerSearchResponse<T> | undefined) =>
  Array.isArray(response?.data?.items) ? response.data.items : [];

const getCustomerOwnerId = (customer: CustomerOwner) =>
  String(customer.id ?? customer.customerId ?? '');

const getContractOwnerId = (contract: ContractOwner) => contract.id || contract.contractId || '';

const getOperationContractOwnerId = (contract: OperationContractOwner) =>
  contract.contractId || contract.id || '';

const formatCustomerLabel = (customer: CustomerOwner) =>
  [
    customer.customerCode,
    customer.fullName ||
      customer.customerName ||
      customer.name ||
      customer.taxNo ||
      customer.phone ||
      getCustomerOwnerId(customer)
  ]
    .filter(Boolean)
    .join(' - ');

const formatContractLabel = (contract: ContractOwner) =>
  contract.contractNumber || contract.contractName || getContractOwnerId(contract);

const formatOperationContractLabel = (contract: OperationContractOwner) =>
  [contract.contractNumber, contract.contractName || getOperationContractOwnerId(contract)]
    .filter(Boolean)
    .join(' - ');

async function searchCustomers(search?: string) {
  const normalizedSearch = toSearchText(search);
  if (!normalizedSearch) {
    const response = await customerServices.searchCustomer({
      page: 0,
      size: DEFAULT_PAGE_SIZE
    });
    return getItems(response);
  }

  const [byCode, byName] = await Promise.all([
    customerServices.searchCustomer({
      page: 0,
      size: DEFAULT_PAGE_SIZE,
      customerCodeContains: normalizedSearch
    }),
    customerServices.searchCustomer({
      page: 0,
      size: DEFAULT_PAGE_SIZE,
      fullNameContains: normalizedSearch
    })
  ]);

  return mergeById([...getItems(byCode), ...getItems(byName)], getCustomerOwnerId);
}

async function searchContracts(search?: string) {
  const response = await contractServices.searchContract({
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    contractNumber: toSearchText(search)
  });

  return getItems(response);
}

async function searchOperationContracts(search?: string) {
  const normalizedSearch = toSearchText(search);
  if (!normalizedSearch) {
    const response = await operationContractServices.searchOperationContracts({
      page: 0,
      size: DEFAULT_PAGE_SIZE
    });
    return getItems(response);
  }

  const [byNumber, byName] = await Promise.all([
    operationContractServices.searchOperationContracts({
      page: 0,
      size: DEFAULT_PAGE_SIZE,
      contractNumber: normalizedSearch
    }),
    operationContractServices.searchOperationContracts({
      page: 0,
      size: DEFAULT_PAGE_SIZE,
      contractName: normalizedSearch
    })
  ]);

  return mergeById([...getItems(byNumber), ...getItems(byName)], getOperationContractOwnerId);
}

export default function useDocumentOwnerLookup(ownerType?: string) {
  const [ownerOptions, setOwnerOptions] = useState<AppSelectOption[]>([]);
  const [ownerLoading, setOwnerLoading] = useState<boolean>(false);
  const [ownerSearch, setOwnerSearch] = useState<string>('');
  const mountedRef = useRef<boolean>(true);
  const searchRequestIdRef = useRef<number>(0);

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    []
  );

  const resetOwnerOptions = useCallback(() => {
    setOwnerOptions([]);
    setOwnerSearch('');
    setOwnerLoading(false);
    searchRequestIdRef.current += 1;
  }, []);

  const searchOwners = useCallback(
    async (search = '') => {
      if (!ownerType) {
        setOwnerOptions([]);
        setOwnerLoading(false);
        return;
      }

      const requestId = searchRequestIdRef.current + 1;
      searchRequestIdRef.current = requestId;
      setOwnerLoading(true);

      let options: AppSelectOption[] = [];
      try {
        if (ownerType === DOCUMENT_OWNER_TYPE.CUSTOMER) {
          const customers = await searchCustomers(search);
          options = customers
            .map((customer) =>
              compactOption({
                value: getCustomerOwnerId(customer),
                label: formatCustomerLabel(customer)
              })
            )
            .filter(Boolean) as AppSelectOption[];
        } else if (ownerType === DOCUMENT_OWNER_TYPE.CONTRACT) {
          const contracts = await searchContracts(search);
          options = contracts
            .map((contract) =>
              compactOption({
                value: getContractOwnerId(contract),
                label: formatContractLabel(contract)
              })
            )
            .filter(Boolean) as AppSelectOption[];
        } else if (ownerType === DOCUMENT_OWNER_TYPE.OPERATION_CONTRACT) {
          const contracts = await searchOperationContracts(search);
          options = contracts
            .map((contract) =>
              compactOption({
                value: getOperationContractOwnerId(contract),
                label: formatOperationContractLabel(contract)
              })
            )
            .filter(Boolean) as AppSelectOption[];
        }
      } catch {
        options = [];
      }

      if (!mountedRef.current || requestId !== searchRequestIdRef.current) return;
      setOwnerLoading(false);
      setOwnerOptions(options);
    },
    [ownerType]
  );

  const debouncedSearchOwners = useMemo(
    () => debounce(searchOwners, CONSTANTS.TIME_DEBOUNCE),
    [searchOwners]
  );

  useEffect(
    () => () => {
      debouncedSearchOwners.cancel();
    },
    [debouncedSearchOwners]
  );

  const onSearchOwners = useCallback(
    (search: string) => {
      setOwnerSearch(search);
      debouncedSearchOwners(search);
    },
    [debouncedSearchOwners]
  );

  const onOpenOwnerDropdown = useCallback(
    (open?: boolean) => {
      if (open && ownerType && !ownerOptions.length && !ownerLoading) {
        searchOwners(ownerSearch);
      }
    },
    [ownerLoading, ownerOptions.length, ownerSearch, ownerType, searchOwners]
  );

  const ownerDropdownRender = useCallback(
    (menuInstance: ReactNode) => (
      <CustomDropSearchMore
        menuInstance={menuInstance}
        searchValue={ownerSearch}
        onChangeSearch={onSearchOwners}
        onMore={() => {}}
        totalList={ownerOptions.length}
        total={ownerOptions.length}
        loading={ownerLoading}
      />
    ),
    [onSearchOwners, ownerLoading, ownerOptions.length, ownerSearch]
  );

  return {
    ownerOptions,
    ownerLoading,
    resetOwnerOptions,
    onOpenOwnerDropdown,
    ownerDropdownRender
  };
}
