'use client';

import {
  K_SIZE_0,
  K_SIZE_100,
  K_SIZE_108,
  K_SIZE_134,
  K_SIZE_160,
  K_SIZE_18,
  K_SIZE_200,
  K_SIZE_467,
  K_SIZE_8
} from '@constant';
import { TextBase } from 'components/text';
import React from 'react';
import { Divider, Drawer, Flex, Spin } from 'antd';
import AppTable from 'components/table';
import { useResponsive } from 'utils/responsive';
import ButtonBase from 'components/button';
import { AppTextField, AppTextFieldControl } from 'components/text-field';
import { AppSelect } from 'components/select';
import IconHover from 'components/icon-vec-local/icon-hover';
import useDefaultParameterHook from 'screens/authentication/default-parameters/useDefaultParameterHook';
import { AppTakeNoteControl } from 'components/take-note';
import AppPagination from 'components/table/pagination';

const DefaultParameters = () => {
  const { isMobile, isTablet } = useResponsive();
  const {
    t,
    paramListLoading,
    pagination,
    currentPage,
    dataFilter,
    selectedItem,
    setSelectedItem,
    openEdit,
    setOpenEdit,
    onCloseEdit,
    loadingEdit,
    control,
    handleSubmit,
    formState,
    handleUpdateSubmit
  } = useDefaultParameterHook();

  const { isValid, errors, isDirty } = formState;

  return (
    <section>
      <Flex
        justify={'space-between'}
        align={'center'}
        gap={K_SIZE_8}
        className={'tablet:flex-col tablet:items-start'}
      >
        <TextBase classNames="title4" t18n={'param:sys_param'} />
      </Flex>
      <Divider className={'my-16'} />

      <Spin spinning={paramListLoading && dataFilter?.length > K_SIZE_0}>
        <div
          className={
            'relative overflow-hidden rounded-radius-l border border-color-400 duration-500'
          }
        >
          <AppTable
            loading={paramListLoading}
            rootClassName={'w-full'}
            className={'[&_.ant-pagination]:hidden'}
            scroll={{ x: 'max-content', y: '75vh' }}
            dataSource={dataFilter}
            columns={[
              {
                title: t('param:code'),
                key: 'paramCode',
                dataIndex: 'paramCode',
                width: K_SIZE_134,
                render: (text, record: any) => (
                  <TextBase
                    text={text}
                    classNames={
                      'sub-title4 !text-secondary-500 cursor-pointer hover:!text-secondary-700'
                    }
                    onClick={() => {
                      setSelectedItem(record);
                    }}
                  />
                )
              },
              {
                title: t('param:value_type'),
                dataIndex: 'valueType',
                width: K_SIZE_108
                // sorter: true,
              },
              {
                title: t('param:param_value'),
                dataIndex: 'paramValue',
                width: K_SIZE_160
              },
              {
                title: t('common:description'),
                dataIndex: 'description',
                key: 'description',
                width: K_SIZE_467,
                render: (text) => (
                  <div className={'line-clamp-2 max-w-[451px] whitespace-normal'}>{text}</div>
                )
              },
              {
                title: t('common:account'),
                fixed: 'right',
                align: 'center',
                width: K_SIZE_108,
                render: (_, record: any) => (
                  <Flex justify={'center'}>
                    <IconHover
                      rootClassName={'text-color-800'}
                      title={t('common:edit')}
                      icon={'ICON_EDIT'}
                      iconHeight={K_SIZE_18}
                      onClick={() => {
                        setSelectedItem(record);
                        setOpenEdit(true);
                      }}
                    />
                  </Flex>
                )
              }
            ]}
            rowKey={'id'}
            pagination={pagination}
          />
        </div>

        <AppPagination
          currentPage={currentPage}
          total={dataFilter.length}
          pagination={pagination}
        />
      </Spin>

      <form id={'update-form'} onSubmit={handleSubmit(handleUpdateSubmit)}>
        <Drawer
          open={openEdit || !!selectedItem?.id}
          title={
            <Flex justify={'space-between'}>
              <div>{`${t(openEdit ? 'common:edit' : 'common:view_detail')} ${t('param:param')}`}</div>
              <IconHover
                title={!!selectedItem?.id && !openEdit ? t('common:edit') : ''}
                icon={!!selectedItem?.id && !openEdit ? 'ICON_EDIT' : 'IC_CLOSE_OUTLINE'}
                onClick={() => {
                  if (!!selectedItem?.id && !openEdit) {
                    setOpenEdit(true);
                    return;
                  }
                  onCloseEdit();
                }}
              />
            </Flex>
          }
          destroyOnClose
          placement={'right'}
          closable={false}
          maskClosable={!openEdit}
          onClose={onCloseEdit}
          width={isTablet || isMobile ? '80vw' : '40vw'}
          footer={
            <Flex justify={'end'}>
              {!!selectedItem?.id && openEdit ? (
                <ButtonBase
                  form={'update-form'}
                  htmlType={'submit'}
                  classNames={'app-common-btn'}
                  type={'primary'}
                  customContent={
                    <div className="flex flex-row items-center justify-center">
                      <div>{t('common:confirm')}</div>
                      {loadingEdit && (
                        <div className="ml-8">
                          <Spin size={'small'} />
                        </div>
                      )}
                    </div>
                  }
                  disabled={!isValid || !isDirty || loadingEdit}
                />
              ) : (
                <ButtonBase
                  classNames={'app-common-btn'}
                  type={'ghost'}
                  t18n={'common:close'}
                  onClick={onCloseEdit}
                />
              )}
            </Flex>
          }
        >
          <div>
            <div
              className={`grid gap-8 ${!!selectedItem && !openEdit ? 'grid-cols-2 gap-y-12' : ''}`}
            >
              <AppTextField
                label={'ID'}
                wrapperClassName={'flex-1'}
                isView={!openEdit}
                disabled
                value={selectedItem?.id}
                defaultValue={selectedItem?.id}
              />
              <AppTextField
                label={t('param:code')}
                wrapperClassName={'flex-1'}
                isView={!openEdit}
                disabled
                value={selectedItem?.paramCode}
                defaultValue={selectedItem?.paramCode}
              />
              <AppSelect
                name={'type'}
                label={t('param:value_type')}
                options={[
                  { value: 'String', label: 'String' },
                  { value: 'Number', label: 'Number' }
                ]}
                isView={!openEdit}
                disabled
                value={selectedItem?.valueType}
                onSelectOption={(e) => {
                  // setLevel(e.key);
                }}
              />

              <AppTextFieldControl
                label={t('param:param_value')}
                placeholder={t('common:input_pla', { label: t('param:param_value').toLowerCase() })}
                wrapperClassName={'flex-1'}
                isView={!openEdit}
                control={control}
                name={'paramValue'}
                type={selectedItem?.valueType?.toLowerCase() === 'number' ? 'number' : 'text'}
                customError={errors.paramValue?.type === 'too_small' ? null : undefined}
              />
              <AppTakeNoteControl
                label={t('common:description')}
                placeholder={t('common:input_pla', {
                  label: t('common:description').toLowerCase()
                })}
                wrapperClassName={!!selectedItem && !openEdit ? 'col-span-2' : 'flex-1'}
                isView={!openEdit}
                control={control}
                name={'description'}
                classNameIsView={'w-full break-words'}
                maxLength={K_SIZE_100 + K_SIZE_200}
                count={{
                  show: true
                }}
              />
            </div>
          </div>
        </Drawer>
      </form>
    </section>
  );
};

export default DefaultParameters;
