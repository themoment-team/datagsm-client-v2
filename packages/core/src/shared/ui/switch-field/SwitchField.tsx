import { type ComponentProps, type ReactNode, useId } from 'react';

import { cn } from '../../lib';
import { Switch } from '../switch';

interface SwitchFieldProps extends Omit<ComponentProps<'input'>, 'type' | 'role' | 'children'> {
  label: ReactNode;
  description?: ReactNode;
}

// Figma DataGSMv2 "WF/Switch field"(Value)를 옮겼다.
// - 글(이름 + 설명)과 오른쪽 스위치를 한 줄로 묶은 설정이다. 폭은 칸에 맞춰 채운다.
// - 글과 스위치 사이 16, 이름과 설명 사이 4. 이름은 body-16 foreground, 설명은 label-14 foreground-muted. 스위치는 세로 가운데.
// - 줄 전체를 <label>로 감싸서 글을 눌러도 스위치가 바뀐다. FormField는 라벨·입력·안내를 세로로 쌓는 틀이라 쓰지 않았다.
//   감싼 label만으로는 설명까지 접근 이름에 들어가므로 이름은 aria-labelledby, 설명은 aria-describedby로 따로 잇는다.
// - Figma에는 disabled·오류 디자인이 없다. disabled는 스위치 모양만 바뀌고 줄은 커서만 바꾼다.
// 서버 컴포넌트에서도 쓸 수 있게 'use client' 없이 useId로만 연결한다.
// className은 바깥 label(줄)에, 나머지 props(name·checked·onChange·ref 등)는 input에 넘긴다.
// React Hook Form의 register 결과를 그대로 펼쳐 넣을 수 있다: <SwitchField {...register('syncEnabled')} label="…" />
export const SwitchField = ({
  label,
  description,
  className,
  'aria-describedby': ariaDescribedBy,
  ...props
}: SwitchFieldProps) => {
  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;
  const describedBy = [ariaDescribedBy, description && descriptionId].filter(Boolean).join(' ');

  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-4 has-disabled:cursor-not-allowed',
        className,
      )}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-1 wrap-break-word">
        <span id={labelId} className="text-body-16 text-foreground">
          {label}
        </span>
        {description && (
          <span id={descriptionId} className="text-label-14 text-foreground-muted">
            {description}
          </span>
        )}
      </span>
      <Switch aria-labelledby={labelId} aria-describedby={describedBy || undefined} {...props} />
    </label>
  );
};
