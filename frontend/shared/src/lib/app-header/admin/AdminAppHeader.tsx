import { GoabAppHeader, GoabBlock, GoabButton, GoabDrawer, GoabIcon, GoabLink } from '@abgov/react-components';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './AdminAppHeader.module.scss';

import { API_ROUTES, SHARED_ROUTES } from '../../authentication/auth-routes';
import { AppSideMenu } from '../../app-side-menu';
import { useAuth } from '../../context/auth-provider';
import { getAsync } from '../../api/authService';
import { useSearchParams } from 'react-router-dom';

const AdminAppHeader = (): React.ReactElement => {
    const { isAuthenticated, getCurrentUser } = useAuth();
    const [open, setOpen] = useState<boolean>(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [currentPath, setCurrentPath] = useState<string>('/');

    const location = useLocation();

    useEffect(() => {
        setCurrentPath(location.pathname);
    }, [location]);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navigate = useNavigate();
    const routeChange = (path: string) => {
        navigate(path);
    };

    const onMobileMenuClick = () => {
        setOpen(!open);
    };

    const getMenuItems = () => {
        return (getCurrentUser()?.userMenu?.left || []) as any[];
    };

    const [searchParameters] = useSearchParams();

    const redirectToSignIn = async () => {
        const parameters = new URLSearchParams();
        // if(!!searchParameters.get("r")) {
        //     parameters.append('returnUrl', `${RETURN_BASE_URL}${searchParameters.toString()}`);
        // }

        await getAsync<string>(
            `${API_ROUTES.access.signin}${parameters.toString() !== '' ? '?' : ''}${parameters.toString()}`
        );
    };

    return (
        <>
            <section slot="header">
                <GoabAppHeader
                    url={process.env.NX_PUBLIC_LOGO_URL}
                    heading="Admin panel"
                    maxContentWidth="100%"
                    onMenuClick={windowWidth < 1024 ? onMobileMenuClick : undefined}
                >
                    {(!isAuthenticated || getCurrentUser()?.profile === 'guest') && (
                        // <Link className="interactive" to={SHARED_ROUTES.signin}>
                        <GoabButton onClick={redirectToSignIn}>Sign in</GoabButton>
                        // </Link>
                    )}
                    {isAuthenticated && getCurrentUser()?.profile !== 'guest' && (
                        <>
                            <a role="tab" aria-selected={currentPath === '/'} onClick={() => routeChange('/')}>
                                Dashboard
                            </a>
                            <a
                                role="tab"
                                aria-selected={currentPath.startsWith('/services') || currentPath === '/add-service'}
                                onClick={() => routeChange('services')}
                            >
                                Content
                            </a>
                            <a
                                role="tab"
                                aria-selected={currentPath === '/audit-logs'}
                                onClick={() => routeChange('audit-logs')}
                            >
                                Audit logs
                            </a>
                            <a
                                role="tab"
                                aria-selected={currentPath === '/publish'}
                                onClick={() => routeChange('publish')}
                            >
                                Publish
                            </a>
                            <goa-app-header-menu
                                heading={getCurrentUser()?.firstName || ''}
                                leadingicon="person-circle"
                            >
                                <div className={styles['user-info']}>
                                    <div className="name">{getCurrentUser()?.name}</div>
                                    <div className={styles['email']}>{getCurrentUser()?.email}</div>
                                    {getCurrentUser()?.profile?.includes('business') && (
                                        <div className={styles['business-name']}>{getCurrentUser()?.businessName}</div>
                                    )}
                                </div>
                                <Link className="interactive" to={SHARED_ROUTES.signout}>
                                    Sign out
                                </Link>
                            </goa-app-header-menu>
                        </>
                    )}
                </GoabAppHeader>
            </section>
            {/*We only display Drawer when it is mobile/tablet. The open property is programmatically changed based on the menu button clicked.*/}
            {windowWidth < 1024 && (
                <GoabDrawer open={open} position={'bottom'} heading={'Menu'} onClose={onMobileMenuClick}>
                    {isAuthenticated && (
                        <GoabBlock ml={'m'} gap="xs" direction="row" alignment="start">
                            <GoabIcon type={'person-circle'} />
                            <p style={{ marginBottom: 0 }}>
                                {getCurrentUser()?.name || ''}
                                <br />
                                {getCurrentUser()?.email || ''}
                                {getCurrentUser()?.profile?.includes('business') && (
                                    <div className={styles['business-name']}>{getCurrentUser()?.businessName}</div>
                                )}
                            </p>
                        </GoabBlock>
                    )}
                    <GoabLink ml={'m'} mt={'l'} mb={'l'}>
                        <a role="tab" aria-selected={currentPath === '/'} onClick={() => routeChange('/')}>
                            Dashboard
                        </a>
                    </GoabLink>
                    <GoabLink ml={'m'} mt={'l'} mb={'l'}>
                        <a
                            role="tab"
                            aria-selected={currentPath.startsWith('/services')}
                            onClick={() => routeChange('services')}
                        >
                            Content
                        </a>
                    </GoabLink>
                    <GoabLink ml={'m'} mt={'l'} mb={'l'}>
                        <a
                            role="tab"
                            aria-selected={currentPath === '/audit-logs'}
                            onClick={() => routeChange('audit-logs')}
                        >
                            Audit logs
                        </a>
                    </GoabLink>
                    <GoabLink ml={'m'} mt={'l'} mb={'l'}>
                        <a role="tab" aria-selected={currentPath === '/publish'} onClick={() => routeChange('publish')}>
                            Publish
                        </a>
                    </GoabLink>
                    <GoabLink ml={'m'} mt={'l'} mb={'l'}>
                        {isAuthenticated && getCurrentUser()?.profile !== 'guest' && (
                            <Link className="interactive" to={SHARED_ROUTES.signout}>
                                Sign out
                            </Link>
                        )}
                        {(!isAuthenticated || getCurrentUser()?.profile === 'guest') && (
                            <Link className="interactive" to={SHARED_ROUTES.signin}>
                                Sign in
                            </Link>
                        )}
                    </GoabLink>
                </GoabDrawer>
            )}
        </>
    );
};

export { AdminAppHeader };
