import { cn } from '@datagsm/core/shared/lib';
import { Badge } from '@datagsm/core/shared/ui/badge';

interface HelpTitleProps {
  synced: boolean;
  onSync: () => void;
  className?: string;
}

// Figma DataGSMv2 "WF/Help title"을 옮겼다. 관련 문서 칸의 제목으로, 글자는 title-24, 배지와 간격 8이다.
// - 연동 꺼짐: "연동 꺼짐" 배지를 붙인 버튼이다. 누르면 onSync로 다시 연동하고, hover 때 제목 뒤를 hover 색으로 덧칠한다.
// - 연동됨: 누를 일이 없으므로 버튼이 아니라 제목 글자로 그린다. hover 효과도, 키보드 Tab 순서도 없다.
export const HelpTitle = ({ synced, onSync, className }: HelpTitleProps) =>
  synced ? (
    <span className={cn('inline-flex items-center text-title-24 text-foreground', className)}>
      관련 문서
    </span>
  ) : (
    <button
      type="button"
      onClick={onSync}
      className={cn(
        'relative isolate inline-flex cursor-pointer items-center gap-2 text-left text-title-24 text-foreground before:absolute before:-inset-x-2 before:-inset-y-1 before:-z-10 before:rounded hover:before:bg-hover',
        className,
      )}
    >
      관련 문서 <Badge>연동 꺼짐</Badge>
    </button>
  );
