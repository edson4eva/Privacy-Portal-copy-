interface ServiceDetailSection {
    title: string;
    content: string;
}
interface ServiceDetailModel {
    id?: string;
    serviceName?: string;
    isAvailable?: boolean;
    showOnUI?: boolean;
    origin?: string;
    rpId?: string;
    rpIdForUAT?: string;
    sku?: string;
    categoryId?: string;
    categoryText?: string;
    dataOwnerIds?: string[];
    dataOwnerTexts?: string[];
    description?: string;
    accessServiceUrl?: string;
    showMockInDev: boolean;
    sections?: ServiceDetailSection[];
}

export { ServiceDetailModel, ServiceDetailSection };
