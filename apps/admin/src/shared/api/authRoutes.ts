import { createAuthRoutes } from '@datagsm/core/shared/auth/server';

import { env } from '@/shared/config';

import 'server-only';

export const authRoutes = createAuthRoutes(env);
