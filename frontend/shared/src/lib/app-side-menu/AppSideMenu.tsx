import { GoabIcon, GoabSideMenu, GoabSideMenuGroup } from '@abgov/react-components';
import { JSX, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { trackEvent } from '../api/tagManagerService';
import { GoabIconType } from '@abgov/ui-components-common';
import styles from './AppSideMenu.module.scss';

interface SideMenuLink {
    type: 'link';
    href: string;
    heading: string;
    icon?: GoabIconType;
    items?: undefined;
}

interface SideMenuGroup {
    type: 'group';
    href?: undefined;
    heading: string;
    icon?: GoabIconType;
    items: SideMenuItem[];
}

export type SideMenuItem = SideMenuLink | SideMenuGroup;

export interface SideMenuProperties {
    items?: SideMenuItem[];
    basePath: string | undefined;
}

/**
 * True when a menu link points at the page being viewed. A link also counts as
 * current for pages nested beneath it, so choosing a service from Services
 * accessed keeps that entry highlighted.
 */
const isCurrentPath = (linkPath: string, currentPath: string): boolean => {
    if (linkPath === '/' || linkPath === '') {
        return currentPath === '/' || currentPath === '';
    }

    const normalized = linkPath.replace(/\/+$/, '');
    return currentPath === normalized || currentPath.startsWith(`${normalized}/`);
};

const AppSideMenu: React.FC<SideMenuProperties> = function ({ items, basePath }) {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const { pathname } = useLocation();

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const trackClick = (url: URL) => {
        switch (true) {
            case url.pathname.includes('privacy/account-history'):
                trackEvent({
                    action: 'pp_account_history_link_click',
                    category: 'pp_account_history',
                    label: 'pp_view_privacy_account_history',
                });
                break;
            case url.pathname.includes('privacy/complaints'):
                trackEvent({
                    action: 'pp_privacy_complaint_link_click',
                    category: 'pp_privacy_complaint',
                    label: 'pp_privacy_complaint_menu',
                });
                break;
        }
    };

    const [memoedItems, memoedKey] = useMemo(() => {
        const mapMenuItemsToComponents = function (items: SideMenuItem[] | undefined) {
            if (!items) return [];
            return items.map((menuItem) => {
                if (menuItem.type === 'group') {
                    return (
                        <GoabSideMenuGroup
                            key={menuItem.heading}
                            testId={menuItem.heading.replace(' ', '').toLocaleLowerCase() + 'heading'}
                            heading={menuItem.heading}
                            icon={menuItem.icon}
                            mt={windowWidth <= 1023 ? 'm' : 'none'}
                        >
                            {mapMenuItemsToComponents(menuItem.items)}
                        </GoabSideMenuGroup>
                    );
                } else if (menuItem.type === 'link') {
                    return getLink(menuItem);
                } else {
                    // todo: error?
                    return <></>;
                }
            });
        };

        const getLink = (menuItem: SideMenuLink): JSX.Element => {
            const url = new URL(menuItem.href, window.origin);

            if (url.origin === window.origin && basePath && url.pathname.startsWith(basePath)) {
                // Render react router relative link that is within the app
                const path = url.pathname.startsWith(basePath) ? url.pathname.slice(basePath.length) : url.pathname;
                const to = path || '/';
                const isCurrent = isCurrentPath(to, pathname);
                return (
                    <Link
                        onClick={() => trackClick(url)}
                        key={menuItem.heading}
                        to={to}
                        aria-current={isCurrent ? 'page' : undefined}
                        data-testid={menuItem.heading.replace(/ /g, '').toLocaleLowerCase() + 'link'}
                        className={[styles['uiam--side-menu--sub-item'], isCurrent ? styles['current'] : '']
                            .filter(Boolean)
                            .join(' ')}
                    >
                        {menuItem.icon && <GoabIcon type={menuItem.icon} />}
                        {menuItem.heading}
                    </Link>
                );
            } else {
                // Render accessible a tag that links to a different app. The
                // router knows nothing about those paths, so compare against the
                // address the browser is actually on.
                const isCurrent = isCurrentPath(url.pathname, window.location.pathname);
                return (
                    <a
                        onClick={() => trackClick(url)}
                        key={menuItem.heading}
                        href={url.href}
                        rel="noopener noreferrer"
                        aria-current={isCurrent ? 'page' : undefined}
                        className={[styles['uiam--side-menu--sub-item'], isCurrent ? styles['current'] : '']
                            .filter(Boolean)
                            .join(' ')}
                        data-testid={menuItem.heading.replace(/ /g, '').toLocaleLowerCase() + 'link'}
                    >
                        {menuItem.icon && <GoabIcon type={menuItem.icon} />} {menuItem.heading}
                    </a>
                );
            }
        };

        const getSideMenuKey = (items: SideMenuItem[] | undefined) => {
            let key = '';
            if (!items) return '';

            items.forEach((item) => {
                if (item.type === 'group') {
                    key = key + item.heading + getSideMenuKey(item.items);
                } else {
                    key = key + item.heading;
                }
            });

            return key;
        };

        return [mapMenuItemsToComponents(items), getSideMenuKey(items)];
    }, [items, pathname, windowWidth]);

    return (
        <nav>
            {memoedItems && (
                <GoabSideMenu key={memoedKey}>
                    <span style={{ display: 'none' }}></span>{' '}
                    {/* Some wierd stuff happening so we must have this empty span */}
                    {memoedItems}
                </GoabSideMenu>
            )}
        </nav>
    );
};

export { AppSideMenu };
