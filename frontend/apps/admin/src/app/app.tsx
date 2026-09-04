import '@abgov/web-components';

import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    BrowserRouter as Router,
    RouterProvider,
    useSearchParams,
} from 'react-router-dom';
import { ProfileRoute, useAuth } from 'shared/src/lib/context/auth-provider';
import ScrollToTop from 'shared/src/lib/scroll-to-top/ScrollToTop';

import AuthenticatedLayout from './components/layout/AuthenticatedLayout';
import { API_ROUTES, SHARED_ROUTES } from 'shared/src/lib/authentication/auth-routes';
import React, { ErrorInfo } from 'react';
import { getAsync } from 'shared/src/lib/api';
import { EditLockContextProvider } from './context/EditLockContext';
import AdminOnly from './components/admin-only/AdminOnly';
import Dashboard from './pages/Dashboard';
import PreviewService from './pages/PreviewService';
import ServicesList from './pages/ServicesList';
import EditService from './pages/EditService';
import AddService from './pages/AddService';
import Publish from './pages/Publish';
import AuditLogs from './pages/AuditLogs';
import SignoutRoute from 'shared/src/lib/authentication/SignoutRoute';
import SignedOutRoute from 'shared/src/lib/authentication/SignedOutRoute';
import NotFoundPage from './pages/NotFound';
import { ErrorBoundary } from 'react-error-boundary';
import FallbackUI from './pages/FallbackPage';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

interface AppLayoutProperties {
    children: React.ReactNode;
}
let appInsights: ApplicationInsights | undefined = undefined;
if (process.env.NX_PUBLIC_APP_INSIGHTS_CONNECTION_STRING) {
    appInsights = new ApplicationInsights({
        config: {
            connectionString: process.env.NX_PUBLIC_APP_INSIGHTS_CONNECTION_STRING,
            enableAutoRouteTracking: true, // for SPA routing
        },
    });
    appInsights.loadAppInsights();
}

const AppLayout: React.FC<AppLayoutProperties> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [searchParameters] = useSearchParams();

    if (isAuthenticated) {
        return <>{children}</>;
    } else {
        const parameters = new URLSearchParams();
        if (searchParameters.get('r')) {
            parameters.append('returnUrl', `${SHARED_ROUTES.base}${searchParameters.toString()}`);
        }
        getAsync(`${API_ROUTES.access.signin}${parameters.toString() !== '' ? '?' : ''}${parameters.toString()}`);
        return <div>Redirecting to login.....</div>;
    }
};
export const logError = (error: Error, info: ErrorInfo) => {
    if (appInsights) {
        appInsights.trackException({
            exception: error,
            properties: { componentStack: info.componentStack, appId: 'admin-portal' },
        });
    }
};
const router = createBrowserRouter(
    createRoutesFromElements(
        <Route
            element={
                <AppLayout>
                    <AuthenticatedLayout />
                </AppLayout>
            }
        >
            <Route
                path="/"
                element={
                    <ErrorBoundary fallbackRender={FallbackUI} onError={logError}>
                        <AdminOnly>
                            <Dashboard />
                        </AdminOnly>
                    </ErrorBoundary>
                }
            />
            <Route
                path="/preview-service/:serviceId"
                element={
                    <ErrorBoundary fallbackRender={FallbackUI} onError={logError}>
                        <AdminOnly>
                            <PreviewService />
                        </AdminOnly>
                    </ErrorBoundary>
                }
            />
            <Route
                path="services"
                element={
                    <ErrorBoundary fallbackRender={FallbackUI} onError={logError}>
                        <AdminOnly>
                            <ServicesList />
                        </AdminOnly>
                    </ErrorBoundary>
                }
            />
            <Route
                path="/services/:serviceId"
                element={
                    <ErrorBoundary fallbackRender={FallbackUI} onError={logError}>
                        <AdminOnly>
                            <EditService />
                        </AdminOnly>
                    </ErrorBoundary>
                }
            />
            <Route
                path="add-service"
                element={
                    <ErrorBoundary fallbackRender={FallbackUI} onError={logError}>
                        <AdminOnly>
                            <AddService />
                        </AdminOnly>
                    </ErrorBoundary>
                }
            />
            <Route
                path="publish"
                element={
                    <ErrorBoundary fallbackRender={FallbackUI} onError={logError}>
                        <AdminOnly>
                            <Publish />
                        </AdminOnly>
                    </ErrorBoundary>
                }
            />
            <Route
                path="audit-logs"
                element={
                    <ErrorBoundary fallbackRender={FallbackUI} onError={logError}>
                        <AdminOnly>
                            <AuditLogs />
                        </AdminOnly>
                    </ErrorBoundary>
                }
            />
            <Route path={SHARED_ROUTES.signout} element={<SignoutRoute title="Sign Out" />} />
            <Route path={SHARED_ROUTES.signedOut} element={<SignedOutRoute title="Signed Out" />} />
            <Route path="*" element={<NotFoundPage />} />
        </Route>
    ),
    {
        basename: process.env.NX_PUBLIC_BASE_HREF?.replace(/\/+$/, ''),
    }
);
export function App(): React.ReactElement {
    const { hasLoaded } = useAuth();

    if (!hasLoaded) {
        return <div>Loading Admin...</div>;
    }

    return (
        <ErrorBoundary fallbackRender={FallbackUI} onError={logError}>
            <EditLockContextProvider>
                <RouterProvider router={router} />
            </EditLockContextProvider>
        </ErrorBoundary>
    );
}

export default App;
