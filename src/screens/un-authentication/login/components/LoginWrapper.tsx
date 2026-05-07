import { ReactNode } from 'react';
import { TextBase } from 'components/text';

interface Props {
  children: ReactNode;
}

const LoginWrapper = ({ children }: Props) => {
  return (
    <div className="mx-auto flex size-full max-w-[520px] flex-col">
      <div className="flex flex-1 flex-col  justify-center">
        <div className="mb-48 mt-20 text-center">
          <TextBase
            text="Chào mừng bạn quay trở lại"
            classNames="!mb-8 text-24 !font-semibold text-color-800"
          />
          <TextBase
            text="Đăng nhập để tiếp tục sử dụng hệ thống"
            classNames="!text-[15px] text-color-700"
          />
        </div>

        <div className="w-full">{children}</div>
      </div>

      <TextBase
        text="© 2026 CRM System. All rights reserved."
        classNames="!text-center !text-14 text-secondary pb-32"
      />
    </div>
  );
};

export default LoginWrapper;
