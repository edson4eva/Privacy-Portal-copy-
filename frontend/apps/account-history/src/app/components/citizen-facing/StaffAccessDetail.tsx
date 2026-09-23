import { GoabButton, GoabCircularProgress, GoabDetails, GoabIcon } from '@abgov/react-components';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get } from 'shared/src/lib/api/dataService';
import PageTitle from 'shared/src/lib/page-title/PageTitle';
import { PpSpacer } from 'shared/src/lib/pp-spacer/PpSpacer';
import useWindowWidth from 'shared/src/lib/utils/useWindowWidth';

import { StaffAccessRecord, formatAccessedAt, isUnderReview } from './staffAccess';
import styles from './StaffAccessPage.module.scss';

/**
 * One row of the record. Rows whose field the source system did not capture
 * are left out entirely rather than shown as blank: the guide treats an
 * uncaptured field and an empty one as different things, and a page full of
 * "Not recorded" tells the reader nothing.
 */
const Row = ({ label, value }: { label: string; value?: React.ReactNode }): React.ReactElement | null => {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    return (
        <>
            <div className={styles['label']}>{label}</div>
            <div className={styles['value']}>{value}</div>
        </>
    );
};

/** A group of rows under the question it answers, as the guide arranges them. */
const Section = ({
    heading,
    note,
    children,
    testId,
}: {
    heading: string;
    note?: string;
    children: React.ReactNode;
    testId: string;
}): React.ReactElement => (
    <section className={styles['section']} data-testid={testId}>
        <h2 className={styles['section-heading']}>{heading}</h2>
        {note && <p className={styles['section-note']}>{note}</p>}
        <div className={styles['rows']}>{children}</div>
    </section>
);

const list = (values?: string[]): string | undefined => (values && values.length ? values.join(', ') : undefined);

/** Each element on its own line, so a long list can be read down rather than across. */
const bullets = (values?: string[], testId?: string): React.ReactElement | undefined =>
    values && values.length ? (
        <ul className={styles['element-list']} data-testid={testId}>
            {values.map((value) => (
                <li key={value}>{value}</li>
            ))}
        </ul>
    ) : undefined;

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
    const flags = record.anomalyFlags ?? [];
    /**
     * The record names the post that made the access, not the person holding
     * it: an outside party by the organization it belongs to, a ministry post
     * by its program area, and either by its position ID.
     */
    const accessor = [record.organization ?? record.unit, record.positionId ? `(${record.positionId})` : '']
        .filter(Boolean)
        .join(' ');
    const underReview = isUnderReview(record);

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
            <p className={styles['intro']} data-testid="record-summary">
                {accessor} looked at your information on {when.date} at {when.time} {when.zone}
                {record.system ? ` in ${record.system}` : ''}.
            </p>

            {(flags.length > 0 || underReview) && (
                <>
                    <PpSpacer vSpacing="m" />
                    <div className={styles['flag-list']} data-testid="record-flags">
                        {underReview && <span className={styles['chip-review']}>{record.reviewOutcome}</span>}
                        {flags.map((flag) => (
                            <span className={styles['chip-flag']} key={flag}>
                                {flag}
                            </span>
                        ))}
                    </div>
                </>
            )}

            <PpSpacer vSpacing="l" />

            <div className={styles['record']} data-testid="access-record">
                <Section heading="Who accessed your information" testId="section-who">
                    <Row
                        label="Position ID"
                        value={
                            record.positionId ? (
                                <span className={styles['identifier']}>{record.positionId}</span>
                            ) : undefined
                        }
                    />
                    <Row label="Position" value={record.role} />
                    <Row label="Organization" value={record.organization} />
                    <Row label="Ministry" value={record.ministry} />
                    <Row label="Program area" value={record.unit} />
                    <Row label="Work location" value={record.officeLocation} />
                    <Row label="Employee type" value={record.employeeType} />
                    <Row label="Relationship to you" value={record.relationshipDeclared} />
                </Section>

                <Section heading="When it happened" testId="section-when">
                    <Row label="Date and time" value={`${when.date} ${when.time} ${when.zone}`} />
                    <Row label="Time spent on your record" value={record.duration} />
                    <Row label="Business hours" value={record.businessHours} />
                    <Row label="Records opened in the session" value={record.recordsViewed} />
                </Section>

                <Section heading="What they looked at" testId="section-what">
                    <Row label="Category" value={list(record.categories)} />
                    <Row label="Type of information accessed" value={bullets(record.information, 'information-list')} />
                    <Row label="Sensitivity" value={record.sensitivity} />
                    <Row label="What was done" value={record.accessType} />
                    <Row label="Identifiers on screen" value={record.identifierDisplay} />
                    <Row label="Household members also opened" value={record.householdViewed} />
                    {record.changes?.map((change) => (
                        <Row
                            key={change.element}
                            label={`Change to ${change.element.toLowerCase()}`}
                            value={`${change.before} → ${change.after}`}
                        />
                    ))}
                </Section>

                <Section
                    heading="Why they looked"
                    note="A purpose code on its own is not enough, so the employee had to type a reason as well."
                    testId="section-why"
                >
                    <Row label="Reason for inquiry" value={record.reasonType} />
                    <Row label="Reason given" value={record.reasonDetail} />
                    {record.externalReference && (
                        <Row label={record.externalReference.label} value={record.externalReference.value} />
                    )}
                    <Row label="Authority relied on" value={record.legalAuthority} />
                    <Row label="Use of your information" value={record.consistentUse} />
                    <Row label="Consent" value={record.consent} />
                    <Row label="What triggered it" value={record.triggeringEvent} />
                    <Row label="Requested by" value={record.thirdPartyRequester} />
                    <Row label="Were you aware at the time?" value={record.clientAware} />
                </Section>

                {record.disclosure && (
                    <Section
                        heading="Who it was shared with"
                        note="This access did not stay inside the program area."
                        testId="section-disclosure"
                    >
                        <Row label="Shared with" value={record.disclosure.disclosedTo} />
                        <Row label="Type of recipient" value={record.disclosure.recipientType} />
                        <Row label="How it was sent" value={record.disclosure.method} />
                        <Row label="What was sent" value={list(record.disclosure.elements)} />
                        <Row label="Authority for sharing" value={record.disclosure.authority} />
                        <Row label="Agreement" value={record.disclosure.agreement} />
                        <Row label="Destruction required" value={record.disclosure.retention} />
                        <Row label="Entered in the disclosure log" value={record.disclosure.logged} />
                    </Section>
                )}

                <Section heading="Review of this access" testId="section-review">
                    <Row label="Was the access appropriate?" value={record.reviewOutcome} />
                    <Row label="Flags raised" value={list(flags) ?? 'None'} />
                    <Row label="Reviewed by" value={record.reviewer} />
                    <Row label="Reviewed on" value={record.reviewedOn} />
                    <Row label="Follow-up" value={record.followUp} />
                    <Row label="Privacy breach file" value={record.breachFile} />
                </Section>

                <div className={styles['technical']}>
                    <GoabDetails heading="System and audit details">
                        <div className={styles['rows']} data-testid="section-technical">
                            <Row label="Access record number" value={record.recordId} />
                            <Row label="Service request or file number" value={record.caseNumber} />
                            <Row label="Bulk query number" value={record.batchId} />
                            <Row label="Your internal client number" value={record.clientId} />
                            <Row label="System used" value={record.system} />
                            <Row label="Screen or report" value={record.screen} />
                            <Row label="How they found your record" value={record.searchMethod} />
                            <Row label="Search entered" value={record.searchString} />
                            <Row label="Action performed" value={record.actionPerformed} />
                            <Row label="What came out of it" value={record.output} />
                            <Row label="Access profile used" value={record.accessProfile} />
                            <Row label="Access level" value={record.accessLevel} />
                            <Row label="Device" value={record.device} />
                            <Row label="Network" value={record.networkLocation} />
                            <Row label="Sign-in method" value={record.authMethod} />
                        </div>
                    </GoabDetails>
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
