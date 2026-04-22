import { TextBase } from 'components/text';
import { ReactElement } from 'react';

interface Props {
  children: ReactElement;
}

const LoginWrapper = ({ children }: Props) => {
  return (
    <div className="size-full rounded-radius-xl border-weight-l border-primary-500 p-20">
      <div className="mb-20 flex items-center justify-between">
        <TextBase preset="h4" t18n="login_screen:login" />
      </div>
      {children}
    </div>
  );
};

export default LoginWrapper;
