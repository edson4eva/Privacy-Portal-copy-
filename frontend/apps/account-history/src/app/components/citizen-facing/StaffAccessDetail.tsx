import { GoabButton, GoabCircularProgress, GoabIcon } from '@abgov/react-components';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get } from 'shared/src/lib/api/dataService';
import PageTitle from 'shared/src/lib/page-title/PageTitle';
import { PpSpacer } from 'shared/src/lib/pp-spacer/PpSpacer';
import useWindowWidth from 'shared/src/lib/utils/useWindowWidth';

import { StaffAccessRecord, formatAccessedAt } from './staffAccess';
import styles from './StaffAccessPage.module.scss';

const Row = ({ label, value }: { label: string; value?: React.ReactNode }): React.ReactElement => (
    <>
        <div className={styles['label']}>{label}</div>
        <div className={styles['value']}>{value || 'Not recorded'}</div>
    </>
);

export function StaffAccessDetail({ basePath = '/transparency' }: { basePath?: string }): React.ReactElement {
    const windowWidth = useWindowWidth();
    const navigate = useNavigate();
    const { access } = useParams();

    const [record, setRecord] = useState<StaffAccessRecord>();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await get<{ staffAccess: { record: StaffAccessRecord } }>(
                    `/v1/staff-access/${access}`
                );
                setRecord(response?.staffAccess?.record);
            } catch (error) {
                // The access logs are not always reachable. Say so rather than
                // failing the page.
                console.error('Failed to fetch the access record:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [access]);

    const backToList = () => navigate(basePath);

    if (isLoading) {
        return <GoabCircularProgress variant="inline" size="small" visible={true}></GoabCircularProgress>;
    }

    if (!record) {
        return (
            <div className={styles['container']}>
                <p className={styles['empty']} data-testid="record-missing">
                    That access record could not be found.
                </p>
                <PpSpacer vSpacing="l" />
                <GoabButton type="secondary" leadingIcon="arrow-back" onClick={backToList} testId="back-to-list">
                    Back to who accessed your information
                </GoabButton>
            </div>
        );
    }

    const when = formatAccessedAt(record.accessedAt);

    return (
        <div className={styles['container']}>
            {windowWidth <= 623 && <PpSpacer vSpacing="xl" />}

            <GoabButton type="tertiary" leadingIcon="arrow-back" onClick={backToList} testId="back-link">
                Back to who accessed your information
            </GoabButton>

            <PpSpacer vSpacing="m" />
            <PageTitle title="CITIZEN-FACING EXPERIENCE" fontColor="#004F84" />
            <PpSpacer vSpacing="m" />
            <h1 className={styles['page-heading']} data-testid="record-heading">
                {record.reasonType}
            </h1>
            <PpSpacer vSpacing="s" />
            <p className={styles['intro']}>
                {record.name} looked at your information on {when.date} at {when.time} {when.zone}.
            </p>

            <PpSpacer vSpacing="l" />

            <div className={styles['record']} data-testid="access-record">
                <div className={styles['rows']}>
                    <Row
                        label="Who accessed"
                        value={
                            <>
                                {record.name} <span className={styles['username']}>{record.username}</span>
                            </>
                        }
                    />
                    <Row label="Role" value={record.role} />
                    <Row label="Business unit" value={record.unit} />
                    <Row label="Date" value={`${when.date} ${when.time} ${when.zone}`} />
                    <Row label="Category" value={record.categories.join('; ')} />
                    <Row label="Type of information accessed" value={record.information.join(', ')} />
                    <Row label="Reason for inquiry" value={`${record.reasonType} - ${record.reasonDetail}`} />
                    <Row label="System used" value={record.system} />
                    <Row label="What was done" value={record.accessType} />
                </div>
            </div>

            <PpSpacer vSpacing="l" />
            <p className={styles['intro']}>
                Do you not recognise this access, or the reason given for it? You can report it by filing a privacy
                complaint.
            </p>
            <PpSpacer vSpacing="m" />
            <div className={styles['actions']}>
                <GoabButton type="secondary" leadingIcon="arrow-back" onClick={backToList} testId="back-to-list">
                    Back to who accessed your information
                </GoabButton>
                <a
                    href={`${process.env.NX_PUBLIC_COMPLAINTS_BASE_HREF ?? '/'}file-complaint`}
                    target="_self"
                    data-testid="file-complaint-link"
                >
                    File a privacy complaint <GoabIcon type="open" size="small" />
                </a>
            </div>

            <PpSpacer vSpacing="2xl" />
        </div>
    );
}

export default StaffAccessDetail;
