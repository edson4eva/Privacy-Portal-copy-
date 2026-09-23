import {
    GoabBadge,
    GoabCallout,
    GoabCircularProgress,
    GoabDetails,
    GoabDropdown,
    GoabDropdownItem,
    GoabPagination,
} from '@abgov/react-components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { get } from 'shared/src/lib/api/dataService';
import PageTitle from 'shared/src/lib/page-title/PageTitle';
import { PpSpacer } from 'shared/src/lib/pp-spacer/PpSpacer';
import useWindowWidth from 'shared/src/lib/utils/useWindowWidth';

import { serviceAreasPresent } from 'shared/src/lib/service-areas/serviceAreas';
import { StaffAccessRecord, formatAccessedAt, isUnderReview } from './staffAccess';
import styles from './StaffAccessPage.module.scss';

const PER_PAGE = 5;
const ALL = 'all';

/** Said on the row itself, being the anomaly signal a reader can judge fastest. */
const isAfterHours = (record: StaffAccessRecord): boolean => /after-hours/i.test(record.businessHours ?? '');

export function StaffAccessPage({ basePath = '/transparency' }: { basePath?: string }): React.ReactElement {
    const windowWidth = useWindowWidth();

    const [records, setRecords] = useState<StaffAccessRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [serviceArea, setServiceArea] = useState(ALL);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await get<{ staffAccess: { records: StaffAccessRecord[] } }>('/v1/staff-access');
                setRecords(response?.staffAccess?.records ?? []);
            } catch (error) {
                // The access logs are not always reachable. Show the page with
                // no records rather than failing outright.
                console.error('Failed to fetch staff access records:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    /** Only the categories some access belongs to, in the inventory's order. */
    const areas = useMemo(() => serviceAreasPresent(records.map((record) => record.serviceArea)), [records]);

    const sorted = useMemo(
        () =>
            [...records]
                .filter((record) => serviceArea === ALL || record.serviceArea === serviceArea)
                .sort((a, b) => new Date(b.accessedAt).getTime() - new Date(a.accessedAt).getTime()),
        [records, serviceArea]
    );

    const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
    const currentPage = Math.min(page, totalPages);
    const currentPageRecords = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

    /** Held steady so the pagination component keeps its change listener. */
    const goToPage = useCallback(({ page: nextPage }: { page: number }) => setPage(nextPage), []);

    const chooseArea = useCallback((value?: string) => {
        setServiceArea(value ?? ALL);
        setPage(1);
    }, []);

    if (isLoading) {
        return <GoabCircularProgress variant="inline" size="small" visible={true}></GoabCircularProgress>;
    }

    return (
        <div className={`${styles['container']} ${styles['wide']}`} data-wide="true" data-testid="access-container">
            {windowWidth <= 623 && <PpSpacer vSpacing="xl" />}

            <PageTitle title="CITIZEN-FACING EXPERIENCE" fontColor="#004F84" />
            <PpSpacer vSpacing="m" />
            <h1 className={styles['page-heading']}>Who accessed your information</h1>
            <PpSpacer vSpacing="m" />
            <p className={styles['intro']}>
                A record of Government of Alberta staff who have looked at your personal information, what they saw, and
                the reason they gave for looking.
            </p>
            <PpSpacer vSpacing="m" />

            <div data-testid="access-notice">
                <GoabCallout type="information" size="large" maxWidth="48rem">
                    Every access is recorded with the reason the employee gave for it. Staff may look at your
                    information to decide eligibility, to correct a payment, to verify who you are, to answer your own
                    inquiry, or to meet a legal obligation. If an entry looks wrong to you, you can file a privacy
                    complaint.
                </GoabCallout>
            </div>

            <PpSpacer vSpacing="l" />

            <div className={styles['filters']} data-testid="access-filters">
                <div className={styles['field']}>
                    <label className={styles['field-label']} htmlFor="filter-service-area">
                        Service area
                    </label>
                    <GoabDropdown
                        name="filter-service-area"
                        value={serviceArea}
                        onChange={(detail) => chooseArea(detail.value)}
                        testId="filter-service-area"
                    >
                        <GoabDropdownItem value={ALL} label="All service areas" />
                        {areas.map((area) => (
                            <GoabDropdownItem key={area} value={area} label={area} />
                        ))}
                    </GoabDropdown>
                </div>
            </div>

            <PpSpacer vSpacing="l" />

            <div className={styles['table-container']}>
                <div className={styles['head']}>
                    <span>Who accessed</span>
                    <span>Date</span>
                    <span>Category</span>
                    <span>Type of information accessed</span>
                    <span>Reason for inquiry</span>
                    <span>Details</span>
                </div>

                {currentPageRecords.length === 0 ? (
                    <p className={styles['empty']} data-testid="access-empty">
                        No one has looked at your information yet.
                    </p>
                ) : (
                    currentPageRecords.map((record) => {
                        const when = formatAccessedAt(record.accessedAt);

                        return (
                            <div className={styles['row']} key={record.id} data-testid={`row-${record.id}`}>
                                <span>
                                    <span className={styles['identifier']} data-testid={`position-${record.id}`}>
                                        {record.positionId ?? 'Position not recorded'}
                                    </span>
                                    <span className={styles['who-role']}>{record.role},</span>
                                    {record.organization && (
                                        <span className={styles['who-org']} data-testid={`org-${record.id}`}>
                                            {record.organization}
                                        </span>
                                    )}
                                    <span className={styles['who-unit']}>{record.unit}</span>
                                </span>
                                <span className={styles['when']}>
                                    {when.date} {when.time}
                                    <span className={styles['when-zone']}>{when.zone}</span>
                                    {isAfterHours(record) && (
                                        <span className={styles['chip-flag']} data-testid={`after-hours-${record.id}`}>
                                            <GoabBadge type="important" content="After-hours" />
                                        </span>
                                    )}
                                </span>
                                <span>
                                    {record.categories.join('; ')}
                                    {record.serviceArea && (
                                        <span className={styles['service-area']} data-testid={`area-${record.id}`}>
                                            {record.serviceArea}
                                        </span>
                                    )}
                                </span>
                                <span>{record.information.join(', ')}</span>
                                <span>
                                    <span className={styles['reason-type']}>{record.reasonType}</span>
                                    <span className={styles['reason-detail']}>{record.reasonDetail}</span>
                                    {isUnderReview(record) && (
                                        <span className={styles['chip-flag']} data-testid={`review-${record.id}`}>
                                            <GoabBadge type="emergency" content={record.reviewOutcome ?? ''} />
                                        </span>
                                    )}
                                </span>
                                <span>
                                    <Link
                                        className={styles['view-link']}
                                        to={`${basePath}/${record.id}`}
                                        data-testid={`view-${record.id}`}
                                    >
                                        View activity
                                    </Link>
                                </span>
                            </div>
                        );
                    })
                )}

                <div className={styles['pager']}>
                    <GoabPagination
                        testId="access-pagination"
                        itemCount={sorted.length}
                        perPageCount={PER_PAGE}
                        pageNumber={currentPage}
                        onChange={goToPage}
                    />
                </div>
            </div>

            <PpSpacer vSpacing="l" />
            <div className={styles['unusual']}>
                <GoabDetails heading="Notice unusual activity?">
                    <p>
                        Do you not recognise who looked at your information, or the reason they gave? You can report it
                        by filing a privacy complaint.
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

            <PpSpacer vSpacing="2xl" />
        </div>
    );
}

export default StaffAccessPage;
