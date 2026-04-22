'use client';

import { CONSTANTS, K_SIZE_1 } from '@constant';
import { AppSelectControl, AppSelectControlProps } from 'components/select';
import CustomDropSearchMore from 'components/select/CustomDropSearchMore';
import { debounce } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { FieldValues } from 'react-hook-form';

interface SelectSearchableProps<T extends FieldValues> extends AppSelectControlProps<T> {
  onApplySearch: (search: string) => void;
  loading: boolean;
}

const SelectSearchable = <T extends FieldValues>({
  loading,
  onApplySearch,
  ...rest
}: SelectSearchableProps<T>) => {
  const [search, setSearch] = useState<string>('');

  const debouncedApplySearch = useMemo(
    () => debounce(onApplySearch, CONSTANTS.TIME_DEBOUNCE),
    [onApplySearch]
  );

  useEffect(() => {
    return () => {
      debouncedApplySearch.cancel();
    };
  }, [debouncedApplySearch]);

  return (
    <AppSelectControl
      {...rest}
      dropdownRender={(menuInstance) => (
        <CustomDropSearchMore
          menuInstance={menuInstance}
          searchValue={search}
          onChangeSearch={(value) => {
            setSearch(value);
            debouncedApplySearch(value);
          }}
          onMore={() => {}}
          totalList={K_SIZE_1}
          total={K_SIZE_1}
          loading={loading}
        />
      )}
    />
  );
};

export default SelectSearchable;
