import styles from './AccessedServicesPage.module.scss';
import { useCallback, useEffect, useMemo, useState } from 'react';
import PageTitle from 'shared/src/lib/page-title/PageTitle';
import { SearchFilterProvider, useSearchFilter } from './search-filter/SearchFilterContext';
import SearchFilter from './search-filter/SearchFilter';
import StaleBanner from './stale-banner/StaleBanner';
import ServiceTable from './service-table/ServiceTable';
import ServiceTablePagination from './service-table-pagination/ServiceTablePagination';
import PageHeading from './page-heading/PageHeading';
import useAccessedServicesData from './hooks/useAccessedServicesData';
import useFilteredAndSortedServices from './hooks/useFilteredAndSortedServices';
import { Categories } from 'shared/src/lib/accessed-service-details/types/Constants';
import { AccessedServiceVm } from '../../../../types/AccessedService';
import { GoabCircularProgress } from '@abgov/react-components';

const ITEMS_PER_PAGE = 5;

const AccessedServices = ({ isPreview, services }: { isPreview: boolean; services: AccessedServiceVm[] }) => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const { setCategories } = useSearchFilter();

    const filteredAndSortedServices = useFilteredAndSortedServices(services);

    const currentPageServices = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredAndSortedServices.slice(startIndex, endIndex);
    }, [currentPage, filteredAndSortedServices]);

    useEffect(() => {
        setCurrentPage(1);
        const sortedCategories = [...Categories].sort((a, b) => a.label.localeCompare(b.label));
        setCategories(sortedCategories);
    }, [setCurrentPage, setCategories]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);
    return (
        <>
            <SearchFilter />
            <ServiceTable
                currentPageServices={currentPageServices}
                servicesCount={filteredAndSortedServices.length}
                isPreview={isPreview}
            />
            <ServiceTablePagination
                servicesCount={filteredAndSortedServices.length}
                perPageCount={ITEMS_PER_PAGE}
                currentPage={currentPage}
                prepareCurrentPageServices={handlePageChange}
            />
        </>
    );
};

const AccessedServicesPage = ({ isPreview }: { isPreview: boolean }): React.ReactElement => {
    const { services, isStale, loading } = useAccessedServicesData(isPreview);
    return (
        <div className={styles['container']}>
            <PageTitle title="SERVICES ACCESSED" fontColor="#004A8F" />
            <StaleBanner isStale={isStale} />
            <PageHeading />
            {loading ? (
                <GoabCircularProgress
                    variant="inline"
                    size="small"
                    message="Loading..."
                    visible={true}
                ></GoabCircularProgress>
            ) : (
                <SearchFilterProvider>
                    <AccessedServices isPreview={isPreview} services={services} />
                </SearchFilterProvider>
            )}
        </div>
    );
};

export default AccessedServicesPage;
