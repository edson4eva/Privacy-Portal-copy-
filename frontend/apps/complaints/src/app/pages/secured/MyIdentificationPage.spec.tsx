import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import MyIdentificationPage from './MyIdentificationPage';

jest.mock('@abgov/react-components', () => ({
    GoabBadge: ({ content }: { content: string }) => <span data-testid="badge">{content}</span>,
    GoabCircularProgress: ({ visible }: { visible: boolean }) => <div data-testid="spinner">{String(visible)}</div>,
    GoabIcon: ({ type }: { type: string }) => <i data-testid={`icon-${type}`} />,
}));

jest.mock('shared/src/lib/api/dataService', () => ({ get: jest.fn() }));
jest.mock('shared/src/lib/context/auth-provider', () => ({ useAuth: jest.fn() }));

import { get } from 'shared/src/lib/api/dataService';
import { useAuth } from 'shared/src/lib/context/auth-provider';

const mockGet = get as jest.Mock;
const mockUseAuth = useAuth as jest.Mock;

const payload = {
    identification: {
        isVerifiedAccount: true,
        cardType: 'Alberta identification',
        card: {
            nameOnCard: 'Demo Alexander USER',
            mailingAddressLines: ['123 Jasper Avenue NW', 'Edmonton, Alberta T5J 0R2'],
            dateOfBirth: '1985-04-12',
            sex: 'Male',
            documentLabel: "Alberta driver's licence",
            documentNumber: '412887-355',
            expiryDate: '2030-04-12',
        },
    },
};

const renderPage = () => render(<MemoryRouter><MyIdentificationPage /></MemoryRouter>);

describe('MyIdentificationPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAuth.mockReturnValue({ getCurrentUser: () => ({ name: 'Demo User', isVerified: true }) });
    });

    it('renders the headings and the verified account badge', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByText('My identification')).toBeInTheDocument());
        expect(screen.getByText('Alberta identification')).toBeInTheDocument();
        expect(screen.getByTestId('badge')).toHaveTextContent('Verified account');
        expect(mockGet).toHaveBeenCalledWith('/v1/identification');
    });

    it('shows each card field with the label from the document', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('name-on-card')).toBeInTheDocument());
        expect(screen.getByTestId('name-on-card')).toHaveTextContent('Demo Alexander USER');
        expect(screen.getByTestId('sex')).toHaveTextContent('Male');
        expect(screen.getByText("Alberta driver's licence")).toBeInTheDocument();
        expect(screen.getByTestId('document-number')).toHaveTextContent('412887-355');
    });

    it('formats dates the way the card prints them', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('date-of-birth')).toBeInTheDocument());
        expect(screen.getByTestId('date-of-birth')).toHaveTextContent('12 April 1985');
        expect(screen.getByTestId('expiry-date')).toHaveTextContent('12 April 2030');
    });

    it('renders the mailing address over multiple lines', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('mailing-address')).toBeInTheDocument());
        const address = screen.getByTestId('mailing-address');
        expect(address).toHaveTextContent('123 Jasper Avenue NW');
        expect(address).toHaveTextContent('Edmonton, Alberta T5J 0R2');
        expect(address.querySelectorAll('span').length).toBe(2);
    });

    it('links out to the registry agent and document requirements', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByText('registry agent')).toBeInTheDocument());
        const registry = screen.getByText('registry agent').closest('a');
        expect(registry).toHaveAttribute('target', '_blank');
        expect(registry).toHaveAttribute('rel', expect.stringContaining('noopener'));
        expect(screen.getByText('your documents').closest('a')).toHaveAttribute('target', '_blank');
    });

    it('falls back to a basic account badge when not verified', async () => {
        mockUseAuth.mockReturnValue({ getCurrentUser: () => ({ name: 'Demo User', isVerified: false }) });
        mockGet.mockResolvedValue({
            identification: { ...payload.identification, isVerifiedAccount: false },
        });
        renderPage();

        await waitFor(() => expect(screen.getByTestId('badge')).toHaveTextContent('Basic account'));
    });

    it('still renders the page when the request fails', async () => {
        // Reject at call time; a promise rejected at setup time can surface as an
        // unhandled rejection before the component attaches its catch.
        mockGet.mockImplementation(() => Promise.reject(new Error('boom')));
        renderPage();

        await waitFor(() => expect(screen.getByText('My identification')).toBeInTheDocument());
        expect(screen.getByTestId('name-on-card')).toHaveTextContent('Not provided');
    });
});
