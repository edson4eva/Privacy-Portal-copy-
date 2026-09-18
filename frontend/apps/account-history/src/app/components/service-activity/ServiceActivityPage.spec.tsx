import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import ServiceActivityPage from './ServiceActivityPage';

jest.mock('@abgov/react-components', () => ({
    GoabCircularProgress: ({ visible }: { visible: boolean }) => <div data-testid="spinner">{String(visible)}</div>,
    GoabDropdown: ({ value, onChange, testId, children }: { value?: string; onChange?: (d: { value?: string }) => void; testId?: string; children?: React.ReactNode }) => (
        <select data-testid={testId} value={value} onChange={(e) => onChange?.({ value: e.target.value })}>{children}</select>
    ),
    GoabDropdownItem: ({ value, label }: { value: string; label: string }) => <option value={value}>{label}</option>,
    GoabIcon: ({ type }: { type: string }) => <i data-testid={`icon-${type}`} />,
    GoabPagination: ({ itemCount, perPageCount, pageNumber, onChange, testId }: { itemCount: number; perPageCount: number; pageNumber: number; onChange: (d: { page: number }) => void; testId?: string }) => {
        const total = Math.max(1, Math.ceil(itemCount / perPageCount));
        return (
            <div data-testid={testId}>
                <span data-testid="page-info">{`Page ${pageNumber} of ${total}`}</span>
                <button
                    data-testid="previous-page"
                    disabled={pageNumber <= 1}
                    onClick={() => onChange({ page: pageNumber - 1 })}
                >
                    Previous
                </button>
                <button
                    data-testid="next-page"
                    disabled={pageNumber >= total}
                    onClick={() => onChange({ page: pageNumber + 1 })}
                >
                    Next
                </button>
            </div>
        );
    },
}));

jest.mock('shared/src/lib/page-title/PageTitle', () => ({
    __esModule: true,
    default: ({ title }: { title: string }) => <div data-testid="page-title">{title}</div>,
}));

jest.mock('shared/src/lib/api/dataService', () => ({ get: jest.fn() }));

import { get } from 'shared/src/lib/api/dataService';
const mockGet = get as jest.Mock;

const now = Date.now();
const daysAgo = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000).toISOString();

const payload = {
    serviceActivity: {
        availableFrom: '2024-07-24',
        categories: [
            { id: 'payments', label: 'Payments' },
            { id: 'applications', label: 'Applications' },
            { id: 'account-activity', label: 'Account activity' },
        ],
        services: [
            { id: 'rebate', name: 'Alberta Energy Rebate' },
            { id: 'fines', name: 'Fine payments' },
        ],
        events: [
            { id: 'e1', serviceId: 'rebate', event: 'Your rebate payment was issued', categoryId: 'payments', occurredAt: daysAgo(2) },
            { id: 'e2', serviceId: 'fines', event: 'You paid for a fine', categoryId: 'payments', occurredAt: daysAgo(10) },
            { id: 'e3', serviceId: 'rebate', event: 'You submitted your application', categoryId: 'applications', occurredAt: daysAgo(40) },
            { id: 'e4', serviceId: 'rebate', event: 'Your identity document was verified', categoryId: 'account-activity', occurredAt: daysAgo(120) },
            { id: 'e5', serviceId: 'fines', event: 'Your payment receipt was issued', categoryId: 'payments', occurredAt: daysAgo(200) },
            { id: 'e6', serviceId: 'rebate', event: 'You gave consent to verify your income', categoryId: 'applications', occurredAt: daysAgo(300) },
        ],
    },
};

const renderPage = () => render(<MemoryRouter><ServiceActivityPage isPreview={false} /></MemoryRouter>);

describe('ServiceActivityPage', () => {
    beforeEach(() => jest.clearAllMocks());

    it('renders the heading, intro and availability notice', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByText('Service activity')).toBeInTheDocument());
        expect(screen.getByTestId('page-title')).toHaveTextContent('PRIVACY PORTAL');
        expect(screen.getByText(/Review activity across government services/)).toBeInTheDocument();
        expect(screen.getByTestId('availability-notice')).toHaveTextContent('July 24, 2024');
        expect(mockGet).toHaveBeenCalledWith('/v1/service-activity');
    });

    it('lists an event with its service, date and category', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('row-e1')).toBeInTheDocument());
        const row = screen.getByTestId('row-e1');
        expect(row).toHaveTextContent('Your rebate payment was issued');
        expect(row).toHaveTextContent('Alberta Energy Rebate');
        expect(row).toHaveTextContent('Payments');
        expect(screen.getByTestId('view-e1')).toHaveAttribute('href', '/accessed-services/rebate');
    });

    it('filters by service', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('filter-service')).toBeInTheDocument());
        fireEvent.change(screen.getByTestId('filter-service'), { target: { value: 'fines' } });

        expect(screen.getByTestId('row-e2')).toBeInTheDocument();
        expect(screen.queryByTestId('row-e1')).not.toBeInTheDocument();
    });

    it('filters by category', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('filter-category')).toBeInTheDocument());
        fireEvent.change(screen.getByTestId('filter-category'), { target: { value: 'account-activity' } });

        expect(screen.getByTestId('row-e4')).toBeInTheDocument();
        expect(screen.queryByTestId('row-e1')).not.toBeInTheDocument();
    });

    it('filters by date range', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('filter-date-range')).toBeInTheDocument());
        fireEvent.change(screen.getByTestId('filter-date-range'), { target: { value: 'last-30' } });

        // Only the two most recent fall inside 30 days.
        expect(screen.getByTestId('row-e1')).toBeInTheDocument();
        expect(screen.getByTestId('row-e2')).toBeInTheDocument();
        expect(screen.queryByTestId('row-e3')).not.toBeInTheDocument();
    });

    it('reverses the order when the date header is chosen', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('sort-date')).toBeInTheDocument());
        expect(screen.getAllByTestId(/^row-/)[0]).toBe(screen.getByTestId('row-e1'));

        fireEvent.click(screen.getByTestId('sort-date'));
        expect(screen.getAllByTestId(/^row-/)[0]).toBe(screen.getByTestId('row-e6'));
    });

    it('pages the list and returns to the first page when a filter changes', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('page-info')).toHaveTextContent('Page 1 of 2'));
        fireEvent.click(screen.getByTestId('next-page'));
        expect(screen.getByTestId('page-info')).toHaveTextContent('Page 2 of 2');

        fireEvent.change(screen.getByTestId('filter-category'), { target: { value: 'payments' } });
        expect(screen.getByTestId('page-info')).toHaveTextContent('Page 1 of 1');
    });

    it('goes back with Previous after going forward with Next', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('page-info')).toHaveTextContent('Page 1 of 2'));
        const firstRowOnPageOne = screen.getAllByTestId(/^row-/)[0].getAttribute('data-testid');

        fireEvent.click(screen.getByTestId('next-page'));
        expect(screen.getByTestId('page-info')).toHaveTextContent('Page 2 of 2');

        fireEvent.click(screen.getByTestId('previous-page'));
        expect(screen.getByTestId('page-info')).toHaveTextContent('Page 1 of 2');
        expect(screen.getAllByTestId(/^row-/)[0]).toHaveAttribute('data-testid', firstRowOnPageOne);
    });

    it('has no Previous to take on the first page', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('previous-page')).toBeInTheDocument());
        expect(screen.getByTestId('previous-page')).toBeDisabled();
    });

    it('never leaves the chosen page beyond the end of a filtered list', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('next-page')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('next-page'));
        expect(screen.getByTestId('page-info')).toHaveTextContent('Page 2 of 2');

        // A filter that leaves one page must not strand the view on page 2.
        fireEvent.change(screen.getByTestId('filter-category'), { target: { value: 'account-activity' } });
        expect(screen.getByTestId('page-info')).toHaveTextContent('Page 1 of 1');
        expect(screen.getByTestId('row-e4')).toBeInTheDocument();
    });

    it('explains when nothing matches', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('filter-service')).toBeInTheDocument());
        fireEvent.change(screen.getByTestId('filter-service'), { target: { value: 'fines' } });
        fireEvent.change(screen.getByTestId('filter-category'), { target: { value: 'applications' } });

        expect(screen.getByTestId('activity-empty')).toBeInTheDocument();
    });

    it('still renders when the request fails', async () => {
        // Reject at call time; a promise rejected at setup time can surface as an
        // unhandled rejection before the component attaches its catch.
        mockGet.mockImplementation(() => Promise.reject(new Error('boom')));
        renderPage();

        await waitFor(() => expect(screen.getByText('Service activity')).toBeInTheDocument());
        expect(screen.getByTestId('activity-empty')).toBeInTheDocument();
    });

    it('uses the preview endpoint in preview mode', async () => {
        mockGet.mockResolvedValue(payload);
        render(<MemoryRouter><ServiceActivityPage isPreview={true} /></MemoryRouter>);

        await waitFor(() => expect(screen.getByTestId('view-e1')).toBeInTheDocument());
        expect(mockGet).toHaveBeenCalledWith('/v1/preview/service-activity');
        expect(screen.getByTestId('view-e1')).toHaveAttribute('href', '/preview/accessed-services/rebate');
    });
});
