'use client';

import { TextBase } from 'components/text';
import { AppTextFieldControl } from 'components/text-field';
import { Control, FieldValues, Path } from 'react-hook-form';

export const CUSTOMER_PERSON_ROLES = [
  { key: 'representative', title: 'Người đại diện' },
  { key: 'chiefAccountant', title: 'Kế toán trưởng' },
  { key: 'contactPerson', title: 'Người liên hệ' }
] as const;

interface CustomerPersonFieldsProps<T extends FieldValues> {
  control: Control<T>;
  disabled?: boolean;
}

/** 3 khối Người đại diện / Kế toán trưởng / Người liên hệ, mỗi khối: Tên | CCCD | SĐT | Email. */
const CustomerPersonFields = <T extends FieldValues>({
  control,
  disabled
}: CustomerPersonFieldsProps<T>) => (
  <div className="grid gap-16">
    {CUSTOMER_PERSON_ROLES.map((role) => (
      <div key={role.key} className="border-t border-color-200 pt-12">
        <TextBase classNames="sub-title4 mb-8" text={role.title} />
        <div className="grid grid-cols-4 gap-12 tablet:grid-cols-2 mobile:grid-cols-1">
          <AppTextFieldControl
            name={`${role.key}.fullName` as Path<T>}
            control={control}
            label="Tên"
            placeholder="Nhập tên"
            disabled={disabled}
          />
          <AppTextFieldControl
            name={`${role.key}.idNo` as Path<T>}
            control={control}
            label="CCCD"
            placeholder="Nhập CCCD"
            disabled={disabled}
          />
          <AppTextFieldControl
            name={`${role.key}.phone` as Path<T>}
            control={control}
            label="SĐT"
            placeholder="Nhập số điện thoại"
            disabled={disabled}
          />
          <AppTextFieldControl
            name={`${role.key}.email` as Path<T>}
            control={control}
            label="Email"
            placeholder="Nhập email"
            disabled={disabled}
          />
        </div>
      </div>
    ))}
  </div>
);

export default CustomerPersonFields;
