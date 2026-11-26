import { cn } from '@datagsm/core/shared/lib';
import { FormField } from '@datagsm/core/shared/ui/form-field';
import { ChevronDownIcon } from '@datagsm/core/shared/ui/icon';
import type { ComponentProps, ReactNode } from 'react';

interface SelectFieldProps extends ComponentProps<'select'> {
  label?: ReactNode;
  // 라벨 오른쪽 "정보" 링크 자리(예: <TextButton>정보</TextButton>).
  info?: ReactNode;
  hint?: ReactNode;
  // 있으면 오류 상태다. hint 자리에 이 문구를 경고 아이콘과 함께 보여 주고 select에 aria-invalid를 붙인다.
  error?: ReactNode;
  // 값이 없을 때 보이는 글자(예: '선택하세요'). value가 ""인 비활성 첫 option으로 그린다.
  placeholder?: string;
}

// Figma DataGSMv2 "WF/Input field"(Type=Select)를 네이티브 <select>로 옮겼다.
// 라벨·정보·안내·오류 문구와 그 연결은 FormField가 맡고, 여기서는 선택칸만 그린다.
// - 선택칸: 높이 48, 좌우 16, 1px line 선, 면 없음, 글자 body-16-regular, 오른쪽 끝에 chevron-down 16(foreground-muted).
//   select가 칸 전체를 덮어 화살표를 눌러도 열린다. 화살표 자리(16 + 간격 8)만큼 오른쪽 여백을 더 둔다.
// - State는 select 상태로 그리고 TextField와 같다. Default: placeholder가 골라져 있으면 foreground-muted.
//   Focus: 선 strong 2px. Disabled: 면 subtle, 라벨·값 foreground-muted. Error(Figma는 Text에만 있다): 선 error 2px.
// - placeholder option도 :disabled라서 비활성 면은 has-disabled가 아니라 select:disabled로 고른다.
// - placeholder가 있고 value·defaultValue가 없으면 defaultValue를 ""로 둔다. 비활성 option은 브라우저가 기본으로 고르지 않기 때문이다.
// 서버 컴포넌트에서도 쓸 수 있게 'use client' 없이 쓴다.
// className은 바깥 래퍼에, 나머지 props(name·value·onChange·ref 등)는 select에 넘기고 children은 <option>들이다.
// React Hook Form의 register 결과를 그대로 펼칠 수 있다: <SelectField {...register('grade')} label="학년">...</SelectField>
export const SelectField = ({
  label,
  info,
  hint,
  error,
  placeholder,
  className,
  id,
  disabled,
  'aria-describedby': ariaDescribedBy,
  children,
  value,
  defaultValue,
  ...props
}: SelectFieldProps) => {
  const hasError = Boolean(error);

  return (
    <FormField
      id={id}
      label={label}
      info={info}
      hint={hint}
      error={error}
      disabled={disabled}
      aria-describedby={ariaDescribedBy}
      className={className}
    >
      {(control) => (
        <div
          className={cn(
            'grid h-12 grid-cols-1 rounded border text-foreground-muted has-[select:disabled]:bg-subtle',
            hasError
              ? 'border-error inset-ring-1 inset-ring-error'
              : 'border-line focus-within:border-strong focus-within:inset-ring-1 focus-within:inset-ring-strong',
          )}
        >
          <select
            {...control}
            disabled={disabled}
            value={value}
            defaultValue={
              placeholder !== undefined && value === undefined && defaultValue === undefined
                ? ''
                : defaultValue
            }
            className="col-start-1 row-start-1 min-w-0 cursor-pointer appearance-none truncate bg-transparent pr-10 pl-4 text-body-16-regular text-foreground outline-none *:text-foreground disabled:cursor-not-allowed disabled:text-foreground-muted has-[option[value='']:checked]:text-foreground-muted"
            {...props}
          >
            {placeholder !== undefined && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>
          <ChevronDownIcon className="pointer-events-none col-start-1 row-start-1 mr-4 self-center justify-self-end" />
        </div>
      )}
    </FormField>
  );
};
