import { CORRELATION_ID } from '../utils/constants';
import { post } from './dataService';

interface Personalisation {
    Department: string;
    ServiceName?: string;
    PrivacyConcern: string;
    Circumstances: string;
    EmployeeName?: string;
    FirstName: string;
    LastName: string;
    UserEmail: string;
    DocumentLinks: string;
    DocumentDescription: string;
    DateOfSubmission: string;
    TimeOfSubmission: string;
    AccountType: string;
}

interface Payload {
    Personalisation: Personalisation;
}

interface EmailResponse {
    success: boolean;
    message: string;
}

export const sendNewComplaintEmail = async (payload: Payload, correlationId:string): Promise<EmailResponse> => {
    try {
        await post('v1/send-email', payload,{headers:{[CORRELATION_ID]:correlationId}});
        return {
            success: true,
            message: `Email for newly filed complaint sent successfully.`,
        };
    } catch (error) {
        console.error('Error sending new complaint email:', error);
        throw error;
    }
};
