# Multi-app FSD Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single starter app with five independently runnable Next.js FSD application skeletons and their shared package boundaries.

**Architecture:** Each application owns its `apps/<name>/src` FSD layers and has no imports from other applications. `@repo/ui` remains a prebuilt UI package; `@repo/core` provides the future shared `entities` and `shared` lower layers without placing an application domain there prematurely. Root validation checks all FSD source roots.

**Tech Stack:** pnpm workspaces, Turborepo, Next.js 16 App Router, React 19, TypeScript, ESLint, Tailwind CSS, Steiger.

**Spec:** `docs/superpowers/specs/2026-09-07-multi-app-fsd-scaffold-design.md`

## Global Constraints

- Application source roots are `apps/*/src`; routes, layouts, metadata, and global CSS stay in `src/app`.
- Application FSD dependency order is `app → views → widgets → features → entities → shared`.
- Applications must not import another application.
- `@repo/ui` remains prebuilt and must not be added to `transpilePackages`.
- `@repo/core` contains only shared lower layers; app-specific domains remain in their app until two applications use them.
- Empty FSD layers contain `.gitkeep`; no domain, feature, or API implementation is added.
- Ports are client 3000, admin 3001, docs 3002, status 3003, oauth 3004.

---

### Task 1: Enable workspace-wide FSD validation

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Verify: `scripts/check-fsd-dependencies.mjs`
- Verify: `steiger.config.mjs`

**Interfaces:**
- Consumes: source-root paths passed as positional arguments to `scripts/check-fsd-dependencies.mjs`.
- Produces: root command `pnpm lint:fsd` that validates all app roots plus `packages/core/src`.

- [x] **Step 1: Add the validation dependencies and script**

Add `steiger` and `@feature-sliced/steiger-plugin` to root `devDependencies`, then add this script:

```json
"lint:fsd": "node scripts/check-fsd-dependencies.mjs apps/client/src apps/admin/src apps/docs/src apps/status/src apps/oauth/src packages/core/src && steiger apps/client/src --fail-on-warnings && steiger apps/admin/src --fail-on-warnings && steiger apps/docs/src --fail-on-warnings && steiger apps/status/src --fail-on-warnings && steiger apps/oauth/src --fail-on-warnings && steiger packages/core/src --fail-on-warnings"
```

- [x] **Step 2: Refresh the lockfile**

Run: `pnpm install`

Expected: `pnpm-lock.yaml` contains both FSD validation dependencies and no package manifest changes remain unstaged.

- [x] **Step 3: Run the checker before creating roots**

Run: `pnpm lint:fsd`

Expected: FAIL because one or more requested source roots do not exist.

- [x] **Step 4: Commit validation setup after the roots exist**

Run: `git add package.json pnpm-lock.yaml && git commit -m "add(global): FSD 구조 검증 추가"`

### Task 2: Convert the starter applications to FSD roots

**Files:**
- Move: `apps/web` → `apps/client`
- Move: `apps/client/app/*` → `apps/client/src/app/*`
- Move: `apps/docs/app/*` → `apps/docs/src/app/*`
- Create: `apps/{client,docs}/src/{views,widgets,features,entities,shared}/.gitkeep`
- Modify: `apps/client/package.json`
- Modify: `apps/docs/package.json`

**Interfaces:**
- Consumes: existing starter route files and `@repo/ui` public package exports.
- Produces: independently runnable `client` and `docs` applications at ports 3000 and 3002, each with an FSD source root.

- [x] **Step 1: Rename the user-facing starter application**

Run: `mv apps/web apps/client`

Expected: `apps/web` no longer exists and `apps/client` contains the original starter files.

- [x] **Step 2: Move App Router files into each FSD app layer**

Move each app's `app` directory to `src/app`. Do not move `public`, `next.config.ts`, `package.json`, or tool configuration files.

- [x] **Step 3: Create the empty FSD layers**

Create exactly one `.gitkeep` file in every empty `views`, `widgets`, `features`, `entities`, and `shared` directory for client and docs.

- [x] **Step 4: Set application identities and ports**

Set `apps/client/package.json` name to `client` and its dev port to 3000. Keep docs named `docs` and set its dev port to 3002.

- [x] **Step 5: Verify the two app roots**

Run: `pnpm --filter client check-types && pnpm --filter docs check-types`

Expected: PASS.

### Task 3: Add admin, status, and OAuth starter applications

**Files:**
- Create: `apps/admin/{src/app,src/views,src/widgets,src/features,src/entities,src/shared}/`
- Create: `apps/status/{src/app,src/views,src/widgets,src/features,src/entities,src/shared}/`
- Create: `apps/oauth/{src/app,src/views,src/widgets,src/features,src/entities,src/shared}/`
- Create: `apps/{admin,status,oauth}/package.json`
- Create: `apps/{admin,status,oauth}/{next.config.ts,tsconfig.json,eslint.config.js,postcss.config.js,next-env.d.ts}`

**Interfaces:**
- Consumes: public `@repo/ui` exports and workspace configuration packages.
- Produces: three standalone starter applications at ports 3001, 3003, and 3004.

- [x] **Step 1: Create a minimal App Router skeleton per application**

For each app, add `src/app/layout.tsx`, `src/app/page.tsx`, and `src/app/globals.css`. The page renders its own application name and imports only `@repo/ui` public exports or local files.

- [x] **Step 2: Create empty FSD layers**

For every new app, add `.gitkeep` in `src/views`, `src/widgets`, `src/features`, `src/entities`, and `src/shared`.

- [x] **Step 3: Add standard Next.js package and tool configuration**

Use the client package dependency versions and scripts. Set dev commands to `next dev --port 3001`, `next dev --port 3003`, and `next dev --port 3004` for admin, status, and oauth respectively. Each `tsconfig.json` maps `@/*` to `./src/*`.

- [x] **Step 4: Verify application isolation**

Run: `pnpm --filter admin check-types && pnpm --filter status check-types && pnpm --filter oauth check-types`

Expected: PASS with no imports that begin with another `apps/` path.

- [x] **Step 5: Commit the five application skeletons**

Run: `git add apps && git commit -m "add(global): 다중 앱 FSD 골격 구성"`

### Task 4: Add the empty shared-core package

**Files:**
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/eslint.config.mjs`
- Create: `packages/core/turbo.json`
- Create: `packages/core/src/entities/.gitkeep`
- Create: `packages/core/src/shared/.gitkeep`

**Interfaces:**
- Consumes: `@repo/typescript-config`, `@repo/eslint-config`, and the root FSD validation command.
- Produces: the empty `packages/core/src` lower-layer root validated by Steiger.

- [x] **Step 1: Create the core workspace package metadata**

Set the package name to `@repo/core`, mark it private, and configure it as a workspace-only package. Do not add application dependencies or runtime exports because there is no shared domain yet.

- [x] **Step 2: Create only the two permitted lower FSD layers**

Add `src/entities/.gitkeep` and `src/shared/.gitkeep`. Do not create `app`, `views`, `widgets`, or `features` under `packages/core/src`.

- [x] **Step 3: Verify the package boundary**

Run: `pnpm lint:fsd`

Expected: PASS; each app root and `packages/core/src` exists, and no dependency violation is reported.

- [x] **Step 4: Commit the package boundary**

Run: `git add packages/core && git commit -m "add(core): 공용 하위 계층 골격 추가"`

### Task 5: Run workspace verification

**Files:**
- Verify: `package.json`
- Verify: `apps/{client,admin,docs,status,oauth}/package.json`
- Verify: `packages/core`

**Interfaces:**
- Consumes: all workspace scripts created in Tasks 1–4.
- Produces: a verified five-app scaffold.

- [x] **Step 1: Run lint**

Run: `pnpm lint`

Expected: PASS.

- [x] **Step 2: Run type checks**

Run: `pnpm check-types`

Expected: PASS.

- [x] **Step 3: Run FSD validation**

Run: `pnpm lint:fsd`

Expected: PASS.

- [x] **Step 4: Inspect the final changes**

Run: `git status --short && git log --oneline -3`

Expected: no generated artifacts are staged; the commits identify the validation, application, and core-package changes.
