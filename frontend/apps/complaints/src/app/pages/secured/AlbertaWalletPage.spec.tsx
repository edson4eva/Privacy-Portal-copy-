import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import AlbertaWalletPage from './AlbertaWalletPage';

jest.mock('@abgov/react-components', () => ({
    GoabButton: ({ children, onClick, testId }: { children: React.ReactNode; onClick?: () => void; testId?: string }) => (
        <button data-testid={testId} onClick={onClick}>{children}</button>
    ),
    GoabCircularProgress: ({ visible }: { visible: boolean }) => <div data-testid="spinner">{String(visible)}</div>,
    GoabIcon: ({ type }: { type: string }) => <i data-testid={`icon-${type}`} />,
}));

jest.mock('shared/src/lib/api/dataService', () => ({ get: jest.fn() }));

import { get } from 'shared/src/lib/api/dataService';
const mockGet = get as jest.Mock;

const payload = {
    wallet: {
        documents: [
            {
                id: 'mobile-health-card',
                documentType: 'Mobile Health Card',
                personalHealthNumber: '54321-8807',
                nameOnCard: 'USER, Demo Alexander',
                birthdate: '1985-04-12',
                expiryDate: '2030-04-12',
            },
        ],
    },
};

const renderPage = () => render(<MemoryRouter><AlbertaWalletPage /></MemoryRouter>);

describe('AlbertaWalletPage', () => {
    beforeEach(() => jest.clearAllMocks());

    it('renders the heading and the add button', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByText('Alberta Wallet')).toBeInTheDocument());
        expect(screen.getByTestId('add-to-wallet')).toHaveTextContent('Add to Alberta Wallet');
        expect(mockGet).toHaveBeenCalledWith('/v1/wallet');
    });

    it('renders the card fields as the card prints them', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('phn-mobile-health-card')).toBeInTheDocument());
        expect(screen.getByTestId('phn-mobile-health-card')).toHaveTextContent('54321-8807');
        expect(screen.getByTestId('name-mobile-health-card')).toHaveTextContent('USER, Demo Alexander');
        expect(screen.getByTestId('birthdate-mobile-health-card')).toHaveTextContent('April 12, 1985');
        expect(screen.getByTestId('expiry-mobile-health-card')).toHaveTextContent('April 12, 2030');
        expect(screen.getByText('Mobile Health Card')).toBeInTheDocument();
    });

    it('shows the hint and presents the document when the card is activated', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('wallet-card-mobile-health-card')).toBeInTheDocument());
        expect(screen.getByText('Click or tap card to present digital document')).toBeInTheDocument();
        expect(screen.queryByTestId('present-panel')).not.toBeInTheDocument();

        fireEvent.click(screen.getByTestId('wallet-card-mobile-health-card'));
        expect(screen.getByTestId('present-panel')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('stop-presenting'));
        expect(screen.queryByTestId('present-panel')).not.toBeInTheDocument();
    });

    it('links to both app stores in a new tab', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByText('App Store')).toBeInTheDocument());
        const apple = screen.getByText('App Store').closest('a');
        const google = screen.getByText('Google Play').closest('a');
        expect(apple).toHaveAttribute('target', '_blank');
        expect(apple).toHaveAttribute('rel', expect.stringContaining('noopener'));
        expect(google).toHaveAttribute('target', '_blank');
        expect(screen.getByText('Get the Alberta Wallet app')).toBeInTheDocument();
    });

    it('shows the shield of arms on the card', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('crest-mobile-health-card')).toBeInTheDocument());
        // Decorative, so it must not be announced.
        expect(screen.getByTestId('crest-mobile-health-card')).toHaveAttribute('alt', '');
    });

    it('explains the empty wallet', async () => {
        mockGet.mockResolvedValue({ wallet: { documents: [] } });
        renderPage();

        await waitFor(() => expect(screen.getByTestId('wallet-empty')).toBeInTheDocument());
    });

    it('still renders when the request fails', async () => {
        // Reject at call time; a promise rejected at setup time can surface as an
        // unhandled rejection before the component attaches its catch.
        mockGet.mockImplementation(() => Promise.reject(new Error('boom')));
        renderPage();

        await waitFor(() => expect(screen.getByText('Alberta Wallet')).toBeInTheDocument());
        expect(screen.getByTestId('wallet-empty')).toBeInTheDocument();
    });
});
