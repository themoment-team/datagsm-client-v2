import Link from 'next/link';

import { cn } from '@datagsm/core/shared/lib';
import { cva } from 'class-variance-authority';
import type { ComponentProps } from 'react';

// Figma DataGSMv2 "WF/Link"(State=Default·Hover, 설명 "글자 버튼은 밑줄")를 옮겼다.
// - 글자 label-14, 글자색 wf/text, 밑줄 굵기·위치는 글꼴 값(from-font)을 따른다.
// - Hover: 글자 둘레(좌우 8, 위아래 4)에 wf/hover 칠과 4px 모서리를 깐다. 레이아웃이 움직이지 않도록
//   ::before로 그리고, isolate로 만든 쌓임 맥락 안에서 -z로 글자 뒤에 둔다.
// - Disabled는 Figma에 없어 WF/Button처럼 글자를 wf/text-muted로 바꾸고 호버 칠을 끈다(button에만 해당).
// TextButton과 TextLink가 같은 모양을 쓴다.
const textButtonVariants = cva(
  'relative isolate inline-flex cursor-pointer items-center text-label-14 whitespace-nowrap text-foreground underline decoration-from-font [text-underline-position:from-font] before:absolute before:-inset-x-2 before:-inset-y-1 before:-z-10 before:rounded not-disabled:hover:before:bg-hover disabled:cursor-not-allowed disabled:text-foreground-muted',
);

type TextButtonProps = ComponentProps<'button'>;

// form 안에서 눌러도 제출되지 않게 type 기본값을 button으로 둔다.
export const TextButton = ({ className, type = 'button', ...props }: TextButtonProps) => (
  <button type={type} className={cn(textButtonVariants(), className)} {...props} />
);

type TextLinkProps = ComponentProps<typeof Link>;

// 다른 화면으로 이동하는 글자 버튼(회원가입, 비밀번호 찾기 등)은 TextLink를 쓴다.
export const TextLink = ({ className, ...props }: TextLinkProps) => (
  <Link className={cn(textButtonVariants(), className)} {...props} />
);
