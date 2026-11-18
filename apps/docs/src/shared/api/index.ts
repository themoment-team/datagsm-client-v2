import { createApiMethods } from '@datagsm/core/shared/api';

import { axiosInstance } from './client';

export { axiosInstance } from './client';
export type { ApiMessageResponse, ApiResponse } from '@datagsm/core/shared/api';
export { ApiError, getQueryClient, setOnUnauthorized } from '@datagsm/core/shared/api';

export const { del, get, patch, post, put } = createApiMethods(axiosInstance);
