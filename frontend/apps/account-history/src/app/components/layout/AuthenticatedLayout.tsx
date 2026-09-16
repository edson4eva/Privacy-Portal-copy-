import { matchPath, Route, Routes, useLocation } from 'react-router-dom';
import SignedInOnly from 'shared/src/lib/authentication/SignedInOnly';
import SignoutRoute from 'shared/src/lib/authentication/SignoutRoute';
import { SHARED_ROUTES } from 'shared/src/lib/authentication/auth-routes';
import { AppFooter } from 'shared/src/lib/app-footer';
import { AppHeader } from 'shared/src/lib/app-header';
import { AppSideMenu, SideMenuItem } from 'shared/src/lib/app-side-menu';
import { ProfileRoute, useAuth } from 'shared/src/lib/context/auth-provider';
import AccountHistory from '../../pages/AccountHistory';
import NotFoundPage from '../../pages/NotFound';
import ServiceActivityDetail from '../service-activity/ServiceActivityDetail';
import ServiceActivityPage from '../service-activity/ServiceActivityPage';
import NoAccess from '../no-access/NoAccess';
import styles from './AuthenticatedLayout.module.scss';
import InternalServerError from '../shared/InternalServerError';
import { ErrorBoundary } from 'react-error-boundary';
import FallbackUI from '../shared/FallbackPage';
import { logError } from 'shared/src/lib/utils/logging';
import useWindowWidth from 'shared/src/lib/utils/useWindowWidth';

const AuthenticatedLayout = (): React.ReactElement => {
    const isMobile = useWindowWidth() <= 623;
    const location = useLocation();
    const routesToExcludeHeaderOnMobile: string[] = ['accessed-services/:service'];
    const shouldHideHeader =
        routesToExcludeHeaderOnMobile.some((pattern) => matchPath(pattern, location.pathname)) && isMobile;

    const { getCurrentUser, hasLoaded } = useAuth();

    const getMenuItems = () => {
        const model = (getCurrentUser()?.userMenu?.left || []) as SideMenuItem[];
        return model;
    };

    if (!hasLoaded) {
        return <div>Loading...</div>;
    }

    return (
        <SignedInOnly>
            {!shouldHideHeader && <AppHeader />}

            <div className={styles['container']}>
                <div className="uiam--side-menu">
                    <AppSideMenu
                        basePath={process.env.NX_PUBLIC_BASE_HREF?.replace(/\/+$/, '')}
                        items={getMenuItems()}
                    />
                </div>

                <div className={styles['content']}>
                    <ErrorBoundary fallbackRender={FallbackUI} onError={logError}>
                        <Routes>
                            <Route path="/error" element={<InternalServerError />} />
                            <Route
                                path="/"
                                element={
                                    <ProfileRoute profile={'personal'}>
                                        <AccountHistory isPreview={false} />
                                    </ProfileRoute>
                                }
                            />
                            <Route
                                path="/preview"
                                element={
                                    <ProfileRoute profile={'personal'}>
                                        <AccountHistory isPreview={true} />
                                    </ProfileRoute>
                                }
                            />
                            <Route
                                path="/accessed-services"
                                element={
                                    <ProfileRoute profile={'personal'}>
                                        <ServiceActivityPage isPreview={false} />
                                    </ProfileRoute>
                                }
                            />
                            <Route
                                path="/preview/accessed-services"
                                element={<ServiceActivityPage isPreview={true} />}
                            />
                            <Route
                                path="/accessed-services/:service"
                                element={
                                    <ProfileRoute profile={'personal'}>
                                        <ServiceActivityDetail isPreview={false} />
                                    </ProfileRoute>
                                }
                            />
                            <Route
                                path="/preview/accessed-services/:service"
                                element={<ServiceActivityDetail isPreview={true} />}
                            />
                            <Route path="/no-access" element={<NoAccess />} />
                            <Route path={SHARED_ROUTES.signout} element={<SignoutRoute title="Sign Out" />} />

                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </ErrorBoundary>
                </div>
            </div>
            <AppFooter />
        </SignedInOnly>
    );
};

export default AuthenticatedLayout;
