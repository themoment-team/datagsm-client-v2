# DataGSM Client v2

DataGSM의 Next.js 프런트엔드 모노레포다. 여섯 앱(client, admin, docs, status, oauth, projects)이 외부 DataGSM 백엔드를 사용하고, 각 앱은 FSD 구조를 갖는다. 공통 코드는 패키지로 공유한다. 구조와 검사는 [project-template](https://github.com/junjuny0227/project-template)의 multi-web을 바탕으로 했다.

## 시작하기

Node.js 24 이상과 pnpm 12.18.0이 필요하다.

```bash
pnpm install --frozen-lockfile
for app in client admin docs status oauth projects; do cp apps/$app/.env.example apps/$app/.env.local; done
pnpm dev
```

| 앱       | 주소                    | 용도        |
| -------- | ----------------------- | ----------- |
| client   | `http://localhost:3000` | 사용자      |
| admin    | `http://localhost:3001` | 관리자      |
| docs     | `http://localhost:3002` | 기술 문서   |
| status   | `http://localhost:3003` | 서비스 상태 |
| oauth    | `http://localhost:3004` | OAuth       |
| projects | `http://localhost:3005` | 프로젝트    |

터미널에서는 Turborepo TUI가 열려 `↑`/`↓`로 앱별 로그를 고를 수 있다(`m`: 단축키 목록). API 모킹은 두지 않는다. 각 앱의 `.env.local`에서 `API_BASE_URL`을 사용할 DataGSM 백엔드(개발 서버 또는 로컬) 주소로 바꾼다. status 앱은 `API_BASE_URL` 대신 상태를 확인할 서버 주소 4개를 넣는다.

## 구조

```text
apps/
├── client/                 사용자 (3000)
├── admin/                  관리자 (3001)
├── docs/                   기술 문서 (3002)
├── status/                 서비스 상태 (3003)
├── oauth/                  OAuth (3004)
└── projects/               프로젝트 (3005)
    ├── app/                얇은 Next 라우트, 오류 화면(error, not-found, global-error)
    ├── src/                _app → _pages → widgets → features → entities → shared
    └── e2e/                홈, 404, 보안 헤더 검사
packages/
├── core/                   공통 widgets·features·entities·shared(공용 사이드바 레이아웃, API 팩토리와 QueryClient, 공통 env 스키마, cn)
├── tailwind-config/        공통 @theme·@source, PostCSS
├── typescript-config/      TypeScript 공통 설정(base, nextjs, react-library)
└── eslint-config/          ESLint 공통 설정(base, next, react)
```

각 앱의 `shared/api`가 `@datagsm/core/shared/api` 팩토리에 앱의 baseURL을 연결한다. core는 세그먼트·slice 단위(`@datagsm/core/shared/<segment>`, `@datagsm/core/{entities,features,widgets}/<slice>`, 각각의 `/server`)로만 공개한다. 앱끼리 import하지 않는다. slice는 처음 쓰는 앱에 두고 두 앱 이상에서 똑같이 쓰면 core의 같은 레이어로 옮긴다. 앱 레이어는 core의 더 아래 레이어만 쓸 수 있고 ESLint가 검사한다. 공통 의존성 버전은 `pnpm-workspace.yaml`의 `catalog`에서 관리한다.

## 환경 변수

앱마다 `.env.example`을 제공한다. 실제 환경 파일은 커밋하지 않는다.

| 변수                | 설명                                                                                                                                                                       | 예시 / 기본값                                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `API_BASE_URL`      | 필수 http(s) 백엔드 주소. 서버 요청과 `/backend/*` rewrite에 사용                                                                                                          | `http://localhost:8080`                                                                                        |
| `STATUS_*_BASE_URL` | status 앱만 쓴다(status는 `API_BASE_URL`을 쓰지 않는다). 상태를 확인할 서버 4개(Web, OpenAPI, OAuth Authorization, OAuth Resource)의 base URL. 실제 주소는 공개하지 않는다 | `.env.example`은 `http://localhost:8081`~`8084`                                                                |
| `APP_*_URL`         | client·docs·status·projects. 공용 사이드바에서 서로 이동할 앱 주소 4개(`APP_CLIENT_URL`, `APP_DOCS_URL`, `APP_STATUS_URL`, `APP_PROJECTS_URL`)                             | 로컬은 `http://localhost:3000`·`3002`·`3003`·`3005`, 운영은 `https://datagsm.kr`, `https://docs.datagsm.kr` 등 |

검증은 앱별 `src/shared/config/env.ts`가 하고, 공통 스키마는 `@datagsm/core/shared/config`의 `AppEnvSchema`다. 브라우저 요청은 `@/shared/api`의 `/backend` 경로를 쓰고, 서버 요청은 `@/shared/api/index.server`를 쓴다. `/api/*`는 Next Route Handler용이다.

## 오류 화면과 보안 헤더

- 모든 앱에 라우트 오류(`error.tsx`), 404(`not-found.tsx`), 루트 layout 오류(`global-error.tsx`) 화면이 들어 있다. 오류 화면은 안내 문구, 다시 시도 버튼, 홈 링크를 보여 주고 `digest`가 있으면 오류 코드로 표시한다. `error.message`는 화면에 내보내지 않는다.
- 문구와 디자인은 각 앱의 `src/_pages/error/ui/ErrorPage.tsx`와 `src/_pages/not-found/ui/NotFoundPage.tsx`에서 바꾼다. `app/`의 세 파일은 재수출만 한다.
- 모든 응답에 `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`가 붙고 `X-Powered-By`는 꺼져 있다. 값은 각 앱 `next.config.ts`의 `headers()`에 있다.
- CSP는 서비스마다 허용 출처가 달라 넣지 않았다. 추가할 때는 `headers()`에 `Content-Security-Policy`를 더하고 모든 앱의 `e2e/security-headers.spec.ts`의 CSP 부재 검사를 함께 바꾼다.

## 배포

Vercel에 앱마다 프로젝트를 하나씩 만들어 배포한다.

- 같은 저장소를 연결하고 Root Directory를 `apps/client`, `apps/admin`처럼 앱 폴더로 지정한다. Framework Preset은 Next.js, Node.js는 24다.
- 설치는 Vercel이 저장소 루트의 pnpm workspace를 인식해 처리한다. 빌드 명령은 앱의 `build` 스크립트(`next build`와 빌드 CSS 검사)를 그대로 쓴다.
- `API_BASE_URL`을 각 프로젝트의 Environment Variables에 환경(Production, Preview)별로 넣는다. status 프로젝트에는 대신 `STATUS_*_BASE_URL` 4개를 넣는다. client·docs·status·projects 프로젝트에는 `APP_*_URL` 4개도 넣는다. `/backend/*` rewrite에 들어가 빌드할 때 고정되므로, 값을 바꾸면 다시 배포해야 반영된다.

## 의존성 업데이트

- `.github/dependabot.yml`이 매주 월요일 09:00(Asia/Seoul)에 npm(pnpm) 의존성과 GitHub Actions 업데이트를 검사한다. 설정 파일이 기본 브랜치에 있으면 별도 앱 설치 없이 동작한다(저장소에서 Dependabot 사용이 허용되어 있어야 한다).
- minor·patch는 생태계별 PR 하나로 묶이고 major는 의존성마다 개별 PR로 온다. 자동 병합은 없다. CI 통과를 확인하고 직접 병합한다.
- `typescript`와 `@types/node`의 major PR은 열리지 않는다(`ignore`). TypeScript는 typescript-eslint가 새 메이저를 지원한 뒤에, `@types/node`는 `.nvmrc`·`engines`·CI의 Node 메이저를 올릴 때 함께 직접 올린다.
- 출시 후 7일이 지나지 않은 버전은 건너뛴다(`cooldown`, `minimumReleaseAge`와 같은 기준). cooldown은 정기 버전 업데이트에만 적용된다.
- 정확한 버전 표기는 그대로 유지된다(`versioning-strategy: increase`).

## 명령과 검증

루트 명령은 모든 앱과 해당 패키지의 작업을 Turborepo로 실행한다. `lint:fsd`만 루트 `steiger.config.mjs`로 각 소스 루트를 차례로 검사한다.

```bash
pnpm dev
pnpm lint
pnpm lint:fsd
pnpm format:check
pnpm check-types
pnpm test
pnpm exec playwright install --with-deps chromium
pnpm test:e2e
pnpm build
```

`check-types`, `build`에는 `API_BASE_URL`이 필요하고, status 앱은 대신 `STATUS_*_BASE_URL` 4개가 필요하다(CI와 같은 자리 표시용 값이면 된다). 환경 파일 없이 검사하려면 `API_BASE_URL=http://localhost:8080 pnpm build`처럼 명령 앞에 전달한다. `.github/workflows/ci.yml`은 같은 게이트를 실행한다.

- `lint:fsd`: 모든 앱과 core의 FSD 경계 검사.
- `test`: Vitest 단위 테스트.
- `test:e2e`: 앱마다 Playwright가 빌드한 운영 서버(3000~3005)를 직접 띄운다. 백엔드 없이 통과하는 화면만 검사하며 이 포트들은 비워 둔다.
- `build`: 모든 앱 빌드와 core 클래스·앱 전용 토큰이 CSS에 포함됐는지 검사.
- `format`: Prettier 자동 수정.

## 에이전트와 작업 양식

규칙은 `AGENTS.md`, Claude 진입점은 `CLAUDE.md`다. 스킬·에이전트·hook과 `steiger.config.mjs`는 팀 하네스([themoment-ai-harness-sync](https://github.com/themoment-team/themoment-ai-harness-sync))가 `.harness/sync.yml` 설정대로 동기화한다.
