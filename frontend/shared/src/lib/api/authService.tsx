import axios, { AxiosResponse } from 'axios';

const axiosInstance = axios.create();
axiosInstance.interceptors.request.use((config) => {
    // Add the `X-Requested-With` header to all outgoing requests
    // UiamAuthenticationEvents.cs
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    config.headers['X-ORIGIN-URL'] = window.location.href;
    config.withCredentials = true;
    return config;
});

export async function getAsync<T>(
    url: string,
    payload?: object | null,
    options?: JsendOptions
): Promise<JsendResponse<T>> {
    try {
        const response = await axiosInstance.request<T>({
            url: url,
            method: 'get',
            params: payload,
        });

        return {
            status: 'success',
            data: response.data,
            message: response.statusText,
        };
    } catch (error) {
        if (axios.isAxiosError(error) && error?.status === 401 && !!error?.response?.headers?.location) {
            // console.info(`Redirect to signin : ${error.response.headers.location}`)

            if (options?.stopAutoRedirect !== true) {
                window.location.href = error?.response?.headers?.location;
            }

            return {
                status: 'fail',
                data: null,
                message: 'Unauthorized',
                redirectUrl: error?.response?.headers?.location,
            };
        }

        return {
            status: 'error',
            data: null,
            message: axios.isAxiosError(error) ? error.message : 'Server error occurred',
        };
    }
}

export function isSuccessResponse(response: JsendResponse<unknown> | undefined): boolean {
    return !!response && response?.status === 'success' && (!!response?.data || !!response?.message);
}
