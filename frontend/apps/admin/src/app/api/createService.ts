/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Service, FileServiceAPIResponse, FileServiceResponse } from '../types/Service';
import { post } from 'shared/src/lib/api/dataService';

export const createService = async (service: Service): Promise<FileServiceResponse> => {
    try {
        const response: FileServiceAPIResponse = await post('/v1/createservice', service, { redirectOnError: false });
        return {
            success: true,
            message: `Service created successfully.`,
        };
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.detail) {
            const errorMessage = error.response.data.detail;
            if (errorMessage) {
                return {
                    success: false,
                    message: errorMessage,
                };
            } else {
                return {
                    success: false,
                    message: `An unexpected error occurred: ${errorMessage}`,
                };
            }
        } else {
            return {
                success: false,
                message: `An unexpected error occurred`,
            };
        }
    }
};
