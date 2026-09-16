import {
    GoabCircularProgress,
    GoabDropdown,
    GoabDropdownItem,
    GoabIcon,
    GoabPagination,
} from '@abgov/react-components';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { get } from 'shared/src/lib/api/dataService';
import PageTitle from 'shared/src/lib/page-title/PageTitle';
import { PpSpacer } from 'shared/src/lib/pp-spacer/PpSpacer';
import useWindowWidth from 'shared/src/lib/utils/useWindowWidth';

import { ActivityEvent, ActivityService, DropDownEntry, ServiceActivity } from './types';
import styles from './ServiceActivityPage.module.scss';

const ALL = 'all';
const PER_PAGE = 5;

/** Date ranges offered by the filter, counted back from today. */
const DATE_RANGES: { id: string; label: string; days?: number }[] = [
    { id: ALL, label: '- Select -' },
    { id: 'last-30', label: 'Last 30 days', days: 30 },
    { id: 'last-90', label: 'Last 90 days', days: 90 },
    { id: 'last-12-months', label: 'Last 12 months', days: 365 },
];

const formatDay = (value: string): string => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' });
};

export function ServiceActivityPage({ isPreview }: { isPreview: boolean }): React.ReactElement {
    const windowWidth = useWindowWidth();

    const [activity, setActivity] = useState<ServiceActivity>();
    const [isLoading, setIsLoading] = useState(true);
    const [serviceId, setServiceId] = useState(ALL);
    const [categoryId, setCategoryId] = useState(ALL);
    const [dateRangeId, setDateRangeId] = useState(ALL);
    const [newestFirst, setNewestFirst] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        async function fetchData() {
            try {
                const endpoint = isPreview ? '/v1/preview/service-activity' : '/v1/service-activity';
                const response = await get<{ serviceActivity: ServiceActivity }>(endpoint);
                setActivity(response?.serviceActivity);
            } catch (error) {
                // The activity service is not always reachable. Show the page
                // with no activity rather than failing outright.
                console.error('Failed to fetch service activity:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [isPreview]);

    const services: ActivityService[] = activity?.services ?? [];
    const categories: DropDownEntry[] = activity?.categories ?? [];
    const events: ActivityEvent[] = activity?.events ?? [];

    const servicesById = useMemo(() => new Map(services.map((service) => [service.id, service])), [services]);
    const categoriesById = useMemo(() => new Map(categories.map((entry) => [entry.id, entry])), [categories]);

    const visibleEvents = useMemo(() => {
        const range = DATE_RANGES.find((entry) => entry.id === dateRangeId);
        const cutoff = range?.days ? Date.now() - range.days * 24 * 60 * 60 * 1000 : undefined;

        const filtered = events.filter((event) => {
            const matchesService = serviceId === ALL || event.serviceId === serviceId;
            const matchesCategory = categoryId === ALL || event.categoryId === categoryId;
            const matchesRange = cutoff === undefined || new Date(event.occurredAt).getTime() >= cutoff;
            return matchesService && matchesCategory && matchesRange;
        });

        return filtered.sort((a, b) => {
            const difference = new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime();
            return newestFirst ? -difference : difference;
        });
    }, [events, serviceId, categoryId, dateRangeId, newestFirst]);

    const currentPageEvents = useMemo(
        () => visibleEvents.slice((page - 1) * PER_PAGE, page * PER_PAGE),
        [visibleEvents, page]
    );

    /** Any change to the filters or the sort invalidates the page being viewed. */
    const applyFilter = (apply: () => void) => {
        apply();
        setPage(1);
    };

    if (isLoading) {
        return <GoabCircularProgress variant="inline" size="small" visible={true}></GoabCircularProgress>;
    }

    const detailPath = (id: string) => (isPreview ? `/preview/accessed-services/${id}` : `/accessed-services/${id}`);

    return (
        <div className={styles['container']}>
            {windowWidth <= 623 && <PpSpacer vSpacing="xl" />}

            <PageTitle title="PRIVACY PORTAL" fontColor="#004F84" />
            <PpSpacer vSpacing="m" />
            <h1 className={styles['page-heading']}>Service activity</h1>
            <PpSpacer vSpacing="m" />
            <p className={styles['intro']}>
                Review activity across government services you've used, including applications, payments, account
                activity, and personal information use.
            </p>
            <PpSpacer vSpacing="m" />

            <div className={styles['availability']} data-testid="availability-notice">
                <GoabIcon type="information-circle" size="small" />
                <p>
                    Activity records are only available for participating services and activities recorded after{' '}
                    {activity?.availableFrom ? formatDay(activity.availableFrom) : 'the service began recording them'}.
                </p>
            </div>

            <PpSpacer vSpacing="l" />

            <div className={styles['filters']}>
                <div className={styles['field']}>
                    <label className={styles['field-label']} htmlFor="filter-service">
                        Service
                    </label>
                    <GoabDropdown
                        name="filter-service"
                        value={serviceId}
                        onChange={(detail) => applyFilter(() => setServiceId(detail.value ?? ALL))}
                        testId="filter-service"
                    >
                        <GoabDropdownItem value={ALL} label="All services" />
                        {services.map((service) => (
                            <GoabDropdownItem key={service.id} value={service.id} label={service.name} />
                        ))}
                    </GoabDropdown>
                </div>

                <div className={styles['field']}>
                    <label className={styles['field-label']} htmlFor="filter-category">
                        Category
                    </label>
                    <GoabDropdown
                        name="filter-category"
                        value={categoryId}
                        onChange={(detail) => applyFilter(() => setCategoryId(detail.value ?? ALL))}
                        testId="filter-category"
                    >
                        <GoabDropdownItem value={ALL} label="All categories" />
                        {categories.map((category) => (
                            <GoabDropdownItem key={category.id} value={category.id} label={category.label} />
                        ))}
                    </GoabDropdown>
                </div>

                <div className={styles['field']}>
                    <label className={styles['field-label']} htmlFor="filter-date-range">
                        Date range
                    </label>
                    <GoabDropdown
                        name="filter-date-range"
                        value={dateRangeId}
                        onChange={(detail) => applyFilter(() => setDateRangeId(detail.value ?? ALL))}
                        testId="filter-date-range"
                    >
                        {DATE_RANGES.map((range) => (
                            <GoabDropdownItem key={range.id} value={range.id} label={range.label} />
                        ))}
                    </GoabDropdown>
                </div>
            </div>

            <PpSpacer vSpacing="l" />

            <div className={styles['table-container']}>
                <div className={styles['head']}>
                    <span>
                        Event / Service<span className={styles['count']}>{visibleEvents.length}</span>
                    </span>
                    <span>
                        <button
                            type="button"
                            className={styles['sort-button']}
                            onClick={() => applyFilter(() => setNewestFirst((previous) => !previous))}
                            data-testid="sort-date"
                            aria-label={`Date, sorted ${newestFirst ? 'newest first' : 'oldest first'}`}
                        >
                            Date
                            <GoabIcon type={newestFirst ? 'arrow-down' : 'arrow-up'} size="small" />
                        </button>
                    </span>
                    <span>Category</span>
                    <span>Details</span>
                </div>

                {currentPageEvents.length === 0 ? (
                    <p className={styles['empty']} data-testid="activity-empty">
                        No activity matches the filters you have chosen.
                    </p>
                ) : (
                    currentPageEvents.map((event) => (
                        <div className={styles['row']} key={event.id} data-testid={`row-${event.id}`}>
                            <span className={styles['event']}>
                                <span className={styles['event-title']}>{event.event}</span>
                                <span className={styles['event-service']}>
                                    {servicesById.get(event.serviceId)?.name ?? event.serviceId}
                                </span>
                            </span>
                            <span>{formatDay(event.occurredAt)}</span>
                            <span>{categoriesById.get(event.categoryId)?.label ?? event.categoryId}</span>
                            <span>
                                <Link to={detailPath(event.serviceId)} data-testid={`view-${event.id}`}>
                                    View activity
                                </Link>
                            </span>
                        </div>
                    ))
                )}

                <div className={styles['pager']}>
                    <GoabPagination
                        testId="activity-pagination"
                        itemCount={visibleEvents.length}
                        perPageCount={PER_PAGE}
                        pageNumber={page}
                        onChange={({ page: nextPage }) => setPage(nextPage)}
                    />
                </div>
            </div>

            <PpSpacer vSpacing="2xl" />
        </div>
    );
}

export default ServiceActivityPage;
