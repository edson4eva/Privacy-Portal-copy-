export enum PublishStatus {
    NotStarted = 1,
    InDevelopment,
    InUAT,
    InProduction,
    Completed,
}

export interface PublishWorkflowStatus {
    id: string;
    status: number;
    guid?: string;
    description?: string;
    userEmail?: string;
    initiatedAt?: Date;
    previewedInDev?: boolean;
    previewedInUAT?: boolean;
    previewedInProd?: boolean;
    confirmedInDevAt?: Date;
    confirmedInUATAt?: Date;
    completedAt?: Date;
    isPublishDisabled: boolean;
}
