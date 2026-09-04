export interface IComplaintHistory {
    complaintId: string;
    department: string;
    service: string;
    circumstances: string;
    employeeName: string;
    complaineeContactInfo: {
        firstName: string;
        lastName: string;
        email: string;
    };
    documents: {
        documentType: string;
        description: string;
    }[];
    createdDate: string;
}

export interface IComplaintResponse {
    complaints: IComplaintHistory[];
}
