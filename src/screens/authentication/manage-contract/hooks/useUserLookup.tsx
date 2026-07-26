import { CONSTANTS, DEFAULT_PAGE_SIZE } from '@constant';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import CustomDropSearchMore from 'components/select/CustomDropSearchMore';
import { AppSelectOption } from 'components/select';
import { ErrorBase } from 'model/common';
import { User, UserSearchItem } from 'model/user';
import { debounce } from 'lodash';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import userServices from 'services/user-services';
import { displayText, getContractErrorMessage } from '../utils';

interface UserLookupItem {
  id: string;
  username?: string;
  fullName?: string;
  email?: string;
}

interface UseUserLookupProps {
  autoLoad?: boolean;
  pinnedIds?: Array<string | undefined>;
  showErrorToast?: boolean;
}

const getUserLabel = (user?: UserLookupItem) => {
  if (!user) return '';
  const name = user.fullName || user.username || user.email || user.id;
  return user.username && user.username !== name ? `${user.username} - ${name}` : name;
};

const normalizeUser = (user?: User | UserSearchItem | null): UserLookupItem | undefined => {
  if (!user?.id) return undefined;
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email
  };
};

const mergeById = (users: UserLookupItem[]) => {
  const userMap = new Map<string, UserLookupItem>();
  users.forEach((user) => {
    if (user.id) userMap.set(user.id, user);
  });
  return Array.from(userMap.values());
};

const buildUserOptions = (users: UserLookupItem[]): AppSelectOption[] =>
  users
    .filter((user) => Boolean(user.id))
    .map((user) => ({
      value: user.id,
      label: getUserLabel(user),
      data: user
    }));

export default function useUserLookup({
  autoLoad = true,
  pinnedIds = [],
  showErrorToast = false
}: UseUserLookupProps = {}) {
  const [dropdownUsers, setDropdownUsers] = useState<UserLookupItem[]>([]);
  const [userMap, setUserMap] = useState<Record<string, UserLookupItem>>({});
  const [userLoading, setUserLoading] = useState<boolean>(false);
  const [userSearch, setUserSearch] = useState<string>('');
  const userMapRef = useRef<Record<string, UserLookupItem>>({});
  const mountedRef = useRef<boolean>(true);
  const searchRequestIdRef = useRef<number>(0);
  const loadedFullListRef = useRef<boolean>(false);

  const pinnedIdsKey = pinnedIds.filter(Boolean).join('|');
  const normalizedPinnedIds = useMemo(
    () => Array.from(new Set(pinnedIdsKey.split('|').filter(Boolean))),
    [pinnedIdsKey]
  );

  const mergeUsers = useCallback((users: UserLookupItem[]) => {
    const validUsers = users.filter((user) => Boolean(user.id));
    if (!validUsers.length) return;

    setUserMap((prev) => {
      const next = { ...prev };
      let changed = false;

      validUsers.forEach((user) => {
        if (next[user.id] !== user) {
          next[user.id] = user;
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, []);

  useEffect(() => {
    userMapRef.current = userMap;
  }, [userMap]);

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    []
  );

  const searchUsers = useCallback(
    async (search = '') => {
      const normalizedSearch = search.trim();
      const requestId = searchRequestIdRef.current + 1;
      searchRequestIdRef.current = requestId;
      setUserLoading(true);

      const responses = normalizedSearch
        ? await Promise.all([
            userServices.getUserSearchList({
              page: 0,
              size: DEFAULT_PAGE_SIZE,
              usernameContains: normalizedSearch
            }),
            userServices.getUserSearchList({
              page: 0,
              size: DEFAULT_PAGE_SIZE,
              fullNameContains: normalizedSearch
            })
          ])
        : [
            await userServices.getUserSearchList({
              page: 0,
              size: DEFAULT_PAGE_SIZE
            })
          ];

      if (!mountedRef.current || requestId !== searchRequestIdRef.current) return;
      setUserLoading(false);

      const users = mergeById(
        responses.flatMap((response) =>
          Array.isArray(response?.data?.items)
            ? response.data.items.map(normalizeUser).filter(Boolean)
            : []
        ) as UserLookupItem[]
      );
      const hasError = responses.some((response) => !response || !response.data);

      if (hasError && !users.length && showErrorToast) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getContractErrorMessage(
            responses.find((response) => !response?.data) as ErrorBase,
            'Tải danh sách người tạo thất bại'
          )
        });
      }

      setDropdownUsers(users);
      mergeUsers(users);
    },
    [mergeUsers, showErrorToast]
  );

  const debouncedSearchUsers = useMemo(
    () => debounce(searchUsers, CONSTANTS.TIME_DEBOUNCE),
    [searchUsers]
  );

  useEffect(
    () => () => {
      debouncedSearchUsers.cancel();
    },
    [debouncedSearchUsers]
  );

  const onSearchUsers = useCallback(
    (search: string) => {
      setUserSearch(search);
      debouncedSearchUsers(search);
    },
    [debouncedSearchUsers]
  );

  const ensureUsers = useCallback(
    async (ids: Array<string | undefined>) => {
      const missingIds = Array.from(new Set(ids.filter(Boolean) as string[])).filter(
        (id) => !userMapRef.current[id]
      );
      if (!missingIds.length || loadedFullListRef.current) return;

      loadedFullListRef.current = true;
      const response = await userServices.getListUser();
      if (!mountedRef.current) return;

      const users = Array.isArray(response?.data)
        ? (response.data.map(normalizeUser).filter(Boolean) as UserLookupItem[])
        : [];

      if (!users.length && showErrorToast) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getContractErrorMessage(response as ErrorBase, 'Tải danh sách user thất bại')
        });
        return;
      }

      mergeUsers(users);
    },
    [mergeUsers, showErrorToast]
  );

  useEffect(() => {
    if (autoLoad) searchUsers();
  }, [autoLoad, searchUsers]);

  useEffect(() => {
    ensureUsers(normalizedPinnedIds);
  }, [ensureUsers, normalizedPinnedIds]);

  const userOptions = useMemo(() => {
    const optionMap = new Map<string, UserLookupItem>();

    dropdownUsers.forEach((user) => {
      if (user.id) optionMap.set(user.id, user);
    });
    normalizedPinnedIds.forEach((id) => {
      const user = userMap[id];
      if (user) optionMap.set(id, user);
    });

    return buildUserOptions(Array.from(optionMap.values()));
  }, [dropdownUsers, normalizedPinnedIds, userMap]);

  const userLabelMap = useMemo(
    () => Object.fromEntries(Object.values(userMap).map((user) => [user.id, getUserLabel(user)])),
    [userMap]
  );

  const getUserDisplay = useCallback(
    (userId?: string) => (userId ? userLabelMap[userId] || userId : displayText()),
    [userLabelMap]
  );

  const onOpenUserDropdown = useCallback(
    (open?: boolean) => {
      if (open && !dropdownUsers.length && !userLoading) {
        searchUsers(userSearch);
      }
    },
    [dropdownUsers.length, searchUsers, userLoading, userSearch]
  );

  const userDropdownRender = useCallback(
    (menuInstance: ReactNode) => (
      <CustomDropSearchMore
        menuInstance={menuInstance}
        searchValue={userSearch}
        onChangeSearch={onSearchUsers}
        onMore={() => {}}
        totalList={userOptions.length}
        total={userOptions.length}
        loading={userLoading}
      />
    ),
    [onSearchUsers, userLoading, userOptions.length, userSearch]
  );

  return {
    userOptions,
    getUserDisplay,
    onOpenUserDropdown,
    userDropdownRender
  };
}
