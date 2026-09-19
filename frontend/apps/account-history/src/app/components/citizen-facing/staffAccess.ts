export interface StaffAccessRecord {
    id: string;
    name: string;
    username: string;
    role: string;
    unit: string;
    accessedAt: string;
    categories: string[];
    information: string[];
    reasonType: string;
    reasonDetail: string;
    system?: string;
    accessType?: string;
}

/** Access is recorded by provincial systems, so it is shown in Alberta's time. */
const ALBERTA_TIME_ZONE = 'America/Edmonton';

/**
 * Splits a timestamp into the parts the table shows: an ISO date, a 24-hour
 * time, and the zone. Pinned to Alberta rather than the reader's own zone, so
 * the record matches the log it came from.
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
