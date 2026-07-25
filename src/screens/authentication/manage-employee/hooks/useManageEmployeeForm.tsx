import { K_SIZE_1 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CREATE_EMPLOYEE,
  GET_EMPLOYEE_DETAIL,
  UPDATE_EMPLOYEE,
  UPLOAD_EMPLOYEE_AVATAR,
  UPLOAD_EMPLOYEE_CONTRACT_FILE
} from '@redux-action-type/employee';
import { dispatch } from '@redux-common';
import { selectEmployeeLoadingDetail } from '@redux-selector/employee';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import { ErrorBase } from 'model/common';
import {
  CreateEmployeeReq,
  EMPLOYMENT_STATUS,
  EMPLOYMENT_TYPE,
  Employee,
  EmployeeWithHistoryRes,
  UpdateEmployeeReq
} from 'model/employee';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { normalizeDateToApi } from 'utils/date';
import { z } from 'zod';
import {
  DATE_API_FORMAT,
  getEmployeeErrorContent,
  optionalNumber,
  optionalString,
  toDatePickerValue
} from '../utils';

const optionalDateSchema = z
  .string()
  .nullable()
  .transform((value) => value?.trim() || '');

const integerStringSchema = (message: string) =>
  z
    .string()
    .trim()
    .refine((value) => !value || /^\d+$/.test(value), {
      message
    });

const decimalStringSchema = (message: string) =>
  z
    .string()
    .trim()
    .refine((value) => !value || /^\d+(\.\d+)?$/.test(value.replaceAll(',', '')), {
      message
    });

const optionalEmailSchema = z
  .string()
  .trim()
  .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
    message: 'Email không đúng định dạng'
  });

const employeeSchema = z.object({
  employeeCode: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập mã nhân sự' }),
  fullName: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập họ và tên' }),
  dateOfBirth: optionalDateSchema,
  gender: z.string().trim(),
  phone: z.string().trim(),
  email: optionalEmailSchema,
  identityNumber: z.string().trim(),
  identityIssueDate: optionalDateSchema,
  identityIssuePlace: z.string().trim(),
  taxCode: z.string().trim(),
  socialInsuranceNo: z.string().trim(),
  permanentAddress: z.string().trim(),
  currentAddress: z.string().trim(),
  departmentCode: z.string().trim(),
  departmentName: z.string().trim(),
  positionCode: z.string().trim(),
  positionName: z.string().trim(),
  managerId: integerStringSchema('Quản lý trực tiếp phải là ID dạng số nguyên'),
  hireDate: optionalDateSchema,
  officialDate: optionalDateSchema,
  resignationDate: optionalDateSchema,
  employmentStatus: z.string().trim(),
  employmentType: z.string().trim(),
  basicSalary: decimalStringSchema('Lương cơ bản phải là số dương'),
  qualifications: z.string().trim(),
  bankName: z.string().trim(),
  bankAccountNumber: z.string().trim(),
  bankAccountName: z.string().trim(),
  note: z.string().trim()
});

export type EmployeeForm = z.infer<typeof employeeSchema>;

interface UseManageEmployeeFormProps {
  isEditMode: boolean;
}

export default function useManageEmployeeForm({ isEditMode }: UseManageEmployeeFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const detailLoading = useSelector(selectEmployeeLoadingDetail);
  const submittingRef = useRef<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee>();
  const [selectedAvatar, setSelectedAvatar] = useState<File>();
  const [selectedContractFile, setSelectedContractFile] = useState<File>();
  const [submitLocked, setSubmitLocked] = useState(false);

  const defaultFormValues: EmployeeForm = useMemo(
    () => ({
      employeeCode: '',
      fullName: '',
      dateOfBirth: '',
      gender: '',
      phone: '',
      email: '',
      identityNumber: '',
      identityIssueDate: '',
      identityIssuePlace: '',
      taxCode: '',
      socialInsuranceNo: '',
      permanentAddress: '',
      currentAddress: '',
      departmentCode: '',
      departmentName: '',
      positionCode: '',
      positionName: '',
      managerId: '',
      hireDate: '',
      officialDate: '',
      resignationDate: '',
      employmentStatus: EMPLOYMENT_STATUS.ACTIVE,
      employmentType: EMPLOYMENT_TYPE.FULL_TIME,
      basicSalary: '',
      qualifications: '',
      bankName: '',
      bankAccountNumber: '',
      bankAccountName: '',
      note: ''
    }),
    []
  );

  const form = useForm<EmployeeForm>({
    mode: 'onTouched',
    defaultValues: defaultFormValues,
    resolver: zodResolver(employeeSchema)
  });

  const onBack = useCallback(() => {
    router.push(ROUTES.EMPLOYEE_LIST);
  }, [router]);

  const fillForm = useCallback(
    (employee: Employee) => {
      form.reset({
        employeeCode: employee.employeeCode || '',
        fullName: employee.fullName || '',
        dateOfBirth: toDatePickerValue(employee.dateOfBirth),
        gender: employee.gender || '',
        phone: employee.phone || '',
        email: employee.email || '',
        identityNumber: employee.identityNumber || '',
        identityIssueDate: toDatePickerValue(employee.identityIssueDate),
        identityIssuePlace: employee.identityIssuePlace || '',
        taxCode: employee.taxCode || '',
        socialInsuranceNo: employee.socialInsuranceNo || '',
        permanentAddress: employee.permanentAddress || '',
        currentAddress: employee.currentAddress || '',
        departmentCode: employee.departmentCode || '',
        departmentName: employee.departmentName || '',
        positionCode: employee.positionCode || '',
        positionName: employee.positionName || '',
        managerId:
          employee.managerId !== undefined && employee.managerId !== null
            ? String(employee.managerId)
            : '',
        hireDate: toDatePickerValue(employee.hireDate),
        officialDate: toDatePickerValue(employee.officialDate),
        resignationDate: toDatePickerValue(employee.resignationDate),
        employmentStatus: employee.employmentStatus || EMPLOYMENT_STATUS.ACTIVE,
        employmentType: employee.employmentType || EMPLOYMENT_TYPE.FULL_TIME,
        basicSalary:
          employee.basicSalary !== undefined && employee.basicSalary !== null
            ? String(employee.basicSalary)
            : '',
        qualifications: employee.qualifications || '',
        bankName: employee.bankName || '',
        bankAccountNumber: employee.bankAccountNumber || '',
        bankAccountName: employee.bankAccountName || '',
        note: employee.note || ''
      });
    },
    [form]
  );

  useEffect(() => {
    if (!isEditMode) return;

    const numericId = Number(id);
    if (!id || Number.isNaN(numericId)) {
      showToast({ type: TYPE_TOAST.ERROR, content: 'Không tìm thấy nhân sự cần cập nhật' });
      onBack();
      return;
    }

    dispatch({
      type: GET_EMPLOYEE_DETAIL,
      payload: {
        body: { id: numericId },
        onSuccess: (response: EmployeeWithHistoryRes) => {
          if (!response.data?.employee) return;
          setSelectedEmployee(response.data.employee);
          fillForm(response.data.employee);
        },
        onFailed: (error?: ErrorBase) => {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getEmployeeErrorContent(error, 'Tải thông tin nhân sự thất bại')
          });
          onBack();
        }
      }
    });
  }, [fillForm, id, isEditMode, onBack]);

  const buildBaseBody = useCallback(
    (data: EmployeeForm): Omit<CreateEmployeeReq, 'employeeCode'> => ({
      fullName: data.fullName.trim(),
      dateOfBirth: optionalString(normalizeDateToApi(data.dateOfBirth)),
      gender: optionalString(data.gender),
      phone: optionalString(data.phone),
      email: optionalString(data.email),
      identityNumber: optionalString(data.identityNumber),
      identityIssueDate: optionalString(normalizeDateToApi(data.identityIssueDate)),
      identityIssuePlace: optionalString(data.identityIssuePlace),
      taxCode: optionalString(data.taxCode),
      socialInsuranceNo: optionalString(data.socialInsuranceNo),
      permanentAddress: optionalString(data.permanentAddress),
      currentAddress: optionalString(data.currentAddress),
      departmentCode: optionalString(data.departmentCode),
      departmentName: optionalString(data.departmentName),
      positionCode: optionalString(data.positionCode),
      positionName: optionalString(data.positionName),
      managerId: optionalNumber(data.managerId),
      hireDate: optionalString(normalizeDateToApi(data.hireDate)),
      officialDate: optionalString(normalizeDateToApi(data.officialDate)),
      resignationDate: optionalString(normalizeDateToApi(data.resignationDate)),
      employmentStatus: optionalString(data.employmentStatus),
      employmentType: optionalString(data.employmentType),
      basicSalary: optionalNumber(data.basicSalary),
      qualifications: optionalString(data.qualifications),
      bankName: optionalString(data.bankName),
      bankAccountNumber: optionalString(data.bankAccountNumber),
      bankAccountName: optionalString(data.bankAccountName),
      note: optionalString(data.note)
    }),
    []
  );

  const buildCreateBody = useCallback(
    (data: EmployeeForm): CreateEmployeeReq => ({
      employeeCode: data.employeeCode.trim(),
      ...buildBaseBody(data)
    }),
    [buildBaseBody]
  );

  const buildUpdateBody = useCallback(
    (employeeId: number, data: EmployeeForm): UpdateEmployeeReq => ({
      id: employeeId,
      ...buildBaseBody(data)
    }),
    [buildBaseBody]
  );

  const onSubmitSuccess = useCallback(
    (content: string) => {
      submittingRef.current = false;
      setSubmitLocked(false);
      showToast({
        type: TYPE_TOAST.SUCCESS,
        content
      });
      onBack();
    },
    [onBack]
  );

  const onSubmitFailed = useCallback((error: unknown, fallback: string) => {
    submittingRef.current = false;
    setSubmitLocked(false);
    showToast({
      type: TYPE_TOAST.ERROR,
      content: getEmployeeErrorContent(error, fallback)
    });
  }, []);

  const onPartialSuccess = useCallback(
    (employeeId: number, content: string) => {
      submittingRef.current = false;
      setSubmitLocked(false);
      showToast({
        type: TYPE_TOAST.ERROR,
        content
      });
      router.push(`${ROUTES.EMPLOYEE_EDIT}?id=${employeeId}`);
    },
    [router]
  );

  const uploadContractAfterAvatar = useCallback(
    (employeeId: number, successContent: string, partialSuccessContent: string) => {
      if (!selectedContractFile) {
        onSubmitSuccess(successContent);
        return;
      }

      dispatch({
        type: UPLOAD_EMPLOYEE_CONTRACT_FILE,
        payload: {
          body: { id: employeeId, file: selectedContractFile },
          onSuccess: () => onSubmitSuccess(successContent),
          onFailed: () => onPartialSuccess(employeeId, partialSuccessContent)
        }
      });
    },
    [onPartialSuccess, onSubmitSuccess, selectedContractFile]
  );

  const uploadFilesAfterSave = useCallback(
    (employeeId: number, successContent: string, partialSuccessContent: string) => {
      if (!selectedAvatar) {
        uploadContractAfterAvatar(employeeId, successContent, partialSuccessContent);
        return;
      }

      dispatch({
        type: UPLOAD_EMPLOYEE_AVATAR,
        payload: {
          body: { id: employeeId, file: selectedAvatar },
          onSuccess: () =>
            uploadContractAfterAvatar(employeeId, successContent, partialSuccessContent),
          onFailed: () => onPartialSuccess(employeeId, partialSuccessContent)
        }
      });
    },
    [onPartialSuccess, selectedAvatar, uploadContractAfterAvatar]
  );

  const onSubmit = useCallback(
    (data: EmployeeForm) => {
      if (submittingRef.current) return;

      submittingRef.current = true;
      setSubmitLocked(true);

      if (isEditMode) {
        const numericId = Number(id);
        if (!id || Number.isNaN(numericId)) {
          onSubmitFailed(undefined, 'Không tìm thấy nhân sự cần cập nhật');
          return;
        }

        dispatch({
          type: UPDATE_EMPLOYEE,
          payload: {
            body: buildUpdateBody(numericId, data),
            onSuccess: (response: EmployeeWithHistoryRes) => {
              const employeeId = response.data?.employee?.id || numericId;
              uploadFilesAfterSave(
                employeeId,
                'Cập nhật nhân sự thành công',
                'Đã cập nhật nhân sự, nhưng tải file thất bại. Vui lòng thử tải lại file.'
              );
            },
            onFailed: (error?: ErrorBase) => onSubmitFailed(error, 'Cập nhật nhân sự thất bại')
          }
        });
        return;
      }

      dispatch({
        type: CREATE_EMPLOYEE,
        payload: {
          body: buildCreateBody(data),
          onSuccess: (response: EmployeeWithHistoryRes) => {
            const employeeId = response.data?.employee?.id;
            if (!employeeId) {
              onSubmitFailed(response, 'Tạo nhân sự thành công nhưng không nhận được ID');
              return;
            }
            uploadFilesAfterSave(
              employeeId,
              'Thêm nhân sự thành công',
              'Đã tạo nhân sự, nhưng tải file thất bại. Vui lòng thử tải lại file.'
            );
          },
          onFailed: (error?: ErrorBase) => onSubmitFailed(error, 'Thêm nhân sự thất bại')
        }
      });
    },
    [buildCreateBody, buildUpdateBody, id, isEditMode, onSubmitFailed, uploadFilesAfterSave]
  );

  return {
    dateApiFormat: DATE_API_FORMAT,
    form,
    detailLoading,
    selectedEmployee,
    selectedAvatar,
    selectedContractFile,
    setSelectedAvatar,
    setSelectedContractFile,
    submitLocked,
    onBack,
    onSubmit
  };
}
