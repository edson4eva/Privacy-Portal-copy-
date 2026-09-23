/**
 * One access event: a Government of Alberta employee looking at the holder's
 * personal information.
 *
 * The shape follows "Access to Citizen Personal Information - Audit and
 * Disclosure Log, Field Reference" (19 September 2026). The five fields of
 * Part 1 are required, because they are the minimum the guide calls a viable
 * record; everything from the Part 2 inventory is optional, because not every
 * system records every field and an access that never left the program area
 * has no disclosure to report.
 */
export interface StaffAccessRecord {
    id: string;

    /* Part 1 - the condensed five-field log. */
    /** Who accessed: name, account, position and program area. */
    name: string;
    username: string;
    /**
     * Identifies the position rather than the person holding it. The list
     * shows this instead of the network account, because an account name is
     * built from a person's own name and so identifies them just as plainly.
     */
    positionId?: string;
    role: string;
    unit: string;
    /** When, as an ISO timestamp; rendered in Alberta time. */
    accessedAt: string;
    /** Broad class of information, from the section 1.2 pick-list. */
    categories: string[];
    /** The specific elements seen within those categories. */
    information: string[];
    /** Business purpose, from the pick-list, plus the mandatory free text. */
    reasonType: string;
    reasonDetail: string;

    /* 2.1 Transaction identifiers. */
    recordId?: string;
    caseNumber?: string;
    batchId?: string;

    /* 2.2 Who accessed the information. */
    ministry?: string;
    /**
     * Set only when the accessor is not a ministry: a registry agent, a
     * service provider, or a private-sector party holding authorized access.
     * The guide keeps employee type separate from the organization, and a
     * reader's first question about an outside party is who they are.
     */
    organization?: string;
    officeLocation?: string;
    accessProfile?: string;
    accessLevel?: string;
    employeeType?: string;

    /* 2.3 When the access occurred. */
    duration?: string;
    businessHours?: string;
    recordsViewed?: number;

    /* 2.4 Whose information was accessed. */
    clientId?: string;
    relationshipDeclared?: string;
    householdViewed?: string;

    /* 2.5 What information was accessed. */
    sensitivity?: string;
    accessType?: string;
    identifierDisplay?: string;
    changes?: { element: string; before: string; after: string }[];

    /* 2.6 Why - reason for inquiry. */
    /**
     * A number the outside party assigned as a result of the access - a
     * parking ticket, an invoice, a file of its own. It is what ties the
     * access to something the reader has actually received, so it is labelled
     * by whatever the party calls it rather than given a generic name.
     */
    externalReference?: { label: string; value: string };
    legalAuthority?: string;
    consistentUse?: string;
    consent?: string;
    triggeringEvent?: string;
    thirdPartyRequester?: string;
    clientAware?: string;

    /* 2.7 How - channel and system. */
    system?: string;
    screen?: string;
    searchMethod?: string;
    searchString?: string;
    actionPerformed?: string;
    output?: string;
    device?: string;
    networkLocation?: string;
    authMethod?: string;

    /* 2.8 Disclosure, where the information left the program area. */
    disclosure?: {
        disclosedTo: string;
        recipientType: string;
        method: string;
        elements: string[];
        authority: string;
        agreement?: string;
        retention?: string;
        logged?: string;
    };

    /* 2.9 Oversight and review. */
    anomalyFlags?: string[];
    reviewOutcome?: string;
    reviewer?: string;
    reviewedOn?: string;
    followUp?: string;
    breachFile?: string;
}

/** Access is recorded by provincial systems, so it is shown in Alberta's time. */
const ALBERTA_TIME_ZONE = 'America/Edmonton';

/**
 * Splits a timestamp into the parts the table shows: an ISO date, a 24-hour
 * time, and the zone. Pinned to Alberta rather than the reader's own zone, so
 * the record matches the log it came from. The guide asks for the zone to be
 * stored and shown with the time, because after-hours access is one of the
 * strongest anomaly signals there is.
 */
export const formatAccessedAt = (value: string): { date: string; time: string; zone: string } => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return { date: value, time: '', zone: '' };
    }

    const parts = new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: ALBERTA_TIME_ZONE,
        timeZoneName: 'short',
    }).formatToParts(parsed);

    const find = (type: string) => parts.find((part) => part.type === type)?.value ?? '';

    return {
        date: `${find('year')}-${find('month')}-${find('day')}`,
        // Midnight comes back as 24 from some engines when hour12 is off.
        time: `${find('hour') === '24' ? '00' : find('hour')}:${find('minute')}`,
        zone: find('timeZoneName'),
    };
};

/**
 * An access still being looked at is worth saying so on the list, because it
 * is the one state where the reader may yet hear something back. A settled
 * "Appropriate" needs no badge; it is what every routine access looks like.
 */
export const isUnderReview = (record: StaffAccessRecord): boolean =>
    /under review|questionable|inappropriate/i.test(record.reviewOutcome ?? '');
