import { ApplicationInsights } from '@microsoft/applicationinsights-web';

let appInsightsInstance: ApplicationInsights | null = null;

export const initializeAppInsights = () => {
    if (appInsightsInstance === null && process.env.NX_PUBLIC_APP_INSIGHTS_CONNECTION_STRING) {
        appInsightsInstance = new ApplicationInsights({
            config: {
                connectionString: process.env.NX_PUBLIC_APP_INSIGHTS_CONNECTION_STRING,
                enableAutoRouteTracking: true, // For SPA routing
            },
        });

        appInsightsInstance.loadAppInsights();
    }

    return appInsightsInstance;
};

export const getAppInsightsInstance = () => {
    return appInsightsInstance;
};
