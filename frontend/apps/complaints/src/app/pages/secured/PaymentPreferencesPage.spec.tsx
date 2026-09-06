import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import PaymentPreferencesPage from './PaymentPreferencesPage';

jest.mock('@abgov/react-components', () => ({
    GoabButton: ({ children, onClick, testId }: { children: React.ReactNode; onClick?: () => void; testId?: string }) => (
        <button data-testid={testId} onClick={onClick}>{children}</button>
    ),
    GoabCircularProgress: ({ visible }: { visible: boolean }) => <div data-testid="spinner">{String(visible)}</div>,
}));

jest.mock('shared/src/lib/page-title/PageTitle', () => ({
    __esModule: true,
    default: ({ title }: { title: string }) => <div data-testid="page-title">{title}</div>,
}));

jest.mock('shared/src/lib/api/dataService', () => ({ get: jest.fn() }));

import { get } from 'shared/src/lib/api/dataService';
const mockGet = get as jest.Mock;

const account = {
    id: 'direct-deposit-1',
    method: 'Direct deposit',
    isInteracVerified: true,
    accountHolder: 'USER, Demo Alexander',
    bankInstitution: '000 ABC Bank of Canada',
    branchTransit: '52369',
    accountNumberLast4: '8563',
    retrievedOn: '2026-07-02T14:33:00.000Z',
};

const payload = { paymentPreferences: { accounts: [account] } };

const renderPage = () => render(<MemoryRouter><PaymentPreferencesPage /></MemoryRouter>);

describe('PaymentPreferencesPage', () => {
    beforeEach(() => jest.clearAllMocks());

    it('renders the eyebrow, heading and intro', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByText('Payment preferences')).toBeInTheDocument());
        expect(screen.getByTestId('page-title')).toHaveTextContent('PERSONAL');
        expect(screen.getByText(/Manage your payment details/)).toBeInTheDocument();
        expect(mockGet).toHaveBeenCalledWith('/v1/payment-preferences');
    });

    it('shows the account details with the Interac Verified mark', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('holder-direct-deposit-1')).toBeInTheDocument());
        expect(screen.getByTestId('interac-verified')).toBeInTheDocument();
        expect(screen.getByText('Direct deposit')).toBeInTheDocument();
        expect(screen.getByTestId('holder-direct-deposit-1')).toHaveTextContent('USER, Demo Alexander');
        expect(screen.getByTestId('institution-direct-deposit-1')).toHaveTextContent('000 ABC Bank of Canada');
        expect(screen.getByTestId('transit-direct-deposit-1')).toHaveTextContent('52369');
    });

    it('masks all but the last four digits of the account number', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('number-direct-deposit-1')).toBeInTheDocument());
        expect(screen.getByTestId('number-direct-deposit-1')).toHaveTextContent('****_****_8563');
    });

    it('shows the retrieved timestamp in Alberta time', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('retrieved-direct-deposit-1')).toBeInTheDocument());
        expect(screen.getByTestId('retrieved-direct-deposit-1')).toHaveTextContent('Jul 2, 2026 at 08:33 AM MDT');
    });

    it('removes an account when Delete is chosen', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('delete-direct-deposit-1')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('delete-direct-deposit-1'));

        expect(screen.queryByTestId('account-direct-deposit-1')).not.toBeInTheDocument();
        expect(screen.getByTestId('payment-empty')).toBeInTheDocument();
    });

    it('adds a further account with Add another', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('add-another')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('add-another'));

        expect(screen.getByTestId('account-direct-deposit-2')).toBeInTheDocument();
        // Only the first account carries the button, so it is not repeated per row.
        expect(screen.getAllByTestId('add-another')).toHaveLength(1);
    });

    it('still renders when the request fails', async () => {
        // Reject at call time; a promise rejected at setup time can surface as an
        // unhandled rejection before the component attaches its catch.
        mockGet.mockImplementation(() => Promise.reject(new Error('boom')));
        renderPage();

        await waitFor(() => expect(screen.getByText('Payment preferences')).toBeInTheDocument());
        expect(screen.getByTestId('payment-empty')).toBeInTheDocument();
    });
});
