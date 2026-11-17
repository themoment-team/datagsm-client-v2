import { createApiMethods } from '@datagsm/core/shared/api';

import { serverAxiosInstance } from './server';

export { authRoutes } from './authRoutes';
export { serverAxiosInstance } from './server';

export const { del, get, patch, post, put } = createApiMethods(serverAxiosInstance);
