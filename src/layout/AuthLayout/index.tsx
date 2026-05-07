'use client';
import { ReactNode } from 'react';
import Image from 'next/image';
import authSideImg from 'assets/images/bg_auth.png';
import authFormSideImg from 'assets/images/bg_form_auth.png';
import { TextBase } from '../../components/text';

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="grid h-dvh grid-cols-[1.1fr_0.9fr] bg-color-50 tablet:grid-cols-1">
      <div className="relative block h-dvh tablet:hidden">
        <div className="relative block h-dvh overflow-hidden tablet:hidden">
          <Image
            src={authSideImg}
            alt="auth-side"
            fill
            priority
            className="object-cover object-right"
          />

          <div className="absolute left-[60px] top-48 z-10 ml-[100px] mt-48 max-w-[420px] tablet:hidden">
            <div className="flex gap-8 font-bold">
              <TextBase text="CRM" classNames="!text-color-50" preset="h1" />
              <TextBase text="ĐIỆN" classNames="!text-primary-500" preset="h1" />
            </div>

            <TextBase
              text="Giải pháp quản trị khách hàng ngành Điện toàn diện"
              classNames="!text-color-50 !font-semibold"
              preset="title4"
            />
          </div>
        </div>
      </div>
      <div className="relative h-dvh">
        <Image
          src={authFormSideImg}
          alt="auth-form-side"
          fill
          priority
          className="object-cover object-right"
        />

        <div className="relative z-10 flex h-full flex-col p-8">
          <div className="flex h-full flex-1 items-center justify-center tablet:mt-[10%] tablet:flex-none">
            <div className="size-full max-w-sm tablet:max-w-lg mobile:px-12">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
