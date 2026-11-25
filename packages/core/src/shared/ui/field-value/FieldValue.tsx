import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';

import { cn } from '../../lib';

// Figma DataGSMv2 "WF/Field value"(Type)를 옮겼다. 상세 카드 같은 곳의 읽기 전용 "항목 + 값" 한 쌍이다.
// - 항목: label-14, foreground-muted. 항목과 값 사이 8.
// - Type: Text=일반 값(body-16-regular), Code=ID·주소처럼 코드로 읽는 값(code-12). 둘 다 foreground.
// - 긴 값은 말줄임하지 않고 줄을 바꾼다(Figma word-break: break-word). 공백 없는 긴 값도 칸 안에서 끊긴다.
// - 폭은 부모를 따른다(Figma 240은 예시 폭). 여러 항목 사이 간격은 쓰는 쪽이 정한다.
// 항목 이름과 값의 쌍이라 <dt>·<dd>로 그린다. 여러 개를 묶는 쪽이 <dl>로 감싼다:
// <dl className="flex flex-col gap-6"><FieldValue label="이름">김유찬</FieldValue>…</dl>
const valueVariants = cva('text-foreground', {
  variants: {
    variant: {
      text: 'text-body-16-regular',
      code: 'font-mono text-code-12',
    },
  },
  defaultVariants: {
    variant: 'text',
  },
});

interface FieldValueProps extends VariantProps<typeof valueVariants> {
  label: ReactNode;
  children: ReactNode;
  className?: string;
}

export const FieldValue = ({ label, children, variant, className }: FieldValueProps) => (
  <div className={cn('flex min-w-0 flex-col gap-2 wrap-break-word', className)}>
    <dt className="text-label-14 text-foreground-muted">{label}</dt>
    <dd className={valueVariants({ variant })}>{children}</dd>
  </div>
);
