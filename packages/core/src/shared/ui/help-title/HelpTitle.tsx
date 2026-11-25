import { cn } from '../../lib';
import { Badge } from '../badge';

interface HelpTitleProps {
  synced: boolean;
  onSync: () => void;
  className?: string;
}

export const HelpTitle = ({ synced, onSync, className }: HelpTitleProps) => (
  <button
    type="button"
    onClick={onSync}
    className={cn(
      'relative isolate inline-flex cursor-pointer items-center gap-2 text-left text-title-24 text-foreground before:absolute before:-inset-x-2 before:-inset-y-1 before:-z-10 before:rounded hover:before:bg-hover',
      className,
    )}
  >
    관련 문서 {!synced && <Badge>연동 꺼짐</Badge>}
  </button>
);
