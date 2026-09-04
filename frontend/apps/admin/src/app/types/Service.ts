export interface Service {
    id?: string;
    serviceName: string;
    description: string;
    categoryId: string;
    dataOwnerId: string;
    origin: string;
    rpId: string;
    rpIdForUAT: string;
    sku: string;
    accessServiceUrl: string;
    showMockInDev?: boolean;
    hasServiceDetails?: boolean;
}

export interface FileServiceResponse {
    success: boolean;
    message: string;
}

export interface FileServiceAPIResponse {
    id?: string;
}
