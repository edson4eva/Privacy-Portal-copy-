interface AccessedService {
    id: string;
    serviceName: string;
    categoryId: string;
    lastAccessedOn: Date;
    isAvailable: boolean;
}

interface AccessedServiceVm {
    id: string;
    serviceName: string;
    categoryId: string;
    lastAccessedOn: Date;
    dateAccessed: string;
    timeAccessed: string;
    isAvailable: boolean;
}

export { AccessedService, AccessedServiceVm };
