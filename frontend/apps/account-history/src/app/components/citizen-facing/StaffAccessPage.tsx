import { GoabCircularProgress, GoabDetails, GoabIcon, GoabPagination } from '@abgov/react-components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { get } from 'shared/src/lib/api/dataService';
import PageTitle from 'shared/src/lib/page-title/PageTitle';
import { PpSpacer } from 'shared/src/lib/pp-spacer/PpSpacer';
import useWindowWidth from 'shared/src/lib/utils/useWindowWidth';

import { StaffAccessRecord, formatAccessedAt, isUnderReview } from './staffAccess';
import styles from './StaffAccessPage.module.scss';

const PER_PAGE = 5;

/** Said on the row itself, being the anomaly signal a reader can judge fastest. */
const isAfterHours = (record: StaffAccessRecord): boolean => /after-hours/i.test(record.businessHours ?? '');

export function StaffAccessPage({ basePath = '/transparency' }: { basePath?: string }): React.ReactElement {
    const windowWidth = useWindowWidth();

    const [records, setRecords] = useState<StaffAccessRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);

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

    const sorted = useMemo(
        () => [...records].sort((a, b) => new Date(b.accessedAt).getTime() - new Date(a.accessedAt).getTime()),
        [records]
    );

    const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
    const currentPage = Math.min(page, totalPages);
    const currentPageRecords = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

    /** Held steady so the pagination component keeps its change listener. */
    const goToPage = useCallback(({ page: nextPage }: { page: number }) => setPage(nextPage), []);

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

            <div className={styles['notice']} data-testid="access-notice">
                <GoabIcon type="information-circle" size="small" />
                <p>
                    Every access is recorded with the reason the employee gave for it. Staff may look at your
                    information to decide eligibility, to correct a payment, to verify who you are, to answer your own
                    inquiry, or to meet a legal obligation. If an entry looks wrong to you, you can file a privacy
                    complaint.
                </p>
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
                                    <span className={styles['username']}>{record.username}</span>
                                    <span className={styles['who-role']}>{record.role},</span>
                                    <span className={styles['who-unit']}>{record.unit}</span>
                                </span>
                                <span className={styles['when']}>
                                    {when.date} {when.time}
                                    <span className={styles['when-zone']}>{when.zone}</span>
                                    {isAfterHours(record) && (
                                        <span className={styles['chip-flag']} data-testid={`after-hours-${record.id}`}>
                                            After-hours
                                        </span>
                                    )}
                                </span>
                                <span>{record.categories.join('; ')}</span>
                                <span>{record.information.join(', ')}</span>
                                <span>
                                    <span className={styles['reason-type']}>{record.reasonType}</span>
                                    <span className={styles['reason-detail']}>{record.reasonDetail}</span>
                                    {isUnderReview(record) && (
                                        <span className={styles['chip-review']} data-testid={`review-${record.id}`}>
                                            {record.reviewOutcome}
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
