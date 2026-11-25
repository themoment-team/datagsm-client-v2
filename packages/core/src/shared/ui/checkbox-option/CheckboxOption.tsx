import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '../../lib';
import { CheckIcon } from '../icon';

// Figma DataGSMv2 "WF/Checkbox option"(State × Padding)을 옮겼다.
// - 권한 범위·구독 이벤트·동의처럼 체크 칸 하나와 설명 글을 한 줄로 묶은 선택지다. 목록 안 간격(8)은 쓰는 곳이 정한다.
// - padding 16은 목록 안 선택지, none은 모달처럼 안쪽 여백이 없는 곳(가입 동의 등)이라 체크 칸이 내용 왼쪽 끝에 맞는다.
// - 체크 칸은 네이티브 checkbox에 appearance-none으로 모양만 입혔다. 클릭·Space·포커스 표시·disabled는 브라우저 동작 그대로다.
//   State(Checked·Unchecked)는 prop이 아니라 input의 checked 상태를 :checked로 그린다.
// - Figma에는 hover·disabled·focus 디자인이 없어서 색을 더하지 않았다. 포커스 테두리는 브라우저 기본값이다.
const checkboxOptionVariants = cva(
  'flex cursor-pointer items-center gap-4 has-disabled:cursor-not-allowed',
  {
    variants: {
      padding: {
        16: 'px-4',
        none: '',
      },
    },
    defaultVariants: {
      padding: 16,
    },
  },
);

interface CheckboxOptionProps
  extends
    Omit<ComponentProps<'input'>, 'type' | 'children'>,
    VariantProps<typeof checkboxOptionVariants> {
  label: ReactNode;
  scope?: ReactNode;
  description?: ReactNode;
}

// className은 바깥 label(행)에, 나머지 props(name·value·checked·onChange·ref 등)는 input에 넘긴다.
// React Hook Form의 register 결과를 그대로 펼쳐 넣을 수 있다: <CheckboxOption {...register('scopes')} value="neis:read" label="…" />
// 보조 줄은 scope나 description이 있을 때만 그린다(Figma "보조 줄"). 둘 다 있을 때만 사이에 점을 둔다.
export const CheckboxOption = ({
  label,
  scope,
  description,
  padding,
  className,
  ...props
}: CheckboxOptionProps) => (
  <label className={cn(checkboxOptionVariants({ padding }), className)}>
    <span className="relative flex shrink-0">
      <input
        type="checkbox"
        className="peer size-5 cursor-[inherit] appearance-none rounded bg-subtle checked:bg-strong"
        {...props}
      />
      <CheckIcon className="pointer-events-none absolute inset-0.5 hidden text-on-strong peer-checked:block" />
    </span>
    <span className="flex min-w-0 flex-1 flex-col wrap-break-word">
      <span className="text-label-14 text-foreground">{label}</span>
      {(scope || description) && (
        <span className="flex items-center gap-1 text-foreground-muted">
          {scope && (
            <span className="shrink-0 font-mono text-code-12 whitespace-nowrap">{scope}</span>
          )}
          {scope && description && (
            <span aria-hidden="true" className="shrink-0 text-caption-12">
              ·
            </span>
          )}
          {description && <span className="min-w-0 flex-1 text-caption-12">{description}</span>}
        </span>
      )}
    </span>
  </label>
);
