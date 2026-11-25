import { type ReactNode, useId } from 'react';

import { cn } from '../../lib';
import { Badge } from '../badge';
import { Button } from '../button';
import { CloseIcon } from '../icon';

interface AlertPanelProps {
  title: string;
  step?: string;
  children?: ReactNode;
  actions: ReactNode;
  onClose?: () => void;
  className?: string;
}

// WF/Alert는 오른쪽 카드 자리에 들어가는 인라인 영역이다.
export const AlertPanel = ({
  title,
  step,
  children,
  actions,
  onClose,
  className,
}: AlertPanelProps) => {
  const titleId = useId();

  return (
    <section
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
