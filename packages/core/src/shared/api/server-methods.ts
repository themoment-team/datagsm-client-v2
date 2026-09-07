import { serverAxiosInstance } from './server';

export const del = async <T>(...args: Parameters<typeof serverAxiosInstance.delete>) =>
  await serverAxiosInstance.delete<T, T>(...args);

export const get = async <T>(...args: Parameters<typeof serverAxiosInstance.get>) =>
  await serverAxiosInstance.get<T, T>(...args);

export const patch = async <T>(...args: Parameters<typeof serverAxiosInstance.patch>) =>
  await serverAxiosInstance.patch<T, T>(...args);

export const post = async <T>(...args: Parameters<typeof serverAxiosInstance.post>) =>
  await serverAxiosInstance.post<T, T>(...args);

export const put = async <T>(...args: Parameters<typeof serverAxiosInstance.put>) =>
  await serverAxiosInstance.put<T, T>(...args);
