import 'axios';

declare module 'axios' {
    export interface AxiosRequestConfig {
        redirectOnError?: boolean;
    }
}
