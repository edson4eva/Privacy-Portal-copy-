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

const licence = {
    id: 'mobile-drivers-licence',
    documentType: "Driver's Licence",
    layout: 'licence',
    icon: 'car',
    licence: {
        number: '412887-355',
        class: '5',
        dateOfBirth: '1985-04-12',
        sex: 'M',
        eyes: 'BRO',
        hair: 'BRO',
        height: '178 cm',
        weight: '79 kg',
        conditions: 'NONE',
        issued: '2026-04-12',
        expires: '2030-04-12',
    },
    primaryLabel: 'Licence number',
    primaryValue: '412887-355',
    nameOnCard: 'USER, DEMO ALEXANDER',
    addressLines: ['123 JASPER AVENUE NW', 'EDMONTON, AB  T5J 0R2'],
    fields: [
        { label: 'Class', value: '5' },
        { label: 'DOB', value: '1985-04-12', isDate: true },
        { label: 'Sex', value: 'M' },
        { label: 'Cond/End', value: 'NONE' },
        { label: 'Expiry date', value: '2030-04-12', isDate: true },
    ],
};

const healthCard = {
    id: 'mobile-health-card',
    documentType: 'Mobile Health Card',
    icon: 'pulse',
    primaryLabel: 'Personal health number',
    primaryValue: '54321-8807',
    nameOnCard: 'USER, Demo Alexander',
    fields: [
        { label: 'Birthdate', value: '1985-04-12', isDate: true },
        { label: 'Expiry date', value: '2030-04-12', isDate: true },
    ],
};

const payload = { wallet: { documents: [licence, healthCard] } };

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

    it('renders the health card fields as the card prints them', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('primary-mobile-health-card')).toBeInTheDocument());
        expect(screen.getByTestId('primary-mobile-health-card')).toHaveTextContent('54321-8807');
        expect(screen.getByTestId('name-mobile-health-card')).toHaveTextContent('USER, Demo Alexander');
        expect(screen.getByTestId('field-mobile-health-card-birthdate')).toHaveTextContent('April 12, 1985');
        expect(screen.getByText('Mobile Health Card')).toBeInTheDocument();
        // No address on a health card, so that block stays absent.
        expect(screen.queryByTestId('address-mobile-health-card')).not.toBeInTheDocument();
    });

    it('draws the licence as the printed card', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('primary-mobile-drivers-licence')).toBeInTheDocument());
        expect(screen.getByText("Driver's Licence")).toBeInTheDocument();
        expect(screen.getByText('CAN')).toBeInTheDocument();
        expect(screen.getByTestId('primary-mobile-drivers-licence')).toHaveTextContent('412887-355');
        expect(screen.getByTestId('name-mobile-drivers-licence')).toHaveTextContent('USER, DEMO ALEXANDER');
        expect(screen.getByTestId('address-mobile-drivers-licence')).toHaveTextContent('EDMONTON, AB');
        expect(screen.getByText('NONE')).toBeInTheDocument();
        expect(screen.getByText('79 kg')).toBeInTheDocument();
    });

    it('prints licence dates the way the card does', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('dob-mobile-drivers-licence')).toBeInTheDocument());
        expect(screen.getByTestId('dob-mobile-drivers-licence')).toHaveTextContent('12/04/1985');
        expect(screen.getByTestId('exp-mobile-drivers-licence')).toHaveTextContent('12/04/2030');
        // The large birth stamp the card carries for age checks.
        expect(screen.getByTestId('birth-stamp-mobile-drivers-licence')).toHaveTextContent('APR 85');
    });

    it('marks the licence as a specimen', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('specimen-mobile-drivers-licence')).toBeInTheDocument());
        expect(screen.getByTestId('specimen-mobile-drivers-licence')).toHaveTextContent('SPECIMEN');
    });

    it('still uses the wallet summary layout for other documents', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('primary-mobile-health-card')).toBeInTheDocument());
        // The health card keeps the label/value fields; the licence does not use them.
        expect(screen.getByTestId('field-mobile-health-card-birthdate')).toBeInTheDocument();
        expect(screen.queryByTestId('specimen-mobile-health-card')).not.toBeInTheDocument();
    });

    it('shows both documents', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getAllByTestId(/^wallet-card-/)).toHaveLength(2));
        expect(screen.getByTestId('crest-mobile-health-card')).toBeInTheDocument();
    });

    it('shows the hint and presents the document when the card is activated', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('wallet-card-mobile-health-card')).toBeInTheDocument());
        expect(screen.getAllByText('Click or tap card to present digital document').length).toBeGreaterThan(0);
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

    it('marks the shield of arms decorative', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('crest-mobile-health-card')).toBeInTheDocument());
        // Decorative, so it must not be announced.
        expect(screen.getByTestId('crest-mobile-health-card')).toHaveAttribute('alt', '');
    });

    it('says where a document is actually added', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('add-to-wallet')).toBeInTheDocument());
        expect(screen.queryByTestId('add-notice')).not.toBeInTheDocument();

        fireEvent.click(screen.getByTestId('add-to-wallet'));
        expect(screen.getByTestId('add-notice')).toHaveTextContent(/Alberta Wallet app on your phone/);
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
