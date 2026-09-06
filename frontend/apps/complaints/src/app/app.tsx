import '@abgov/web-components';

import { GoabOneColumnLayout } from '@abgov/react-components';
import { ErrorInfo, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AccessTokenRoute } from 'shared/src/lib/authentication/AccessTokenRoute';
import { AnonymousOnly } from 'shared/src/lib/authentication/AnonymousOnly';
import { SignedInOnly } from 'shared/src/lib/authentication/SignedInOnly';
import { SignedOutRoute } from 'shared/src/lib/authentication/SignedOutRoute';
import { SigninRoute } from 'shared/src/lib/authentication/SigninRoute';
import { SignoutRoute } from 'shared/src/lib/authentication/SignoutRoute';
import { SHARED_ROUTES } from 'shared/src/lib/authentication/auth-routes';
import { AppFooter } from 'shared/src/lib/app-footer';
import { AppHeader } from 'shared/src/lib/app-header';
import { AppSideMenu, SideMenuItem } from 'shared/src/lib/app-side-menu';
import { useAuth } from 'shared/src/lib/context/auth-provider';
import ScrollToTop from 'shared/src/lib/scroll-to-top/ScrollToTop';

import styles from './app.module.scss';
import ComplaintLandingPage from './pages/public/ComplaintLandingPage';
import { ComplaintRedirect } from './pages/public/ComplaintRedirect';
import ComplaintHistory from './pages/secured/ComplaintHistory';
import FileComplaint from './pages/secured/FileComplaint';
import PrivacyFeaturesPage from './pages/public/PrivacyFeaturesPage';
import PersonalInformationPage from './pages/secured/PersonalInformationPage';
import MyIdentificationPage from './pages/secured/MyIdentificationPage';
import AlbertaWalletPage from './pages/secured/AlbertaWalletPage';
import PaymentPreferencesPage from './pages/secured/PaymentPreferencesPage';
import SecuritySettingsPage from './pages/secured/SecuritySettingsPage';
import { ErrorBoundary } from 'react-error-boundary';
import FallbackUI from './pages/public/FallbackPage';
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
export const logError = (error: Error, info: ErrorInfo) => {
    if (appInsights) {
        appInsights.trackException({
            exception: error,
            properties: { componentStack: info.componentStack, appId: 'complaints' },
        });
    }
};

if (process.env.NX_PUBLIC_GOOGLE_ANALYTICS_KEY && process.env.JEST_WORKER_ID === undefined) {
    const key = process.env.NX_PUBLIC_GOOGLE_ANALYTICS_KEY;
    const sdk = document.createElement('script');
    sdk.src = `https://www.googletagmanager.com/gtag/js?id=${key}`;
    sdk.async = true;

    document.head.appendChild(sdk);

    const initScript = document.createElement('script');
    initScript.innerText = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', '${key}');
    `;

    document.head.appendChild(initScript);
}

if (process.env.NX_PUBLIC_PINGDOM_URL && process.env.JEST_WORKER_ID === undefined) {
    const sdk = document.createElement('script');
    sdk.src = process.env.NX_PUBLIC_PINGDOM_URL;
    sdk.async = true;

    document.head.appendChild(sdk);
}

const AppLayout: React.FC<AppLayoutProperties> = ({ children }) => {
    const { getCurrentUser } = useAuth();

    const [isGuest, setIsGuest] = useState(false);
    const [classes, setClasses] = useState(['uiam--side-menu']);

    const getMenuItems = (): SideMenuItem[] => {
        const user = getCurrentUser();
        const model = user?.userMenu?.left || [];
        return model;
    };

    const useIsLandingPage = () => {
        const location = useLocation();
        return location.pathname === '/' || location.pathname === '/landing';
    };

    useEffect(() => {
        const user = getCurrentUser();

        if ((!user || user.profile === 'guest') && !classes.includes('no-user')) {
            setIsGuest(true);
            setClasses((previousClasses) => [...previousClasses, 'no-user']);
        } else if (user && user.profile !== 'guest') {
            setIsGuest(false);
            setClasses((previousClasses) => [...previousClasses.filter((c) => c !== 'no-user')]);
        }
    }, [getCurrentUser]);

    const containerStyles = isGuest ? 'main-container-center-positioned' : 'main-container';
    const isLandingPage = useIsLandingPage();

    return (
        <div className={styles[containerStyles]}>
            {!isLandingPage && (
                <div className={classes.map((cls) => styles[cls] || cls).join(' ')}>
                    <AppSideMenu
                        basePath={process.env.NX_PUBLIC_BASE_HREF?.replace(/\/+$/, '')}
                        items={getMenuItems()}
                    />
                </div>
            )}
            {children}
        </div>
    );
};

export function App(): React.ReactElement {
    return (
        <>
            <ErrorBoundary fallbackRender={FallbackUI} onError={logError}>
                <GoabOneColumnLayout>
                    <ScrollToTop />
                    <section slot="header">
                        <AppHeader />
                    </section>
                    <Routes>
                        <Route
                            path="*"
                            element={
                                <AppLayout>
                                    <Routes>
                                        {/* Default Route to Redict Page */}
                                        <Route path="/" element={<ComplaintRedirect />} />

                                        <Route
                                            path={'/file-complaint'}
                                            element={
                                                <ErrorBoundary fallbackRender={FallbackUI} onError={logError}>
                                                    <SignedInOnly>
                                                        <FileComplaint />
                                                    </SignedInOnly>
                                                </ErrorBoundary>
                                            }
                                        ></Route>
                                        <Route
                                            path={'/file-complaint-as-guest'}
                                            element={
                                                <ErrorBoundary fallbackRender={FallbackUI} onError={logError}>
                                                    <ComplaintLandingPage />
                                                </ErrorBoundary>
                                            }
                                        ></Route>
                                        <Route
                                            path={'/complaint-history'}
                                            element={
                                                <ErrorBoundary fallbackRender={FallbackUI} onError={logError}>
                                                    <SignedInOnly>
                                                        <ComplaintHistory />
                                                    </SignedInOnly>
                                                </ErrorBoundary>
                                            }
                                        ></Route>
                                        <Route
                                            path={'/landing'}
                                            element={
                                                <ErrorBoundary fallbackRender={FallbackUI} onError={logError}>
                                                    <AnonymousOnly redirectPath="/file-complaint">
                                                        <ComplaintLandingPage />
                                                    </AnonymousOnly>
                                                </ErrorBoundary>
                                            }
                                        ></Route>
                                        <Route
                                            path={'/personal-information'}
                                            element={
                                                <ErrorBoundary fallbackRender={FallbackUI} onError={logError}>
                                                    <SignedInOnly>
                                                        <PersonalInformationPage />
                                                    </SignedInOnly>
                                                </ErrorBoundary>
                                            }
                                        ></Route>
                                        <Route
                                            path={'/my-identification'}
                                            element={
                                                <ErrorBoundary fallbackRender={FallbackUI} onError={logError}>
                                                    <SignedInOnly>
                                                        <MyIdentificationPage />
                                                    </SignedInOnly>
                                                </ErrorBoundary>
                                            }
                                        ></Route>
                                        <Route
                                            path={'/alberta-wallet'}
                                            element={
                                                <ErrorBoundary fallbackRender={FallbackUI} onError={logError}>
                                                    <SignedInOnly>
                                                        <AlbertaWalletPage />
                                                    </SignedInOnly>
                                                </ErrorBoundary>
                                            }
                                        ></Route>
                                        <Route
                                            path={'/payment-preferences'}
                                            element={
                                                <ErrorBoundary fallbackRender={FallbackUI} onError={logError}>
                                                    <SignedInOnly>
                                                        <PaymentPreferencesPage />
                                                    </SignedInOnly>
                                                </ErrorBoundary>
                                            }
                                        ></Route>
                                        <Route
                                            path={'/security-settings'}
                                            element={
                                                <ErrorBoundary fallbackRender={FallbackUI} onError={logError}>
                                                    <SignedInOnly>
                                                        <SecuritySettingsPage />
                                                    </SignedInOnly>
                                                </ErrorBoundary>
                                            }
                                        ></Route>
                                        <Route
                                            path={'/features'}
                                            element={
                                                <ErrorBoundary fallbackRender={FallbackUI} onError={logError}>
                                                    <SignedInOnly>
                                                        <PrivacyFeaturesPage></PrivacyFeaturesPage>
                                                    </SignedInOnly>
                                                </ErrorBoundary>
                                            }
                                        ></Route>

                                        <Route element={<AnonymousOnly />}>
                                            <Route
                                                path={SHARED_ROUTES.signin}
                                                element={<SigninRoute title="Sign in" />}
                                            />
                                        </Route>
                                        <Route
                                            path={SHARED_ROUTES.signout}
                                            element={<SignoutRoute title="Sign Out" />}
                                        />
                                        <Route
                                            path={SHARED_ROUTES.signedOut}
                                            element={<SignedOutRoute title="Signed Out" />}
                                        />
                                        <Route
                                            path={SHARED_ROUTES.accessToken}
                                            element={<AccessTokenRoute title="Access Token" />}
                                        />
                                    </Routes>
                                </AppLayout>
                            }
                        />
                    </Routes>
                    <section slot="footer">
                        <AppFooter />
                    </section>
                </GoabOneColumnLayout>
            </ErrorBoundary>
        </>
    );
}

export default App;
