import { SessionTimer } from '@datagsm/core/entities/auth-session';
import { cn } from '@datagsm/core/shared/lib';
import { Button, buttonVariants } from '@datagsm/core/shared/ui/button';
import { Skeleton } from '@datagsm/core/shared/ui/skeleton';
import type { ComponentProps } from 'react';

import { ScopeList } from '@/entities/scope';
import { withSubjectParticle } from '@/shared/lib';
import { AuthWindow } from '@/shared/ui/auth-window';

type ConsentPageProps =
  | { status: 'loading' }
  | {
      status: 'ready';
      clientName: string;
      scopes: ComponentProps<typeof ScopeList>['scopes'];
      sessionRemainingSeconds: number;
      approving?: boolean;
      onApprove: () => void;
      onDeny: () => void;
    }
  | { status: 'unavailable'; docsUrl: string; statusUrl: string }
  | { status: 'invalid' };

// Figma DataGSMv2 "WF/OAuth modal"의 SSO 동의 상태(Consent·Consent loading·Unavailable·Invalid, node 1037:444·494·532·552)다.
// 화면만 그린다. 데이터와 승인·거부 처리는 쓰는 쪽이 status와 콜백으로 넘긴다.
// 승인 처리 중(approving)은 Figma 설명대로 두 버튼을 막고 승인 라벨을 "처리 중…"으로 바꾼다.
export const ConsentPage = (props: ConsentPageProps) => {
  switch (props.status) {
    case 'loading':
      return (
        <AuthWindow title="접근 권한 동의">
          <div aria-busy="true" className="flex flex-col gap-3">
            <span className="sr-only">권한 정보를 불러오는 중입니다.</span>
            <Skeleton className="h-4 w-60" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" disabled>
              거부
            </Button>
            <Button className="flex-1" disabled>
              승인
            </Button>
          </div>
        </AuthWindow>
      );
    case 'ready':
      return (
        <AuthWindow title="접근 권한 동의">
          <div className="flex flex-col gap-3">
            <p className="text-body-16-regular">
              {withSubjectParticle(props.clientName)} 아래 권한을 요청합니다.
            </p>
            <ScopeList scopes={props.scopes} />
            <SessionTimer remainingSeconds={props.sessionRemainingSeconds} />
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              disabled={props.approving}
              onClick={props.onDeny}
            >
              거부
            </Button>
            <Button className="flex-1" disabled={props.approving} onClick={props.onApprove}>
              {props.approving ? '처리 중…' : '승인'}
            </Button>
          </div>
        </AuthWindow>
      );
    case 'unavailable':
      return (
        <AuthWindow title="서비스 정보를 불러오지 못했습니다">
          <p className="text-body-16-regular text-foreground-muted">
            잠시 뒤 다시 시도하세요.
            <br />
            문제가 계속되면 서버 장애일 수 있습니다. 기술문서나 서버 상태를 확인하세요.
          </p>
          {/* 다른 앱으로 가는 이동이라 Link가 아닌 <a>에 버튼 모양만 입힌다. */}
          <div className="flex gap-2">
            <a
              href={props.docsUrl}
              className={cn(buttonVariants({ variant: 'secondary' }), 'flex-1')}
            >
              기술문서
            </a>
            <a
              href={props.statusUrl}
              className={cn(buttonVariants({ variant: 'secondary' }), 'flex-1')}
            >
              서버 상태 확인
            </a>
          </div>
        </AuthWindow>
      );
    case 'invalid':
      return (
        <AuthWindow title="잘못된 접근입니다">
          <p className="text-body-16-regular text-foreground-muted">
            잘못되었거나 만료된 접근입니다.
            <br />
            서비스에서 다시 로그인하세요.
          </p>
        </AuthWindow>
      );
  }
};
