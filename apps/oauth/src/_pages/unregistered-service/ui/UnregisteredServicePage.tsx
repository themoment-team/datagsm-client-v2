import { NotFoundCard } from '@datagsm/core/shared/ui/not-found';

interface UnregisteredServicePageProps {
  // 로그인 요청의 client_id. 사용자가 주소에 직접 넣을 수 있는 값이라 글자로만 보여 준다.
  clientId: string;
}

// Figma "케이스 / OAuth · 등록되지 않은 서비스 (404)"(1760:46843). 이동 버튼은 없다.
// 아직 라우트에 연결하지 않았다. 인가 서버가 등록되지 않은 client_id를 이 화면으로 보내 주는 변경
// (themoment-team/datagsm-server#503)이 나오면 로그인 흐름 작업에서 연결한다.
export const UnregisteredServicePage = ({ clientId }: UnregisteredServicePageProps) => (
  <NotFoundCard
    title="서비스를 찾을 수 없습니다"
    description="이 client_id로 등록된 서비스가 없습니다. 서비스 관리자에게 문의하세요."
  >
    <p className="flex gap-2 font-mono text-code-12 text-foreground-muted">
      <span className="shrink-0">client_id</span>
      <span className="min-w-0 break-all">{clientId}</span>
    </p>
  </NotFoundCard>
);
