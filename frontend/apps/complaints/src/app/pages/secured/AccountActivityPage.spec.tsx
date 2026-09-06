import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import AccountActivityPage from './AccountActivityPage';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

jest.mock('@abgov/react-components', () => ({
    GoabBadge: ({ content }: { content: string }) => <span data-testid="badge">{content}</span>,
    GoabButton: ({ children, onClick, testId }: { children: React.ReactNode; onClick?: () => void; testId?: string }) => (
        <button data-testid={testId} onClick={onClick}>{children}</button>
    ),
    GoabCircularProgress: ({ visible }: { visible: boolean }) => <div data-testid="spinner">{String(visible)}</div>,
    GoabIcon: ({ type }: { type: string }) => <i data-testid={`icon-${type}`} />,
    GoabPagination: ({
        itemCount,
        perPageCount,
        pageNumber,
        onChange,
        testId,
    }: {
        itemCount: number;
        perPageCount: number;
        pageNumber: number;
        onChange: (d: { page: number }) => void;
        testId?: string;
    }) => (
        <div data-testid={testId}>
            <span data-testid="page-info">{`Page ${pageNumber} of ${Math.ceil(itemCount / perPageCount)}`}</span>
            <button data-testid="next-page" onClick={() => onChange({ page: pageNumber + 1 })}>Next</button>
        </div>
    ),
    GoabTable: ({ children, testId, onSort }: { children: React.ReactNode; testId?: string; onSort?: (d: { sortBy: string; sortDir: number }) => void }) => (
        <div data-testid={testId}>
            <button data-testid="sort-event-asc" onClick={() => onSort?.({ sortBy: 'event', sortDir: 1 })}>sort</button>
            <table>{children}</table>
        </div>
    ),
    GoabTableSortHeader: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

jest.mock('shared/src/lib/api/dataService', () => ({ get: jest.fn() }));

import { get } from 'shared/src/lib/api/dataService';
const mockGet = get as jest.Mock;

const makeEvent = (index: number, overrides: Record<string, unknown> = {}) => ({
    id: `activity-${index}`,
    event: 'Sign in',
    method: 'Google',
    status: 'Successful',
    occurredAt: new Date(Date.UTC(2026, 8, 6, 18, 55 - index)).toISOString(),
    ipAddress: '142.229.84.78',
    location: 'Edmonton',
    device: 'Windows NT 10.0, Chrome',
    deviceDetail: 'Unknown',
    ...overrides,
});

const events = Array.from({ length: 12 }, (_, index) => makeEvent(index + 1));

const renderPage = () => render(<MemoryRouter><AccountActivityPage /></MemoryRouter>);

describe('AccountActivityPage', () => {
    beforeEach(() => jest.clearAllMocks());

    it('renders the heading, intro and timezone note', async () => {
        mockGet.mockResolvedValue({ accountActivity: { events } });
        renderPage();

        await waitFor(() => expect(screen.getByText('Account activity')).toBeInTheDocument());
        expect(screen.getByText(/View a history of your account/)).toBeInTheDocument();
        expect(screen.getByText(/timezone where you are right now/)).toBeInTheDocument();
        expect(mockGet).toHaveBeenCalledWith('/v1/account-activity');
    });

    it('shows only one page of rows at a time', async () => {
        mockGet.mockResolvedValue({ accountActivity: { events } });
        renderPage();

        await waitFor(() => expect(screen.getByTestId('page-info')).toHaveTextContent('Page 1 of 3'));
        expect(screen.getAllByTestId(/^activity-row-/)).toHaveLength(5);
    });

    it('moves to the next page', async () => {
        mockGet.mockResolvedValue({ accountActivity: { events } });
        renderPage();

        await waitFor(() => expect(screen.getByTestId('next-page')).toBeInTheDocument());
        const firstRow = screen.getAllByTestId(/^activity-row-/)[0];
        fireEvent.click(screen.getByTestId('next-page'));

        expect(screen.getByTestId('page-info')).toHaveTextContent('Page 2 of 3');
        expect(screen.getAllByTestId(/^activity-row-/)[0]).not.toBe(firstRow);
    });

    it('returns to the first page when the sort changes', async () => {
        mockGet.mockResolvedValue({ accountActivity: { events } });
        renderPage();

        await waitFor(() => expect(screen.getByTestId('next-page')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('next-page'));
        expect(screen.getByTestId('page-info')).toHaveTextContent('Page 2 of 3');

        fireEvent.click(screen.getByTestId('sort-event-asc'));
        expect(screen.getByTestId('page-info')).toHaveTextContent('Page 1 of 3');
    });

    it('marks a failed attempt differently from a successful one', async () => {
        mockGet.mockResolvedValue({
            accountActivity: { events: [makeEvent(1), makeEvent(2, { status: 'Failed' })] },
        });
        renderPage();

        await waitFor(() => expect(screen.getAllByTestId('badge')).toHaveLength(2));
        const contents = screen.getAllByTestId('badge').map((badge) => badge.textContent);
        expect(contents).toContain('Successful');
        expect(contents).toContain('Failed');
    });

    it('formats the timestamp with a timezone', async () => {
        mockGet.mockResolvedValue({ accountActivity: { events: [makeEvent(1)] } });
        renderPage();

        await waitFor(() => expect(screen.getByTestId('when-activity-1')).toBeInTheDocument());
        // Rendered in the viewer's own zone, so assert the shape rather than a fixed zone.
        expect(screen.getByTestId('when-activity-1').textContent).toMatch(/^September \d+, 2026 at \d+:\d{2} [AP]M \(.+\)$/);
    });

    it('sends Manage security to the security settings page', async () => {
        mockGet.mockResolvedValue({ accountActivity: { events } });
        renderPage();

        await waitFor(() => expect(screen.getByTestId('manage-security')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('manage-security'));
        expect(mockNavigate).toHaveBeenCalledWith('/security-settings');
    });

    it('links out to report suspicious activity', async () => {
        mockGet.mockResolvedValue({ accountActivity: { events } });
        renderPage();

        await waitFor(() => expect(screen.getByText(/report suspicious activity/)).toBeInTheDocument());
        expect(screen.getByText(/report suspicious activity/).closest('a')).toHaveAttribute('target', '_blank');
    });

    it('still renders when the request fails', async () => {
        // Reject at call time; a promise rejected at setup time can surface as an
        // unhandled rejection before the component attaches its catch.
        mockGet.mockImplementation(() => Promise.reject(new Error('boom')));
        renderPage();

        await waitFor(() => expect(screen.getByText('Account activity')).toBeInTheDocument());
        expect(screen.getByTestId('activity-empty')).toBeInTheDocument();
    });
});
