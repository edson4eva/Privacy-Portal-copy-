interface AccessedServiceDetailsResponse {
    accessedServiceDetails: AccessedServiceDetails;
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
    dataOwnerId?: string;
    dataOwnerText?: string;
    description?: string;
    accessServiceUrl?: string;
    sections?: ServiceDetailSection[];
}
interface AccessedServiceDetails {
    accessedDates: Date[];
    serviceDetails: ServiceDetailModel;
}
