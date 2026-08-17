'use client';

import {
  DEFAULT_PAGE_SIZE,
  K_SIZE_0,
  K_SIZE_1,
  K_SIZE_100,
  K_SIZE_130,
  K_SIZE_140,
  K_SIZE_18,
  K_SIZE_180,
  K_SIZE_8,
  K_SIZE_80,
  NULL_VALUE
} from '@constant';
import { Divider, Drawer, Flex, Spin } from 'antd';
import ButtonBase from 'components/button';
import IconHover from 'components/icon-vec-local/icon-hover';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import { AppTakeNoteControl } from 'components/take-note';
import TagFilter from 'components/tag-filter';
import { TextBase } from 'components/text';
import { AppTextField, AppTextFieldControl } from 'components/text-field';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { SystemParameter } from 'model/system-parameter';
import { useMemo } from 'react';
import { ROUTES } from 'config/routes';
import { useResponsive } from 'utils/responsive';
import useDefaultParameterHook, {
  SystemParameterFilterForm
} from 'screens/authentication/default-parameters/useDefaultParameterHook';

const FILTER_LABEL_MAP: Record<keyof SystemParameterFilterForm, string> = {
  paramKey: 'Mã tham số',
  paramValue: 'Giá trị'
};

const displayText = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') return NULL_VALUE;
  return String(value);
};

const DefaultParameters = () => {
  const { isMobile, isTablet } = useResponsive();
  const {
    t,
    paramList,
    total,
    paramListLoading,
    submitting,
    currentPage,
    pagination,
    filter,
    filterApplied,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    drawerMode,
    selectedItem,
    onOpenCreate,
    onOpenEdit,
    onOpenView,
    onCloseDrawer,
    onDelete,
    control,
    handleSubmit,
    formState,
    onSubmit,
    descriptionMaxLength,
    paramKeyMaxLength
  } = useDefaultParameterHook();

  const { isValid, isDirty, errors } = formState;
  const isView = drawerMode === 'view';
  const isEdit = drawerMode === 'edit';
  const isCreate = drawerMode === 'create';

  const activeFilters = useMemo(
    () =>
      (Object.entries(filterApplied) as [keyof SystemParameterFilterForm, string][]).filter(
        ([, value]) => Boolean(value)
      ),
    [filterApplied]
  );

  const columns = useMemo<any[]>(
    () => [
      {
        title: 'STT',
        key: 'index',
        width: K_SIZE_80,
        align: 'center',
        render: (_: unknown, __: SystemParameter, index: number) =>
          (currentPage - K_SIZE_1) * DEFAULT_PAGE_SIZE + index + K_SIZE_1
      },
      {
        title: t('param:code'),
        dataIndex: 'paramKey',
        key: 'paramKey',
        width: K_SIZE_180,
        render: (text: string, record: SystemParameter) => (
          <TextBase
            text={displayText(text)}
            classNames="sub-title4 !text-secondary-500 cursor-pointer hover:!text-secondary-700"
            onClick={() => onOpenView(record)}
          />
        )
      },
      {
        title: t('param:param_value'),
        dataIndex: 'paramValue',
        key: 'paramValue',
        width: K_SIZE_180,
        render: (text: string) => (
          <div title={text} className="max-w-[220px] truncate">
            {displayText(text)}
          </div>
        )
      },
      {
        title: t('common:description'),
        dataIndex: 'description',
        key: 'description',
        width: K_SIZE_100 * 4,
        render: (text: string) => (
          <div className="line-clamp-2 max-w-[460px] whitespace-normal">{displayText(text)}</div>
        )
      },
      {
        title: t('common:updated_by'),
        dataIndex: 'updatedByName',
        key: 'updatedByName',
        width: K_SIZE_140,
        render: (_: string, record: SystemParameter) =>
          displayText(record.updatedByName || record.createdByName)
      },
      {
        title: t('common:updated_at'),
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        width: K_SIZE_140,
        render: (_: string, record: SystemParameter) =>
          displayText(record.updatedAt || record.createdAt)
      },
      {
        title: t('common:action'),
        key: 'action',
        fixed: 'right',
        align: 'center',
        width: K_SIZE_130,
        render: (_: unknown, record: SystemParameter) => (
          <div className="flex justify-center gap-8">
            <IconHover
              rootClassName="text-color-800"
              title={t('common:view_detail')}
              icon="ICON_EYE_OPEN"
              iconHeight={K_SIZE_18}
              onClick={() => onOpenView(record)}
            />
            <IconHover
              rootClassName="text-color-800"
              title={t('common:edit')}
              icon="ICON_EDIT"
              iconHeight={K_SIZE_18}
              onClick={() => onOpenEdit(record)}
            />
            <IconHover
              rootClassName="text-error-500 hover:text-error-500"
              title={t('common:delete')}
              icon="IC_TRASH_OUTLINE"
              iconHeight={K_SIZE_18}
              onClick={() => onDelete(record)}
            />
          </div>
        )
      }
    ],
    [currentPage, onDelete, onOpenEdit, onOpenView, t]
  );

  const drawerTitle = () => {
    if (isCreate) return `${t('common:add_new')} ${t('param:param').toLowerCase()}`;
    if (isEdit) return `${t('common:edit')} ${t('param:param').toLowerCase()}`;
    return `${t('common:view_detail')} ${t('param:param').toLowerCase()}`;
  };

  return (
    <PageWithBreadcrumb
      breadcrumbList={[
        { title: t('menu:system_administration') },
        { title: t('param:sys_param'), key: ROUTES.DEFAULT_PARAMETERS }
      ]}
    >
      <section>
        <Flex
          justify="space-between"
          align="center"
          gap={K_SIZE_8}
          className="tablet:flex-col tablet:items-start"
        >
          <TextBase classNames="title4" t18n={'param:sys_param'} />
          <ButtonBase
            type="primary"
            leftIcon="IC_ADD_OUTLINE2"
            customContent="Thêm tham số"
            onClick={onOpenCreate}
            classNames="mobile:w-full mobile:justify-center"
          />
        </Flex>
        <Divider className="my-16" />

        <div className="mb-12 grid grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)] items-end gap-12 rounded-radius-l border border-color-300 bg-color-50 p-12 mobile:grid-cols-1">
          <AppTextField
            name="paramKey"
            label={t('param:code')}
            placeholder="Nhập mã tham số"
            value={filter.paramKey}
            onChange={(event) => onChangeFilter('paramKey', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppTextField
            name="paramValue"
            label={t('param:param_value')}
            placeholder="Nhập giá trị tham số"
            value={filter.paramValue}
            onChange={(event) => onChangeFilter('paramValue', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <Flex justify="end" gap={K_SIZE_8} className="col-span-full">
            <ButtonBase
              type="ghost"
              t18n={'common:clear_filter'}
              onClick={() => onResetFilter()}
              classNames="min-w-[104px] mobile:flex-1 mobile:justify-center"
            />
            <ButtonBase
              type="primary"
              leftIcon="IC_SEARCH_OUTLINE2"
              t18n={'common:search'}
              onClick={onApplyFilter}
              classNames="min-w-[112px] mobile:flex-1 mobile:justify-center"
            />
          </Flex>
        </div>

        {activeFilters.length > K_SIZE_0 && (
          <div className="mb-8 flex w-full flex-wrap items-center gap-8">
            {activeFilters.map(([key, value]) => (
              <TagFilter
                key={key}
                content={`${FILTER_LABEL_MAP[key]}: ${value}`}
                onClose={() => onResetFilter(key)}
              />
            ))}
          </div>
        )}

        <Spin spinning={paramListLoading && paramList.length > K_SIZE_0}>
          <div className="overflow-hidden rounded-radius-l border border-color-400 duration-500">
            <AppTable
              loading={paramListLoading}
              rootClassName="w-full"
              className="[&_.ant-pagination]:hidden"
              scroll={{ x: 'max-content', y: '75vh' }}
              dataSource={paramList}
              columns={columns}
              rowKey="id"
              pagination={pagination}
            />
          </div>
          <AppPagination currentPage={currentPage} total={total} pagination={pagination} />
        </Spin>

        <form id="param-form" onSubmit={handleSubmit(onSubmit)}>
          <Drawer
            open={Boolean(drawerMode)}
            title={
              <Flex justify="space-between" align="center">
                <div>{drawerTitle()}</div>
                <IconHover
                  title={isView ? t('common:edit') : ''}
                  icon={isView ? 'ICON_EDIT' : 'IC_CLOSE_OUTLINE'}
                  onClick={() => {
                    if (isView && selectedItem) {
                      onOpenEdit(selectedItem);
                      return;
                    }
                    onCloseDrawer();
                  }}
                />
              </Flex>
            }
            destroyOnClose
            placement="right"
            closable={false}
            maskClosable={isView}
            onClose={onCloseDrawer}
            width={isTablet || isMobile ? '80vw' : '40vw'}
            footer={
              <Flex justify="end" gap={K_SIZE_8}>
                {isView ? (
                  <ButtonBase
                    classNames="app-common-btn"
                    type="ghost"
                    t18n={'common:close'}
                    onClick={onCloseDrawer}
                  />
                ) : (
                  <>
                    <ButtonBase
                      classNames="app-common-btn"
                      type="ghost"
                      t18n={'common:cancel'}
                      onClick={onCloseDrawer}
                    />
                    <ButtonBase
                      form="param-form"
                      htmlType="submit"
                      classNames="app-common-btn"
                      type="primary"
                      customContent={
                        <div className="flex flex-row items-center justify-center">
                          <div>{t('common:confirm')}</div>
                          {submitting && (
                            <div className="ml-8">
                              <Spin size="small" />
                            </div>
                          )}
                        </div>
                      }
                      disabled={!isValid || (isEdit && !isDirty) || submitting}
                    />
                  </>
                )}
              </Flex>
            }
          >
            <div className={`grid gap-8 ${isView ? 'grid-cols-2 gap-y-12' : ''}`}>
              {isCreate ? (
                <AppTextFieldControl
                  label={t('param:code')}
                  placeholder="Ví dụ: PAYMENT_DUE_DAYS"
                  wrapperClassName="flex-1"
                  control={control}
                  name="paramKey"
                  maxLength={paramKeyMaxLength}
                  caption="Mã tham số là khoá hệ thống dùng để đọc cấu hình, không sửa được sau khi tạo."
                />
              ) : (
                <AppTextField
                  name="paramKeyView"
                  label={t('param:code')}
                  wrapperClassName="flex-1"
                  isView={isView}
                  disabled
                  value={selectedItem?.paramKey}
                  defaultValue={selectedItem?.paramKey}
                />
              )}

              <AppTextFieldControl
                label={t('param:param_value')}
                placeholder={t('common:input_pla', {
                  label: t('param:param_value').toLowerCase()
                })}
                wrapperClassName="flex-1"
                isView={isView}
                control={control}
                name="paramValue"
                customError={errors.paramValue?.type === 'too_small' ? null : undefined}
              />

              <AppTakeNoteControl
                label={t('common:description')}
                placeholder={t('common:input_pla', {
                  label: t('common:description').toLowerCase()
                })}
                wrapperClassName={isView ? 'col-span-2' : 'flex-1'}
                isView={isView}
                control={control}
                name="description"
                classNameIsView="w-full break-words"
                maxLength={descriptionMaxLength}
                count={{ show: true }}
              />

              {isView && (
                <>
                  <AppTextField
                    name="createdInfo"
                    label="Người tạo"
                    wrapperClassName="flex-1"
                    isView
                    disabled
                    value={displayText(selectedItem?.createdByName)}
                    defaultValue={displayText(selectedItem?.createdByName)}
                  />
                  <AppTextField
                    name="createdAt"
                    label="Ngày tạo"
                    wrapperClassName="flex-1"
                    isView
                    disabled
                    value={displayText(selectedItem?.createdAt)}
                    defaultValue={displayText(selectedItem?.createdAt)}
                  />
                  <AppTextField
                    name="updatedInfo"
                    label={t('common:updated_by')}
                    wrapperClassName="flex-1"
                    isView
                    disabled
                    value={displayText(selectedItem?.updatedByName)}
                    defaultValue={displayText(selectedItem?.updatedByName)}
                  />
                  <AppTextField
                    name="updatedAt"
                    label={t('common:updated_at')}
                    wrapperClassName="flex-1"
                    isView
                    disabled
                    value={displayText(selectedItem?.updatedAt)}
                    defaultValue={displayText(selectedItem?.updatedAt)}
                  />
                </>
              )}
            </div>
          </Drawer>
        </form>
      </section>
    </PageWithBreadcrumb>
  );
};

export default DefaultParameters;
