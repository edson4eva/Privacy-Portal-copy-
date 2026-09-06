import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { AppSideMenu, SideMenuItem } from './AppSideMenu';

jest.mock('@abgov/react-components', () => ({
    GoabIcon: ({ type }: { type: string }) => <i data-testid={`icon-${type}`} />,
    GoabSideMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="side-menu">{children}</div>,
    GoabSideMenuGroup: ({ heading, children }: { heading: string; children: React.ReactNode }) => (
        <div data-testid={`group-${heading}`}>
            <span>{heading}</span>
            {children}
        </div>
    ),
}));

jest.mock('../api/tagManagerService', () => ({ trackEvent: jest.fn() }));

const items: SideMenuItem[] = [
    {
        type: 'group',
        heading: 'Personal',
        items: [
            { type: 'link', heading: 'Personal information', href: '/complaints/personal-information' },
            { type: 'link', heading: 'Payment preferences', href: '#' },
        ],
    },
    { type: 'link', heading: 'Alberta Wallet', href: '/complaints/alberta-wallet' },
    { type: 'link', heading: 'Services accessed', href: '/account-history/' },
];

const renderMenu = (path: string) =>
    render(
        <MemoryRouter initialEntries={[path]}>
            <AppSideMenu items={items} basePath="/complaints" />
        </MemoryRouter>
    );

describe('AppSideMenu', () => {
    it('marks the link for the current page', () => {
        renderMenu('/alberta-wallet');

        expect(screen.getByTestId('albertawalletlink')).toHaveAttribute('aria-current', 'page');
        expect(screen.getByTestId('personalinformationlink')).not.toHaveAttribute('aria-current');
    });

    it('keeps a link current for pages nested beneath it', () => {
        renderMenu('/personal-information/edit');

        expect(screen.getByTestId('personalinformationlink')).toHaveAttribute('aria-current', 'page');
    });

    it('does not mark a link current for an unrelated path with the same prefix', () => {
        renderMenu('/alberta-wallet-settings');

        expect(screen.getByTestId('albertawalletlink')).not.toHaveAttribute('aria-current');
    });

    it('renders in-app links as router links and other apps as anchors', () => {
        renderMenu('/alberta-wallet');

        // Same basePath, so the router handles it and no full URL is emitted.
        expect(screen.getByTestId('albertawalletlink')).toHaveAttribute('href', '/alberta-wallet');
        // Different app, so it is a plain anchor to the other path.
        expect(screen.getByTestId('servicesaccessedlink').getAttribute('href')).toContain('/account-history/');
    });

    it('renders every item from the menu model', () => {
        renderMenu('/alberta-wallet');

        expect(screen.getByTestId('group-Personal')).toBeInTheDocument();
        expect(screen.getByText('Payment preferences')).toBeInTheDocument();
        expect(screen.getByText('Alberta Wallet')).toBeInTheDocument();
    });
});
