import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import InboxPage from './InboxPage';

jest.mock('@abgov/react-components', () => ({
    GoabButton: ({ children, onClick, testId }: { children: React.ReactNode; onClick?: () => void; testId?: string }) => (
        <button data-testid={testId} onClick={onClick}>{children}</button>
    ),
    GoabCheckbox: ({ checked, onChange, testId, text }: { checked?: boolean; onChange?: (d: { checked: boolean }) => void; testId?: string; text?: string }) => (
        <label>
            <input type="checkbox" data-testid={testId} checked={!!checked} onChange={(e) => onChange?.({ checked: e.target.checked })} />
            {text}
        </label>
    ),
    GoabCircularProgress: ({ visible }: { visible: boolean }) => <div data-testid="spinner">{String(visible)}</div>,
    GoabDropdown: ({ value, onChange, testId, children }: { value?: string; onChange?: (d: { value?: string }) => void; testId?: string; children?: React.ReactNode }) => (
        <select data-testid={testId} value={value} onChange={(e) => onChange?.({ value: e.target.value })}>{children}</select>
    ),
    GoabDropdownItem: ({ value, label }: { value: string; label: string }) => <option value={value}>{label}</option>,
    GoabIcon: ({ type }: { type: string }) => <i data-testid={`icon-${type}`} />,
    GoabInput: ({ value, onChange, testId, placeholder }: { value?: string; onChange?: (d: { name: string; value: string }) => void; testId?: string; placeholder?: string }) => (
        <input data-testid={testId} placeholder={placeholder} value={value} onChange={(e) => onChange?.({ name: 'inbox-search', value: e.target.value })} />
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
    },
];

const payload = { inbox: { programs, messages } };
const renderPage = () => render(<MemoryRouter><InboxPage /></MemoryRouter>);

describe('InboxPage', () => {
    beforeEach(() => jest.clearAllMocks());

    it('renders the heading, warning copy and both messages', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByText('Inbox')).toBeInTheDocument());
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

    it('explains when nothing matches', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('inbox-search')).toBeInTheDocument());
        fireEvent.change(screen.getByTestId('inbox-search'), { target: { value: 'zzzzz' } });

        expect(screen.getByTestId('inbox-empty')).toBeInTheDocument();
    });

    it('still renders when the request fails', async () => {
        // Reject at call time; a promise rejected at setup time can surface as an
        // unhandled rejection before the component attaches its catch.
        mockGet.mockImplementation(() => Promise.reject(new Error('boom')));
        renderPage();

        await waitFor(() => expect(screen.getByText('Inbox')).toBeInTheDocument());
        expect(screen.getByTestId('inbox-empty')).toBeInTheDocument();
    });
});
