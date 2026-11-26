import { type ComponentProps, type ReactNode, useId } from 'react';

import { cn } from '@datagsm/core/shared/lib';
import { FormField } from '@datagsm/core/shared/ui/form-field';

interface TextFieldProps extends ComponentProps<'input'> {
  label?: ReactNode;
  // 라벨 오른쪽 "정보" 링크 자리(예: <TextButton>정보</TextButton>).
  info?: ReactNode;
  hint?: ReactNode;
  // 있으면 오류 상태다. hint 자리에 이 문구를 경고 아이콘과 함께 보여 주고 input에 aria-invalid를 붙인다.
  error?: ReactNode;
  // 입력칸 안 오른쪽에 고정으로 붙는 글자(예: '@gsm.hs.kr'). 화면 리더도 읽도록 aria-describedby에 넣는다.
  suffix?: ReactNode;
  // 입력칸 안 맨 오른쪽(예: 인증 코드 남은 시간 '04:52'). 매초 바뀔 수 있어 aria-describedby에는 넣지 않는다.
  trailing?: ReactNode;
  // 입력칸 오른쪽 바깥(예: Email field의 코드 전송 버튼). 폭 80 고정은 쓰는 쪽이 Button className(w-20)으로 정한다.
  action?: ReactNode;
}

// Figma DataGSMv2 "WF/Input field"(Type=Text)와 "WF/Email field"를 하나로 옮겼다.
// 라벨·정보·안내·오류 문구와 그 연결은 FormField가 맡고, 여기서는 입력칸만 그린다.
// - 입력칸: 높이 48, 좌우 16, 1px line 선, 면 없음, 글자 body-16-regular. 폭은 부모를 채우고 다른 폭은 className으로 정한다.
// - State는 prop이 아니라 input 상태로 그린다.
//   Filled: 값은 foreground, placeholder는 foreground-muted. Focus: focus-within으로 선이 strong 2px.
//   Disabled: 면 subtle, 라벨·값 foreground-muted. Error: 선 error 2px, 오류 문구와 경고 아이콘은 error.
// - 2px 선은 1px border에 1px inset ring을 더해 그린다. border 폭을 바꾸면 글자가 1px 밀리기 때문이다.
// - Figma에 Error + Focus 조합이 없어 오류 중에는 포커스해도 error 선을 유지한다.
// 서버 컴포넌트에서도 쓸 수 있게 'use client' 없이 useId로만 연결한다.
// className은 바깥 래퍼에, 나머지 props(name·value·onChange·ref 등)는 input에 넘긴다.
// React Hook Form의 register 결과를 그대로 펼칠 수 있다: <TextField {...register('email')} label="이메일" />
export const TextField = ({
  label,
  info,
  hint,
  error,
  suffix,
  trailing,
  action,
  className,
  id,
  disabled,
  'aria-describedby': ariaDescribedBy,
  ...props
}: TextFieldProps) => {
  const suffixId = useId();
  const hasError = Boolean(error);
  const describedBy = [ariaDescribedBy, suffix && suffixId].filter(Boolean).join(' ');

  return (
    <FormField
      id={id}
      label={label}
      info={info}
      hint={hint}
      error={error}
      disabled={disabled}
      aria-describedby={describedBy || undefined}
      className={className}
    >
      {(control) => (
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex h-12 min-w-0 flex-1 cursor-text items-center gap-2 rounded border px-4 text-body-16-regular text-foreground-muted has-disabled:cursor-not-allowed has-disabled:bg-subtle',
              hasError
                ? 'border-error inset-ring-1 inset-ring-error'
                : 'border-line focus-within:border-strong focus-within:inset-ring-1 focus-within:inset-ring-strong',
            )}
          >
            <input
              {...control}
              disabled={disabled}
              className="h-full min-w-0 flex-1 text-foreground outline-none placeholder:text-foreground-muted disabled:cursor-not-allowed disabled:text-foreground-muted"
              {...props}
            />
            {suffix && (
              <span id={suffixId} className="shrink-0 whitespace-nowrap">
                {suffix}
              </span>
            )}
            {trailing && <span className="shrink-0 whitespace-nowrap">{trailing}</span>}
          </div>
          {action}
        </div>
      )}
    </FormField>
  );
};
