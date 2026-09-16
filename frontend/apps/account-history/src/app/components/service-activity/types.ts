export interface DropDownEntry {
    id: string;
    label: string;
}

export interface ActivityDetail {
    label: string;
    value: string;
}

export interface ActivityEvent {
    id: string;
    serviceId: string;
    event: string;
    categoryId: string;
    occurredAt: string;
    details?: ActivityDetail[];
}

export interface ActivityService {
    id: string;
    name: string;
    description: string;
    /** Part of the description rendered as a link, where the service has one. */
    descriptionLinkText?: string;
    categoryId: string;
    categoryLabel: string;
    ministry: string;
    accessServiceUrl?: string;
    /** False where the service has not published its details yet. */
    detailsAvailable: boolean;
    personalInformation?: string[];
    howPersonalInformationIsUsed?: string;
    legislation?: { summary: string; label: string; url: string };
}

export interface ServiceActivity {
    availableFrom?: string;
    categories: DropDownEntry[];
    services?: ActivityService[];
    service?: ActivityService;
    events: ActivityEvent[];
}
