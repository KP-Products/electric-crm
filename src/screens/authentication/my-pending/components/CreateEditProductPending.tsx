'use client';

import { selectProductLevel } from '@redux-selector/sys-parameter-selector';
// import CreateEditProductForm from 'screens/authentication/products-and-code-fee/components/CreateEditProductForm';
import React, { useEffect, useState } from 'react';
import { ACTION_TYPES, PendingTaskDetail } from 'model/pending-task';
import {Product } from 'model/product';
// import ChangeFeeProductModal from 'screens/authentication/products-and-code-fee/components/ChangeFeeProductModal';
import { useSelector } from 'react-redux';
// import useProductAndCodeHook from 'screens/authentication/products-and-code-fee/useProductAndCodeHook';
import { PERMISSION_APPROVE_ACTION } from 'utils/permission.util';
// import { selectFeeCodes } from '@redux-selector/fee-code-selector';
import { K_SIZE_0 } from '@constant';
import { dispatch } from '@redux-common';
// import { FEE_CODE_LIST } from '@redux-action-type/fee-code-type';
import { ErrorBase } from 'model/common';
import { FeeCode } from 'model/fee-code';
import { DebugUtils } from 'utils/debug-utils';

interface Props {
  infoTask?: PendingTaskDetail;
  isView?: boolean;
  onClose?: () => void;
  onDone?: () => void;
  canEdit?: boolean;
  onApprove?: (onDone?: () => void) => void;
  onReject?: (onDone?: () => void) => void;
  onDelete?: (onDone?: () => void) => void;
}
const CreateEditProductPending = ({
  infoTask,
  isView,
  onClose,
  onDone,
  canEdit,
  onApprove,
  onReject,
  onDelete
}: Props) => {
  // const {
  //   updateForm,
  //   viewProduct,
  //   openCreateProduct,
  //   setOpenCreateProduct,
  //   onCloseCreate,
  //   setViewProduct,
  //   editProduct,
  //   setEditProduct,
  //   onCreateNew,
  //
  //   openChange,
  //   setOpenChange,
  //
  //   dataProduct,
  //   dataProductConvert,
  //   dataMap,
  //   feeCodeChanges,
  //   setFeeCodeChanges,
  //   fecthListConvert,
  //   loadingSubmit
  // } = useProductAndCodeHook({ approveFlow: infoTask?.operationType, onDone: onDone });
  // const feeCodes = useSelector(selectFeeCodes);
  const productLevel = useSelector(selectProductLevel);
  // const {
  //   control,
  //   handleSubmit,
  //   formState: { isDirty, isValid }
  // } = updateForm;

  const [toProduct, setToProduct] = useState<string[]>();
  const [defaultFeeCodeChanges, setDefaultFeeCodeChanges] = useState<string[]>();
  const [loadingChange, setLoadingChange] = useState<boolean>(false);

  useEffect(() => {
    if (infoTask?.actionId) {
      const detail = infoTask?.dataDetail;

      if (
        infoTask.actionId === PERMISSION_APPROVE_ACTION.PARAMETER_PRODUCT_APPROVE_ACTION &&
        infoTask.operationType === ACTION_TYPES.CREATE
      ) {
        const product: Product = {
          ...detail,
          id: detail?.id || infoTask?.transactionId || '',
          code: detail?.code || '',
          bbRequestId: infoTask?.requestId
        };

        // setViewProduct(product);
        // setEditProduct(!isView);
        // setOpenCreateProduct(true);
        return;
      }
      // convert
      const mappingDetails = detail.mappingDetails;
      if (mappingDetails && mappingDetails.length > K_SIZE_0) {
        const dataFeeCodes = mappingDetails.map((de) => de.feeCode || '');
        // setFeeCodeChanges(dataFeeCodes);
        setDefaultFeeCodeChanges(dataFeeCodes);
        setToProduct(
          mappingDetails[K_SIZE_0].productCode ? [mappingDetails[K_SIZE_0].productCode] : undefined
        );
        // setOpenChange(true);
      }
      // convert
    }
  }, [infoTask, isView]);

  // useEffect(() => {
    // if (openChange) {
    //   if (!dataProductConvert) {
    //     setLoadingChange(true);
    //     fecthListConvert(() => {
    //       setLoadingChange(false);
    //     });
    //     return;
    //   }
    // }
  //   setLoadingChange(false);
  // }, [openChange, dataProductConvert]);

  // useEffect(() => {
  //   if (!feeCodes)
  //     dispatch({
  //       type: FEE_CODE_LIST,
  //       payload: {
  //         onSuccess: (data: FeeCode) => {
  //           DebugUtils.logS(['FEE_CODE_LIST data', data]);
  //         },
  //         onFailed: (error?: ErrorBase) => {
  //           DebugUtils.logS(['FEE_CODE_LIST error', error]);
  //         }
  //       }
  //     });
  // }, [feeCodes]);

  if (!infoTask) {
    return null;
  }
  return (
    <></>
    // <>
    //   <CreateEditProductForm
    //     isApprove={infoTask?.operationType === ACTION_TYPES.CREATE}
    //     canEdit={canEdit}
    //     createProduct={false}
    //     editProduct={editProduct}
    //     control={control as any}
    //     open={openCreateProduct}
    //     onClose={() => {
    //       onCloseCreate();
    //       onClose?.();
    //     }}
    //     setEditProduct={() => {
    //       setEditProduct(true);
    //     }}
    //     onSubmit={handleSubmit(onCreateNew)}
    //     viewProduct={viewProduct}
    //     disabledSubmit={!isDirty || !isValid || loadingSubmit}
    //     isLastlevel={!!viewProduct?.level && viewProduct?.level === productLevel}
    //   />
    //
    //   <ChangeFeeProductModal
    //     afterClose={onClose}
    //     isViewDefault={isView}
    //     canEdit={canEdit}
    //     openChange={openChange}
    //     setOpenChange={setOpenChange}
    //     dataProduct={dataProduct}
    //     dataProductConvert={dataProductConvert}
    //     productLevel={productLevel}
    //     dataMap={dataMap}
    //     feeCodeChanges={feeCodeChanges}
    //     defaultFeeCodeChanges={defaultFeeCodeChanges}
    //     setFeeCodeChanges={setFeeCodeChanges}
    //     feeCodes={feeCodes}
    //     defaultToProduct={toProduct}
    //     loading={loadingChange}
    //     onApprove={onApprove}
    //     onReject={onReject}
    //     onDelete={onDelete}
    //   />
    // </>
  );
};

export default CreateEditProductPending;
