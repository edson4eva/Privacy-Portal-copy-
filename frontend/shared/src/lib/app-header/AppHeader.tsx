/* eslint-disable unicorn/prevent-abbreviations */
import { GoabAppHeader, GoabBlock, GoabButton, GoabDrawer, GoabIcon, GoabLink } from '@abgov/react-components';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './AppHeader.module.scss';

import { API_ROUTES, SHARED_ROUTES } from '../authentication/auth-routes';
import { AppSideMenu } from '../app-side-menu';
import { useAuth } from '../context/auth-provider';
import { getAsync } from '../api/authService';

const AppHeader = (): React.ReactElement => {
    const { isAuthenticated, getCurrentUser } = useAuth();
    const [open, setOpen] = useState<boolean>(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const location = useLocation();
    const [showGuestSignInButton, SetGuestShowSignInButton] = useState<boolean>(false);
    const emailRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [splitEmail, setSplitEmail] = useState<string | null>(null);

    const email = getCurrentUser()?.email || '';
    const name = getCurrentUser()?.name || '';
    const businessName = getCurrentUser()?.businessName || '';

    useEffect(() => {
        if (location.pathname !== '/file-complaint-as-guest' && location.pathname !== '/landing') {
            SetGuestShowSignInButton(true);
        } else {
            SetGuestShowSignInButton(false);
        }
    }, [location]);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        checkEmailWidth();
    }, [email, windowWidth]);

    const checkEmailWidth = () => {
        if (emailRef.current && containerRef.current && email.includes('@')) {
            const emailWidth = emailRef.current.offsetWidth;
            const containerWidth = containerRef.current.offsetWidth;

            const ratio = emailWidth / containerWidth;

            if (ratio > 0.75) {
                const [localPart, domainPart] = email.split('@');
                setSplitEmail(`${localPart}\n@${domainPart}`);
            } else {
                setSplitEmail(null);
            }
        }
    };

    const onMobileMenuClick = () => {
        setOpen(!open);
    };

    const getMenuItems = () => {
        return (getCurrentUser()?.userMenu?.left || []) as any[];
    };

    const redirectToSignIn = async () => {
        const parameters = new URLSearchParams();
        await getAsync<string>(
            `${API_ROUTES.access.signin}${parameters.toString() !== '' ? '?' : ''}${parameters.toString()}`
        );
    };

    return (
        <>
            <section slot="header">
                {/* Below code has be duplicated because GoAAppHeader does not re-rendered so state variable is not working */}
                {showGuestSignInButton && (
                    <GoabAppHeader
                        url={process.env.NX_PUBLIC_LOGO_URL}
                        heading="Alberta.ca Account"
                        maxContentWidth="100%"
                        onMenuClick={windowWidth < 1024 ? onMobileMenuClick : undefined}
                    >
                        {(!isAuthenticated || getCurrentUser()?.profile === 'guest') && (
                            <Link
                                className={`${styles['sign-in-button']} interactive`}
                                to={SHARED_ROUTES.signin}
                                onClick={redirectToSignIn}
                            >
                                Sign in
                            </Link>
                        )}
                        {isAuthenticated && getCurrentUser()?.profile !== 'guest' && (
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
                        )}
                    </GoabAppHeader>
                )}
                {!showGuestSignInButton && (
                    <GoabAppHeader
                        url={process.env.NX_PUBLIC_LOGO_URL}
                        heading="Alberta.ca Account"
                        maxContentWidth="100%"
                        onMenuClick={windowWidth < 1024 ? onMobileMenuClick : undefined}
                    >
                        {isAuthenticated && getCurrentUser()?.profile !== 'guest' && (
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
                        )}
                    </GoabAppHeader>
                )}
            </section>
            {/*We only display Drawer when it is mobile/tablet. The open property is programmatically changed based on the menu button clicked.*/}
            {windowWidth < 1024 && (
                <GoabDrawer open={open} position={'bottom'} heading={'Menu'} onClose={onMobileMenuClick}>
                    {isAuthenticated && (
                        <GoabBlock ml={'m'} gap="xs" direction="row" alignment="start">
                            <div ref={containerRef} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <div>
                                    <GoabIcon type="person-circle" />
                                </div>
                                <div style={{ overflowWrap: 'anywhere' }}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{name}</div>
                                    <div
                                        ref={emailRef}
                                        style={{ fontSize: '1rem', marginBottom: '8px', whiteSpace: 'pre-line' }}
                                    >
                                        {splitEmail ?? email}
                                    </div>
                                    <div>{businessName}</div>
                                </div>
                            </div>
                        </GoabBlock>
                    )}
                    <AppSideMenu
                        basePath={process.env.NX_PUBLIC_BASE_HREF?.replace(/\/+$/, '')}
                        items={getMenuItems()}
                    />

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

export { AppHeader };
