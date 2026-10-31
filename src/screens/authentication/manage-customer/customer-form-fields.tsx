import { REQUIRED_MARK } from '@constant';
import { TextBase } from 'components/text';
import { AppTextFieldControl } from 'components/text-field';
import type { Control } from 'react-hook-form';
import type { CustomerForm } from './useManageCustomer';

interface CustomerFormFieldsProps {
  control: Control<CustomerForm>;
  customerCodeDisabled?: boolean;
}

const CustomerFormFields = ({ control, customerCodeDisabled = false }: CustomerFormFieldsProps) => (
  <>
    <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
      <AppTextFieldControl
        name="customerCode"
        control={control}
        label="Mã khách hàng"
        labelSuffix={REQUIRED_MARK}
        labelSuffixClassName="text-error-600"
        placeholder="Nhập mã khách hàng"
        disabled={customerCodeDisabled}
      />
      <AppTextFieldControl
        name="fullName"
        control={control}
        label="Tên khách hàng"
        placeholder="Nhập tên khách hàng"
      />
      <AppTextFieldControl
        name="taxNo"
        control={control}
        label="Mã số thuế"
        placeholder="Nhập mã số thuế"
        maxLength={30}
      />
      <AppTextFieldControl
        name="address"
        label="Địa chỉ"
        placeholder="Nhập địa chỉ"
        control={control}
      />
    </div>
    {(
      [
        { key: 'representative', label: 'Người đại diện' },
        { key: 'chiefAccountant', label: 'Kế toán trưởng' },
        { key: 'contactPerson', label: 'Người liên hệ' }
      ] as const
    ).map((person) => (
      <section key={person.key} className="mt-16 border-t border-color-300 pt-16">
        <TextBase classNames="sub-title3 mb-12" text={person.label} />
        <div className="grid grid-cols-4 gap-12 mobile:grid-cols-2">
          <AppTextFieldControl
            name={`${person.key}.fullName`}
            label="Tên"
            placeholder="Nhập tên"
            control={control}
            maxLength={255}
          />
          <AppTextFieldControl
            name={`${person.key}.idNo`}
            label="CCCD"
            placeholder="Nhập CCCD"
            control={control}
            maxLength={12}
          />
          <AppTextFieldControl
            name={`${person.key}.phone`}
            label="SĐT"
            placeholder="Nhập số điện thoại"
            control={control}
          />
          <AppTextFieldControl
            name={`${person.key}.email`}
            label="Email"
            placeholder="Nhập email"
            control={control}
            maxLength={255}
          />
        </div>
      </section>
    ))}
  </>
);

export default CustomerFormFields;
