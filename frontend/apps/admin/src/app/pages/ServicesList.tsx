import { useCallback, useEffect, useState } from 'react';
import { get } from 'shared/src/lib/api/dataService';
import styles from './ServicesList.module.scss';
import PageTitle from 'shared/src/lib/page-title/PageTitle';
import { Service } from '../types/Service';
import { GoabButton, GoabPagination, GoabRadioGroup, GoabRadioItem, GoabTable } from '@abgov/react-components';
import { Link } from 'react-router-dom';
import { PublishStatus, PublishWorkflowStatus } from '../types/PublishStatus';
import EditLockCallout from '../components/callout/EditLockCallout';
import { SearchBar } from '../components/search-bar/SearchBar';
import { GoabRadioGroupOnChangeDetail } from '@abgov/ui-components-common';

type ServiceDetailsFilter = 'all' | 'available' | 'notAvailable';

const ServicesList = (): React.ReactElement => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [currentPageServices, setCurrentPageServices] = useState<Service[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [canEdit, setCanEdit] = useState<boolean>(true);
    const [searchPattern, setSearchPattern] = useState<string>('');
    const [displayServices, setDisplayServices] = useState<Service[]>([]);
    const [detailsFilter, setDetailsFilter] = useState<ServiceDetailsFilter>('all');

    useEffect(() => {
        async function fetchData() {
            const response = await get<PublishWorkflowStatus>('/v1/admin/publish-status', { redirectOnError: false });
            if (response.status === PublishStatus.NotStarted || response.status === PublishStatus.Completed) {
                setCanEdit(true);
            } else {
                setCanEdit(false);
            }
        }
        fetchData();
    }, []);

    const prepareCurrentPageServices = useCallback(
        (page: number) => {
            setCurrentPage(page);
            const servicesCopy = [...displayServices];
            const itemsPerPage = 5;
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const currentServices = servicesCopy.slice(startIndex, endIndex);
            setCurrentPageServices(currentServices);
        },
        [displayServices]
    );

    useEffect(() => {
        async function fetchData() {
            const response = await get<{ services: Service[] }>('/v1/services', { redirectOnError: false });
            if (response.services && response.services.length > 0) {
                setServices(response.services);
            }
        }
        fetchData();
    }, []);
    useEffect(() => {
        const pattern = searchPattern.trim();
        let filtered = [...services];

        if (detailsFilter === 'available') {
            filtered = filtered.filter((s) => s.hasServiceDetails === true);
        } else if (detailsFilter === 'notAvailable') {
            filtered = filtered.filter((s) => !s.hasServiceDetails);
        }

        if (pattern) {
            filtered = filtered.filter((s) => s.serviceName.toLocaleLowerCase().includes(pattern.toLocaleLowerCase()));
        }

        setDisplayServices(filtered);
    }, [searchPattern, services, detailsFilter]);

    const handleExportCsv = () => {
        const col2Header = 'Service details available';
        const headers = ['Service Name', col2Header];
        const rows = displayServices.map((s) => [s.serviceName, s.hasServiceDetails ? 'Yes' : 'No']);
        const csvContent = [headers, ...rows]
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);

        const filterName =
            detailsFilter === 'all' ? 'all' : detailsFilter === 'available' ? 'available' : 'not-available';

        const date = new Date().toLocaleDateString('en-CA');
        const filename = `services-export_details-${filterName}_${date}.csv`;

        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    useEffect(() => {
        prepareCurrentPageServices(1);
    }, [prepareCurrentPageServices]);

    return (
        <>
            <div className={styles['container']}>
                <PageTitle title="PRIVACY PORTAL" />
                <h2 className={styles['heading']} data-testid="page-heading">
                    Digital services
                </h2>
                <p data-testid="sub-heading">
                    Below is a list of all digital services available through the Privacy Portal. You can add a new
                    service or view and edit the details of an existing one.
                </p>
                {!canEdit && <EditLockCallout />}
                <div className={styles['search-export-row']}>
                    <SearchBar
                        placeholder={'Type keyword to search services'}
                        searchPattern={searchPattern}
                        setSearchPattern={setSearchPattern}
                        delayMilliseconds={100}
                    />
                    <GoabButton
                        type="primary"
                        variant="normal"
                        size="compact"
                        leadingIcon="download"
                        onClick={handleExportCsv}
                        testId="export-csv-button"
                    >
                        Export CSV
                    </GoabButton>
                </div>
                <div className={styles['filter-row']} data-testid="filter-row">
                    <span className={styles['filter-span']} data-testid="filter-span">
                        Filter:
                    </span>
                    <span
                        className={`${styles['chip-wrapper']} ${detailsFilter === 'all' ? styles['chip-active'] : ''}`}
                    >
                        <GoabRadioGroup
                            name="service-availability-filter"
                            value={detailsFilter}
                            orientation="horizontal"
                            onChange={(detail: GoabRadioGroupOnChangeDetail) =>
                                setDetailsFilter(detail.value as ServiceDetailsFilter)
                            }
                        >
                            <GoabRadioItem value="all" label="All services" />
                            <GoabRadioItem value="available" label="Service details available" />
                            <GoabRadioItem value="notAvailable" label="Service details not available" />
                        </GoabRadioGroup>
                    </span>
                </div>
                <div className={styles['table-container']} data-testid="table-container">
                    <GoabTable width="100%" testId="all-services-table">
                        <thead className={styles['tbl-thead']}>
                            <tr>
                                <th>
                                    <div className={styles['th-service-accessed']}>
                                        <div>Service</div>
                                        <div className={styles['services-count']}>{displayServices.length}</div>
                                    </div>
                                </th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentPageServices.map((service, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{service.serviceName}</td>
                                        <td>
                                            <Link to={`/services/${service.id}`}>{canEdit ? 'Edit' : 'View'}</Link>
                                        </td>
                                    </tr>
                                );
                            })}
                            <tr>
                                <td>
                                    {canEdit ? (
                                        <Link to={`/add-service`}>+ Add new service</Link>
                                    ) : (
                                        <div className={styles['disabledLink']}>+ Add new service</div>
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </GoabTable>
                </div>
                <div className={styles['pagination-container']} data-testid="pagination-container">
                    <GoabPagination
                        testId="services-table-pagination"
                        itemCount={displayServices.length}
                        perPageCount={5}
                        pageNumber={currentPage}
                        onChange={({ page }) => prepareCurrentPageServices(page)}
                    />
                </div>
            </div>
        </>
    );
};

export default ServicesList;
