'use client';

import { K_SIZE_0 } from '@constant';
import { GET_LIST_UNIT } from '@redux-action-type/user';
import { dispatch } from '@redux-common';
import { selectUnitList } from '@redux-selector/user';
import { AppSelectControlProps } from 'components/select';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import { useSelector } from 'react-redux';
import SelectSearchable from 'screens/authentication/manage-user/components/SelectSearchable';
import { useAppTranslation } from 'utils/i18n';

interface SelectUnitProps<T extends FieldValues>
  extends Omit<AppSelectControlProps<T>, 'options'> {}

const SelectUnit = <T extends FieldValues>(props: SelectUnitProps<T>) => {
  const { t } = useAppTranslation();
  const unitList = useSelector(selectUnitList);

  const defaultFilter = useMemo(() => ({ search: '' }), []);
  const [filterApplied, setFilterApplied] = useState(defaultFilter);

  const onApplySearch = useCallback((search: string) => {
    setFilterApplied((prev) => ({ ...prev, search }));
  }, []);

  const unitOptions = useMemo(
    () => unitList.map((u) => ({ label: u.name, value: u.id })),
    [unitList]
  );

  const filteredOptions = useMemo(() => {
    if (!filterApplied.search) return unitOptions;
    return unitOptions.filter((unit) =>
      unit.label.toLowerCase().includes(filterApplied.search.toLowerCase())
    );
  }, [filterApplied, unitOptions]);

  useEffect(() => {
    if (unitList.length === K_SIZE_0) dispatch({ type: GET_LIST_UNIT, payload: {} });
  }, [unitList.length]);

  return (
    <SelectSearchable
      label={t('manage_user:unit')}
      placeholder={t('manage_user:select_unit')}
      options={filteredOptions}
      wrapperClassName="w-full"
      onApplySearch={onApplySearch}
      loading={false}
      {...props}
    />
  );
};

export default SelectUnit;
