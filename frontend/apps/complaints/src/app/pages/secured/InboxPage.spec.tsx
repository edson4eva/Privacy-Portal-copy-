import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import InboxPage from './InboxPage';

jest.mock('@abgov/react-components', () => ({
    GoabCallout: ({ type, children }: { type: string; children: React.ReactNode }) => (
        <aside data-testid={`callout-${type}`}>{children}</aside>
    ),
    GoabButton: ({
        children,
        onClick,
        testId,
    }: {
        children: React.ReactNode;
        onClick?: () => void;
        testId?: string;
    }) => (
        <button data-testid={testId} onClick={onClick}>
            {children}
        </button>
    ),
    GoabCheckbox: ({
        checked,
        onChange,
        testId,
        text,
    }: {
        checked?: boolean;
        onChange?: (d: { checked: boolean }) => void;
        testId?: string;
        text?: string;
    }) => (
        <label>
            <input
                type="checkbox"
                data-testid={testId}
                checked={!!checked}
                onChange={(e) => onChange?.({ checked: e.target.checked })}
            />
            {text}
        </label>
    ),
    GoabCircularProgress: ({ visible }: { visible: boolean }) => <div data-testid="spinner">{String(visible)}</div>,
    GoabDropdown: ({
        value,
        onChange,
        testId,
        children,
    }: {
        value?: string;
        onChange?: (d: { value?: string }) => void;
        testId?: string;
        children?: React.ReactNode;
    }) => (
        <select data-testid={testId} value={value} onChange={(e) => onChange?.({ value: e.target.value })}>
            {children}
        </select>
    ),
    GoabDropdownItem: ({ value, label }: { value: string; label: string }) => <option value={value}>{label}</option>,
    GoabIcon: ({ type }: { type: string }) => <i data-testid={`icon-${type}`} />,
    GoabInput: ({
        value,
        onChange,
        testId,
        placeholder,
    }: {
        value?: string;
        onChange?: (d: { name: string; value: string }) => void;
        testId?: string;
        placeholder?: string;
    }) => (
        <input
            data-testid={testId}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange?.({ name: 'inbox-search', value: e.target.value })}
        />
    ),
}));

jest.mock('shared/src/lib/api/dataService', () => ({ get: jest.fn() }));

import { get } from 'shared/src/lib/api/dataService';
const mockGet = get as jest.Mock;

const programs = [
    { id: 'upcoming-renewals', name: 'Upcoming Renewals', colour: '#b4550a' },
    { id: 'alberta-wallet', name: 'Alberta Wallet', colour: '#0f7b3f' },
];

const messages = [
    {
        id: 'msg-1',
        programId: 'upcoming-renewals',
        subject: "Your driver's licence expires October 5, 2026",
        preview: 'Renew online in about 10 minutes, or book a registry visit.',
        tag: 'Action required',
        isUnread: true,
        receivedAt: '2026-09-05T21:30:00.000Z',
    },
    {
        id: 'msg-2',
        programId: 'alberta-wallet',
        subject: 'Alberta Wallet terms of use have been updated',
        preview: 'Changes take effect September 15, 2026.',
        receivedAt: '2026-07-30T18:04:00.000Z',
        from: 'Technology and Innovation',
    },
    {
        id: 'msg-3',
        programId: 'alberta-wallet',
        subject: 'Your digital licence is ready',
        preview: 'Add it once and use it on your phone.',
        receivedAt: '2026-08-26T16:33:00.000Z',
        from: 'Technology and Innovation',
        referenceNumber: 'AW-2026-0001',
        respondBy: '2099-01-31',
        greeting: 'Hello Demo,',
        paragraphs: ['A digital licence is ready to add.'],
        callout: { title: 'Respond soon', text: 'Add the licence before the date shown.' },
        sections: [{ heading: 'What you will need', bullets: ['Your phone'] }],
        actions: [{ label: 'Add to wallet', kind: 'primary' }],
        attachment: { name: 'Licence summary (PDF)', meta: 'PDF, 12 KB' },
        relatedLinks: ['About Alberta Wallet'],
        help: {
            name: 'Wallet Support',
            lines: ['310-0000'],
            contactLabel: 'Contact support',
            contactHref: 'https://www.alberta.ca/service-alberta',
        },
    },
];

const payload = { inbox: { programs, messages } };
const renderPage = (entry = '/inbox') =>
    render(
        <MemoryRouter initialEntries={[entry]}>
            {/* Stands in for the side menu entry, which is a router link to this page. */}
            <Link to="/inbox" data-testid="nav-inbox">
                Inbox
            </Link>
            <Routes>
                <Route path="/inbox" element={<InboxPage />} />
            </Routes>
        </MemoryRouter>
    );

describe('InboxPage', () => {
    beforeEach(() => jest.clearAllMocks());

    it('renders the heading, warning copy and both messages', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByRole('heading', { name: 'Inbox' })).toBeInTheDocument());
        expect(screen.getByText(/never ask for your password/)).toBeInTheDocument();
        expect(screen.getByTestId('row-msg-1')).toBeInTheDocument();
        expect(screen.getByTestId('row-msg-2')).toBeInTheDocument();
        expect(mockGet).toHaveBeenCalledWith('/v1/inbox');
    });

    it('filters by program when a chip is chosen', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('chip-alberta-wallet')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('chip-alberta-wallet'));

        expect(screen.queryByTestId('row-msg-1')).not.toBeInTheDocument();
        expect(screen.getByTestId('row-msg-2')).toBeInTheDocument();
    });

    it('searches across subject, preview and program', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('inbox-search')).toBeInTheDocument());
        fireEvent.change(screen.getByTestId('inbox-search'), { target: { value: 'registry' } });

        expect(screen.getByTestId('row-msg-1')).toBeInTheDocument();
        expect(screen.queryByTestId('row-msg-2')).not.toBeInTheDocument();
    });

    it('shows only unread messages when asked', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('unread-only')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('unread-only'));

        expect(screen.getByTestId('row-msg-1')).toBeInTheDocument();
        expect(screen.queryByTestId('row-msg-2')).not.toBeInTheDocument();
    });

    it('reverses the order when sorted oldest first', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('inbox-sort')).toBeInTheDocument());
        const before = screen.getAllByTestId(/^row-msg-/).map((row) => row.getAttribute('data-testid'));
        expect(before[0]).toBe('row-msg-1');

        fireEvent.change(screen.getByTestId('inbox-sort'), { target: { value: 'oldest' } });
        const after = screen.getAllByTestId(/^row-msg-/).map((row) => row.getAttribute('data-testid'));
        expect(after[0]).toBe('row-msg-2');
    });

    it('opens a message and marks it read', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('row-msg-1')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('row-msg-1'));

        expect(screen.getByTestId('message-detail')).toBeInTheDocument();
        expect(screen.getByText("Your driver's licence expires October 5, 2026")).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('back-to-inbox'));
        // It was the only unread message, so filtering by unread now finds none.
        fireEvent.click(screen.getByTestId('unread-only'));
        expect(screen.getByTestId('inbox-empty')).toBeInTheDocument();
    });

    it('shows the sender, respond-by date, attachment and program history', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('row-msg-3')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('row-msg-3'));

        expect(screen.getByTestId('detail-from')).toHaveTextContent('Technology and Innovation');
        expect(screen.getByTestId('detail-respond-by')).toHaveTextContent('January 31, 2099');
        expect(screen.getByTestId('detail-attachment')).toHaveTextContent('Licence summary (PDF)');
        expect(screen.getByText('What you will need')).toBeInTheDocument();
        // Same program, so the other Wallet message is offered.
        expect(screen.getByTestId('history-msg-2')).toBeInTheDocument();
    });

    it('counts the days remaining rather than printing a fixed number', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('row-msg-3')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('row-msg-3'));

        expect(screen.getByTestId('detail-callout').textContent).toMatch(/\d+ days left to respond/);
    });

    it('marks a message unread again from the detail view', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('row-msg-2')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('row-msg-2'));
        fireEvent.click(screen.getByTestId('mark-unread'));

        // Back on the list, and it now survives the unread filter.
        fireEvent.click(screen.getByTestId('unread-only'));
        expect(screen.getByTestId('row-msg-2')).toBeInTheDocument();
    });

    it('archives a message and shows it in the archived list', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('row-msg-2')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('row-msg-2'));
        fireEvent.click(screen.getByTestId('archive'));

        expect(screen.queryByTestId('row-msg-2')).not.toBeInTheDocument();

        fireEvent.click(screen.getByTestId('toggle-archived'));
        expect(screen.getByText('Archived messages')).toBeInTheDocument();
        expect(screen.getByTestId('row-msg-2')).toBeInTheDocument();
    });

    it('steps to the next message in the list being read', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('row-msg-1')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('row-msg-1'));

        // Newest first, so msg-1 is at the top and has no previous.
        expect(screen.getByTestId('previous-message')).toBeDisabled();
        fireEvent.click(screen.getByTestId('next-message'));
        expect(screen.getByText('Your digital licence is ready')).toBeInTheDocument();
    });

    it('links the contact label where the message gives a destination', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('row-msg-3')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('row-msg-3'));

        const link = screen.getByTestId('help-contact-link');
        expect(link).toHaveAttribute('href', 'https://www.alberta.ca/service-alberta');
        expect(link).toHaveAttribute('target', '_blank');
        // Leaving the portal must not hand the opener to the other site.
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(link).toHaveTextContent('Contact support');
    });

    it('says where a program action is completed instead of pretending to do it', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('row-msg-3')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('row-msg-3'));

        expect(screen.queryByTestId('action-notice')).not.toBeInTheDocument();
        fireEvent.click(screen.getByTestId('action-primary'));
        expect(screen.getByTestId('action-notice')).toHaveTextContent(/not part of this application/);
    });

    it('explains when nothing matches', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('inbox-search')).toBeInTheDocument());
        fireEvent.change(screen.getByTestId('inbox-search'), { target: { value: 'zzzzz' } });

        expect(screen.getByTestId('inbox-empty')).toBeInTheDocument();
    });

    it('opens a message straight from a link', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage('/inbox?message=msg-3');

        await waitFor(() => expect(screen.getByTestId('message-detail')).toBeInTheDocument());
        expect(screen.getByText('Your digital licence is ready')).toBeInTheDocument();
    });

    it('returns to the inbox when the side menu entry is chosen while reading', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage('/inbox?message=msg-3');

        await waitFor(() => expect(screen.getByTestId('message-detail')).toBeInTheDocument());

        // Choosing Inbox in the side menu navigates to this page with no query,
        // which must close the open message rather than leave it showing.
        fireEvent.click(screen.getByTestId('nav-inbox'));

        await waitFor(() => expect(screen.queryByTestId('message-detail')).not.toBeInTheDocument());
        expect(screen.getByTestId('row-msg-1')).toBeInTheDocument();
    });

    it('leaves the archived list when the side menu entry is chosen', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage('/inbox?view=archived');

        await waitFor(() => expect(screen.getByText('Archived messages')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('nav-inbox'));

        await waitFor(() => expect(screen.getByRole('heading', { name: 'Inbox' })).toBeInTheDocument());
    });

    it('keeps the archived list in the address so it survives a reload', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage('/inbox?view=archived');

        await waitFor(() => expect(screen.getByText('Archived messages')).toBeInTheDocument());
    });

    it('still renders when the request fails', async () => {
        // Reject at call time; a promise rejected at setup time can surface as an
        // unhandled rejection before the component attaches its catch.
        mockGet.mockImplementation(() => Promise.reject(new Error('boom')));
        renderPage();

        await waitFor(() => expect(screen.getByRole('heading', { name: 'Inbox' })).toBeInTheDocument());
        expect(screen.getByTestId('inbox-empty')).toBeInTheDocument();
    });
});
