import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import AlbertaWalletPage from './AlbertaWalletPage';

jest.mock('@abgov/react-components', () => ({
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
    GoabCircularProgress: ({ visible }: { visible: boolean }) => <div data-testid="spinner">{String(visible)}</div>,
    GoabIcon: ({ type }: { type: string }) => <i data-testid={`icon-${type}`} />,
}));

jest.mock('shared/src/lib/api/dataService', () => ({ get: jest.fn() }));

import { get } from 'shared/src/lib/api/dataService';
const mockGet = get as jest.Mock;

const licence = {
    id: 'mobile-drivers-licence',
    serviceUrl: 'https://eservices.alberta.ca/',
    serviceArea: 'Driving safety',
    listedService: 'Licensing and owning a vehicle',
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
    serviceUrl: 'https://www.albertahealthservices.ca/',
    serviceArea: 'Health',
    listedService: 'Coverage and benefits',
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
    serviceUrl: 'https://www.alberta.ca/alberta-energy-rebate',
    serviceArea: 'Family and social supports',
    listedService: 'Alberta Energy Rebate',
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
    serviceUrl: 'https://www.albertaparks.ca/albertaparks-ca/visit-our-parks/camping-in-alberta-parks/',
    serviceArea: 'Tourism, sport and outdoor recreation',
    listedService: 'Provincial parks and campgrounds',
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

const renderPage = () =>
    render(
        <MemoryRouter>
            <AlbertaWalletPage />
        </MemoryRouter>
    );

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

    it('puts a presentation code on every card, licence included', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getAllByTestId(/^qr-/)).toHaveLength(4));
        for (const id of [
            'mobile-drivers-licence',
            'mobile-health-card',
            'alberta-energy-rebate-card',
            'campsite-reservation',
        ]) {
            expect(screen.getByTestId(`qr-${id}`)).toBeInTheDocument();
        }
    });

    it('gives each card its own code rather than repeating one', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getAllByTestId(/^qr-/)).toHaveLength(4));
        const patterns = screen.getAllByTestId(/^qr-/).map((frame) => frame.innerHTML);
        expect(new Set(patterns).size).toBe(patterns.length);
    });

    it('groups the cards under their category, in the inventory order', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('area-Driving safety')).toBeInTheDocument());
        const headings = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent);

        // Driving safety, Family and social supports, Health then Tourism is
        // the inventory's order, not the order the cards arrive in.
        expect(headings).toEqual([
            'Driving safety',
            'Family and social supports',
            'Health',
            'Tourism, sport and outdoor recreation',
            'Get the Alberta Wallet app',
        ]);
    });

    it('names the listed service each category covers', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('area-Health')).toBeInTheDocument());
        expect(screen.getByTestId('area-Health')).toHaveTextContent('Coverage and benefits');
        expect(screen.getByTestId('area-Driving safety')).toHaveTextContent('Licensing and owning a vehicle');
        expect(screen.getByTestId('area-Tourism, sport and outdoor recreation')).toHaveTextContent(
            'Provincial parks and campgrounds'
        );
    });

    it('does not repeat a service name the card already carries', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('area-Family and social supports')).toBeInTheDocument());
        // The rebate is both a card and the service it is listed under.
        expect(screen.getAllByText('Alberta Energy Rebate')).toHaveLength(1);
        expect(screen.getByTestId('area-Family and social supports').querySelectorAll('p')).toHaveLength(0);
    });

    it('keeps every card, one to its category, and hints once for the wallet', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('wallet-stack-Health')).toBeInTheDocument());
        const stacks = [
            'Driving safety',
            'Family and social supports',
            'Health',
            'Tourism, sport and outdoor recreation',
        ];
        expect(stacks.map((area) => screen.getByTestId(`wallet-stack-${area}`).children.length)).toEqual([1, 1, 1, 1]);
        // One hint for the wallet, not one per category.
        expect(screen.getAllByText(/Choose a card, or the link beneath it/)).toHaveLength(1);
    });

    it('groups a document the inventory does not cover rather than dropping it', async () => {
        mockGet.mockResolvedValue({
            wallet: { documents: [{ ...healthCard, serviceArea: undefined, listedService: undefined }] },
        });
        renderPage();

        await waitFor(() => expect(screen.getByTestId('area-Other documents')).toBeInTheDocument());
        expect(screen.getByTestId('wallet-stack-Other documents').children).toHaveLength(1);
    });

    it('opens each card at the website of the service it belongs to', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('wallet-card-mobile-health-card')).toBeInTheDocument());
        const expected: [string, string][] = [
            ['mobile-drivers-licence', 'https://eservices.alberta.ca/'],
            ['mobile-health-card', 'https://www.albertahealthservices.ca/'],
            ['alberta-energy-rebate-card', 'https://www.alberta.ca/alberta-energy-rebate'],
            [
                'campsite-reservation',
                'https://www.albertaparks.ca/albertaparks-ca/visit-our-parks/camping-in-alberta-parks/',
            ],
        ];

        for (const [id, href] of expected) {
            const card = screen.getByTestId(`wallet-card-${id}`);
            expect(card.tagName).toBe('A');
            expect(card).toHaveAttribute('href', href);
            expect(card).toHaveAttribute('target', '_blank');
            // Leaving the portal must not hand the opener to the other site.
            expect(card).toHaveAttribute('rel', 'noopener noreferrer');
        }
    });

    it('offers a link beneath each card, naming the site it reaches', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('service-link-mobile-health-card')).toBeInTheDocument());
        const expected: [string, string, string][] = [
            ['mobile-drivers-licence', 'eservices.alberta.ca', 'https://eservices.alberta.ca/'],
            ['mobile-health-card', 'albertahealthservices.ca', 'https://www.albertahealthservices.ca/'],
            ['alberta-energy-rebate-card', 'alberta.ca', 'https://www.alberta.ca/alberta-energy-rebate'],
            [
                'campsite-reservation',
                'albertaparks.ca',
                'https://www.albertaparks.ca/albertaparks-ca/visit-our-parks/camping-in-alberta-parks/',
            ],
        ];

        for (const [id, host, href] of expected) {
            const link = screen.getByTestId(`service-link-${id}`);
            expect(link).toHaveAttribute('href', href);
            expect(link).toHaveAttribute('target', '_blank');
            expect(link).toHaveAttribute('rel', 'noopener noreferrer');
            expect(link).toHaveTextContent(`Go to ${host}`);
        }
    });

    it('carries no advertising tracking on the rebate link', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('wallet-card-alberta-energy-rebate-card')).toBeInTheDocument());
        const href = screen.getByTestId('wallet-card-alberta-energy-rebate-card').getAttribute('href') ?? '';
        for (const parameter of ['gclid', 'utm_', 'gad_source', 'gad_campaignid', 'gbraid']) {
            expect(href).not.toContain(parameter);
        }
    });

    it('does not make a card a link when its service has no website', async () => {
        mockGet.mockResolvedValue({ wallet: { documents: [{ ...healthCard, serviceUrl: undefined }] } });
        renderPage();

        await waitFor(() => expect(screen.getByTestId('wallet-card-mobile-health-card')).toBeInTheDocument());
        const card = screen.getByTestId('wallet-card-mobile-health-card');
        expect(card.tagName).toBe('DIV');
        expect(card).not.toHaveAttribute('href');
        // And no link is offered beneath it either, rather than one to nowhere.
        expect(screen.queryByTestId('service-link-mobile-health-card')).not.toBeInTheDocument();
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
