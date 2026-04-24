import { TextBase } from 'components/text';
import { ReactElement } from 'react';

interface Props {
  children: ReactElement;
}

const LoginWrapper = ({ children }: Props) => {
  return (
    <div className="flex flex-col gap-20">
      <div>
        <TextBase preset="h4" text={'⚡️ CRM Điện'} classNames={'text-center'} />
        <TextBase text={'Hệ Thống Quản Lý Điện Lực'} classNames={'text-center'} />
      </div>
      <div className="size-full rounded-radius-xl border border-color-400 bg-color-50 p-20 shadow-[0_8px_24px_rgba(16,36,62,0.05)]">
        <div className="mb-20 flex items-center justify-between">
          <TextBase text="Đăng nhập hệ thống" />
        </div>
        {children}
      </div>
    </div>
  );
};

export default LoginWrapper;
