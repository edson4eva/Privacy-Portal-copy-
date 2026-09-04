interface ServiceDetailDto {
    serviceName?: string;
    isAvailable?: boolean;
    showOnUI?: boolean;
    origin?: string;
    rpId?: string;
    rpIdForUAT?: string;
    sku?: string;
    categoryId?: string;
    description?: string;
    //dataOwnerId?: string;
    dataOwnerIds?: string[];
    showMockInDev?: boolean;
    accessServiceUrl?: string;
}
export { ServiceDetailDto };