/* eslint-disable unicorn/prevent-abbreviations */
export const formatDate = (dateString: string | Date): { formattedDate: string; formattedTime: string } => {
    // If timezone is not present, determine the timezone offset based on MST/MDT
    const formattedTimeString = /([+-]\d{2}:\d{2}|Z)$/i.test(dateString.toString())
        ? dateString
        : `${dateString}${getFormattedOffset(dateString)}`;

    // Convert the date string to Date and apply local timezone
    const date = new Date(
        formattedTimeString instanceof Date ? formattedTimeString.toISOString() : formattedTimeString
    );
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Return the formatted date and time
    return {
        formattedDate: date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: userTimeZone,
        }),
        formattedTime: date
            .toLocaleTimeString(undefined, { hour: 'numeric', minute: 'numeric', hour12: true, timeZone: userTimeZone })
            .toLowerCase(),
    };
};

// Helper function to get the formatted offset (-06:00 for MDT, -07:00 for MST)
function getFormattedOffset(dateString: string | Date): string {
    const timezoneOffset = getZoneOffset(dateString);
    return `${timezoneOffset < 0 ? '-' : '+'}${Math.abs(timezoneOffset).toString().padStart(2, '0')}:00`;
}

// Helper function to get the offset (-6 for MDT, -7 for MST)
function getZoneOffset(dateString: string | Date): number {
    const currentDate = new Date(dateString instanceof Date ? dateString.toISOString() : dateString);
    const options: Intl.DateTimeFormatOptions = { timeZone: 'America/Denver', timeZoneName: 'short' };
    return currentDate.toLocaleString('en-US', options).includes('MDT') ? -6 : -7;
}
