import { useCallback, useEffect, useState } from 'react';
import { get, post } from 'shared/src/lib/api/dataService';
import styles from './AuditLogs.module.scss';
import PageTitle from 'shared/src/lib/page-title/PageTitle';
import {
    GoabButton,
    GoabButtonGroup,
    GoabCircularProgress,
    GoabModal,
    GoabPagination,
    GoabSpacer,
    GoabTable,
} from '@abgov/react-components';
import { AuditLog, AuditLogFilter } from '../types/AuditLog';
import { formatCanadaDateOnlyString, formatDate, formatDateString } from '../utils/dateUtils';
import { AuditLogActionCategory } from '../enums/AuditLogActionCategory';
import { PublishWorkflowStatus } from '../types/PublishStatus';
import {
    AuditLogSearchFilterProvider,
    useAuditLogSearchFilter,
} from '../components/audit-log/AuditLogSearchFilterContext';
import AuditLogSearchFilter from '../components/audit-log/AuditLogSearchFilter';
import { useThrottle } from '../utils/useThrottle';

const AuditLogs = (): React.ReactElement => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [currentPageAuditLogs, setCurrentPageAuditLogs] = useState<AuditLog[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [openDetailDialog, setOpenDetailDialog] = useState<boolean>(false);
    const [actionText, setActionText] = useState<string>('');
    const [desc, setDesc] = useState<string>('');
    const [timestamp, setTimestamp] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [busy, setBusy] = useState<boolean>(false);
    const { searchTerm, email, actions, beginDate, endDate, openFilter } = useAuditLogSearchFilter();
    const throttledBusy = useThrottle(busy, 1500);
    const [showBusy, setShowBusy] = useState<boolean>(false);

    useEffect(() => {
        if (busy && throttledBusy) {
            setShowBusy(true);
        } else {
            setShowBusy(false);
        }
    }, [busy, throttledBusy]);

    const prepareCurrentPageAuditLogs = useCallback(
        (page: number) => {
            setCurrentPage(page);
            const auditLogsCopy = [...auditLogs];
            const itemsPerPage = 10;
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const currentAuditLogs = auditLogsCopy.slice(startIndex, endIndex);
            setCurrentPageAuditLogs(currentAuditLogs);
        },
        [auditLogs]
    );
    useEffect(() => {
        async function fetchData() {
            setBusy(true);
            try {
                const response = await post<{ auditLogs: AuditLog[] }, AuditLogFilter>(
                    '/v1/auditLogs',
                    {
                        pattern: searchTerm,
                        userId: email,
                        actions: actions,
                        beginDate: beginDate ? formatCanadaDateOnlyString(beginDate) : undefined,
                        endDate: endDate ? formatCanadaDateOnlyString(endDate) : undefined,
                    },
                    { redirectOnError: false }
                );
                if (response.auditLogs && response.auditLogs.length > 0) {
                    setAuditLogs(response.auditLogs);
                } else {
                    setAuditLogs([]);
                }
            } catch (error) {
                alert(error);
            }
            setBusy(false);
        }
        fetchData();
    }, [searchTerm, email, actions, beginDate, endDate]);

    useEffect(() => {
        prepareCurrentPageAuditLogs(1);
    }, [prepareCurrentPageAuditLogs]);

    const openDetails = (log: AuditLog) => {
        if (log.status !== undefined) {
            setActionText(log.action);
            setDesc(log.description);
            setTimestamp(formatDateString(log.timestamp) ?? '');
            setContent(log.status.description ?? '');
            setOpenDetailDialog(true);
        }
    };

    return (
        <>
            <div className={styles['container']}>
                <PageTitle title="PRIVACY PORTAL" fontColor="#004A8F" />
                <h2 className={styles['heading']} data-testid="page-heading">
                    Audit Logs
                </h2>
                <div>
                    Below is a detailed record of all admin actions which include adding or updating services,
                    publishing changes to environments, and rolling back or discarding updates.
                </div>
                <GoabCircularProgress
                    variant="fullscreen"
                    size="large"
                    message="Loading..."
                    visible={showBusy}
                ></GoabCircularProgress>
                <GoabModal
                    heading={<div className={styles['modal-heading']}>Description of changes made</div>}
                    role="dialog"
                    open={openDetailDialog}
                    actions={
                        <GoabButtonGroup alignment="end">
                            <GoabButton type="primary" onClick={() => setOpenDetailDialog(false)}>
                                Back to audit log
                            </GoabButton>
                        </GoabButtonGroup>
                    }
                >
                    <div className={styles['modal-div']}>
                        <div className={styles['modal-row']}>
                            <div className={styles['modal-label']}>Action:</div>
                            <div className={styles['model-value']}>{actionText}</div>
                        </div>
                        <div className={styles['modal-row']}>
                            <div className={styles['modal-label']}>Description:</div>
                            <div className={styles['model-value']}>{desc}</div>
                        </div>
                        <div className={styles['modal-row']}>
                            <div className={styles['modal-label']}>Timestamp:</div>
                            <div className={styles['model-value']}>{timestamp}</div>
                        </div>
                        <GoabSpacer vSpacing={'s'}></GoabSpacer>
                        <div className={styles['raw-section-content']} dangerouslySetInnerHTML={{ __html: content }} />
                    </div>
                </GoabModal>
                <AuditLogSearchFilter />
                <div className={styles['table-container']} data-testid="table-container">
                    <GoabTable width="100%" testId="all-audit-log-table">
                        <thead className={styles['tbl-thead']}>
                            <tr>
                                <th>User</th>
                                <th>Action</th>
                                <th>Description</th>
                                <th>Timestamp</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentPageAuditLogs.map((auditLog) => {
                                return (
                                    <tr key={auditLog.id}>
                                        <td>{auditLog.userId}</td>
                                        <td>
                                            <div
                                                className={
                                                    auditLog.action === 'Published'
                                                        ? styles['publish-action']
                                                        : auditLog.action === 'Rolled back'
                                                        ? styles['rollback-action']
                                                        : auditLog.action === 'Updated'
                                                        ? styles['update-action']
                                                        : styles['add-action']
                                                }
                                            >
                                                {auditLog.action}
                                            </div>
                                        </td>
                                        <td>{auditLog.description}</td>
                                        <td>{formatDateString(auditLog.timestamp)}</td>
                                        <td>
                                            {auditLog.status ? (
                                                <button
                                                    className={styles['link-btn']}
                                                    onClick={() => {
                                                        openDetails(auditLog);
                                                    }}
                                                >
                                                    View
                                                </button>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </GoabTable>
                </div>
                <div className={styles['pagination-container']} data-testid="pagination-container">
                    <GoabPagination
                        testId="audit-log-table-pagination"
                        itemCount={auditLogs.length}
                        perPageCount={10}
                        pageNumber={currentPage}
                        onChange={({ page }) => prepareCurrentPageAuditLogs(page)}
                    />
                </div>
            </div>
        </>
    );
};

const AuditLogPage: React.FC = (): React.ReactElement => {
    return (
        <AuditLogSearchFilterProvider>
            <AuditLogs />
        </AuditLogSearchFilterProvider>
    );
};
export default AuditLogPage;
