 
 
import { Complaint, FileComplaintAPIResponse, FileComplaintResponse } from '../models/complaint';
import { post } from './dataService';
import {CORRELATION_ID} from '../utils/constants';
import { isDemoMode } from '../utils/demoMode';

export const createComplaint = async (complaint: Complaint, correlationId:string): Promise<FileComplaintResponse> => {
    if (isDemoMode()) {
        // Nothing is persisted: acknowledge the submission so the flow can
        // reach its confirmation step without a Complaints API.
        return {
            createdDate: new Date().toISOString(),
            success: true,
            message: `Complaint filed successfully (demo mode - not saved).`,
        };
    }

    try {
        const response: FileComplaintAPIResponse = await post('v1/complaints', complaint,{headers: {'Content-Type': 'application/json', [CORRELATION_ID]: correlationId}});
        return {
            createdDate: response?.createdDate,
            success: true,
            message: `Complaint filed successfully.`,
        };
    } catch (error) {
        console.error('Error filing complaint:', error);
        return {
            success: false,
            message: `Error filing complaint.`,
        };
    }
};
