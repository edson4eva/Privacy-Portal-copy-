// eslint-disable-next-line unicorn/prevent-abbreviations
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

export const formatDateString = (dateString: string | Date | undefined): string | undefined => {
    if (dateString) {
        const formattedDate = formatDate(dateString);
        return `${formattedDate.formattedDate} ${formattedDate.formattedTime}`;
    } else {
        return undefined;
    }
};

export const randomDate = (start: Date, end: Date): Date => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

export const formatDateOnlyString = (date: Date | undefined): string | undefined => {
    if (date) {
        const optionsDate: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'America/Edmonton',
        };
        return date.toLocaleDateString(undefined, optionsDate);
    } else {
        return undefined;
    }
};
export const formatCanadaDateOnlyString = (date: Date | undefined): string | undefined => {
    if (date) {
        return date.toLocaleDateString('en-CA', { timeZone: 'America/Edmonton' });
    } else {
        return undefined;
    }
};
