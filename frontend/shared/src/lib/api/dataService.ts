import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { isDemoMode } from '../utils/demoMode';
import { getDemoResponse } from './demoData';
import { AxiosError } from 'axios';

const apiClient = axios.create({
    baseURL: process.env.NX_PUBLIC_API_URL,
    timeout: 10000,
    // In demo mode a failed call must not hijack the page: the interceptor
    // below redirects to the error screen, which defeats the callers' own
    // try/catch handling.
    redirectOnError: !isDemoMode(),
});

apiClient.interceptors.request.use((config) => {
    // Add the `X-Requested-With` header to all outgoing requests
    // UiamAuthenticationEvents.cs
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    config.headers['X-ORIGIN-URL'] = window.location.href;
    config.withCredentials = true;
    return config;
});

apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            console.error('Unauthorized access');
        } else if (error.response?.status === 500) {
            console.error('Internal server error');
            console.error(error);
        }
        if (error.config?.redirectOnError) {
            const url =
                window.location.origin + process.env.NX_PUBLIC_BASE_HREF + 'error?returnUrl=' + window.location.href;
            window.location.href = url;
        }
        return Promise.reject(error);
    }
);

export const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    if (isDemoMode()) {
        const demoResponse = getDemoResponse(url);
        if (demoResponse !== undefined) {
            return demoResponse as T;
        }
    }

    const response = await apiClient.get<T>(url, config);
    return response.data;
};

export const put = async <T, D>(url: string, data: D, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
};

export const post = async <T, D>(url: string, data: D, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
};
export const remove = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
};
