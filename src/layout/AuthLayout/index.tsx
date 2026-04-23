'use client';
import { ReactNode } from 'react';

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="grid h-dvh bg-color-200 tablet:grid-cols-1">
      <div className="flex flex-col gap-4 p-8">
        {/*<Header />*/}
        <div className="flex flex-1 items-center justify-center tablet:mt-[10%] tablet:flex-none">
          <div className="w-full max-w-sm tablet:max-w-lg mobile:px-12">{children}</div>
        </div>
        {/*<Footer />*/}
      </div>
    </div>
  );
};

export default AuthLayout;
