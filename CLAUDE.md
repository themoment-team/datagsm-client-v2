# DataGSM Client v2

DataGSM 멀티 앱 프런트엔드. **Turborepo 모노레포** — `client`·`admin`·`docs`·`status`·`oauth` 다섯 Next.js 16 앱과 공유 패키지로 구성한다. FSD를 사용하며, 모든 응답과 문서는 한국어로 작성한다.

## 스택

Turborepo + pnpm workspace / Next.js 16 (App Router) / React 19 / TypeScript / Tailwind CSS 4 / TanStack Query v5 / axios / ESLint + Prettier

React Hook Form, zod, shadcn은 현재 workspace 의존성이 아니다. 실제 요구가 생기기 전에는 추가하거나 사용하지 않는다.

## 모노레포 구조

```text
apps/
├── client/   사용자 앱 (포트 3000)
├── admin/    관리자 앱 (포트 3001)
├── docs/     문서 앱 (포트 3002)
├── status/   상태 앱 (포트 3003)
└── oauth/    OAuth 앱 (포트 3004)
packages/
├── core/               @datagsm/core — 공유 하위 레이어 shared·entities (소스 소비)
├── ui/                 @datagsm/ui — 공용 UI·스타일 (prebuilt dist)
├── tailwind-config/    @datagsm/tailwind-config — Tailwind·PostCSS 설정
├── eslint-config/      @datagsm/eslint-config — base·next·react-internal
└── typescript-config/  @datagsm/typescript-config — base·nextjs·react-library
```

- 루트는 Turbo 작업과 Prettier 단일 설정을 관리한다.
- 앱은 독립 배포 단위다. 각 앱이 자기 `public/`, `.env.local`, `next.config.ts`를 소유한다.
- 사용자 요청 없이 앱을 삭제·병합하거나 패키지 scope를 바꾸지 않는다.

## 아키텍처 — Feature-Sliced Design

FSD 레이어를 모노레포 경계로 물리 분리한다.

```text
apps/*/src/            상위 레이어 (앱 고유)
├── app/       Next 라우팅, layout, metadata, Provider (FSD app 겸용)
├── views/     페이지 조합 (FSD pages — Next과 충돌해 개명)
├── widgets/   재사용 페이지 섹션
├── features/  유저 액션, 폼, mutation
├── entities/  앱 전용 도메인 엔티티
└── shared/    앱 전용 공용 유틸

packages/core/src/     하위 레이어 (앱 공유)
├── shared/    API client·server, 메서드 래퍼, 쿠키, config
└── entities/  두 앱 이상이 공유하는 도메인 엔티티

packages/ui/           디자인 시스템 역할의 별도 prebuilt 패키지
```

세그먼트는 필요한 경우에만 만든다: `ui/` 컴포넌트 · `model/` 타입·훅·스키마·상수 · `api/` 요청 함수 · `lib/` 슬라이스 전용 유틸 · `config/` 설정.

- **엔티티 승격 규칙**: 앱 전용 entity는 앱의 `src/entities`에 둔다. 둘 이상의 앱이 실제로 사용할 때만 `@datagsm/core/entities`로 옮긴다.
- **디자인 시스템 vs 도메인 UI**: 범용 primitive는 `@datagsm/ui`, 도메인 UI는 해당 entity 또는 feature의 `ui/`에 둔다.
- 현재 비어 있는 FSD 레이어는 scaffold다. 도메인 코드가 생길 때만 채운다.

### 의존성 규칙

- 앱 내부: `app → views → widgets → features → entities → shared` (위에서 아래로만)
- 앱 → 패키지: `@datagsm/core`·`@datagsm/ui`만 import. **앱끼리 import 금지.**
- `@datagsm/core` 내부: `entities → shared` 방향만.
- 같은 레이어의 다른 비즈니스 slice import 금지.
- 예외: `app`·`shared`는 slice로 나뉘지 않으므로 내부 세그먼트끼리 import할 수 있다. 불가피한 entity 관계만 `entities/<slice>/@x/<consumer>` 공개 API를 사용한다.
- `app/**/page.tsx`는 라우팅과 조합에만 두고, 페이지 구현은 `views`에 둔다.

## 패키지 빌드 모델

- **`@datagsm/core` = 소스 소비.** 별도 build가 없으며 앱의 `next.config.ts`에서 `transpilePackages: ['@datagsm/core']`로 컴파일한다. exports는 소스 `.ts` 경로를 가리켜 RSC 지시문을 보존한다.
- **`@datagsm/ui` = prebuilt.** `tsc`와 Tailwind CLI가 `dist/`의 JS·CSS·d.ts를 만든다. `transpilePackages`에 추가하지 않는다.
- 루트 `turbo dev`는 `@datagsm/ui`의 CSS·컴포넌트 watch 작업을 함께 시작한다. 앱 단독 dev가 필요하면 먼저 `pnpm turbo run build --filter=@datagsm/ui`로 UI 산출물을 만든다.
- eslint·typescript·tailwind-config는 앱 런타임 번들에 포함하지 않는다.

## 네이밍

| 구분                   | 규칙                 | 예                              |
| ---------------------- | -------------------- | ------------------------------- |
| slice 폴더             | kebab-case           | `job-post/`, `like-project/`    |
| 컴포넌트·에셋 컴포넌트 | PascalCase           | `ui/JobCard.tsx`, `Logo.tsx`    |
| 유틸·훅·타입 파일      | camelCase            | `useDebounce.ts`, `cookie.ts`   |
| props                  | PascalCase + `Props` | `JobCardProps`                  |
| 응답·요청 타입         | PascalCase + `Type`  | `JobResponseType`, `JobReqType` |

## Import / Export

- slice마다 `index.ts`로 외부 API를 공개한다. 서버 전용 API는 `index.server.ts`로 분리한다.
- 클라이언트 API는 `@datagsm/core/shared/client`, 서버 API는 `@datagsm/core/shared/server`로만 import한다. `server-only` 모듈을 클라이언트 배럴에 섞지 않는다.
- `@/*`는 **해당 앱의 `src/*`만** 가리킨다. 패키지 코드는 `@datagsm/*` 공개 경로만 사용한다.
- `@datagsm/ui`는 공개 export만 소비한다. UI 유틸이 필요해질 때 `cn`도 이 패키지에서 제공하며, `@datagsm/core`에는 넣지 않는다.
- import 정렬은 ESLint `simple-import-sort`가 관리한다. 수동 정렬 규칙은 `react` → `next/*` → 외부 → `@datagsm/*` → `@/*` → 상대경로다.

```ts
// apps/client/src/entities/job/index.ts
export * from './model/types';
export { default as JobCard } from './ui/JobCard';

// 소비처
import { get } from '@datagsm/core/shared/client';
import { Button } from '@datagsm/ui';
```

## 타입

- 객체 형태는 `interface`, 단순 유니온은 `type`을 사용한다.
- 타입명은 PascalCase다. props는 `...Props`, 나머지는 `...Type`으로 끝낸다.
- `enum`은 사용하지 않는다. 유니온과 `Record` const 객체로 메타데이터를 정의한다.

```ts
export type StatusType = 'PENDING' | 'APPROVED' | 'REJECTED';

const STATUS_META: Record<StatusType, { label: string }> = {
  PENDING: { label: '확인 중' },
  APPROVED: { label: '승인' },
  REJECTED: { label: '거절' },
};
```

## 컴포넌트

화살표 함수와 props 구조 분해를 사용한다. 도메인 컴포넌트는 default export, `@datagsm/ui` primitive는 named export 관례를 유지한다.

```tsx
interface JobCardProps {
  data: JobType;
}

const JobCard = ({ data }: JobCardProps) => {
  // 1. 변수 / 훅
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // 2. 핸들러 · 기타 로직
  const handleClick = () => setIsOpen(true);

  // 3. useEffect
  useEffect(() => {}, []);

  // 4. return
  return <div>{data.title}</div>;
};

export default JobCard;
```

## 스타일링

- 조건부 클래스 또는 외부 `className` 병합이 있을 때만 `cn()`을 사용한다. 정적 클래스는 문자열로 작성한다.
- 클래스명은 가능한 한 하나의 문자열로 유지한다. 반복되는 클래스만 slice의 `ui/styles.ts` 상수로 분리한다.
- 토큰과 공통 CSS는 `@datagsm/tailwind-config`가 소유한다. 컴포넌트에서 전역 토큰을 재정의하지 않는다.
- 현재 앱 `globals.css`와 `@datagsm/ui/styles.css`는 각각 Tailwind preflight를 포함한다. 새 전역 스타일 진입점을 추가하지 않는다.

```tsx
// ❌ 조건이 없는데 cn()
className={cn('flex items-center gap-2')}

// ✅ 정적 클래스
className="flex items-center gap-2"

// ✅ 조건부 클래스 또는 외부 className 병합
className={cn('flex gap-2', isActive && 'bg-primary')}
className={cn('rounded-lg px-4', className)}
```

## API

### 인스턴스

| 용도                    | 모듈                          | baseURL        | 토큰                                                                   |
| ----------------------- | ----------------------------- | -------------- | ---------------------------------------------------------------------- |
| 브라우저                | `@datagsm/core/shared/client` | `/backend`     | 쿠키의 access token을 Bearer 헤더로 전달, 401 시 refresh 후 재시도     |
| 서버(RSC·Server Action) | `@datagsm/core/shared/server` | `API_BASE_URL` | `next/headers` 쿠키의 access token을 Bearer 헤더로 전달, 갱신하지 않음 |

브라우저의 `/backend/*`는 앱별 `next.config.ts` rewrite를 통해 `API_BASE_URL`로 전달된다. Next Route Handler에는 예약된 `/api/*` 경로를 사용한다.

### 메서드 래퍼

`@datagsm/core/shared/client`의 `get / post / patch / put / del`을 사용한다. 응답 인터셉터가 `response.data`를 반환하므로 일반 요청에서 axios 인스턴스를 직접 호출하지 않는다.

```ts
const jobs = await get<JobType[]>(jobUrl.getJobs());
```

`Parameters<typeof ...>` 기반 메서드의 body 인자는 엄격히 추론되지 않는다. 요청 타입은 실제 검증 스키마나 명시적 `...ReqType` 변수로 관리한다.

### URL 상수

URL 상수는 해당 entity의 `api/`에 둔다. 공용 인증 URL만 `@datagsm/core`에 둔다. 서버 API의 실제 path 규약을 따르며, 근거 없이 `/api` 또는 버전 prefix를 추가하지 않는다.

```ts
export const jobUrl = {
  getJobs: () => '/v1/jobs',
  getJob: (id: number) => `/v1/jobs/${id}`,
} as const;
```

## TanStack Query

훅은 `useGet<리소스>` / `usePost<리소스>` / `usePatch<리소스>` / `usePut<리소스>` / `useDelete<리소스>`로 이름 짓는다. Query key는 계층 배열과 `all()`을 사용해 정밀 무효화가 가능하게 한다.

```ts
export const jobQueryKeys = {
  all: () => ['jobs'] as const,
  getJobs: () => ['jobs', 'list'] as const,
  getJob: (jobId?: number) => ['jobs', 'detail', jobId] as const,
} as const;
```

## zod

zod는 아직 설치되지 않았다. 도입이 승인되면 스키마는 `<이름>Schema`, 추론 요청 타입은 `...ReqType`으로 이름 짓는다. 스키마를 도입하기 전에는 이를 전제로 한 폼·API 추상화를 만들지 않는다.

## 검증

변경 후 루트에서 범위에 맞는 검증을 실행한다. Next 설정이 환경값을 요구하므로 build와 type check에는 `API_BASE_URL`이 필요하다.

```bash
API_BASE_URL=http://localhost:8080 pnpm build
pnpm lint
pnpm lint:fsd
API_BASE_URL=http://localhost:8080 pnpm check-types
pnpm format:check
```

특정 앱은 `pnpm --filter client <script>`처럼 실행한다. FSD 경계·공개 API·서버/클라이언트 경계를 변경했다면 최소한 `lint:fsd`, 해당 앱 type check, build를 실행한다.

## 알려진 트레이드오프

- refresh token은 JavaScript가 읽는 쿠키에 저장된다. XSS 시 탈취 위험이 있으므로, 보안 요구가 높아지면 HttpOnly 쿠키와 Route Handler/BFF 경계를 도입한다.
- 서버 API는 토큰을 갱신하지 않고 401을 그대로 던진다. Server Action에서 cookie write가 실제로 필요해질 때만 확장한다.
- refresh 실패 시 공용 클라이언트가 현재 `/signin`으로 이동한다. 이는 앱별 인증 경계와 맞지 않을 수 있으므로 새 앱 정책을 이 코드에 추가하지 말고, 인증 feature/route로 이전할 시점에 함께 정리한다.
- FSD `app` 레이어는 각 앱의 Next `src/app`과 합친다. 라우팅·layout·Provider를 한곳에 유지하기 위한 선택이다.
- FSD `shared`는 `@datagsm/core/shared`(API·lib·config)와 `@datagsm/ui`(UI)로 나뉜다. 소스 소비와 prebuilt라는 빌드 모델 차이 때문이다.
- `@datagsm/ui/styles.css`와 앱 `globals.css`가 각각 Tailwind preflight를 포함해 CSS가 일부 중복된다. 현재는 멱등이지만, UI 컴포넌트가 늘면 단일 preflight 전략을 검토한다.
