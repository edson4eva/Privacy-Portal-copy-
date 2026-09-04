import { useEffect, useState } from 'react';
import {
    createBrowserRouter,
    createRoutesFromElements,
    matchPath,
    Outlet,
    Route,
    RouterProvider,
    Routes,
    useLocation,
} from 'react-router-dom';
import SignedInOnly from 'shared/src/lib/authentication/SignedInOnly';
import SignedOutRoute from 'shared/src/lib/authentication/SignedOutRoute';
import SignoutRoute from 'shared/src/lib/authentication/SignoutRoute';
import { SHARED_ROUTES } from 'shared/src/lib/authentication/auth-routes';
import { AppFooter } from 'shared/src/lib/app-footer';
import { AdminAppHeader } from 'shared/src/lib/app-header/admin/AdminAppHeader';
import { AppSideMenu, SideMenuItem } from 'shared/src/lib/app-side-menu';
import { ProfileRoute, useAuth } from 'shared/src/lib/context/auth-provider';

import NotFoundPage from '../../pages/NotFound';

import styles from './AuthenticatedLayout.module.scss';
import Dashboard from '../../pages/Dashboard';
import AuditLogs from '../../pages/AuditLogs';
import Publish from '../../pages/Publish';
import ServicesList from '../../pages/ServicesList';
import AdminOnly from '../admin-only/AdminOnly';
import EditService from '../../pages/EditService';
import AddService from '../../pages/AddService';
import PreviewService from '../../pages/PreviewService';

const AuthenticatedLayout = (): React.ReactElement => {
    const routesToExcludeHeaderOnMobile: string[] = ['accessed-services/:service'];
    const [isMobile, setIsMobile] = useState(false);
    const location = useLocation();
    const shouldHideHeader =
        routesToExcludeHeaderOnMobile.some((pattern) => matchPath(pattern, location.pathname)) && isMobile;

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 623);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            {!shouldHideHeader && <AdminAppHeader />}
            <div className={styles['container']}>
                <div className={styles['content']}>
                    <Outlet />
                </div>
            </div>
            <AppFooter />
        </>
    );
};

export default AuthenticatedLayout;
