'use client';

import { cn } from '../../lib';
import { Button } from '../button';
import { CopyIcon } from '../icon';

interface CopyValueProps {
  value: string;
  // Figma 속성 "복사". 가린 값은 false로 넘겨 복사 버튼을 숨긴다.
  copyable?: boolean;
  // 버튼의 접근 이름. 화면 글자는 "복사"로 두고 "API 키 복사"처럼 무엇을 복사하는지 알려 준다.
  copyLabel?: string;
  // 복사 결과를 알릴 곳(토스트 등)에 넘긴다. 실패는 권한 거부나 HTTPS가 아닌 주소에서 생긴다.
  onCopy?: () => void;
  onCopyError?: (error: unknown) => void;
  className?: string;
}

// Figma DataGSMv2 "WF/Copy value"를 옮겼다. ID·시크릿·키처럼 복사해 가는 값을 한 줄로 보여 준다.
// - 값 상자: 높이 48, 좌우 16, 1px line 테두리, 글자 code-12. 넘치면 말줄임하고 전체 값은 title로 보여 준다.
// - 복사: WF/Button Ghost. 말줄임과 상관없이 전체 값을 복사한다.
export const CopyValue = ({
  value,
  copyable = true,
  copyLabel,
  onCopy,
  onCopyError,
  className,
}: CopyValueProps) => {
  // clipboard가 없는 환경(HTTPS가 아닌 주소)은 writeText 전에 TypeError가 나므로 함께 catch한다.
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      onCopy?.();
    } catch (error) {
      onCopyError?.(error);
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex h-12 min-w-0 flex-1 items-center rounded border border-line px-4">
        <p title={value} className="min-w-0 flex-1 truncate font-mono text-code-12 text-foreground">
          {value}
        </p>
      </div>
      {copyable && (
        <Button
          variant="ghost"
          className="shrink-0"
          aria-label={copyLabel}
          onClick={() => void copy()}
        >
          <CopyIcon />
          복사
        </Button>
      )}
    </div>
  );
};
