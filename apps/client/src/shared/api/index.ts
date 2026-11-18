import { createApiMethods } from '@datagsm/core/shared/api';

import { axiosInstance } from './client';

export { axiosInstance } from './client';

export const { del, get, patch, post, put } = createApiMethods(axiosInstance);
