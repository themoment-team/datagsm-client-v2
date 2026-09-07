# DataGSM Client v2

pnpm과 Turborepo로 관리하는 Next.js 멀티 앱 모노레포입니다.

## 앱

| 앱       | 개발 서버               |
| -------- | ----------------------- |
| `client` | `http://localhost:3000` |
| `admin`  | `http://localhost:3001` |
| `docs`   | `http://localhost:3002` |
| `status` | `http://localhost:3003` |
| `oauth`  | `http://localhost:3004` |

각 앱은 `src/app`과 FSD 레이어(`entities`, `features`, `widgets`, `views`, `shared`)를 사용합니다.

## 패키지

- `@datagsm/core`: 공용 API 클라이언트, 인증, 환경 설정
- `@datagsm/ui`: 공용 React UI와 스타일
- `@datagsm/tailwind-config`: 공용 Tailwind·PostCSS 설정
- `@datagsm/eslint-config`: 공용 ESLint 설정
- `@datagsm/typescript-config`: 공용 TypeScript 설정

## 시작하기

Node.js 24 이상과 pnpm 11을 사용합니다.

```sh
pnpm install
API_BASE_URL=http://localhost:8080 pnpm dev
```

`API_BASE_URL`은 모든 앱에서 필수입니다. `/backend/*` 요청은 이 주소로 rewrite되며, Next.js Route Handler에는 예약된 `/api/*` 경로를 사용합니다. 로컬 개발에서는 앱별 `.env.local` 또는 실행 환경에 설정하세요.

```env
API_BASE_URL=http://localhost:8080
```

## 주요 명령

```sh
# 모든 앱·패키지 개발 서버 실행
API_BASE_URL=http://localhost:8080 pnpm dev

# 프로덕션 빌드
API_BASE_URL=http://localhost:8080 pnpm build

# ESLint 검사
pnpm lint

# TypeScript 검사
pnpm check-types

# FSD 의존성 경계 검사
pnpm lint:fsd
```
