import ButtonBase from 'components/button';
import { IconSvgLocal } from 'components/icon-vec-local';
import { TextBase } from 'components/text';
import { ROUTES } from 'config/routes';
import Link from 'next/link';

const Error500Page = () => {
  return (
    <div className="flex size-full items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        <div className="mb-16 w-[300px]">
          <IconSvgLocal name="ERROR_500" height={370} width={396} classNames="max-w-full h-auto" />
        </div>
        <TextBase
          text="Internal Server Error"
          preset="h2"
          classNames="mt-12 px-4 text-center !text-color-800"
        />
        <TextBase
          text="The page you are looking was moved, removed, renamed, or might never exist!"
          preset="body1"
          classNames="px-4 text-center !text-color-700"
        />
        <Link href={ROUTES.ROOT} className="mt-12">
          <ButtonBase t18n="Back To Home" type="primary" />
        </Link>
      </div>
    </div>
  );
};

export default Error500Page;
