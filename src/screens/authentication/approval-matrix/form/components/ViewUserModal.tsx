'use client';

import { K_SIZE_0, K_SIZE_24 } from '@constant';
import { Flex, Modal } from 'antd';
import { IconSvgLocal } from 'components/icon-vec-local';
import TagFilter from 'components/tag-filter';
import { UserSearchItem } from 'model/user';
import {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { useAppTranslation } from 'utils/i18n';
import { useResponsive } from 'utils/responsive';

export interface ViewUserModalRef {
  open: (data: UserSearchItem[], onChange: ControllerRenderProps['onChange']) => void;
  close: () => void;
}

export interface ViewUserModalProps {
  isView: boolean;
}

const ViewUserModal = forwardRef(
  ({ isView }: ViewUserModalProps, ref: ForwardedRef<ViewUserModalRef>) => {
    const { t } = useAppTranslation();
    const { isMobile, isTablet } = useResponsive();

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [userList, setUserList] = useState<UserSearchItem[]>([]);

    const onChangeRef = useRef<ControllerRenderProps['onChange']>();

    const open = useCallback(
      (data: UserSearchItem[], onChange: ControllerRenderProps['onChange']) => {
        setIsOpen(true);
        setUserList(data);
        onChangeRef.current = onChange;
      },
      []
    );
    const close = useCallback(() => setIsOpen(false), []);

    useImperativeHandle(ref, () => ({ open, close }), [open, close]);

    const onRemove = useCallback(
      (userId: string) => {
        const newUsers = userList.filter((u) => u.id !== userId);
        setUserList(newUsers);
        onChangeRef.current?.(newUsers);
      },
      [userList]
    );

    useEffect(() => {
      if (userList.length === K_SIZE_0) close();
    }, [userList, close]);

    return (
      <Modal
        open={isOpen}
        title={
          <Flex justify={'space-between'}>
            <div>{t('approval_matrix:approver')}</div>
            <IconSvgLocal
              name={'IC_CLOSE_OUTLINE'}
              classNames={'text-color-700 cursor-pointer hover:text-color-800'}
              height={K_SIZE_24}
              onClick={close}
            />
          </Flex>
        }
        destroyOnClose
        closeIcon={false}
        onCancel={close}
        maskClosable
        width={isTablet || isMobile ? '80vw' : '60vw'}
        footer={null}
      >
        <div className="flex flex-wrap items-center gap-8 rounded-radius-m border border-color-300 px-16 py-12">
          {userList.map((user) => (
            <TagFilter
              key={user.id}
              content={user.username}
              hiddenClose={isView}
              onClose={() => onRemove(user.id)}
            />
          ))}
        </div>
      </Modal>
    );
  }
);

export default ViewUserModal;
