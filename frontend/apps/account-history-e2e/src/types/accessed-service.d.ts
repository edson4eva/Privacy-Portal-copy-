interface AccessedServicesResponse {
    accessedServices: AccessedService[];
}
interface AccessedService {
    id: string;
    serviceName: string;
    lastAccessedOn: Date;
    isAvailable: boolean;
}
