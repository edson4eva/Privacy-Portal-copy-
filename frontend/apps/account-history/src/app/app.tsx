import '@abgov/web-components';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import ScrollToTop from 'shared/src/lib/scroll-to-top/ScrollToTop';
import AuthenticatedLayout from './components/layout/AuthenticatedLayout';
import { ErrorBoundary } from 'react-error-boundary';
import FallbackUI from './components/shared/FallbackPage';
import { AuthProvider } from 'shared/src/lib/context/auth-provider';
import { Route, Routes } from 'react-router-dom';
import { initializeAppInsights } from 'shared/src/lib/utils/appInsights';
import { initializeGoogleAnalytics } from 'shared/src/lib/utils/google-analytics';
import { initializePingdom } from 'shared/src/lib/utils/pingdom';
import { logError } from 'shared/src/lib/utils/logging';
import { useEffect } from 'react';

export function App(): React.ReactElement {
    useEffect(() => {
        initializeAppInsights();
        initializeGoogleAnalytics();
        initializePingdom();
    }, []);

    return (
        <ErrorBoundary fallbackRender={FallbackUI} onError={logError}>
            <Router basename={process.env.NX_PUBLIC_BASE_HREF?.replace(/\/+$/, '')}>
                <ScrollToTop />
                <Routes>
                    {/* Add any public routes (accessible without authentication) here */}
                    <Route
                        path="/*"
                        element={
                            <AuthProvider>
                                <AuthenticatedLayout />
                            </AuthProvider>
                        }
                    />
                </Routes>
            </Router>
        </ErrorBoundary>
    );
}

export default App;
