import { useEffect, useState } from 'react';
import { AccessedService, AccessedServiceVm } from '../../../../../types/AccessedService';
import { get } from 'shared/src/lib/api';
import { formatDate } from 'shared/src/lib/utils/dateUtils';

const convertToAccessedServiceVm = (services: AccessedService[]): AccessedServiceVm[] => {
    return services.map((service) => {
        const { formattedDate, formattedTime } = formatDate(service.lastAccessedOn);
        return {
            id: service.id,
            serviceName: service.serviceName,
            categoryId: service.categoryId,
            lastAccessedOn: service.lastAccessedOn,
            dateAccessed: formattedDate,
            timeAccessed: formattedTime,
            isAvailable: service.isAvailable,
        };
    });
};
const useAccessedServicesData = (isPreview: boolean) => {
    const [services, setServices] = useState<AccessedServiceVm[]>([]);
    const [isStale, setIsStale] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    useEffect(() => {
        const fetchData = async () => {
            const endpoint = isPreview ? '/v1/preview/accessed-services' : '/v1/accessed-services';
            try {
                setLoading(true);
                const response = await get<{ isStale: boolean; accessedServices: AccessedService[] }>(endpoint, {
                    withCredentials: true,
                });
                if (response.accessedServices && response.accessedServices.length > 0) {
                    const vm = convertToAccessedServiceVm(response.accessedServices);
                    setServices(vm);
                    setIsStale(response.isStale);
                }
            } catch (error) {
                console.error('Error fetching accessed services:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isPreview]);

    return { services, isStale, loading };
};

export default useAccessedServicesData;
