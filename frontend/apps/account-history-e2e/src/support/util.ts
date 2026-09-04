/* eslint-disable unicorn/prevent-abbreviations */
export const formatDate = (dateString: string | Date): { formattedDate: string; formattedTime: string } => {
    const hasTimeZoneOffset = /[+-]\d{2}:\d{2}$/.test(dateString.toString());
    const formattedDateString = hasTimeZoneOffset ? dateString.toString() : `${dateString}Z`;
    const date = new Date(formattedDateString);
    const optionsDate: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    const formattedDate = date.toLocaleDateString(undefined, optionsDate);

    const optionsTime: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    };
    const formattedTime = date.toLocaleTimeString(undefined, optionsTime).toLowerCase();
    return { formattedDate, formattedTime };
};
