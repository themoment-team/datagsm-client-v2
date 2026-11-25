import type { ComponentProps } from 'react';

import { cn } from '../../lib';

// aria-label을 선택 속성에서 필수 속성으로 바꾼다. 아이콘만 있어 이름이 없으면 스크린 리더가 읽을 것이 없다.
interface IconButtonProps extends Omit<ComponentProps<'button'>, 'aria-label'> {
  'aria-label': string;
}

// Figma DataGSMv2 "WF/Icon button"(State=Default·Hover)을 옮겼다. 관련 문서 카드의 접기 버튼 같은 아이콘만 있는 버튼이다.
// - 크기 32 × 32, 모서리 4, 아이콘 16px 가운데. 아이콘은 children으로 바꿔 넣는다.
// - 아이콘 색은 wf/text-muted다. svg가 currentColor를 쓰므로 글자색 클래스로 바꾼다(className="text-foreground").
// - Hover: wf/hover 바탕을 깐다.
// - Disabled는 Figma에 없어 WF/Button처럼 호버 칠을 끄고 아이콘을 wf/text-muted로 둔다.
// form 안에서 눌러도 제출되지 않게 type 기본값을 button으로 둔다.
export const IconButton = ({ className, type = 'button', ...props }: IconButtonProps) => (
  <button
    type={type}
    className={cn(
      'inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded text-foreground-muted not-disabled:hover:bg-hover disabled:cursor-not-allowed disabled:text-foreground-muted [&_svg]:size-4 [&_svg]:shrink-0',
      className,
    )}
    {...props}
  />
);
