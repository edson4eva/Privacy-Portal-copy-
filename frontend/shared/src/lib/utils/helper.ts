/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import dayjs from 'dayjs';

export const formatFileSize = (bytes: number) => {
    const KB = 1024;
    const MB = KB * 1024;

    if (bytes >= MB) {
        return `${(bytes / MB).toFixed(2)}MB`;
    } else {
        return `${(bytes / KB).toFixed(2)}KB`;
    }
};

export const getOrdinalSuffix = (day: number) => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const lastDigit = day % 10;
    const lastTwoDigits = day % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
        return suffixes[0];
    }

    return suffixes[lastDigit] || suffixes[0];
};

export const getformattedDateText = () => {
    const date = dayjs();
    const day = date.date();
    const month = date.format('MMMM');
    const year = date.format('YYYY');
    const suffix = getOrdinalSuffix(day);

    return `Uploaded on ${month} ${day}${suffix} ${year}, ${date.format('h:mm a')}`;
};

export const formatComplaintDateSubmissionString = (date: Date | undefined): string => {
    if (date === undefined) {
        return '';
    }
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    const datePart = date?.toLocaleDateString('en-US', options);
    const timePart = date?.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });

    return `${datePart} at ${timePart}`;
};

export const getAcceptedMimes = () => {
    return 'PDF, pdf, DOC, doc, DOCX, docx, JPEG, jpeg, JPG, jpg, PNG, png';
};
