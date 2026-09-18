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

const rebate = {
    id: 'alberta-energy-rebate-card',
    documentType: 'Alberta Energy Rebate',
    icon: 'flash',
    primaryLabel: 'Reference number',
    primaryValue: 'AER-2026-771254',
    nameOnCard: 'USER, Demo Alexander',
    fields: [
        { label: 'Status', value: 'Approved' },
        { label: 'Amount issued', value: '$600.00' },
        { label: 'Issued', value: '2026-09-03', isDate: true },
    ],
};

const campsite = {
    id: 'campsite-reservation',
    documentType: 'Campsite Reservation',
    icon: 'bonfire',
    primaryLabel: 'Reservation number',
    primaryValue: 'ABP-2027-30518',
    nameOnCard: 'USER, Demo Alexander',
    fields: [
        { label: 'Park', value: 'Bow Valley Provincial Park' },
        { label: 'Site', value: 'C-14' },
        { label: 'Check-in', value: '2027-07-16', isDate: true },
        { label: 'Status', value: 'Confirmed' },
    ],
};

const payload = { wallet: { documents: [licence, healthCard, rebate, campsite] } };

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

    it('shows every document in the wallet', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getAllByTestId(/^wallet-card-/)).toHaveLength(4));
        expect(screen.getByTestId('crest-mobile-health-card')).toBeInTheDocument();
    });

    it('renders the energy rebate with its reference number and amount', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('primary-alberta-energy-rebate-card')).toBeInTheDocument());
        expect(screen.getByText('Alberta Energy Rebate')).toBeInTheDocument();
        expect(screen.getByTestId('primary-alberta-energy-rebate-card')).toHaveTextContent('AER-2026-771254');
        expect(screen.getByTestId('field-alberta-energy-rebate-card-status')).toHaveTextContent('Approved');
        expect(screen.getByTestId('field-alberta-energy-rebate-card-amount-issued')).toHaveTextContent('$600.00');
        expect(screen.getByTestId('field-alberta-energy-rebate-card-issued')).toHaveTextContent('September 3, 2026');
        // A benefit card carries no address, so that block stays absent.
        expect(screen.queryByTestId('address-alberta-energy-rebate-card')).not.toBeInTheDocument();
    });

    it('renders the campsite reservation with its park, site and dates', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('primary-campsite-reservation')).toBeInTheDocument());
        expect(screen.getByText('Campsite Reservation')).toBeInTheDocument();
        expect(screen.getByTestId('primary-campsite-reservation')).toHaveTextContent('ABP-2027-30518');
        expect(screen.getByTestId('field-campsite-reservation-park')).toHaveTextContent('Bow Valley Provincial Park');
        expect(screen.getByTestId('field-campsite-reservation-site')).toHaveTextContent('C-14');
        expect(screen.getByTestId('field-campsite-reservation-check-in')).toHaveTextContent('July 16, 2027');
        expect(screen.getByTestId('field-campsite-reservation-status')).toHaveTextContent('Confirmed');
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
