/* eslint-disable @typescript-eslint/no-unused-vars */
interface ComplaineeContactInfo {
    firstName: string;
    lastName: string;
    email: string;
}

export interface DocumentFile {
    fileType: string;
    fileName: string;
    url: string;
}

interface Document {
    documentation: string;
    files: DocumentFile[];
}

export interface Complaint {
    department: string;
    service?: string;
    concern: string;
    circumstances: string;
    employeeName?: string;
    complaineeContactInfo: ComplaineeContactInfo;
    documents: Document[];
}

export interface FileComplaintResponse {
    createdDate?: string;
    success: boolean;
    message: string;
}

export interface FileComplaintAPIResponse {
    createdDate?: string;
    id?: string;
}
