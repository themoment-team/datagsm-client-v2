# DataGSM Client v2

외부 DataGSM 백엔드를 쓰는 Next.js App Router 프런트엔드 모노레포다(pnpm + Turborepo). 코드는 Feature-Sliced Design(FSD) 공식 Next.js 구조를 따른다. 응답과 문서는 한국어로 쓰고, 식별자·파일 이름·커밋 타입은 영어로 둔다.

## 이 파일과 스킬

- 일반 패턴(FSD 배치, 네이밍, 데이터 조회·폼, Tailwind 사용법)은 하네스 스킬에 있다. 해당 작업을 하기 전에 아래 표의 스킬을 읽는다.
- 이 파일에는 이 레포에서만 정한 것과 스킬 기본값을 뒤집는 결정만 적는다. 스킬과 이 파일이 다르면 이 파일을 따른다.
- ESLint·Prettier·steiger·tsc가 검사하는 규칙은 도구 결과를 근거로 판단한다. 버전은 `pnpm-workspace.yaml`의 `catalog`, 앱 포트는 각 앱 `package.json`의 `dev` 스크립트, 변수 목록은 각 앱 `src/shared/config/env.ts`가 정한다.

| 스킬                      | 쓰는 때                                                         |
| ------------------------- | --------------------------------------------------------------- |
| `nextjs-fsd-architecture` | 레이어·slice를 정하거나 구조, 앱과 core 사이 공유를 바꿀 때     |
| `react-conventions`       | 파일·타입 이름, 컴포넌트 모양을 정할 때                         |
| `data-and-forms`          | 서버 데이터 조회·변경, 폼을 만들 때                             |
| `tailwind-shadcn`         | Tailwind 클래스, 토큰, 공통 UI 위치를 정할 때                   |
| `react-best-practices`    | React·Next 코드의 렌더링·데이터 요청·번들 성능을 볼 때          |
| `git-commit`              | 변경을 논리 단위로 나눠 커밋할 때                               |
| `write-pr`                | 커밋을 바탕으로 PR을 만들 때                                    |
| `resolve-reviews`         | PR 리뷰 코멘트를 판단하고 반영할 때                             |
| `ponytail`                | 가장 작은 변경으로 해결하고 과한 설계를 줄일 때                 |
| `ponytail-audit`          | 레포 전체의 버그·보안·지울 코드를 점검할 때(코드는 바꾸지 않음) |
| `humanizer`               | 문서·PR 본문 같은 글에서 AI 문투를 걷어낼 때                    |

스킬은 `.agents/skills/`(Codex)와 `.claude/skills/`(Claude Code)에 있다. 도구가 못 잡는 컨벤션 기준으로 변경을 검토할 때는 `frontend-convention-validator` 에이전트를 쓴다.

## 앱과 패키지

| 위치                         | 역할                                                       |
| ---------------------------- | ---------------------------------------------------------- |
| `apps/client`                | 사용자 웹. 로그인이 필요하다                               |
| `apps/admin`                 | 관리자 웹. 로그인이 필요하고 메뉴를 따로 둔다              |
| `apps/docs`                  | 문서                                                       |
| `apps/status`                | DataGSM 서버들의 상태 확인. DataGSM API를 호출하지 않는다  |
| `apps/oauth`                 | 인가 서버의 로그인 화면                                    |
| `apps/projects`              | 프로젝트                                                   |
| `packages/core`              | 앱이 공유하는 FSD 레이어(shared·entities·features·widgets) |
| `packages/tailwind-config`   | 디자인 토큰·글꼴(`shared-styles.css`), PostCSS             |
| `packages/eslint-config`     | `base`, `next`(앱), `react`(core)                          |
| `packages/typescript-config` | `base`, `nextjs`(앱), `react-library`(core)                |

- 앱은 독립 배포 단위다. 사용자 요청 없이 앱을 삭제·병합하거나 패키지 scope(`@datagsm/*`)를 바꾸지 않는다.
- 기존 라우트와 공개 API를 사용자 요청 없이 지우거나 이름을 바꾸지 않는다.

## 명령과 검증

프로젝트 루트에서 실행한다. 루트 스크립트가 모든 앱과 패키지에 대해 돈다. CI(`.github/workflows/ci.yml`)도 아래 순서로 전부 실행한다.

| 명령                | 상태                                                        |
| ------------------- | ----------------------------------------------------------- |
| `pnpm lint`         | verified (exit 0, 2026-11-18)                               |
| `pnpm lint:fsd`     | verified (exit 0, 2026-11-18)                               |
| `pnpm format:check` | verified (exit 0, 2026-11-18)                               |
| `pnpm check-types`  | verified (exit 0, 2026-11-18)                               |
| `pnpm test`         | verified (exit 0, 2026-11-18)                               |
| `pnpm test:e2e`     | unverified. 3000~3005 포트가 모두 비었을 때 실행해 확인한다 |
| `pnpm build`        | verified (exit 0, 2026-11-18)                               |

- `check-types`, `test`, `test:e2e`, `build`, `dev`는 환경 변수가 있어야 돈다. 앱 폴더의 `.env.local`이 있으면 거기서 읽고, 없으면 `ci.yml`의 `env` 블록 값(자리 표시용)을 명령 앞에 붙인다.
- E2E는 처음에 `pnpm exec playwright install --with-deps chromium`이 필요하다. Playwright가 앱을 빌드해 띄운 뒤 돈다.
- `lint:fsd`는 루트 `steiger.config.mjs`로 각 앱 `src`와 `packages/core/src`를 `--fail-on-warnings`로 검사한다. turbo 작업이 아니라서 turbo 옵션을 받지 않는다.
- 범위에 맞게 고른다. FSD 경계, 공개 API, 서버·클라이언트 경계를 바꿨다면 최소한 `lint:fsd`, `check-types`, `build`를 돌린다.
- 동작을 바꾸면 그 동작을 확인하는 테스트를 함께 고치거나 추가한다. CI에는 백엔드가 없으므로 E2E는 API 응답 없이 통과하는 화면(홈, 404, 보안 헤더, 사이드바 등)만 다룬다.
- 실행하지 못했거나 실패한 검사는 그대로 보고한다.

## 생성 파일과 동기화 파일

손으로 고치지 않는다.

| 파일                                                                                                   | 원본                                                           | 다시 만드는 방법                  | 검사                                |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- | --------------------------------- | ----------------------------------- |
| `pnpm-lock.yaml`                                                                                       | 각 `package.json`, `pnpm-workspace.yaml`의 `catalog`           | `pnpm install`                    | CI `pnpm install --frozen-lockfile` |
| `.agents/`, `.codex/`, `.gemini/`, `.claude/{skills,agents,hooks,settings.json}`, `steiger.config.mjs` | 팀 하네스 레포(themoment-ai-harness-sync), `.harness/sync.yml` | 하네스 레포에 반영하면 동기화된다 | 하네스 동기화                       |
| `next-env.d.ts`, `.next/`, `.turbo/`, `*.tsbuildinfo`, `test-results/`                                 | Next·turbo·tsc·Playwright                                      | 해당 명령 실행                    | `.gitignore`(커밋하지 않음)         |

## 스킬과 다른 이 레포의 결정

스킬 본문이나 예시가 아래와 다르면 아래를 따른다.

- **core가 제공하는 것은 앱에서 다시 내보내지 않는다.** `ApiError`, `ApiResponse`, `getQueryClient` 등은 쓰는 곳에서 `@datagsm/core/...`로 바로 가져온다. 앱의 `@/shared/api`는 앱마다 값이 다른 것(`get`·`post` 등 HTTP 메서드, axios 인스턴스, `authRoutes`)만 내보낸다. 스킬 예시의 `import { ApiError, getQueryClient } from '@/shared/api'`는 이 레포에서 쓰지 않는다.
- **응답은 감싸져 온다.** DataGSM 서버 응답은 `{ status, code, message, data }`이고 `status`는 `"200 OK"` 같은 문자열이다. 응답 타입은 `ApiResponse<T>`, `data`가 없는 메시지 응답(삭제 등)은 `ApiMessageResponse`로 적는다(`get<ApiResponse<User>>(url)`). 예외: 엑셀 내보내기(`/v1/*/exports/excel`)는 파일을 그대로 줘서 `get<Blob>(url, { responseType: 'blob' })`, 반환값이 없는 API는 본문 없는 204라 `post<void>`로 받는다.
- **API 오류는 `status`로 분기한다.** `ApiError.code`는 서버 오류 코드가 아니라 axios 오류 코드(`ERR_NETWORK`, `ECONNABORTED` 등)이고, 서버 본문의 `code`는 HTTP 상태와 같은 숫자라 담지 않는다. 화면에서는 `error instanceof ApiError`로 좁힌 뒤 `status`로 분기하고 서버 문구는 `message`로 보여 준다. 응답이 없는 실패는 `status: 0`이다. `data-and-forms` 폼 예시처럼 `error.code`를 서버 오류 코드로 보고 필드에 연결하지 않는다.
- **API 모킹(MSW)은 두지 않는다.** 개발은 `API_BASE_URL`로 실제 DataGSM 개발 서버에 붙는다. 컴포넌트 테스트는 `vi.mock`으로 API 함수를 바꾼다. 스킬의 모킹 관련 절은 이 레포에 해당하지 않는다.
- **토큰은 `shared-styles.css`만 소유한다.** 앱 `globals.css`에서 `@theme` 값을 덮어쓰지 않는다. 토큰은 Figma DataGSMv2 "WF · 파운데이션"의 Light·Dark 모드를 옮긴 것이고, Tailwind 기본 색 팔레트를 지웠으므로 색은 그 토큰만 쓴다. 기본은 Light이고 Dark 값은 `[data-theme='dark']`가 같은 변수를 덮어쓰므로 `dark:` 변형을 쓰지 않는다. 색 토큰을 더하면 두 곳에 함께 넣는다.
- **테마 선택은 모든 앱이 쿠키 `theme` 하나를 함께 쓴다.** core `features/theme-toggle`이 관리한다. localStorage는 주소마다 따로라 앱을 오가면 테마가 풀리기 때문이다. 배포에서는 `Domain=datagsm.kr`, 로컬에서는 host-only로 저장한다(쿠키는 포트를 구분하지 않는다). 인증 쿠키는 host-only로 두지만 테마는 민감하지 않은 값이라 범위를 넓혔고, 읽을 때 `light`·`dark` 말고는 무시한다. 루트 layout의 `ThemeProvider`가 그리기 전에 `<html data-theme>`을 맞추는 인라인 스크립트를 넣으므로 `<html>`에 `suppressHydrationWarning`이 필요하다.
- **간격·모서리·높이 토큰은 만들지 않는다.** Figma 값이 Tailwind 기본 스케일과 같다(예: 14px = `3.5`, 4px 모서리 = `rounded`, 버튼 36px = `h-9`). "없는 토큰은 `@theme`에 먼저 추가"는 색·글자에만 적용한다.
- **글자는 텍스트 스타일 토큰 하나로 정한다.** `text-title-32`, `text-body-16` 등(코드는 `font-mono text-code-12`)이 크기·줄 높이·자간·굵기를 함께 정한다. `text-2xl`, `font-semibold` 같은 기본 크기·굵기 클래스를 섞지 않는다.
- **글꼴은 `shared-styles.css`가 불러온다.** Pretendard(`font-sans`)와 JetBrains Mono(`font-mono`)를 npm 패키지의 unicode-range 분할 CSS로 불러온다. 루트 레이아웃이나 `next/font`로 글꼴을 설정하지 않는다. `next/font/local`은 unicode-range로 나누지 못해 Pretendard 전체를 미리 받게 된다.
- **별도 UI 패키지를 만들지 않는다.** 도메인 없는 공용 UI는 core `shared/ui`에 컴포넌트별 폴더로 둔다. 팀 디자인 시스템(themoment-design-system)이 준비되면 그때 옮긴다.

## 레이아웃과 앱 간 이동

- 모든 앱의 레이아웃(왼쪽 사이드바 + 본문)은 core `widgets/app-shell`의 `AppShell`이다. 앱은 `_app/layout`에서 지금 앱(`currentApp`), 앱 주소, 메뉴 목록만 넘긴다.
- 공통 배경은 core `shared/ui/iridescence-background`의 `IridescenceBackground`(WebGL)다. `AppShell`이 깔고, `AppShell`을 쓰지 않는 oauth는 루트 레이아웃에서 깐다. client 랜딩(`/`)만 사이드바와 배경을 쓰지 않는다. 그래서 client는 `AppShell`을 루트 레이아웃이 아니라 `app/(shell)/layout.tsx`에 두고, 랜딩 `app/page.tsx`만 그 밖에 둔다. 새 페이지는 `app/(shell)` 아래에 만든다. 없는 주소는 루트 `app/not-found.tsx`가 받으므로, 404에도 사이드바가 남도록 그 안에서 `ShellLayout`으로 감싼다. 오류 화면은 `app/(shell)/error.tsx`가 받는다.
- client·docs·status·projects는 core의 `USER_SIDEBAR_ITEMS`를 함께 쓴다. admin은 `apps/admin/src/_app/config`의 관리자 메뉴와 `badge="관리자"`를 넘긴다. 관리자 메뉴는 모두 admin 안 경로라 admin은 `APP_*_URL`을 받지 않는다.
- 같은 앱 메뉴는 `Link`, 다른 앱 메뉴는 그 앱 주소로 가는 `<a>`다. 다른 앱은 다른 배포라서 `Link`의 앱 안 이동과 prefetch가 동작하지 않는다.
- 페이지는 화면 높이(`h-dvh`)로 고정되고 페이지 자체는 스크롤하지 않는다. 콘솔 화면의 본문은 core `shared/ui/panel-layout`의 `PanelLayout`(Figma 칸 구성 중 하나를 `layout`으로 고른다)과 `Panel`로 나누고, 칸마다 제목을 포함한 내용이 따로 스크롤된다. 칸 폭은 Figma 1920 값의 비율이고, 1536(15.6인치 FHD, 125% 배율)보다 좁으면 본문만 가로로 스크롤된다. 화면마다 grid나 고정 폭을 따로 쓰지 않는다.
- 스크롤 영역은 core `shared/ui/scroll-area`의 `ScrollArea`(Base UI 래퍼)로 만든다. 앱에서 `@base-ui/react`나 `overflow-auto`로 직접 만들지 않는다. 안쪽 스크롤 영역 끝에 닿은 휠은 바깥 칸으로 이어지는 것이 의도된 동작이라 `overscroll-behavior`로 막지 않는다.

## API 연결

- 브라우저 요청은 `@/shared/api`, 서버(RSC, Server Function) 요청은 `@/shared/api/index.server`의 `get / post / patch / put / del`로 보낸다. 서버 쪽은 `server-only`라서 클라이언트 코드에서 import하면 빌드가 실패한다.
- 브라우저 인스턴스의 baseURL은 `/backend`다. 각 앱 `next.config.ts` rewrite가 `API_BASE_URL`로 넘기고, client·admin은 `proxy.ts`가 먼저 받아 토큰을 붙인다. `/api/*`는 Route Handler용으로 비워 둔다.
- 브라우저의 401은 `setOnUnauthorized(redirectToLogin)`가 로그인을 다시 시작한다(client·admin의 `shared/api/client.ts`). 서버 인스턴스에는 사용자별 훅을 등록하지 않는다.

## 인증

로그인이 필요한 앱은 client와 admin뿐이다. 로그인 화면은 oauth 앱이 띄우고, client·admin은 인가 서버의 OAuth client 하나를 함께 쓴다. 기준 문서는 https://docs.datagsm.kr/oauth 이다. 공용 코드는 `@datagsm/core/shared/auth`(브라우저)와 `@datagsm/core/shared/auth/server`(Route Handler, Proxy, 서버 인스턴스)에 있고, 앱은 검증한 env를 넘겨 `createAuthRoutes`·`createAuthProxy`를 만들기만 한다.

- 흐름은 Authorization Code + PKCE S256이다: `GET /api/login?returnTo=` → 인가 서버 → `GET /api/callback`에서 Next 서버가 code를 토큰으로 바꾼다. `returnTo`는 같은 앱의 `/` 경로만 허용한다(open redirect 방지).
- `scope`는 보내지 않는다. client에 등록되지 않은 값을 보내면 `invalid_scope`로 로그인이 막힌다. 등록된 범위를 확인한 뒤에만 명시한다.
- 토큰은 앱 도메인의 host-only httpOnly 쿠키(SameSite=Lax)에만 둔다. 브라우저 코드는 토큰을 읽지 않는다. 쿠키 이름과 만료는 core `shared/auth/cookies.ts`가 정한다.
- 백엔드는 `Authorization: Bearer`만 읽는다. 브라우저 요청은 `proxy.ts`가 `/backend/*`에서 쿠키를 헤더로 바꾸고(쿠키는 넘기지 않음), 서버 요청은 `withAccessToken`이 `cookies()`에서 읽어 붙인다.
- 각 앱 `proxy.ts`의 matcher는 보호할 경로를 직접 적는 allowlist다. 로그인이 필요한 페이지를 만들면 matcher에 더한다. "…을 뺀 전부" 같은 제외 패턴은 쓰지 않는다. matcher 밖의 페이지는 토큰을 갱신하지 않는다.
- CSRF: 쿠키가 자동 전송되므로 `/backend/*`의 상태 변경 요청과 `POST /api/logout`은 `Origin`이 앱 주소와 다르면 403이다.
- 갱신은 `proxy.ts`가 한다. refresh token은 갱신마다 바뀐다(회전). `invalid_grant`·401이면 토큰 쿠키를 지우고 다시 로그인하게 하고, 429·네트워크 오류면 refresh token을 남겨 다음에 다시 시도한다.
- 로그아웃은 core `features/logout`의 `LogoutButton` 하나로 한다. 브라우저가 인가 서버 `POST /v1/oauth/logout`(`credentials: 'include'`)으로 SSO 세션을 끝낸 뒤, 실패하더라도 이 앱의 `POST /api/logout` form을 제출해 토큰 쿠키를 지운다. 사이드바에는 `AppShell`의 `idpLogoutUrl`(서버에서 `buildIdpLogoutUrl(env)`로 만든다)을 넘긴 앱(client, admin)에만 버튼이 생긴다. prefetch·이미지 태그로 실행될 수 있으므로 GET 링크로 만들지 않는다. 다른 앱에 이미 저장된 토큰은 만료나 다음 갱신 실패까지 남는다. 로컬(`localhost` → stage 인가 서버)은 다른 사이트라 SameSite=Lax 세션 쿠키가 실리지 않아 SSO 세션이 남는다.

## 환경 변수

- 서버 환경 변수는 각 앱 `src/shared/config/env.ts` 한 곳에서 검증하고 `env`로 꺼내 쓴다. `env`는 서버에서만 읽는다.
- 여러 앱이 함께 쓰는 변수는 core `shared/config`에 스키마와 `read…Env(process.env)` 도우미로 둔다(`AppEnvSchema`, `AppUrlsEnvSchema`, `OauthEnvSchema`). 앱 전용 변수는 `AppEnvSchema.extend({...})`로 더한다.
- `next.config.ts`가 `env`를 import하므로 필수 변수가 없으면 `dev`, `check-types`, `build`가 바로 실패한다.
- 새 변수를 추가하면 한 변경에서 함께 고친다: 스키마(공통이면 core, 앱 전용이면 앱의 `extend`)와 그 `env.test.ts`, 앱 `.env.example`, 앱 `playwright.config.ts`의 `webServer.env`, `ci.yml`의 `env`, `turbo.json` 작업의 `env`, 이 파일, README.
- 비밀값(`OAUTH_CLIENT_SECRET`)과 공개하지 않는 주소(status의 `STATUS_*_BASE_URL`)는 `.env.local`과 Vercel에만 넣는다. `.env.example`과 CI에는 자리 표시용 값만 둔다.
- client·admin은 인가 서버의 client에 앱마다 `<앱 주소>/api/callback`을 redirect URI로 등록해야 로그인이 된다.

## 보안 헤더와 배포

- 모든 앱 `next.config.ts`의 `headers()`가 모든 경로에 기본 보안 헤더를 붙이고 `X-Powered-By`를 끈다. CSP는 아직 없다. 헤더를 바꾸거나 CSP를 더하면 모든 앱의 `e2e/security-headers.spec.ts`도 고친다.
- 모든 앱의 `next.config.ts`는 같게 유지하고 공통 부분을 바꾸면 모든 앱에 똑같이 고친다. status만 `API_BASE_URL`을 쓰지 않아 `/backend` rewrite가 없다.
- 배포는 Vercel이다. 앱마다 프로젝트를 하나씩 두고 Root Directory를 `apps/<앱>`으로, 앱마다 서브도메인으로 배포한다. `API_BASE_URL`은 rewrite에 들어가 빌드 시 고정되므로 값을 바꾸면 다시 배포한다. Docker 설정은 두지 않는다.
- 앱을 추가하거나 지우면 앱 폴더 밖의 앱 목록도 고친다: 루트 `package.json`의 `lint:fsd`, `.lintstagedrc.mjs`, `.prettierrc` overrides, 사이드바로 오가는 앱이면 core의 `AppId`·`AppUrlsEnvSchema`·사용자 메뉴와 CI·Playwright의 `APP_*_URL`, 이 파일과 README. 새 앱은 기존 앱을 복제한 뒤 `package.json` 이름·포트, `playwright.config.ts` 포트, `layout.tsx` 메타, 홈 제목과 그 테스트를 바꾸고, 마지막에 복제한 앱 이름으로 `rg`해 빠진 곳을 찾는다.

## 함정

겪었거나 코드가 막고 있는 문제다. 무엇을 잃는지와 함께 적는다.

- **turbo 캐시가 오류를 가린다.** 한 앱만 고친 뒤 다시 돌리면 다른 패키지는 캐시된 통과를 보여 준다. 형제 앱의 같은 import 정렬 오류를 놓친 적이 있다. 고친 뒤에는 `pnpm lint --force`처럼 `--force`로 다시 돌리고, 스크립트로 import를 더했다면 건드린 모든 앱에서 `pnpm exec eslint --fix`를 돌린다.
- **`.env.local`이 "변수 없이도 된다"는 확인을 오염시킨다.** Next는 셸에서 변수를 지워도 `.env.local`을 읽는다. 로컬 빌드 통과는 그 변수가 필요 없다는 증거가 아니다. 단위 테스트와 CI(env 파일 없음)로 확인한다.
- **E2E 포트가 고정이다.** `playwright.config.ts`가 포트를 고정하고 `reuseExistingServer: false`라서 같은 포트에 dev 서버가 떠 있으면 모든 E2E가 "already used"로 실패한다. 실행 전에 `lsof -nP -iTCP:3000-3005 -sTCP:LISTEN`으로 확인하고, 다른 사람이 띄운 서버는 끄지 않는다.
- **한 페이지만 쓰는 slice는 `lint:fsd`가 실패한다.** steiger의 `insignificant-slice` 경고가 `--fail-on-warnings`로 오류가 된다. 한 페이지만 쓰는 코드는 그 페이지의 세그먼트(`_pages/<page>/{api,model,config,ui}`)에 두고, 두 번째 소비처가 생길 때 entities나 core로 옮긴다. `apps/status/src/_pages/home`이 그 예다.
- **새 `--text-*` 토큰은 core `shared/lib/cn.ts` 목록에도 넣는다.** tailwind-merge가 모르는 `text-<이름>`을 글자색으로 보고 다른 `text-*`와 병합할 때 지운다. `cn.test.ts`가 `shared-styles.css`와 목록이 어긋나면 실패한다.
- **외부 주소로 가는 next.config rewrite는 proxy가 붙인 `Set-Cookie`를 버린다.** 그래서 client·admin의 `/backend/*`는 `proxy.ts`가 직접 rewrite한다. 이 경로를 next.config rewrite로 되돌리면 갱신한 토큰이 브라우저에 저장되지 않는다.
- **같은 refresh token으로 동시에 갱신하면 인가 서버가 토큰을 지운다.** 재사용으로 판단하기 때문이다. 갱신은 반드시 core `oauth.ts`의 `refreshTokens`로 해서 한 번으로 합친다. 합치기는 서버 인스턴스 하나 안에서만 되므로 인스턴스가 여럿이면 드물게 다시 로그인하게 된다.
- **요청 때마다 외부를 호출하는 서버 컴포넌트는 `await connection()`이 필요하다.** 없으면 `next build`가 prerender하면서 빌드 중에 외부를 호출하고 그 결과를 굳힌다.
- **응답 속도를 재는 요청은 캐시하지 않는다.** `fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(...) })`로 보내고 fetch 앞뒤만 잰다. 캐시가 필요해지면 측정 함수 전체(값과 측정 시각)를 캐시한다.

## 의존성

- 버전은 범위 없이 정확히 고정하고, 공통 버전은 `pnpm-workspace.yaml`의 `catalog` 한 곳에서 바꾼다(package.json은 `catalog:`로 참조). `minimumReleaseAge` 기간이 지나지 않은 버전은 올리지 않는다.
- Dependabot(`.github/dependabot.yml`)이 매주 PR을 연다. 자동 병합은 없으니 CI 통과를 확인하고 병합한다. `typescript`·`@types/node`의 major는 PR을 열지 않는다. TypeScript는 typescript-eslint가 새 메이저를 지원한 뒤에, `@types/node`는 Node 메이저를 올릴 때 직접 올린다.
- 사용자 요청 없이 새 라이브러리를 추가하지 않는다.
- Next.js API가 기억과 다르면 `node_modules/next/dist/docs/`의 번들 문서를 확인한다.

## 에이전트 작업 규칙

- 커밋, 푸시, PR 생성, 리뷰 답글은 사용자가 요청한 경우에만 한다. 기존 브랜치와 작업 트리의 변경을 보존한다.
- 기본 작업 브랜치는 `develop`이다. 새 작업은 `develop`에서 브랜치를 만들어 `develop`으로 PR을 올린다. PR 본문은 `.github/PULL_REQUEST_TEMPLATE.md`를 따른다.
- `.env.local`을 비롯한 환경·자격 증명 파일은 열거나 출력하지 않는다. 필요한 값은 `.env.example`과 `src/shared/config/env.ts`에서 확인한다.
- 이 파일은 Codex·Gemini CLI(`.gemini/settings.json`)·Hermes가 직접 읽고, Claude Code는 `CLAUDE.md`의 `@AGENTS.md`로 읽는다. 지침은 이 파일 하나에만 쓴다. 스킬은 하네스가 동기화하므로 여기서 고치지 않는다.
