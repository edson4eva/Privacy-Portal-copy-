import { useMemo } from "react";
import { AccessedServiceVm } from "../../../../../types/AccessedService";
import { useSearchFilter } from "../search-filter/SearchFilterContext";

const useFilteredAndSortedServices = (services: AccessedServiceVm[]) => {
    const { searchTerm, selectedCategories, sortBy } = useSearchFilter();

    const filteredServices = useMemo(() => {
        return services.filter(
            (service) =>
                (service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    service.dateAccessed.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    service.timeAccessed.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (selectedCategories.length === 0 || selectedCategories.some((cat) => cat.id === service.categoryId))
        );
    }, [services, searchTerm, selectedCategories]);

    const sortedAndFilteredServices = useMemo(() => {
        if (!sortBy) {
            return filteredServices;
        }

        return [...filteredServices].sort((a, b) => {
            const dateA = new Date(a.lastAccessedOn).getTime();
            const dateB = new Date(b.lastAccessedOn).getTime();
            return sortBy === 'earliest-accessed' ? dateA - dateB : dateB - dateA;
        });
    }, [filteredServices, sortBy]);

    return sortedAndFilteredServices;
};

export default useFilteredAndSortedServices;