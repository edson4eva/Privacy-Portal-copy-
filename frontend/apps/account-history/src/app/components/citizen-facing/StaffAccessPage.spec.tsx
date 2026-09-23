import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import StaffAccessPage from './StaffAccessPage';

jest.mock('@abgov/react-components', () => ({
    GoabCircularProgress: ({ visible }: { visible: boolean }) => <div data-testid="spinner">{String(visible)}</div>,
    GoabDetails: ({ heading, children }: { heading: string; children: React.ReactNode }) => (
        <details open>
            <summary>{heading}</summary>
            {children}
        </details>
    ),
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
    }) => {
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

const record = (id: string, overrides: Record<string, unknown> = {}) => ({
    id,
    name: 'J. Doe',
    username: 'jdoe01',
    positionId: 'POS-IS-0142',
    role: 'Benefits Officer 2',
    unit: 'Income Support - Edmonton North',
    accessedAt: '2026-09-19T20:32:00.000Z',
    categories: ['Financial'],
    information: ['Personal income', 'direct deposit details', 'payment history'],
    reasonType: 'Benefit calculation',
    reasonDetail: 'client called re: September shortfall',
    ...overrides,
});

const records = [
    record('sa-1'),
    record('sa-2', {
        name: 'M. Tran',
        username: 'mtran03',
        accessedAt: '2026-09-18T15:07:00.000Z',
        categories: ['Driver and vehicle'],
    }),
    record('sa-3', {
        name: 'A. Okafor',
        username: 'aokafor',
        accessedAt: '2026-09-18T02:14:00.000Z',
        categories: ['Child and family services', 'Health'],
    }),
    record('sa-4', { accessedAt: '2026-09-16T17:45:00.000Z' }),
    record('sa-5', { accessedAt: '2026-09-14T19:20:00.000Z' }),
    record('sa-6', { accessedAt: '2026-09-11T16:05:00.000Z' }),
];

const payload = { staffAccess: { records } };
const renderPage = () =>
    render(
        <MemoryRouter>
            <StaffAccessPage />
        </MemoryRouter>
    );

describe('StaffAccessPage', () => {
    beforeEach(() => jest.clearAllMocks());

    it('flags an after-hours access on the row', async () => {
        mockGet.mockResolvedValue({
            staffAccess: {
                records: [
                    record('sa-1', { businessHours: 'Business hours' }),
                    record('sa-2', { accessedAt: '2026-09-18T02:14:00.000Z', businessHours: 'After-hours' }),
                ],
            },
        });
        renderPage();

        await waitFor(() => expect(screen.getByTestId('row-sa-2')).toBeInTheDocument());
        expect(screen.getByTestId('after-hours-sa-2')).toHaveTextContent('After-hours');
        expect(screen.queryByTestId('after-hours-sa-1')).not.toBeInTheDocument();
    });

    it('flags an access an auditor has not settled, and only that one', async () => {
        mockGet.mockResolvedValue({
            staffAccess: {
                records: [
                    record('sa-1', { reviewOutcome: 'Appropriate' }),
                    record('sa-2', { accessedAt: '2026-09-18T02:14:00.000Z', reviewOutcome: 'Under review' }),
                ],
            },
        });
        renderPage();

        await waitFor(() => expect(screen.getByTestId('row-sa-2')).toBeInTheDocument());
        expect(screen.getByTestId('review-sa-2')).toHaveTextContent('Under review');
        expect(screen.queryByTestId('review-sa-1')).not.toBeInTheDocument();
    });

    it('opts out of the app measure so the last column is not cut off', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('access-container')).toBeInTheDocument());
        expect(screen.getByTestId('access-container')).toHaveAttribute('data-wide', 'true');
    });

    it('names an outside organization on its row, and only there', async () => {
        mockGet.mockResolvedValue({
            staffAccess: {
                records: [
                    record('sa-1'),
                    record('sa-11', {
                        username: 'impark-ar-0142',
                        positionId: 'POS-AR-0142',
                        role: 'Authorized requester — parking enforcement',
                        organization: 'Imperial Parking Canada Corporation',
                        unit: 'Parking enforcement — Calgary',
                        accessedAt: '2026-09-19T22:58:00.000Z',
                    }),
                ],
            },
        });
        renderPage();

        await waitFor(() => expect(screen.getByTestId('row-sa-11')).toBeInTheDocument());
        const row = screen.getByTestId('row-sa-11');
        expect(row).toHaveTextContent('Imperial Parking Canada Corporation');
        expect(row).toHaveTextContent('POS-AR-0142');
        expect(row).toHaveTextContent('Parking enforcement — Calgary');
        expect(screen.queryByTestId('org-sa-1')).not.toBeInTheDocument();
    });

    it('shows a ticket number on the row, not only on the record', async () => {
        mockGet.mockResolvedValue({
            staffAccess: {
                records: [
                    record('sa-11', {
                        organization: 'Imperial Parking Canada Corporation',
                        reasonType: 'Information-sharing agreement request',
                        reasonDetail: 'registered owner lookup to issue parking ticket PT-2026-884213',
                    }),
                ],
            },
        });
        renderPage();

        await waitFor(() => expect(screen.getByTestId('row-sa-11')).toBeInTheDocument());
        expect(screen.getByTestId('row-sa-11')).toHaveTextContent('PT-2026-884213');
    });

    it('renders the heading, intro and all six columns', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByText('Who accessed your information')).toBeInTheDocument());
        expect(screen.getByTestId('page-title')).toHaveTextContent('CITIZEN-FACING EXPERIENCE');
        for (const heading of [
            'Who accessed',
            'Date',
            'Category',
            'Type of information accessed',
            'Reason for inquiry',
            'Details',
        ]) {
            expect(screen.getByText(heading)).toBeInTheDocument();
        }
        expect(mockGet).toHaveBeenCalledWith('/v1/staff-access');
    });

    it('identifies the position, not the person holding it', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('row-sa-1')).toBeInTheDocument());
        const row = screen.getByTestId('row-sa-1');
        expect(screen.getByTestId('position-sa-1')).toHaveTextContent('POS-IS-0142');
        expect(row).toHaveTextContent('Benefits Officer 2');
        expect(row).toHaveTextContent('Income Support - Edmonton North');
        expect(row).not.toHaveTextContent('J. Doe');
        expect(row).not.toHaveTextContent('jdoe01');
    });

    it('says so rather than falling back to an account when no position is recorded', async () => {
        mockGet.mockResolvedValue({ staffAccess: { records: [record('sa-1', { positionId: undefined })] } });
        renderPage();

        await waitFor(() => expect(screen.getByTestId('row-sa-1')).toBeInTheDocument());
        expect(screen.getByTestId('position-sa-1')).toHaveTextContent('Position not recorded');
        expect(screen.getByTestId('row-sa-1')).not.toHaveTextContent('jdoe01');
    });

    it('shows the information seen and the reason given', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('row-sa-1')).toBeInTheDocument());
        const row = screen.getByTestId('row-sa-1');
        expect(row).toHaveTextContent('Personal income, direct deposit details, payment history');
        expect(row).toHaveTextContent('Benefit calculation');
        expect(row).toHaveTextContent('client called re: September shortfall');
    });

    it('joins several categories into one cell', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('row-sa-3')).toBeInTheDocument());
        expect(screen.getByTestId('row-sa-3')).toHaveTextContent('Child and family services; Health');
    });

    it('stamps the date in Alberta time, as the log recorded it', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('row-sa-1')).toBeInTheDocument());
        // 20:32 UTC is 14:32 in Alberta on that date.
        expect(screen.getByTestId('row-sa-1')).toHaveTextContent('2026-09-19 14:32');
        expect(screen.getByTestId('row-sa-1')).toHaveTextContent('MDT');
    });

    it('offers View activity for each record', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('view-sa-1')).toBeInTheDocument());
        expect(screen.getByTestId('view-sa-1')).toHaveTextContent('View activity');
        expect(screen.getByTestId('view-sa-1')).toHaveAttribute('href', '/transparency/sa-1');
    });

    it('shows the most recent access first', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getAllByTestId(/^row-/)).toHaveLength(5));
        expect(screen.getAllByTestId(/^row-/)[0]).toBe(screen.getByTestId('row-sa-1'));
    });

    it('pages the list, forward and back', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('page-info')).toHaveTextContent('Page 1 of 2'));
        expect(screen.getByTestId('previous-page')).toBeDisabled();

        fireEvent.click(screen.getByTestId('next-page'));
        expect(screen.getByTestId('page-info')).toHaveTextContent('Page 2 of 2');

        fireEvent.click(screen.getByTestId('previous-page'));
        expect(screen.getByTestId('page-info')).toHaveTextContent('Page 1 of 2');
    });

    it('offers a route to filing a privacy complaint', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('file-complaint-link')).toBeInTheDocument());
        expect(screen.getByTestId('file-complaint-link').getAttribute('href')).toContain('file-complaint');
    });

    it('says so when nobody has looked', async () => {
        mockGet.mockResolvedValue({ staffAccess: { records: [] } });
        renderPage();

        await waitFor(() => expect(screen.getByTestId('access-empty')).toBeInTheDocument());
    });

    it('still renders when the request fails', async () => {
        // Reject at call time; a promise rejected at setup time can surface as an
        // unhandled rejection before the component attaches its catch.
        mockGet.mockImplementation(() => Promise.reject(new Error('boom')));
        renderPage();

        await waitFor(() => expect(screen.getByText('Who accessed your information')).toBeInTheDocument());
        expect(screen.getByTestId('access-empty')).toBeInTheDocument();
    });
});
