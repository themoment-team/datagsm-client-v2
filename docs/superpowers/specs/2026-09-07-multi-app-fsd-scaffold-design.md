# Multi-app FSD Scaffold Design

## Goal

Replace the single `apps/web` starter with five minimal Next.js App Router applications: `client`, `admin`, `docs`, `status`, and `oauth`. Establish the package and validation boundaries required for later migration from `datagsm-client`.

## Application layout

`apps/web` becomes `apps/client`. The applications use ports 3000 through 3004 in this order: client, admin, docs, status, oauth.

Every application uses this structure:

```
src/
├── app/       # Next.js routes, layout, global styles
├── views/     # page composition
├── widgets/   # reusable page sections
├── features/  # user actions and mutations
├── entities/  # app-local domains
└── shared/    # app-local lower-level code
```

Only `src/app` contains starter application code. Empty FSD layers contain `.gitkeep` files, so no application domain or feature API is introduced early.

## Package boundaries

`@datagsm/ui` remains the prebuilt design-system package and is consumed through its public exports. It is not added to `transpilePackages`.

`@datagsm/core` is introduced as a shared lower-layer scaffold with `src/entities` and `src/shared`. It has no domain implementation. Future cross-application entities move there only after a second application needs them; app-specific domains remain in their owning application.

Applications do not import one another. Future package imports use public package entry points only. Server-only exports, when introduced, use dedicated `index.server.ts` subpaths.

## FSD validation

The root `lint:fsd` command runs the bundled dependency checker for all five application source roots and `packages/core/src`, then runs Steiger for each root. The existing harness overrides already provide the checker and Steiger configuration.

## Verification

Run `pnpm lint`, `pnpm check-types`, and `pnpm lint:fsd`. The scaffold succeeds when all five applications have independent build/type/lint scripts, FSD roots exist, and validation reports no dependency violations.
