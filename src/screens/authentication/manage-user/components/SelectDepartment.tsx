'use client';

import { GET_LIST_DEPARTMENT } from '@redux-action-type/user';
import { dispatch } from '@redux-common';
import { selectDepartmentList, selectUnitList } from '@redux-selector/user';
import { AppSelectControlProps } from 'components/select';
import { GetListDepartmentReq } from 'model/master-data';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FieldValues, Path, UseFormClearErrors, UseFormSetError, useWatch } from 'react-hook-form';
import { useSelector } from 'react-redux';
import SelectSearchable from 'screens/authentication/manage-user/components/SelectSearchable';
import { useAppTranslation } from 'utils/i18n';

interface SelectDepartmentProps<T extends FieldValues>
  extends Omit<AppSelectControlProps<T>, 'options'> {
  unitIdFieldName: Path<T>;
  setError: UseFormSetError<T>;
  clearErrors: UseFormClearErrors<T>;
}

const SelectDepartment = <T extends FieldValues>({
  control,
  name,
  unitIdFieldName,
  setError,
  clearErrors,
  ...restProps
}: SelectDepartmentProps<T>) => {
  const { t } = useAppTranslation();
  const unitList = useSelector(selectUnitList);
  const departmentList = useSelector(selectDepartmentList);

  const watchUnitId = useWatch({ control: control, name: unitIdFieldName });

  const defaultFilter = useMemo(() => ({ search: '' }), []);
  const [filterApplied, setFilterApplied] = useState(defaultFilter);

  const onApplySearch = useCallback((search: string) => {
    setFilterApplied((prev) => ({ ...prev, search }));
  }, []);

  const onOpenChange = useCallback(
    (open?: boolean) => {
      if (!watchUnitId && open) {
        setError(unitIdFieldName, { message: t('manage_user:please_select_unit') });
      } else {
        clearErrors(unitIdFieldName);
      }
    },
    [watchUnitId, unitIdFieldName, setError, clearErrors, t]
  );

  const departmentOptions = useMemo(
    () => (watchUnitId ? departmentList.map((d) => ({ label: d.name, value: d.id })) : []),
    [departmentList, watchUnitId]
  );

  const filteredOptions = useMemo(() => {
    if (!filterApplied.search) return departmentOptions;
    return departmentOptions.filter((department) =>
      department.label.toLowerCase().includes(filterApplied.search.toLowerCase())
    );
  }, [filterApplied, departmentOptions]);

  useEffect(() => {
    if (!watchUnitId) return;
    const unit = unitList.find((u) => u.id === watchUnitId);
    if (!unit) return;
    clearErrors(unitIdFieldName);
    const body: GetListDepartmentReq = {
      unitCode: unit.code
    };
    dispatch({ type: GET_LIST_DEPARTMENT, payload: { body } });
  }, [watchUnitId, unitList, clearErrors, unitIdFieldName]);

  return (
    <SelectSearchable
      control={control}
      name={name}
      label={t('manage_user:department')}
      placeholder={t('manage_user:select_department')}
      options={filteredOptions}
      wrapperClassName="w-full"
      onApplySearch={onApplySearch}
      loading={false}
      onOpenChange={onOpenChange}
      {...restProps}
    />
  );
};

export default SelectDepartment;
