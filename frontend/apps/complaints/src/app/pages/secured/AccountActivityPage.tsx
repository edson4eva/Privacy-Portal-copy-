import {
    GoabBadge,
    GoabButton,
    GoabCircularProgress,
    GoabIcon,
    GoabPagination,
    GoabTable,
    GoabTableSortHeader,
} from '@abgov/react-components';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get } from 'shared/src/lib/api/dataService';
import { PpSpacer } from 'shared/src/lib/pp-spacer/PpSpacer';
import useWindowWidth from 'shared/src/lib/utils/useWindowWidth';

import styles from './AccountActivityPage.module.scss';

interface ActivityEvent {
    id: string;
    event: string;
    method?: string;
    status: 'Successful' | 'Failed';
    occurredAt: string;
    ipAddress: string;
    location: string;
    device: string;
    deviceDetail: string;
}

const PER_PAGE = 5;

const REPORT_URL = 'https://www.alberta.ca/contact-alberta-ca-account';

/**
 * Formats a timestamp as "September 6, 2026 at 12:55 PM (MDT)". Deliberately
 * left in the viewer's own timezone, which is what the note on the page tells
 * them to expect - unlike payment timestamps, which are pinned to Alberta.
 */
const formatOccurredAt = (value: string | undefined): string | undefined => {
    if (!value) {
        return undefined;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return undefined;
    }

    const day = date.toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' });
    const time = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short',
    });

    // "12:55 PM MDT" reads as "12:55 PM (MDT)" on the page.
    const parts = time.split(' ');
    const zone = parts.pop();
    return `${day} at ${parts.join(' ')} (${zone})`;
};

type SortKey = 'event' | 'status' | 'occurredAt' | 'ipAddress' | 'device';

export function AccountActivityPage(): React.ReactElement {
    const windowWidth = useWindowWidth();
    const navigate = useNavigate();

    const [events, setEvents] = useState<ActivityEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [sortKey, setSortKey] = useState<SortKey>('occurredAt');
    const [sortDirection, setSortDirection] = useState(-1);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await get<{ accountActivity: { events: ActivityEvent[] } }>('/v1/account-activity');
                setEvents(response?.accountActivity?.events ?? []);
            } catch (error) {
                // The audit log is not always reachable. Show the page with no
                // events rather than failing outright.
                console.error('Failed to fetch account activity:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const sortedEvents = useMemo(() => {
        const compare = (a: ActivityEvent, b: ActivityEvent): number => {
            if (sortKey === 'occurredAt') {
                return new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime();
            }

            return String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''));
        };

        return [...events].sort((a, b) => compare(a, b) * sortDirection);
    }, [events, sortKey, sortDirection]);

    const currentPageEvents = useMemo(
        () => sortedEvents.slice((page - 1) * PER_PAGE, page * PER_PAGE),
        [sortedEvents, page]
    );

    const onSort = (sortBy: string, sortDir: number) => {
        setSortKey(sortBy as SortKey);
        setSortDirection(sortDir);
        // A reorder invalidates the current page, so start again at the top.
        setPage(1);
    };

    if (isLoading) {
        return <GoabCircularProgress variant="inline" size="small" visible={true}></GoabCircularProgress>;
    }

    return (
        <div className={styles['container']}>
            {windowWidth <= 623 && <PpSpacer vSpacing="xl" />}

            <h1 className={styles['page-heading']}>Account activity</h1>
            <PpSpacer vSpacing="m" />
            <p className={styles['intro']}>
                View a history of your account, including sign-in attempts, password changes, and email updates.
            </p>
            <PpSpacer vSpacing="m" />
            <p className={styles['intro']}>
                <b>Note</b>: Your sign-in time is shown in the timezone where you are right now (for example, MST).
            </p>
            <PpSpacer vSpacing="l" />

            {events.length === 0 ? (
                <p className={styles['empty']} data-testid="activity-empty">
                    There is no recorded activity on your account yet.
                </p>
            ) : (
                <>
                    <div className={styles['table-container']}>
                        <GoabTable
                            width="100%"
                            testId="activity-table"
                            onSort={(detail) => onSort(detail.sortBy, detail.sortDir)}
                        >
                            <thead>
                                <tr>
                                    <th>
                                        <GoabTableSortHeader name="event">Event</GoabTableSortHeader>
                                    </th>
                                    <th>
                                        <GoabTableSortHeader name="status">Status</GoabTableSortHeader>
                                    </th>
                                    <th>
                                        <GoabTableSortHeader name="occurredAt" direction="desc">
                                            Date/Time
                                        </GoabTableSortHeader>
                                    </th>
                                    <th>
                                        <GoabTableSortHeader name="ipAddress">IP/Location</GoabTableSortHeader>
                                    </th>
                                    <th>
                                        <GoabTableSortHeader name="device">Device</GoabTableSortHeader>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentPageEvents.map((activity) => (
                                    <tr key={activity.id} data-testid={`activity-row-${activity.id}`}>
                                        <td className={styles['cell']}>
                                            {activity.event}
                                            {activity.method && (
                                                <span className={styles['detail']}>({activity.method})</span>
                                            )}
                                        </td>
                                        <td className={styles['cell']}>
                                            <GoabBadge
                                                type={activity.status === 'Successful' ? 'success' : 'emergency'}
                                                content={activity.status}
                                            />
                                        </td>
                                        <td className={styles['cell']} data-testid={`when-${activity.id}`}>
                                            {formatOccurredAt(activity.occurredAt)}
                                        </td>
                                        <td className={styles['cell']}>
                                            {activity.ipAddress}
                                            <span className={styles['detail']}>({activity.location})</span>
                                        </td>
                                        <td className={styles['cell']}>
                                            {activity.device}
                                            <span className={styles['detail']}>({activity.deviceDetail})</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </GoabTable>
                    </div>

                    <PpSpacer vSpacing="m" />
                    <GoabPagination
                        testId="activity-pagination"
                        itemCount={sortedEvents.length}
                        perPageCount={PER_PAGE}
                        pageNumber={page}
                        onChange={({ page: nextPage }) => setPage(nextPage)}
                    />
                </>
            )}

            <PpSpacer vSpacing="xl" />
            <h2 className={styles['suspicious-heading']}>Notice suspicious activity?</h2>
            <PpSpacer vSpacing="m" />
            <p>
                If you notice any unfamiliar activity, reset your password, turn on 2-step verification in Security
                Settings, and contact our support team to{' '}
                <a href={REPORT_URL} target="_blank" rel="noopener noreferrer">
                    report suspicious activity
                    <span className={styles['link-icon']} aria-hidden>
                        <GoabIcon type="open" size="small" />
                    </span>
                </a>
            </p>
            <PpSpacer vSpacing="l" />
            <GoabButton type="primary" onClick={() => navigate('/security-settings')} testId="manage-security">
                Manage security
            </GoabButton>

            <PpSpacer vSpacing="2xl" />
        </div>
    );
}

export default AccountActivityPage;
