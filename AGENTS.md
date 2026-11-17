# DataGSM Client v2

DataGSM의 Next.js App Router **프런트엔드 모노레포**다. 여섯 앱 `apps/client`(3000), `apps/admin`(3001), `apps/docs`(3002), `apps/status`(3003), `apps/oauth`(3004), `apps/projects`(3005)가 외부 DataGSM 백엔드를 사용한다. Feature-Sliced Design(FSD) 공식 Next.js 구조를 따른다. 모든 응답과 문서는 한국어로 작성하고, 식별자·파일 이름·커밋 타입은 영어로 둔다.

## 스택

pnpm 12 / Next.js 16 (App Router, React Compiler) / React 19 / TypeScript 6 / Tailwind CSS 4 + cva / TanStack Query 5 / axios / zod 4 / react-hook-form / Vitest / Playwright / ESLint 10 + Prettier / steiger.

- 의존성은 범위 없이 정확한 버전으로 고정한다. `pnpm-workspace.yaml`의 `minimumReleaseAge`(7일)를 지키며, 출시 7일이 지나지 않은 버전은 올리지 않는다.
- 공통 의존성 버전은 `pnpm-workspace.yaml`의 `catalog` 한 곳에서 바꾸고 package.json은 `catalog:`로 참조한다.
- 업데이트 PR은 Dependabot(`.github/dependabot.yml`)이 매주 연다. minor·patch는 생태계(npm, GitHub Actions)별 한 PR로 묶이고 major는 개별 PR이다. 단 `typescript`와 `@types/node`의 major는 PR을 열지 않는다. TypeScript는 typescript-eslint가 새 메이저를 지원한 뒤에, `@types/node`는 Node 메이저를 올릴 때 함께 직접 올린다. 자동 병합은 설정하지 않았다. 병합 전에 CI 통과를 확인한다.
- 사용자 요청 없이 새 라이브러리를 추가하지 않는다.
- Next.js 16 API가 기억과 다르면 `node_modules/next/dist/docs/`의 번들 문서를 확인한다.

## 구조

```text
apps/{client,admin,docs,status,oauth,projects}/
├── app/                   얇은 Next 라우트 (layout, page, error, not-found, global-error)
├── src/
│   ├── _app/              providers(TanStackProvider), global-error, styles/globals.css
│   ├── _pages/            home/ui/HomePage.tsx, error, not-found
│   ├── widgets/           .gitkeep
│   ├── features/          .gitkeep
│   ├── entities/          .gitkeep
│   └── shared/            api(앱별 연결), config(core 스키마로 env 검증)
└── e2e/                   Playwright 테스트
packages/
├── core/                  widgets → features → entities → shared(앱 공유 FSD 레이어), 공용 레이아웃(widgets/app-shell), API 팩토리·인터셉터·getQueryClient, env 스키마, cn
├── tailwind-config/       공통 CSS 토큰·@source, PostCSS
├── typescript-config/     base, nextjs(앱), react-library(core)
└── eslint-config/         base, next(앱), react(core)
```

- `_app`·`_pages`의 밑줄은 Next가 `src/app`, `src/pages`를 라우터 폴더로 읽지 않게 하려고 붙였다. steiger는 이 둘을 `app`·`pages` 레이어로 인식한다.
- `widgets`, `features`, `entities`는 실제 도메인 코드가 생길 때만 slice를 추가한다. 빈 slice나 세그먼트를 미리 만들지 않는다.
- 아래 `src/`, `app/`, `@/` 경로는 각 웹 앱 기준이다.
- 앱은 독립 배포 단위다. 사용자 요청 없이 앱을 삭제·병합하거나 패키지 scope(`@datagsm/*`)를 바꾸지 않는다.
- `@/*`는 각 앱의 `src/*`를 가리킨다. 루트 `app/`도 `@/`로 `src`를 import한다.
- 기존 라우트와 공개 API를 사용자 요청 없이 삭제하거나 이름을 바꾸지 않는다.

## FSD 규칙

상세 가이드(레이어 판단, slice 설계, `@x`, 예시)는 [`nextjs-fsd-architecture`](.agents/skills/nextjs-fsd-architecture/SKILL.md) 스킬에 있다. 여기에는 늘 적용되는 핵심만 둔다.

- import 방향은 `_app → _pages → widgets → features → entities → shared`뿐이다. 같은 레이어의 다른 slice와 slice 내부 경로 import도 금지다. `pnpm lint:fsd`가 루트 `steiger.config.mjs`로 각 앱과 `packages/core`를 검사한다. 이 설정 파일은 하네스가 배포하므로 직접 고치지 않는다.
- slice 밖에서는 공개 `index.ts`로만 import한다. 서버 전용 코드는 `index.server.ts`로 따로 공개하고 클라이언트 배럴에 섞지 않는다.
- 루트 `app/`의 라우트 파일은 얇게 둔다. 페이지 구현은 `src/_pages/<slice>`에 두고 라우트는 재수출이나 조합만 한다. **steiger는 루트 `app/`을 검사하지 않으므로** 라우트 파일에 비즈니스 로직을 넣지 않는 것은 직접 지킨다.

```ts
// app/page.tsx
export { HomePage as default } from '@/_pages/home';
```

- 오류 화면도 같은 방식이다. `app/error.tsx`·`not-found.tsx`·`global-error.tsx`는 재수출만 하고 구현은 `src/_pages/error`, `src/_pages/not-found`, `src/_app/global-error`에 둔다. 화면에는 `error.message`를 노출하지 않고 `digest`만 오류 코드로 보여 준다.
- 세그먼트는 필요할 때만 만든다: `ui/` 컴포넌트 · `model/` 타입·훅·스키마·상수 · `api/` 요청 함수·query 팩토리·mutation 훅 · `lib/` slice 전용 유틸 · `config/` 설정.
- feature 전용 코드를 `shared/`에 넣지 않는다.

## 패키지 경계

상세(core import 표, `@x`, slice를 core로 옮기는 순서, 패키지별 ESLint·Tailwind·`transpilePackages`, 앱별 `next.config.ts`)는 [`nextjs-fsd-architecture`](.agents/skills/nextjs-fsd-architecture/SKILL.md) 스킬의 Turborepo 절에 있다. 앱과 패키지 사이에서 코드를 옮기거나 패키지 설정을 바꾸기 전에 읽는다. 여기에는 늘 적용되는 핵심만 둔다.

- 앱끼리는 어떤 경우에도 import하지 않는다. 공유는 `packages/*`로만 한다. 패키지는 package.json의 `exports`에 있는 공개 진입점으로만 import한다.
- core에는 패키지 루트 진입점이 없고, 앱 안의 slice 공개 API와 같은 단위로 공개한다: `@datagsm/core/shared/<segment>`, `@datagsm/core/{entities,features,widgets}/<slice>`, 서버 전용은 각각의 `/server`.
- 앱과 core는 위치만 다를 뿐 같은 레이어 체계다. 앱의 레이어는 core의 **더 아래** 레이어만 import한다. 같은 레이어도 다른 slice라서 금지다. `@datagsm/eslint-config/next`가 레이어별로 막는다.
- slice는 처음 쓰는 앱에 둔다. 두 앱 이상이 데이터와 동작까지 똑같이 쓰게 될 때만 core의 같은 레이어로 옮긴다.
- 모든 웹 앱의 레이아웃(왼쪽 사이드바 + 본문)은 core의 `widgets/app-shell`(`AppShell`)이다. 앱은 `_app/layout`에서 지금 앱(`currentApp`), 앱 주소, 메뉴 목록만 넘긴다. client·docs·status·projects는 core의 `USER_SIDEBAR_ITEMS`를 함께 쓰고, 관리자 웹은 `apps/admin/src/_app/config`의 관리자 메뉴와 `badge="관리자"`를 넘긴다. 관리자 메뉴는 모두 admin 안 경로라 admin은 `APP_*_URL`을 받지 않는다. 같은 앱 메뉴는 `Link`, 다른 앱 메뉴는 `<a>`로 그 앱 주소에 연결된다.
- 여러 앱이 함께 쓰는 도메인 없는 UI(기본 컴포넌트, 레이아웃 틀)는 core의 `shared/ui`에 컴포넌트별 폴더로 두고 `@datagsm/core/shared/ui/<component>`로 import한다. 별도 UI 패키지는 만들지 않는다. 팀 디자인 시스템(themoment-design-system)이 준비되면 그때 옮긴다.

## 네이밍

| 구분              | 규칙                         | 예                                 |
| ----------------- | ---------------------------- | ---------------------------------- |
| slice 폴더        | kebab-case                   | `user-profile/`                    |
| 컴포넌트 파일     | PascalCase                   | `ui/HomePage.tsx`                  |
| 유틸·훅·기타 파일 | camelCase                    | `getQueryClient.ts`, `cn.ts`       |
| props 타입        | PascalCase + `Props`         | `HomePageProps`                    |
| 그 밖의 타입      | PascalCase, 종류 접미사 없음 | `User`, `UserResponse`             |
| 요청 타입         | PascalCase + `Request`       | `UpdateProfileRequest`             |
| zod 스키마        | PascalCase + `Schema`        | `EnvSchema`, `UpdateProfileSchema` |

예시 이름 중 이 표에서 처음 나온 것(`user-profile` 등)은 구현된 모듈이 아니다.

## 타입

- 객체 형태는 `interface`, 유니온과 조합은 `type`을 쓴다.
- `enum`은 쓰지 않는다. 리터럴 유니온과 `as const` 객체 또는 `Record`를 쓴다. ESLint가 막는다.
- 타입만 가져올 때는 `import type`을 쓴다. ESLint가 고친다.
- 타입 이름에 `Type` 같은 종류 접미사를 붙이지 않는다. 같은 이름의 값(클래스·상수)이 있을 때만 역할을 나타내는 단어를 붙인다(`ApiError` 클래스의 생성 인자는 `ApiErrorInit`).

## 컴포넌트

- 화살표 함수와 props 구조 분해를 쓴다.
- `src` 안의 모듈은 named export만 쓴다(`export const HomePage = …`, 소유 slice의 `index.ts`에서 `export { HomePage } from './ui/HomePage';`). default export는 Next가 요구하는 루트 `app/` 라우트 파일과 설정 파일에만 두고, 라우트는 `export { HomePage as default } from '@/_pages/home';`로 재수출한다. `src`의 default export는 ESLint가 막는다.
- 컴포넌트 안의 순서는 변수·훅 → 핸들러·기타 로직 → `useEffect`(필요할 때만) → return이다. 관례를 맞추려고 필요 없는 상태나 effect를 만들지 않는다.
- 기본은 Server Component다. 상태·이벤트·브라우저 API가 필요한 가장 작은 컴포넌트에만 `'use client'`를 붙인다.
- import 정렬(`react` → `next` → 외부 패키지 → `@/` → 상대 경로)은 ESLint `simple-import-sort`가 고친다.

## 스타일링

- Tailwind CSS v4다. 앱 진입점은 `src/_app/styles/globals.css`, 공통 디자인 토큰은 `@datagsm/tailwind-config/shared-styles.css`가 소유한다. 토큰은 `@theme`에 추가하고(`--color-background` → `bg-background`), 다른 전역 스타일 진입점을 만들지 않는다.
- 디자인 토큰은 Figma DataGSMv2의 "WF · 파운데이션"(Dark 모드만)을 옮긴 것이다. Tailwind 기본 색 팔레트는 지웠으므로 색은 토큰만 쓴다: 면 `background`·`surface`·`subtle`·`table-head`·`selected`·`row-selected`·`strong`·`glass-fill`·`scrim`·`scrim-card`, 선 `line`·`glass-line`, 글자 `foreground`·`foreground-muted`·`on-strong`·`error`.
- 글자는 텍스트 스타일 토큰 하나로 크기·줄 높이·자간·굵기를 함께 정한다: `text-title-32`, `text-title-24`, `text-heading-20`, `text-body-16`, `text-body-16-regular`, `text-label-14`, `text-caption-12`, `text-badge-11`, 코드는 `font-mono text-code-12`.
- Figma의 간격·모서리·높이 값은 Tailwind 기본값과 같아서 토큰을 따로 두지 않는다: 간격 4·8·12·14·16·24·32px = `1`·`2`·`3`·`3.5`·`4`·`6`·`8`, 모서리 4px = `rounded`, 버튼 높이 36px = `h-9`. 같은 값의 토큰(`--spacing-14` 등)을 새로 만들지 않는다.
- `--text-*` 토큰 이름을 더하거나 바꾸면 core `shared/lib/cn.ts`의 목록도 고친다. tailwind-merge가 모르는 이름은 잘못 병합한다(예: `text-title-32`를 글자색으로 보고 지운다).
- 글꼴은 본문 Pretendard(`font-sans`, 기본값), 코드 JetBrains Mono(`font-mono`)다. 둘 다 `@datagsm/tailwind-config/shared-styles.css`가 npm 패키지의 unicode-range 분할 CSS로 불러온다. 앱에서 `next/font`나 다른 글꼴 진입점을 따로 만들지 않는다.
- 정적 클래스는 문자열 하나로 쓴다. `cn()`(`@datagsm/core/shared/lib`)은 조건부 클래스나 외부 `className` 병합이 있을 때만 쓴다.
- 여러 곳에서 반복되는 클래스 조합은 컴포넌트로 뽑는다. 클래스 문자열을 상수로 빼지 않는다.
- 크기·색 같은 variant가 있는 컴포넌트는 `cva`(class-variance-authority)로 정의하고 `VariantProps`로 props 타입을 만든다. 외부 `className`은 `cn(variants({ ... }), className)`으로 병합한다.
- 클래스 순서는 Prettier(`prettier-plugin-tailwindcss`)가 정렬한다. `cn(...)`과 `cva(...)` 안의 문자열도 `tailwindFunctions` 설정으로 정렬된다.

```tsx
// ❌ 조건이 없는데 cn()
className={cn('flex items-center gap-2')}

// ✅ 정적 클래스
className="flex items-center gap-2"

// ✅ 조건부 클래스, 외부 className 병합
className={cn('flex gap-2', isActive && 'bg-foreground text-background')}
className={cn('rounded-lg px-4', className)}
```

```tsx
// variant가 있는 컴포넌트
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@datagsm/core/shared/lib';

const buttonVariants = cva('inline-flex items-center rounded-md font-medium', {
  variants: {
    variant: { primary: 'bg-foreground text-background', outline: 'border border-foreground' },
    size: { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4' },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});

interface ButtonProps extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {}

export const Button = ({ variant, size, className, ...props }: ButtonProps) => (
  <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
);
```

## API

- 브라우저 요청은 `@/shared/api`, 서버(RSC, Server Function) 요청은 `@/shared/api/index.server`의 `get / post / patch / put / del`로 보낸다. 이 메서드는 core `createApiMethods`가 만들고 응답의 `.data`만 돌려준다. 인스턴스(`axiosInstance`, `serverAxiosInstance`)를 직접 호출하지 않는다.
- 브라우저 인스턴스의 baseURL은 `/backend`이고, 각 앱 `next.config.ts`의 rewrite가 `API_BASE_URL`로 넘긴다. `/api/*`는 Route Handler용으로 비워 둔다. 서버 인스턴스는 `server-only`라 클라이언트 코드에서 `index.server`를 import하면 빌드가 실패한다.
- 응답 타입은 첫 번째, body 타입은 두 번째 제네릭이다: `post<UserResponse, UpdateProfileRequest>(url, body)`. URL 상수는 소유 slice의 `api/`에 두고 서버의 실제 경로를 그대로 쓴다.
- DataGSM 서버 응답은 `{ status, code, message, data }` 형태로 감싸져 온다. 응답 타입에는 이 감싼 형태를 포함해 적는다.
- 요청 실패는 모두 `ApiError { status, code, message, requestId? }`로 던져지고 원본은 `cause`에 있다. 응답이 없는 실패(네트워크 오류, 타임아웃, 취소)는 `status: 0`이다. `requestId`는 응답 헤더 `X-Request-Id`다. 화면에서는 `error instanceof ApiError`로 좁힌 뒤 분기한다.
- 401 응답에 연결할 동작은 `setOnUnauthorized`로 등록한다. 동시에 들어온 401은 진행 중인 훅 하나를 함께 기다리고, 훅이 끝나면 원래 요청은 재시도 없이 `ApiError`로 실패한다. 훅 안의 요청(토큰 갱신 등)은 이 인터셉터가 없는 별도 인스턴스로 보낸다. 같은 인스턴스로 보내 401을 받으면 훅을 기다리며 멈춘다. 서버 인스턴스는 모듈 상태를 요청 사이에 공유하므로 서버 쪽에 사용자별 훅을 등록하지 않는다.
- API 모킹(MSW)은 두지 않는다. 개발은 `API_BASE_URL`로 실제 DataGSM 개발 서버에 붙는다. 컴포넌트 테스트에서 API 응답이 필요하면 `vi.mock`으로 API 함수를 바꾼다.

## 환경 변수

- 서버 환경 변수는 `src/shared/config/env.ts` 한 곳에서 검증하고 `env`로 꺼내 쓴다. 앱 공통 변수와 오류 메시지는 `@datagsm/core/shared/config`의 `AppEnvSchema`가 소유하고, 앱은 `process.env` 값을 모아 `parseEnv`에 넘긴다. 앱 전용 변수는 `AppEnvSchema.extend({...})`로 더한다. 일반 기능은 `process.env`를 다른 곳에서 직접 읽지 않는다.
- 새 변수를 추가하면 스키마(공통이면 core, 앱 전용이면 앱의 `extend`), `.env.example`, CI의 `env`를 함께 고친다.
- status를 뺀 각 앱의 변수는 `API_BASE_URL`(필수, http(s) URL)이다. `API_BASE_URL`이 없으면 `dev`, `build`, `check-types`가 바로 실패한다.
- client·docs·status·projects는 공용 사이드바에서 서로 이동할 앱 주소 `APP_CLIENT_URL`, `APP_DOCS_URL`, `APP_STATUS_URL`, `APP_PROJECTS_URL`(모두 필수)도 받는다. 스키마는 core의 `AppUrlsEnvSchema`이고, 값은 `readAppUrlsEnv(process.env)`로 모은다. 앱은 서브도메인(`datagsm.kr`, `docs.datagsm.kr` 등)으로 따로 배포한다.
- status 앱은 상태를 확인할 서버 4개의 base URL(`STATUS_WEB_BASE_URL`, `STATUS_OPENAPI_BASE_URL`, `STATUS_OAUTH_AUTHORIZATION_BASE_URL`, `STATUS_OAUTH_RESOURCE_BASE_URL`, 모두 필수)만 받는다. DataGSM API를 호출하지 않으므로 `API_BASE_URL`, `/backend` rewrite, axios 인스턴스가 없다. 실제 주소는 공개하지 않으므로 `.env.example`과 CI에는 자리 표시용 값만 두고, 실제 값은 `.env.local`과 Vercel에만 넣는다. 상태 확인은 서버 컴포넌트에서 각 서버의 `GET /v1/health`를 요청해 2xx면 정상으로 보고, 응답 속도는 그 요청 앞뒤 시간만 잰다.
- `env`는 서버에서만 읽는다. 클라이언트 컴포넌트에서 import하지 않는다.

## 보안 헤더와 배포

- 모든 앱의 `next.config.ts`의 `headers()`가 모든 경로에 기본 보안 헤더(HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`)를 붙이고 `X-Powered-By`를 끈다. CSP는 넣지 않았다. 헤더를 바꾸거나 CSP를 더하면 모든 앱의 `e2e/security-headers.spec.ts`도 함께 고친다. 모든 앱의 `next.config.ts`는 같게 유지하고, 공통 부분을 바꾸면 모든 앱 파일에 똑같이 고친다. 단 status는 `API_BASE_URL`을 쓰지 않아 `/backend` rewrite가 없다.
- 앱을 추가하거나 지우면 앱 폴더 밖에서 앱 목록을 가진 곳도 함께 고친다: 루트 `package.json`의 `lint:fsd`, `.lintstagedrc.mjs`, `.prettierrc` overrides, 사이드바로 오가는 앱이면 core의 `AppId`·`AppUrlsEnvSchema`·사용자 메뉴와 CI·Playwright의 `APP_*_URL`, 이 문서와 README. 새 앱은 기존 앱을 복제한 뒤 `package.json` 이름·포트, `playwright.config.ts` 포트, `layout.tsx` 메타, 홈 제목과 그 테스트를 바꾼다. 마지막에 `rg -n "oauth"`처럼 기존 앱 이름으로 검색해 빠진 곳이 없는지 확인한다.
- 배포는 Vercel이다. 앱마다 Vercel 프로젝트를 하나씩 두고 Root Directory를 `apps/<앱>`으로 둔다. `API_BASE_URL`은 rewrite에 들어가 빌드 시 고정되므로 Vercel 프로젝트의 환경 변수로 넣고, 값을 바꾸면 다시 배포한다. Docker 이미지 빌드 설정은 두지 않는다.

## 데이터와 폼

상세 패턴은 [`data-and-forms`](.agents/skills/data-and-forms/SKILL.md) 스킬에 있다.

- TanStack Query: 조회는 entity `api/`의 `<리소스>Queries` 팩토리(`queryOptions`, key는 `all()` 루트의 계층 배열)를 컴포넌트에서 `useQuery` 등에 바로 넘긴다. 로직이 없는 조회 훅으로 감싸지 않는다. mutation은 훅으로 두고 동작으로 이름 짓는다(`useUpdateProfile`, HTTP 메서드 이름 아님). QueryClient는 `@/shared/api`의 `getQueryClient`로 얻는다. 서버 prefetch는 `src/_pages`의 페이지 컴포넌트에서 하고 루트 `app/` 라우트는 얇게 둔다.
- 폼: zod 스키마(`...Schema`)와 react-hook-form(`zodResolver`)을 쓰고, 요청 타입은 `z.infer`로 만든 `...Request`이다. 제출은 mutation으로 한다.

## 테스트

- 단위 테스트는 대상 파일 옆에 `*.test.ts(x)`로 둔다(Vitest, jsdom, Testing Library).
- E2E 테스트는 `e2e/*.spec.ts`에 둔다(Playwright). 앱을 빌드해 띄운 뒤(3000~3005) 돈다. CI에는 백엔드가 없으므로 E2E는 API 응답 없이 통과하는 화면(홈, 404, 보안 헤더 등)만 다룬다. 서버 데이터가 필요한 E2E를 CI에서 돌려야 하면 그때 모킹 도입을 결정한다.
- 동작을 바꾸면 그 동작을 확인하는 테스트를 함께 고치거나 추가한다.

## 검증

변경 후 프로젝트 루트에서 범위에 맞는 검사를 실행한다. 루트 스크립트가 모든 앱과 패키지의 게이트를 실행하며 lint:fsd는 모든 앱과 core를 검사한다. CI(`.github/workflows/ci.yml`)도 같은 순서로 전부 실행한다.

```bash
pnpm lint
pnpm lint:fsd
pnpm format:check
pnpm check-types   # API_BASE_URL 필요
pnpm test
pnpm test:e2e      # 처음에는 pnpm exec playwright install --with-deps chromium
pnpm build         # API_BASE_URL 필요
```

- `API_BASE_URL`(status 앱은 `STATUS_*_BASE_URL` 4개)은 `.env.local`이 있으면 거기서 읽힌다. 없으면 `API_BASE_URL=http://localhost:8080 pnpm build`처럼 명령 앞에 붙인다.
- FSD 경계, 공개 API, 서버·클라이언트 경계를 바꿨다면 최소한 `lint:fsd`, `check-types`, `build`를 확인한다.
- 실행하지 못했거나 실패한 검사는 그대로 보고한다.

## 에이전트 작업 규칙

- 커밋, 푸시, PR 생성, 리뷰 답글은 사용자가 요청한 경우에만 한다. 기존 브랜치와 작업 트리의 변경을 보존한다.
- 기본 작업 브랜치는 `develop`이다. 새 작업은 `develop`에서 브랜치를 만들어 `develop`으로 PR을 올린다(`git-commit`, `write-pr` 스킬의 Git Flow).
- `.env.local`을 비롯한 환경·자격 증명 파일은 열거나 출력하지 않는다. 필요한 값은 `.env.example`과 `src/shared/config/env.ts`에서 확인한다.
- 이 파일의 규칙 중 도구가 검사하는 것(ESLint, Prettier, steiger, tsc)은 도구 결과를 근거로 판단한다.
- 작업 절차는 `.agents/skills/`(Codex)와 `.claude/skills/`(Claude Code)에 있다. Gemini CLI는 `.gemini/settings.json`에 따라 이 파일을 읽는다. 이 폴더들과 `.codex/`, `.claude/agents`, `.claude/hooks`, `.claude/settings.json`, `.gemini/`, `steiger.config.mjs`는 팀 하네스(themoment-ai-harness-sync)가 `.harness/sync.yml` 설정대로 동기화하므로 이 레포에서 직접 고치지 않는다. 바꿀 내용은 하네스 레포에 반영한다.

| 스킬                      | 쓰는 때                                                         |
| ------------------------- | --------------------------------------------------------------- |
| `git-commit`              | 변경을 논리 단위로 나눠 커밋할 때                               |
| `write-pr`                | 커밋을 바탕으로 PR을 만들 때                                    |
| `resolve-reviews`         | PR 리뷰 코멘트를 판단하고 반영할 때                             |
| `nextjs-fsd-architecture` | 레이어·slice를 정하거나 구조, 앱과 패키지 사이 공유를 바꿀 때   |
| `react-conventions`       | 파일·타입 이름, 컴포넌트 모양을 정할 때                         |
| `data-and-forms`          | 서버 데이터 조회·변경, 폼을 만들 때                             |
| `tailwind-shadcn`         | Tailwind 클래스, 토큰, 공통 UI 위치를 정할 때                   |
| `react-best-practices`    | React·Next 코드의 렌더링·데이터 요청·번들 성능을 볼 때          |
| `ponytail`                | 가장 작은 변경으로 해결하고 과한 설계를 줄일 때                 |
| `ponytail-audit`          | 레포 전체의 버그·보안·지울 코드를 점검할 때(코드는 바꾸지 않음) |
| `humanizer`               | 문서·PR 본문 같은 글에서 AI 문투를 걷어낼 때                    |

- 변경을 도구가 못 잡는 컨벤션 기준으로 검토할 때는 `frontend-convention-validator` 에이전트를 쓴다.
