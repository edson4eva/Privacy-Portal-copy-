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
    it('sets a second name beside the icon and heading', () => {
        renderMenu('/complaints/alberta-wallet');

        const inbox = screen.getByTestId('inboxlink');
        const subLabel = screen.getByTestId('inboxsublabel');
        expect(inbox).toHaveTextContent('Inbox');
        expect(subLabel).toHaveTextContent('(Unified Messaging Service)');

        // The icon and heading are one child, the second name the next, so
        // the two sit side by side on one line.
        const entry = subLabel.parentElement;
        expect(entry?.children).toHaveLength(2);
        const name = entry?.children[0];
        expect(name).toHaveTextContent('Inbox');
        expect(name?.querySelector('img')).not.toBeNull();
        expect(entry?.children[1]).toBe(subLabel);
    });

    it('adds no second name to an entry that goes by one', () => {
        renderMenu('/complaints/alberta-wallet');

        const wallet = screen.getByTestId('albertawalletlink');
        expect(wallet).toHaveTextContent('Alberta Wallet');
        expect(screen.queryByTestId('albertawalletsublabel')).not.toBeInTheDocument();
        // And keeps its right padding, which only the wider entry gives up.
        expect(wallet.className).not.toContain('has-second-name');
    });

    it('marks the entry that carries a second name, so it can take the width', () => {
        renderMenu('/complaints/alberta-wallet');

        expect(screen.getByTestId('inboxlink').className).toContain('has-second-name');
    });

    it('sets the second name beside the heading and centred on it', () => {
        const stylesheet = readFileSync(join(__dirname, 'AppSideMenu.module.scss'), 'utf8').replace(
            /\/\*[\s\S]*?\*\//g,
            ''
        );
        const entry = /\.uiam--side-menu--entry\s*\{([^}]*)\}/.exec(stylesheet);
        const name = /\.uiam--side-menu--entry-name\s*\{([^}]*)\}/.exec(stylesheet);
        const wide = /\.uiam--side-menu--has-second-name\s*\{([^}]*)\}/.exec(stylesheet);

        // Beside, not beneath: a column is what put it on its own line, and
        // wrapping is what put it back there once the row was too tight.
        expect(entry?.[1]).not.toContain('flex-direction: column');
        // Centred, not on the heading's baseline: a baseline sits under the
        // letters, which put the smaller text low against the icon.
        expect(entry?.[1]).toContain('align-items: center');
        expect(entry?.[1]).not.toContain('align-items: baseline');
        expect(entry?.[1]).toContain('flex-wrap: nowrap');
        // The icon still begins where every other entry's icon begins, and
        // does not shrink to make room.
        expect(name?.[1]).toContain('justify-content: flex-start');
        expect(name?.[1]).toContain('flex: 0 0 auto');
        // And the entry gives up its right padding so one line fits. The
        // selector has to name the element too: the rule for a top level
        // entry sets the whole padding shorthand as
        // `goa-side-menu > .sub-item`, which outweighs a lone class and put
        // the padding straight back.
        expect(wide?.[1]).toContain('padding-right: var(--goa-space-none)');
        const selector = /([^{}]*has-second-name[^{]*)\{/.exec(stylesheet)?.[1] ?? '';
        expect(selector).toContain('goa-side-menu >');
        expect(selector).toContain('.uiam--side-menu--sub-item.uiam--side-menu--has-second-name');
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

    it('colours the current entry through the token the component forces', () => {
        /*
         * The component's own styles carry
         *   color: var(--goa-side-menu-child-color-text-selected) !important
         * so no rule this app writes on the link can win. The colour has to
         * be set on the token, which is what this checks.
         */
        const overrides = readFileSync(join(__dirname, '..', '..', 'style', 'overrides.css'), 'utf8').replace(
            /\/\*[\s\S]*?\*\//g,
            ''
        );
        const declared = /--goa-side-menu-child-color-text-selected\s*:\s*([^;]+);/.exec(overrides);

        expect(declared).not.toBeNull();
        expect(declared?.[1].trim()).toBe('var(--goa-color-interactive-default)');
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
