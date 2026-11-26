import { cn } from '@datagsm/core/shared/lib';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

// Figma DataGSMv2 "WF/Info title"(Type × State)을 옮겼다.
// 도움말 문서가 연결된 제목이다. 따로 「정보」 버튼을 두지 않고 제목을 누르면 관련 문서를 연다.
// - Type: Title=화면·카드 제목(title-32), Label=항목 이름(label-14), Label muted=지표 이름(label-14, 흐린 글자).
// - Hover: 밑줄만 생긴다. 굵기·위치는 글꼴 값(from-font)을 따른다.
// 같은 화면의 관련 문서 카드에 문서를 띄우는 동작이라 링크가 아니라 <button>이다.
// 제목 구조가 필요하면 쓰는 쪽이 감싼다: <h1><InfoTitle>OAuth 클라이언트</InfoTitle></h1>
const infoTitleVariants = cva(
  'cursor-pointer text-left decoration-from-font [text-underline-position:from-font] hover:underline',
  {
    variants: {
      variant: {
        title: 'text-title-32 text-foreground',
        label: 'text-label-14 text-foreground',
        labelMuted: 'text-label-14 text-foreground-muted',
      },
    },
    defaultVariants: {
      variant: 'title',
    },
  },
);

interface InfoTitleProps extends ComponentProps<'button'>, VariantProps<typeof infoTitleVariants> {}

// form 안에서 눌러도 제출되지 않게 type 기본값을 button으로 둔다.
export const InfoTitle = ({ variant, className, type = 'button', ...props }: InfoTitleProps) => (
  <button type={type} className={cn(infoTitleVariants({ variant }), className)} {...props} />
);
