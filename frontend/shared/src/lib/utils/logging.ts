// src/utils/logging.ts
import { ErrorInfo } from 'react';
import { getAppInsightsInstance } from './appInsights';

/**
 * Log error to Application Insights
 * @param error Error object
 * @param info Error information
 */
export const logError = (error: Error, info: ErrorInfo): void => {
    const appInsights = getAppInsightsInstance();
    if (appInsights) {
        appInsights.trackException({ exception: error, properties: { componentStack: info.componentStack } });
    }
};
