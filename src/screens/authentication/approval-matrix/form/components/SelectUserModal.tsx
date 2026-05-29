'use client';

import { CONSTANTS, K_SIZE_0, K_SIZE_1, K_SIZE_20, K_SIZE_24 } from '@constant';
import { GET_LIST_USER } from '@redux-action-type/user';
import { dispatch } from '@redux-common';
import { selectUserList, selectUserLoadingList } from '@redux-selector/user';
import { Divider, Flex, Modal, Spin } from 'antd';
import ButtonBase from 'components/button';
import AppCheckbox from 'components/checkbox';
import { IconSvgLocal } from 'components/icon-vec-local';
import { AppTextField } from 'components/text-field';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { debounce } from 'lodash';
import { UserSearchItem, UserSearchRes } from 'model/user';
import {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react';
import { Control, ControllerRenderProps, useWatch } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { ApprovalMatrixForm } from 'screens/authentication/approval-matrix/hooks/useApprovalMatrixForm';
import { filterUser } from 'screens/authentication/manage-user/utils/method';
import { useAppTranslation } from 'utils/i18n';
import { useResponsive } from 'utils/responsive';

export interface SelectUserModalRef {
  open: (
    data: UserSearchItem[],
    onChange: ControllerRenderProps['onChange'],
    index: number
  ) => void;
  close: () => void;
}

interface SelectUserModalProps {
  control: Control<ApprovalMatrixForm>;
}

const SelectUserModal = forwardRef(
  ({ control }: SelectUserModalProps, ref: ForwardedRef<SelectUserModalRef>) => {
    const { t } = useAppTranslation();
    const { isMobile, isTablet } = useResponsive();
    const userList = useSelector(selectUserList);
    const loadingUserList = useSelector(selectUserLoadingList);

    const approvalLevel = useWatch({ control, name: 'approvalLevel' });

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [userMap, setUserMap] = useState<Map<string, UserSearchItem>>(new Map());
    const defaultFilter = useMemo(() => ({ username: '' }), []);
    const [filter, setFilter] = useState(defaultFilter);
    const [filterApplied, setFilterApplied] = useState(defaultFilter);

    const onConfirmRef = useRef<ControllerRenderProps['onChange']>();
    const indexRef = useRef<number>();

    const open = useCallback(
      (data: UserSearchItem[], onChange: ControllerRenderProps['onChange'], index: number) => {
        setIsOpen(true);
        onConfirmRef.current = onChange;
        indexRef.current = index;
        setSelectedIds(new Set(data.map((u) => u.id)));
        setUserMap((prev) => {
          const map = new Map(prev);
          data.forEach((u) => map.set(u.id, u));
          return map;
        });
      },
      []
    );
    const close = useCallback(() => setIsOpen(false), []);

    useImperativeHandle(ref, () => ({ open, close }), [open, close]);

    const handleConfirm = useCallback(() => {
      const selectedUser = Array.from(selectedIds)
        .map((id) => userMap.get(id))
        .filter((u): u is UserSearchItem => Boolean(u));
      onConfirmRef.current?.(selectedUser);
      close();
    }, [selectedIds, userMap, close]);

    const otherUserSelectedMap = useMemo(() => {
      if (!approvalLevel) return new Map<string, number>();
      const map = new Map<string, number>();
      approvalLevel.forEach((level, index) => {
        if (index === indexRef.current) return;
        level.user?.forEach((u) => {
          if (u?.id) {
            map.set(u.id, index);
          }
        });
      });
      return map;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [approvalLevel, indexRef.current]);

    const userFiltered = useMemo(
      () => filterUser(userList, filterApplied),
      [userList, filterApplied]
    );

    const onChangeCheckbox = useCallback(
      (checkedValues: string[]) => {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          const newlyChecked = checkedValues.filter((id) => !prev.has(id));
          const duplicated = newlyChecked
            .map((id) => {
              if (otherUserSelectedMap.has(id)) {
                return {
                  id,
                  level: otherUserSelectedMap.get(id)
                };
              }
              return null;
            })
            .filter(Boolean);
          if (duplicated.length > K_SIZE_0) {
            const level = duplicated.map((u) => Number(u?.level) + K_SIZE_1).join('');
            showToast({
              type: TYPE_TOAST.WARNING,
              content: t('approval_matrix:duplicate_user', { level })
            });
            return prev;
          }
          const currentIds = userFiltered.map((u) => u.id);
          currentIds.forEach((id) => {
            if (!checkedValues.includes(id)) {
              next.delete(id);
            }
          });
          checkedValues.forEach((id) => {
            next.add(id);
          });
          return next;
        });
      },
      [userFiltered, otherUserSelectedMap, t]
    );

    const onApplySearch = useCallback((username: string) => {
      setFilterApplied((prev) => ({ ...prev, username }));
    }, []);

    const debouncedApplySearch = useMemo(
      () => debounce(onApplySearch, CONSTANTS.TIME_DEBOUNCE),
      [onApplySearch]
    );

    useEffect(() => {
      return () => {
        debouncedApplySearch.cancel();
      };
    }, [debouncedApplySearch]);

    const onGetListUserSuccess = useCallback((response: UserSearchRes) => {
      const newUsers = response.data?.items || [];
      setUserMap((prev) => {
        const map = new Map(prev);
        newUsers.forEach((u) => map.set(u.id, u));
        return map;
      });
    }, []);

    useEffect(() => {
      if (userList.length === K_SIZE_0) {
        dispatch({ type: GET_LIST_USER, payload: { onSuccess: onGetListUserSuccess } });
      } else {
        setUserMap((prev) => {
          const map = new Map(prev);
          userList.forEach((u) => map.set(u.id, u));
          return map;
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userList.length, onGetListUserSuccess]);

    return (
      <Modal
        open={isOpen}
        title={
          <Flex justify={'space-between'}>
            <div>{t('approval_matrix:select_user')}</div>
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
        width={isTablet || isMobile ? '80vw' : '40vw'}
        footer={
          <Flex justify={'end'}>
            <ButtonBase
              type={'primary'}
              customContent={t('common:confirm')}
              classNames={'app-common-btn'}
              onClick={handleConfirm}
            />
          </Flex>
        }
      >
        <div className="pb-16">
          <AppTextField
            allowClear
            placeholder={t('common:search_placeholder')}
            rootClassName={'h-44'}
            prefix={
              <IconSvgLocal
                name={'IC_SEARCH_OUTLINE2'}
                width={K_SIZE_20}
                height={K_SIZE_20}
                classNames={'text-color-500'}
              />
            }
            value={filter.username}
            onChange={(e) => {
              setFilter((prev) => ({ ...prev, username: e.target.value }));
              debouncedApplySearch(e.target.value);
            }}
            onPressEnter={(e) => e.currentTarget.blur()}
          />
          <Divider className="mb-0 mt-16" />
        </div>
        <Spin spinning={loadingUserList}>
          <AppCheckbox
            direction="column"
            name={'user'}
            value={Array.from(selectedIds)}
            onChange={onChangeCheckbox}
            options={userFiltered.map((item) => ({
              label: item.username,
              value: item.id
            }))}
            wrapperClassName="max-h-[220px] overflow-scroll"
          />
        </Spin>
      </Modal>
    );
  }
);

export default SelectUserModal;
