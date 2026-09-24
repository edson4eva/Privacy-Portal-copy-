import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { AppSideMenu, SideMenuItem } from './AppSideMenu';
import { readFileSync } from 'fs';
import { join } from 'path';

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
    {
        type: 'link',
        heading: 'Inbox',
        subheading: '(Unified Messaging Service)',
        iconSrc: 'envelope.svg',
        href: '#',
    },
];

const renderMenu = (path: string) =>
    render(
        <MemoryRouter initialEntries={[path]}>
            <AppSideMenu items={items} basePath="/complaints" />
        </MemoryRouter>
    );

describe('AppSideMenu', () => {
    it('sets a second name on its own line beneath the icon and heading', () => {
        renderMenu('/complaints/alberta-wallet');

        const inbox = screen.getByTestId('inboxlink');
        const subLabel = screen.getByTestId('inboxsublabel');
        expect(inbox).toHaveTextContent('Inbox');
        expect(subLabel).toHaveTextContent('(Unified Messaging Service)');

        // The icon sits on the line above with the heading, not beside the
        // stack, so the second name centres under both of them.
        const stack = subLabel.parentElement;
        expect(stack?.children).toHaveLength(2);
        const firstLine = stack?.children[0];
        expect(firstLine).toHaveTextContent('Inbox');
        expect(firstLine?.querySelector('img')).not.toBeNull();
        expect(stack?.children[1]).toBe(subLabel);
    });

    it('adds no second line to an entry that goes by one name', () => {
        renderMenu('/complaints/alberta-wallet');

        const wallet = screen.getByTestId('albertawalletlink');
        expect(wallet).toHaveTextContent('Alberta Wallet');
        expect(screen.queryByTestId('albertawalletsublabel')).not.toBeInTheDocument();
    });

    it('names the current page in the interactive blue, not the text colour', () => {
        // Comments go first: a check should read declarations, not the prose
        // beside them, and the comment on this rule names the token it
        // replaced.
        const stylesheet = readFileSync(join(__dirname, 'AppSideMenu.module.scss'), 'utf8').replace(
            /\/\*[\s\S]*?\*\//g,
            ''
        );
        const rule = /\.uiam--side-menu--sub-item\.current\s*\{([^}]*)\}/.exec(stylesheet);

        expect(rule).not.toBeNull();
        expect(rule?.[1]).toContain('color: var(--goa-color-interactive-default)');
        // This one resolves through text-default to #333333, which reads as
        // black beside the other entries.
        expect(rule?.[1]).not.toContain('--goa-side-menu-child-color-text-selected');
    });

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

    it('renders an image icon where one is supplied, and the design system icon otherwise', () => {
        renderMenu('/alberta-wallet');

        const inbox = screen.getByTestId('inboxlink');
        const image = inbox.querySelector('img');
        expect(image).toHaveAttribute('src', 'envelope.svg');
        // Decorative, since the entry names itself in text.
        expect(image).toHaveAttribute('alt', '');
        expect(inbox.querySelector('[data-testid^="icon-"]')).toBeNull();
    });

    it('renders every item from the menu model', () => {
        renderMenu('/alberta-wallet');

        expect(screen.getByTestId('group-Personal')).toBeInTheDocument();
        expect(screen.getByText('Payment preferences')).toBeInTheDocument();
        expect(screen.getByText('Alberta Wallet')).toBeInTheDocument();
    });
});
