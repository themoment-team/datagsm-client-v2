import type { ComponentProps } from 'react';

import { cn } from '../../lib';

type SwitchProps = Omit<ComponentProps<'input'>, 'type' | 'role'>;

// Figma DataGSMv2 "WF/Switch"(Value × State)를 옮겼다.
// - 켜고 끄는 설정 하나(44×24 고정). 글과 함께 쓸 때는 SwitchField를 쓴다. 버튼을 토글로 쓰지 않는다.
// - 트랙은 네이티브 checkbox에 role="switch"와 appearance-none으로 모양만 입혔다. 클릭·Space·포커스 표시·disabled는 브라우저 동작 그대로다.
//   Value(On·Off)는 prop이 아니라 input의 checked 상태를 :checked로, State(Disabled)는 :disabled로 그린다.
// - 트랙: Off는 subtle에 1px line 테두리, On은 strong, Disabled·On은 subtle. 테두리 1px은 On에서도 투명하게 남겨 손잡이 위치가 같다.
// - 손잡이(20, 안쪽 여백 2): Off는 왼쪽, On은 오른쪽으로 20 옮긴다. 색은 On on-strong, Off·Disabled·On foreground-muted, Disabled·Off line.
// - Figma에는 움직임이 없어서 손잡이 이동에만 기본 transition을 걸고, 움직임 줄이기 설정이면 끈다.
//   hover·focus 디자인도 없어서 색을 더하지 않았다. 포커스 테두리는 브라우저 기본값이다.
// className은 바깥 span(위치·여백용)에, 나머지 props(name·checked·onChange·ref 등)는 input에 넘긴다.
// React Hook Form의 register 결과를 그대로 펼쳐 넣을 수 있다: <Switch {...register('enabled')} aria-label="…" />
// 접근 이름은 쓰는 쪽이 aria-label, aria-labelledby, <label>로 붙인다.
export const Switch = ({ className, ...props }: SwitchProps) => (
  <span className={cn('relative inline-flex shrink-0', className)}>
    <input
      type="checkbox"
      role="switch"
      className="peer h-6 w-11 cursor-pointer appearance-none rounded border border-line bg-subtle checked:border-transparent checked:bg-strong disabled:cursor-not-allowed disabled:checked:bg-subtle"
      {...props}
    />
    <span
      aria-hidden="true"
      className="pointer-events-none absolute top-0.5 left-0.5 size-5 rounded bg-foreground-muted peer-checked:translate-x-5 peer-checked:bg-on-strong peer-disabled:bg-line peer-disabled:peer-checked:bg-foreground-muted motion-safe:transition-transform"
    />
  </span>
);
