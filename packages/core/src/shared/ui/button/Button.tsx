import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '../../lib';

// Figma DataGSMv2 "WF/Button"(Style × State)을 옮겼다.
// - 크기: 높이 36, 좌우 14, 아이콘·글자 간격 8, 글자 label-14. 다른 크기와 폭(폼 끝 버튼의 FILL은 w-full)은 className으로 덮어쓴다.
// - Hover: 기본 칠 위에 호버 색을 한 겹 덧칠한다(Primary는 hover-on-strong, 나머지는 hover).
//   같은 색 두 점짜리 그라디언트로 background-image를 깔아 background-color 위에 겹친다.
// - 아이콘: children에 svg를 넣으면 16px로 맞추고 currentColor로 글자색을 따른다.
// - 다른 앱으로 가는 <a>처럼 버튼 모양의 링크는 buttonVariants로 클래스만 가져다 쓴다. hover는 :enabled가 없는 <a>에도 걸리도록 not-disabled로 건다.
export const buttonVariants = cva(
  'inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded px-3.5 text-label-14 whitespace-nowrap disabled:cursor-not-allowed [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-strong from-hover-on-strong to-hover-on-strong text-on-strong not-disabled:hover:bg-linear-to-r disabled:bg-subtle disabled:text-foreground-muted',
        secondary:
          'bg-subtle from-hover to-hover text-foreground not-disabled:hover:bg-linear-to-r disabled:text-foreground-muted',
        ghost: 'text-foreground not-disabled:hover:bg-hover disabled:text-foreground-muted',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
);

interface ButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {}

// form 안에서 눌러도 제출되지 않게 type 기본값을 button으로 둔다. 제출 버튼은 type="submit"을 넘긴다.
export const Button = ({ variant, className, type = 'button', ...props }: ButtonProps) => (
  <button type={type} className={cn(buttonVariants({ variant }), className)} {...props} />
);
