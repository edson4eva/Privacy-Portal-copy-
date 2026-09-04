// eslint-disable-next-line unicorn/prevent-abbreviations
import axios from 'axios';

export const VALIDATION_ERRORS = {
    SERVICE_NAME_MISSING: 'Service name is required.',
    SERVICE_DESC_MISSING: 'Description is required.',
    CATEGORY_MISSING: 'Category is required.',
    DATA_OWNER_MISSING: 'Data Owner is required.',
    SERVICE_LINK_MISSING: 'Service access link is required.',
    SHOW_MOCK_IN_DEV_MISSING: 'ShowMockInDev is required.',
    ORIGIN_MISSING: 'Origin is required.',
    INVALID_ORIGIN: 'Invalid origin.',
    INVALID_CATEGORY: 'Invalid category',
    INVALID_DATAOWNER: 'Invalid data owner.',
    INVALID_SERVICE_LINK: 'Invalid service access link',
    SERVICE_NAME_TOO_LONG: 'Service name no more than 100 characters.',
    SERVICE_DESC_TOO_LONG: 'Description no more than 5000 characters.',
    RPID_TOO_LONG: 'RP ID no more than 100 characters.',
    RPID_UAT_TOO_LONG: 'RP ID (UAT) no more than 100 characters.',
    SKU_TOO_LONG: 'SKU no more than 100 characters.',
    SERVICE_AVAILABILITY_MISSING: 'Service availability is required.',
    RP_ID_MISSING: 'RP ID is required.',
    RP_ID_UAT_MISSING: 'RP ID (UAT) is required.',
    SKU_MISSING: 'SKU is required.',
    SERVICE_NAME_CONFLICT: 'Service name already exists.',
    SERVICE_SKU_CONFLICT: 'SKU already exists.',
    SERVICE_RPID_CONFLICT: 'RP ID already exists.',
    SERVICE_RPID_UAT_CONFLICT: 'RP ID (UAT) already exists.',
};

export const extractAxiosError = (error: unknown): string | undefined => {
    if (axios.isAxiosError(error)) {
        return error.response?.data.detail;
    }
};

export const timeoutFunction = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
