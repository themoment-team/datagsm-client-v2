import { type ComponentProps, type ReactNode, useId } from 'react';

import { cn } from '@datagsm/core/shared/lib';
import { Badge } from '@datagsm/core/shared/ui/badge';
import { Button } from '@datagsm/core/shared/ui/button';
import { CloseIcon } from '@datagsm/core/shared/ui/icon';

interface AlertPanelProps extends Omit<ComponentProps<'section'>, 'title' | 'children'> {
  title: string;
  step?: string;
  children?: ReactNode;
  actions: ReactNode;
  onClose?: () => void;
}

// WF/Alert는 오른쪽 카드 자리에 들어가는 인라인 영역이다.
// 모달로 띄울 때는 core shared/ui/dialog가 Base UI Popup을 이 section으로 그린다(role, ref 등이 props로 들어온다).
// 접근 이름은 언제나 이 제목이 되도록 aria-labelledby를 props 뒤에 둔다. 그래서 Dialog는 Base UI Title을 따로 쓰지 않는다.
export const AlertPanel = ({
  title,
  step,
  children,
  actions,
  onClose,
  className,
  ...props
}: AlertPanelProps) => {
  const titleId = useId();

  return (
    <section
      {...props}
      aria-labelledby={titleId}
      className={cn('flex w-full max-w-140 flex-col gap-8 bg-glass-fill p-6', className)}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h2
            id={titleId}
            className="max-w-90 min-w-0 text-title-32 wrap-break-word text-foreground"
          >
            {title}
          </h2>
          {step && <Badge className="shrink-0">{step}</Badge>}
        </div>
        {onClose && (
          <Button variant="ghost" className="shrink-0" onClick={onClose}>
            <CloseIcon />
            닫기
          </Button>
        )}
      </header>
      {children != null && (
        <div className="flex min-w-0 flex-col gap-6 text-body-16-regular text-foreground-muted">
          {children}
        </div>
      )}
      <footer className="flex gap-2 [&>*]:flex-1">{actions}</footer>
    </section>
  );
};
