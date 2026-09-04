import { ServiceDetailModel } from "./ServiceDetailModel";

interface AccessServiceDate {
    formattedDate: string;
    formattedTime: string;
}

interface AccessedServiceDetailsModel {
    accessedDates: Date[];
    serviceDetails: ServiceDetailModel;
}

interface AccessedServiceSection {
    title: string;
    content: string;
}

export { AccessServiceDate, AccessedServiceDetailsModel, AccessedServiceSection };
