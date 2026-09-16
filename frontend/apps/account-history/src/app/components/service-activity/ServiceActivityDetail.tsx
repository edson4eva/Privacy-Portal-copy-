import { GoabButton, GoabCircularProgress, GoabDetails, GoabIcon, GoabPagination } from '@abgov/react-components';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { get } from 'shared/src/lib/api/dataService';
import { PpSpacer } from 'shared/src/lib/pp-spacer/PpSpacer';
import useWindowWidth from 'shared/src/lib/utils/useWindowWidth';

import { ActivityEvent, ActivityService, DropDownEntry, ServiceActivity } from './types';
import styles from './ServiceActivityDetail.module.scss';

const PER_PAGE = 5;

type Tab = 'activity' | 'details';

const formatDay = (value: string): string => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' });
};

/** Splits a description so the named phrase can be rendered as a link. */
const describe = (service: ActivityService): React.ReactNode => {
    const { description, descriptionLinkText, accessServiceUrl } = service;
    if (!descriptionLinkText || !accessServiceUrl || !description.includes(descriptionLinkText)) {
        return description;
    }

    const [before, after] = description.split(descriptionLinkText);
    return (
        <>
            {before}
            <a href={accessServiceUrl} target="_blank" rel="noopener noreferrer">
                {descriptionLinkText}
            </a>
            {after}
        </>
    );
};

export function ServiceActivityDetail({ isPreview }: { isPreview: boolean }): React.ReactElement {
    const windowWidth = useWindowWidth();
    const navigate = useNavigate();
    const { service: serviceId } = useParams();

    const [activity, setActivity] = useState<ServiceActivity>();
    const [isLoading, setIsLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string>();
    const [page, setPage] = useState(1);

    /**
     * The chosen tab lives in the address, so a tab can be linked to and the
     * browser's back button steps between them rather than off the page.
     */
    const [searchParams, setSearchParams] = useSearchParams();
    const tab: Tab = searchParams.get('tab') === 'details' ? 'details' : 'activity';
    const showTab = (next: Tab) => setSearchParams(next === 'details' ? { tab: 'details' } : {});

    useEffect(() => {
        async function fetchData() {
            try {
                const endpoint = isPreview
                    ? `/v1/preview/service-activity/${serviceId}`
                    : `/v1/service-activity/${serviceId}`;
                const response = await get<{ serviceActivity: ServiceActivity }>(endpoint);
                setActivity(response?.serviceActivity);
            } catch (error) {
                // The activity service is not always reachable. Show the page
                // with what is known rather than failing outright.
                console.error('Failed to fetch service activity:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [isPreview, serviceId]);

    const service = activity?.service;
    const events: ActivityEvent[] = activity?.events ?? [];
    const categories: DropDownEntry[] = activity?.categories ?? [];
    const categoriesById = useMemo(() => new Map(categories.map((entry) => [entry.id, entry])), [categories]);

    const sortedEvents = useMemo(
        () => [...events].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()),
        [events]
    );
    const currentPageEvents = sortedEvents.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const backToList = () => navigate(isPreview ? '/preview/accessed-services' : '/accessed-services');

    if (isLoading) {
        return <GoabCircularProgress variant="inline" size="small" visible={true}></GoabCircularProgress>;
    }

    if (!service) {
        return (
            <div className={styles['container']}>
                <p className={styles['empty']} data-testid="service-missing">
                    That service could not be found.
                </p>
                <PpSpacer vSpacing="l" />
                <GoabButton type="secondary" leadingIcon="arrow-back" onClick={backToList} testId="back-to-list">
                    Back to service activity
                </GoabButton>
            </div>
        );
    }

    return (
        <div className={styles['container']}>
            {windowWidth <= 623 && <PpSpacer vSpacing="xl" />}

            <GoabButton type="tertiary" leadingIcon="arrow-back" onClick={backToList} testId="back-link">
                Back to service activity
            </GoabButton>

            <PpSpacer vSpacing="m" />
            <h1 className={styles['service-name']} data-testid="service-name">
                {service.name}
            </h1>
            <PpSpacer vSpacing="s" />
            <p className={styles['description']}>{describe(service)}</p>
            <PpSpacer vSpacing="m" />

            <div className={styles['property']}>
                <span className={styles['property-title']}>
                    <GoabIcon type="albums" size="small" />
                    Category
                </span>
                <span className={`${styles['chip']} ${styles['chip-category']}`} data-testid="service-category">
                    {service.categoryLabel}
                </span>
            </div>
            <PpSpacer vSpacing="s" />
            <div className={styles['property']}>
                <span className={styles['property-title']}>
                    <GoabIcon type="business" size="small" />
                    Ministry and data owner
                </span>
                <span className={`${styles['chip']} ${styles['chip-ministry']}`} data-testid="service-ministry">
                    {service.ministry}
                </span>
            </div>

            <PpSpacer vSpacing="l" />

            <div className={styles['tabs']} role="tablist">
                <button
                    type="button"
                    role="tab"
                    aria-selected={tab === 'activity'}
                    className={`${styles['tab']} ${tab === 'activity' ? styles['tab-current'] : ''}`}
                    onClick={() => showTab('activity')}
                    data-testid="tab-activity"
                >
                    Activity history
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={tab === 'details'}
                    className={`${styles['tab']} ${tab === 'details' ? styles['tab-current'] : ''}`}
                    onClick={() => showTab('details')}
                    data-testid="tab-details"
                >
                    Service details
                </button>
            </div>

            <PpSpacer vSpacing="l" />

            {tab === 'activity' ? (
                <div data-testid="panel-activity">
                    <p>
                        Review activity related to this service, including applications, payments and personal
                        information use.
                    </p>
                    <PpSpacer vSpacing="l" />

                    {sortedEvents.length === 0 ? (
                        <p className={styles['empty']} data-testid="no-activity">
                            No activity has been recorded for this service yet.
                        </p>
                    ) : (
                        <div className={styles['table-container']}>
                            <div className={styles['head']}>
                                <span />
                                <span>Event</span>
                                <span>Date</span>
                                <span>Category</span>
                            </div>

                            {currentPageEvents.map((event) => {
                                const isExpanded = expandedId === event.id;
                                const hasDetails = !!event.details?.length;

                                return (
                                    <div key={event.id}>
                                        <button
                                            type="button"
                                            className={`${styles['row']} ${styles['row-toggle']}`}
                                            onClick={() => setExpandedId(isExpanded ? undefined : event.id)}
                                            aria-expanded={isExpanded}
                                            data-testid={`event-${event.id}`}
                                        >
                                            <span className={styles['chevron']} aria-hidden>
                                                <GoabIcon
                                                    type={isExpanded ? 'chevron-down' : 'chevron-forward'}
                                                    size="small"
                                                />
                                            </span>
                                            <span className={styles['event-title']}>{event.event}</span>
                                            <span>{formatDay(event.occurredAt)}</span>
                                            <span>
                                                {categoriesById.get(event.categoryId)?.label ?? event.categoryId}
                                            </span>
                                        </button>

                                        {isExpanded && (
                                            <div
                                                className={styles['activity-details']}
                                                data-testid={`details-${event.id}`}
                                            >
                                                <span className={styles['activity-details-title']}>
                                                    Activity details
                                                </span>
                                                {hasDetails ? (
                                                    <div className={styles['activity-details-grid']}>
                                                        {event.details?.map((detail) => (
                                                            <div key={detail.label}>
                                                                <div className={styles['detail-label']}>
                                                                    {detail.label}
                                                                </div>
                                                                <div className={styles['detail-value']}>
                                                                    {detail.value}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className={styles['empty']}>
                                                        No further details were recorded for this activity.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            <div className={styles['pager']}>
                                <GoabPagination
                                    testId="detail-pagination"
                                    itemCount={sortedEvents.length}
                                    perPageCount={PER_PAGE}
                                    pageNumber={page}
                                    onChange={({ page: nextPage }) => setPage(nextPage)}
                                />
                            </div>
                        </div>
                    )}

                    <PpSpacer vSpacing="l" />
                    <div className={styles['unusual']}>
                        <GoabDetails heading="Notice unusual activity?">
                            <p>
                                Notice any concerns or suspicious activity related to your personal information? You
                                can now report it by filing a privacy complaint.
                            </p>
                            <PpSpacer vSpacing="s" />
                            <a
                                href={`${process.env.NX_PUBLIC_COMPLAINTS_BASE_HREF ?? '/'}file-complaint`}
                                target="_self"
                                data-testid="file-complaint-link"
                            >
                                File a privacy complaint
                            </a>
                        </GoabDetails>
                    </div>
                </div>
            ) : (
                <div data-testid="panel-details">
                    {service.detailsAvailable ? (
                        <>
                            <h2 className={styles['section-heading']}>Personal information</h2>
                            <PpSpacer vSpacing="s" />
                            <p className={styles['lead']}>
                                Personal information the service maintains for you includes:
                            </p>
                            <PpSpacer vSpacing="s" />
                            <ul className={styles['bullets']} data-testid="personal-information">
                                {service.personalInformation?.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>

                            <PpSpacer vSpacing="xl" />
                            <h2 className={styles['section-heading']}>How personal information is used</h2>
                            <PpSpacer vSpacing="s" />
                            <p>{service.howPersonalInformationIsUsed}</p>

                            {service.legislation && (
                                <>
                                    <PpSpacer vSpacing="xl" />
                                    <h2 className={styles['section-heading']}>Legislation</h2>
                                    <PpSpacer vSpacing="s" />
                                    <p>{service.legislation.summary}</p>
                                    <PpSpacer vSpacing="s" />
                                    <a
                                        href={service.legislation.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        data-testid="legislation-link"
                                    >
                                        {service.legislation.label} <GoabIcon type="open" size="small" />
                                    </a>
                                </>
                            )}
                        </>
                    ) : (
                        <div className={styles['coming-soon']} data-testid="details-coming-soon">
                            <GoabIcon type="alert-circle" size="medium" />
                            <div>
                                <strong className={styles['coming-soon-title']}>Service details coming soon</strong>
                                <p>
                                    We are working to provide more details about this service, including the personal
                                    information maintained and how it is used. Stay tuned for updates.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <PpSpacer vSpacing="xl" />
            <div className={styles['actions']}>
                <GoabButton type="secondary" leadingIcon="arrow-back" onClick={backToList} testId="back-to-list">
                    Back to service activity
                </GoabButton>
                {service.accessServiceUrl && (
                    <GoabButton
                        type="primary"
                        onClick={() => window.open(service.accessServiceUrl, '_blank', 'noopener,noreferrer')}
                        testId="access-service"
                    >
                        Access service
                    </GoabButton>
                )}
            </div>

            <PpSpacer vSpacing="2xl" />
        </div>
    );
}

export default ServiceActivityDetail;
