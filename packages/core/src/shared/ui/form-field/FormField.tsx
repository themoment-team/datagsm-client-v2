import { type ReactNode, useId } from 'react';

import { cn } from '@datagsm/core/shared/lib';
import { WarningIcon } from '@datagsm/core/shared/ui/icon';

// FormField가 입력에 붙일 연결 props. 입력 요소에 그대로 펼친다.
interface FormFieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
}

interface FormFieldProps {
  // 입력의 id. 없으면 useId로 만든다.
  id?: string;
  label?: ReactNode;
  // 라벨 오른쪽 "정보" 자리. 무엇을 여는지는 쓰는 쪽이 정하므로 TextButton·TextLink를 그대로 넘긴다.
  info?: ReactNode;
  hint?: ReactNode;
  // 있으면 오류 상태다. hint 자리에 이 문구를 경고 아이콘과 함께 alert로 보여 주고 입력에 aria-invalid를 붙인다.
  error?: ReactNode;
  // 라벨 글자색만 바꾼다. 입력의 disabled는 쓰는 쪽이 입력에 직접 넘긴다.
  disabled?: boolean;
  // 쓰는 곳에서 더 연결할 설명 id. 안내·오류 문구 id보다 앞에 둔다.
  'aria-describedby'?: string;
  className?: string;
  children: (control: FormFieldControlProps) => ReactNode;
}

// Figma DataGSMv2 "WF/Input field"의 공통 틀(라벨 행 + 컨트롤 + 안내·오류 문구)이다.
// - 라벨·컨트롤·안내 문구는 세로로 8 간격. 라벨과 안내 문구는 label-14.
// - 라벨 행: 라벨 옆 4 간격에 정보 자리. 정보는 좌우 8·위아래 2 안쪽 여백을 둔다(Figma info 프레임).
//   비활성이어도 정보 링크는 누를 수 있어야 하므로 라벨만 foreground-muted로 바꾼다.
// - 입력 모양은 쓰는 쪽(TextField, SelectField)이 children으로 그린다. children은 함수이고
//   받은 id·aria-describedby·aria-invalid를 입력에 펼친다. 그래서 register 결과도 입력에 그대로 붙일 수 있다.
// 서버 컴포넌트에서도 쓸 수 있게 'use client' 없이 useId로만 연결한다.
export const FormField = ({
  id,
  label,
  info,
  hint,
  error,
  disabled,
  'aria-describedby': ariaDescribedBy,
  className,
  children,
}: FormFieldProps) => {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const messageId = `${controlId}-message`;
  const hasError = Boolean(error);
  const message = hasError ? error : hint;
  const describedBy = [ariaDescribedBy, message && messageId].filter(Boolean).join(' ');

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {(label || info) && (
        <div className="flex items-center gap-1 self-start">
          {label && (
            <label
              htmlFor={controlId}
              className={cn(
                'text-label-14',
                disabled ? 'text-foreground-muted' : 'text-foreground',
              )}
            >
              {label}
            </label>
          )}
          {info && <span className="flex px-2 py-0.5">{info}</span>}
        </div>
      )}
      {children({
        id: controlId,
        'aria-describedby': describedBy || undefined,
        'aria-invalid': hasError || undefined,
      })}
      {message &&
        (hasError ? (
          <p
            id={messageId}
            role="alert"
            className="flex items-center gap-1 text-label-14 text-error"
          >
            <WarningIcon />
            <span className="min-w-0 flex-1">{message}</span>
          </p>
        ) : (
          <p id={messageId} className="text-label-14 text-foreground-muted">
            {message}
          </p>
        ))}
    </div>
  );
};
