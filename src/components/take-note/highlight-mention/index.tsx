'use client';

import React, { useRef, useState } from 'react';
import clsx from 'clsx';
import { Mentions } from 'antd';
import { DataDrivenOptionProps } from 'rc-mentions/lib/Mentions';
import { K_SIZE_0, K_SIZE_1, K_SIZE_2, K_SIZE_3 } from '@constant';
import AppHelperText from 'components/helper-text';
import { DebugUtils } from 'utils/debug-utils';
import { MentionsRef } from 'antd/es/mentions';

interface Props {
  value: string;
  setValue: (text: string) => void;
  error?: string;
  setError?: (text: string) => void;
  prefixes?: string | string[];
  prefixForMethod?: string[];
  onSearch?: (value: string, prefix: string) => void;
  options?: DataDrivenOptionProps[];
  onSelect?: (option: DataDrivenOptionProps, prefix: string) => void;
  classNames?: string;
  classNameContent?: string;
  classNameHighlight?: string;
  row?: number;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  dateParamMethods?: string[];
  dateParams?: string[];
  disabled?: boolean;
  onBlur?: () => void;
}

const DEFAULT_PREFIX = '@';
const HighlightMention = ({
  prefixes = DEFAULT_PREFIX,
  prefixForMethod = [],
  onSearch,
  value,
  setValue,
  error,
  setError,
  options,
  classNames = '',
  classNameContent = '',
  classNameHighlight = '',
  onSelect,
  row = K_SIZE_3,
  dateParamMethods = [],
  dateParams = [],
  onKeyDown,
  disabled = false,
  onBlur
}: Props) => {
  const ID = 'HIGHLIGHT_ID';
  const refMention = useRef<MentionsRef | null>(null);
  const [isFocus, setIsFocus] = useState<boolean>(false);

  const escapedPrefixes = [...prefixes].map((p) => `\\${p}`).join('');
  const escapedPrefixParams = [...prefixes]
    .filter((p) => !prefixForMethod?.includes(p))
    .map((p) => `\\${p}`)
    .join('');
  const escapedPrefixForMethod = [...prefixForMethod].map((p) => `\\${p}`).join('');
  const createDynamicRegex = () => {
    return new RegExp(`([${escapedPrefixes}]\\w+|[\\(\\),]|[${escapedPrefixes}]|[0-9.])`, 'g');
  };
  const regexFuncName = /\$(\w+)\([^)]*$/;

  const renderHighlightedText = (text: string) => {
    const regex = createDynamicRegex();
    const parts = text.split(regex).filter((part) => part !== '');
    DebugUtils.logS(['parts', parts]);
    return parts.map((part, index) => {
      const trimPart = part.trim();
      let isFuncChart = ['(', ')', ','].includes(trimPart);
      const isMention = [...prefixes].some((p) => trimPart.startsWith(p));
      if (!isMention && !isFuncChart) {
        return part;
      }
      let isError = false;
      if (isMention && trimPart.length === K_SIZE_1) {
        isError = true;
      }
      return (
        <span
          key={index}
          className={clsx(
            isError ? 'text-error-500' : isFuncChart ? 'text-color-500' : 'text-link-600',
            classNameHighlight
          )}
        >
          {part}
        </span>
      );
    });
  };

  const regReplaceParam10 = new RegExp(`[${escapedPrefixParams}]\\w+`, 'g');
  const regReplaceParam = new RegExp(`[${escapedPrefixParams}]`, 'g');
  const regReplaceFunc = new RegExp(`[${escapedPrefixForMethod}](\\w+)\\s*\\(([^()]+)\\)`, 'g');
  const validateMathExpression = (input: string) => {
    try {
      // Dọn dẹp chuỗi
      let cleanText = input.trim().replace(/[÷×]/g, (m) => (m === '÷' ? '/' : '*'));

      // Thay thế các hàm $FunctionName(...) thành một phép tính toán học.
      let errorMsg = '';
      cleanText = cleanText.replace(
        regReplaceFunc,
        (match: string, funcName: string, contents: string): string => {
          const args = contents?.split(',')?.filter((arg: string) => arg.trim() !== '');
          const argCount = args.length;

          // Kiểm tra logic dựa trên tên hàm (funcName)
          if (dateParamMethods.includes(funcName)) {
            if (argCount !== K_SIZE_2) {
              errorMsg = `Hàm ${funcName} yêu cầu 2 tham số`;
            } else if (
              args?.some((arg) => !dateParams?.includes(arg.replace(regReplaceParam, '').trim()))
            ) {
              errorMsg = `Hàm ${funcName} yêu cầu tham số là date`;
            }
          }
          return `(${contents})`;
        }
      );
      if (!!errorMsg) {
        return { isValid: false, error: errorMsg };
      }

      cleanText = cleanText.replace(/\$\w+\s*\(([^)]+)\)/g, '($1)');
      cleanText = cleanText.replace(/,/g, ' + ');
      // Thay thế tất cả các biến số 10
      cleanText = cleanText.replace(regReplaceParam10, '10');
      // Thực hiện tính toán thử bằng Function
      const result = new Function(`return ${cleanText}`)();
      return {
        isValid: true,
        result: result,
        processedExpression: cleanText
      };
    } catch (error: any) {
      let vietnameseMsg = 'Lỗi cú pháp toán học';
      if (error instanceof SyntaxError) {
        if (error.message.includes('Unexpected token')) {
          const errChar = error.message.split(' ')?.[K_SIZE_2];
          vietnameseMsg = 'Ký tự không hợp lệ: ' + errChar;
        }
      } else if (error.message.includes('is not defined')) {
        const errMet = error.message.split(' ')?.[K_SIZE_0];
        vietnameseMsg = 'Lỗi cú pháp toán học: ' + errMet;
      } else {
        // Lỗi từ các câu lệnh throw Error ở trên
        DebugUtils.logS(['CHECK_MATH', error.message]);
      }

      return { isValid: false, error: vietnameseMsg };
    }
  };

  const checkValidMath = () => {
    const check = validateMathExpression(value?.trim() || '');
    if (!check.isValid) {
      setError?.(check.error || '');
      return;
    }
    setError?.('');
  };

  const highlightText = document.getElementById(ID);

  return (
    <div>
      <div
        className={clsx(
          'relative rounded-radius-m border',
          classNames,
          disabled
            ? 'border-color-300 bg-color-200'
            : error
              ? 'border-error-500'
              : isFocus
                ? 'border-primary-500'
                : 'border-color-300'
        )}
      >
        <Mentions
          disabled={disabled}
          ref={refMention}
          allowClear
          onKeyDown={(event) => {
            onKeyDown?.(event);
            const { key, currentTarget } = event;
            const { selectionStart, value } = currentTarget;

            const controlKeys = [
              'Backspace',
              'Delete',
              'ArrowLeft',
              'ArrowRight',
              'ArrowDown',
              'ArrowUp',
              'Tab'
            ];
            if (controlKeys.includes(key) || event.ctrlKey || event.metaKey) return;

            // Lấy từ hiện tại dựa trên vị trí con trỏ (quét ngược về khoảng trắng gần nhất)
            const textBeforeCursor = value.substring(K_SIZE_0, selectionStart || K_SIZE_0);
            const words = textBeforeCursor.split(/\s+/);
            const currentWord = words[words.length - K_SIZE_1]; // Từ mà người dùng đang gõ

            // Kiểm tra xem từ hiện tại có bắt đầu bằng prefix không
            const isInsideMention = [...prefixes].some((p) => currentWord.startsWith(p));

            // Kiểm tra tên hàm
            const matchMethod = value.slice(K_SIZE_0, selectionStart).match(regexFuncName);
            if (
              [...dateParamMethods].includes(matchMethod?.[0].match(/\$(\w+)[^$]*$/)?.[1] || '') &&
              prefixForMethod?.includes(key)
            ) {
              if ([...dateParamMethods].includes(matchMethod?.[1] || '')) {
                event.preventDefault();
              } else {
                if (
                  [...dateParamMethods].includes(matchMethod?.[0].match(/\$(\w+)[^$]*$/)?.[1] || '')
                )
                  event.preventDefault();
              }
            }
            // Định nghĩa quy tắc chặn
            if (isInsideMention) {
              // TRONG MENTION: Cho phép chữ, số, và các ký tự toán học/ngoặc
              const allowedInside = /[a-zA-Z0-9(),.+\/*\s_-]/;
              if (!allowedInside.test(key) && !prefixes.includes(key)) {
                event.preventDefault();
              }
            } else {
              // Chỉ cho phép: Số, Dấu cách, Phép tính, Dấu phẩy, Dấu chấm và Prefix
              const allowedOutside = /[0-9(),.+\/*\s_-]/;
              const isStartingPrefix = prefixes.includes(key);

              if (!isStartingPrefix && !allowedOutside.test(key)) {
                event.preventDefault();
              }
            }
          }}
          rows={row}
          rootClassName={clsx(
            'z-10 text-14 text-color-800 caret-color-800 [&_.ant-mentions>textarea]:bg-[transparent] [&_.ant-mentions>textarea]:py-[7px] [&_.ant-mentions>textarea]:pl-[7px] [&_.ant-mentions>textarea]:pr-20 [&_.ant-mentions>textarea]:font-medium [&_.ant-mentions>textarea]:leading-16 [&_.ant-mentions>textarea]:text-[transparent] [&_.ant-mentions>textarea]:[scrollbar-width:none]',
            classNameContent
          )}
          onFocus={() => setIsFocus(true)}
          onBlur={() => {
            setIsFocus(false);
            checkValidMath();
            onBlur?.();
          }}
          variant={'borderless'}
          prefix={prefixes}
          value={value}
          onChange={(text) => {
            setValue(text.replace(/[÷×]/g, (m) => (m === '÷' ? '/' : '*')));
          }}
          onSearch={(value, prefix) => {
            onSearch?.(value, prefix);
          }}
          onSelect={onSelect}
          options={options}
          onScroll={(e) => {
            if (highlightText) {
              highlightText.scrollTop = e.currentTarget.scrollTop;
            }
          }}
          onClear={() => {
            setError?.('');
          }}
        />

        <div
          id={ID}
          className={
            'pointer-events-none absolute inset-y-[7px] left-[7px] right-0 z-[1] overflow-auto whitespace-pre-wrap break-words pe-24 text-14 font-medium leading-16 text-color-800 [scrollbar-width:none]'
          }
        >
          {renderHighlightedText(value || '')}
        </div>
      </div>
      <AppHelperText error={error} />
    </div>
  );
};

export default HighlightMention;
