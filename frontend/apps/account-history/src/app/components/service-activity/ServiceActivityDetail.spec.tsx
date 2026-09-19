import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ServiceActivityDetail from './ServiceActivityDetail';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

jest.mock('@abgov/react-components', () => ({
    GoabButton: ({ children, onClick, testId }: { children: React.ReactNode; onClick?: () => void; testId?: string }) => (
        <button data-testid={testId} onClick={onClick}>{children}</button>
    ),
    GoabCircularProgress: ({ visible }: { visible: boolean }) => <div data-testid="spinner">{String(visible)}</div>,
    GoabDetails: ({ heading, children }: { heading: string; children: React.ReactNode }) => (
        <details open><summary>{heading}</summary>{children}</details>
    ),
    GoabIcon: ({ type }: { type: string }) => <i data-testid={`icon-${type}`} />,
    GoabPagination: ({ itemCount, perPageCount, pageNumber, onChange, testId }: { itemCount: number; perPageCount: number; pageNumber: number; onChange: (d: { page: number }) => void; testId?: string }) => (
        <div data-testid={testId}>
            <span data-testid="page-info">{`Page ${pageNumber} of ${Math.max(1, Math.ceil(itemCount / perPageCount))}`}</span>
            <button data-testid="next-page" onClick={() => onChange({ page: pageNumber + 1 })}>Next</button>
        </div>
    ),
}));

jest.mock('shared/src/lib/api/dataService', () => ({ get: jest.fn() }));

import { get } from 'shared/src/lib/api/dataService';
const mockGet = get as jest.Mock;

const categories = [
    { id: 'payments', label: 'Payments' },
    { id: 'applications', label: 'Applications' },
];

const withDetails = {
    serviceActivity: {
        categories,
        service: {
            id: 'rebate',
            name: 'Alberta Energy Rebate',
            description: 'This online service can be used to get $600 to help with the cost of everyday essentials for eligible Albertans.',
            descriptionLinkText: 'eligible Albertans',
            categoryId: 'family-and-social-support',
            categoryLabel: 'Family and Social Support',
            ministry: 'Energy and Minerals',
            accessServiceUrl: 'https://example.alberta.ca/rebate',
            detailsAvailable: true,
            personalInformation: ['Name', 'Date of birth', 'Social Insurance Number'],
            howPersonalInformationIsUsed: 'This information is used to determine eligibility.',
            legislation: { summary: 'This legislation gives the legal authority.', label: 'FOIP', url: 'https://example.alberta.ca/foip' },
        },
        events: [
            { id: 'e1', serviceId: 'rebate', event: 'Your rebate payment was issued', categoryId: 'payments', occurredAt: '2026-09-03T15:12:00.000Z', details: [{ label: 'Amount', value: '$600.00' }, { label: 'Status', value: 'Deposited' }] },
            { id: 'e2', serviceId: 'rebate', event: 'You submitted your application', categoryId: 'applications', occurredAt: '2026-08-24T17:30:00.000Z' },
        ],
    },
};

const withoutDetails = {
    serviceActivity: {
        categories,
        service: {
            id: 'fines',
            name: 'Fine payments',
            description: 'Pay violation tickets, notices of conviction and time to pay notices.',
            categoryId: 'justice',
            categoryLabel: 'Justice',
            ministry: 'Justice and Solicitor General',
            accessServiceUrl: 'https://example.alberta.ca/fines',
            detailsAvailable: false,
        },
        events: [],
    },
};

const renderDetail = (id = 'rebate', entry = `/accessed-services/${id}`) =>
    render(
        <MemoryRouter initialEntries={[entry]}>
            <Routes>
                <Route path="/accessed-services/:service" element={<ServiceActivityDetail isPreview={false} />} />
            </Routes>
        </MemoryRouter>
    );

describe('ServiceActivityDetail', () => {
    beforeEach(() => jest.clearAllMocks());

    it('shows the service, its category and its ministry', async () => {
        mockGet.mockResolvedValue(withDetails);
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('service-name')).toHaveTextContent('Alberta Energy Rebate'));
        expect(screen.getByTestId('service-category')).toHaveTextContent('Family and Social Support');
        expect(screen.getByTestId('service-ministry')).toHaveTextContent('Energy and Minerals');
        expect(mockGet).toHaveBeenCalledWith('/v1/service-activity/rebate');
    });

    it('renders the named phrase of the description as a link', async () => {
        mockGet.mockResolvedValue(withDetails);
        renderDetail();

        await waitFor(() => expect(screen.getByText('eligible Albertans')).toBeInTheDocument());
        expect(screen.getByText('eligible Albertans').closest('a')).toHaveAttribute('target', '_blank');
    });

    it('opens on activity history and expands an activity to show its details', async () => {
        mockGet.mockResolvedValue(withDetails);
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('panel-activity')).toBeInTheDocument());
        expect(screen.queryByTestId('details-e1')).not.toBeInTheDocument();

        fireEvent.click(screen.getByTestId('event-e1'));
        const details = screen.getByTestId('details-e1');
        expect(details).toHaveTextContent('Activity details');
        expect(details).toHaveTextContent('$600.00');
        expect(details).toHaveTextContent('Deposited');

        fireEvent.click(screen.getByTestId('event-e1'));
        expect(screen.queryByTestId('details-e1')).not.toBeInTheDocument();
    });

    it('keeps several activities open at once', async () => {
        mockGet.mockResolvedValue(withDetails);
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('event-e1')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('event-e1'));
        fireEvent.click(screen.getByTestId('event-e2'));

        // Opening the second must not close the first.
        expect(screen.getByTestId('details-e1')).toBeInTheDocument();
        expect(screen.getByTestId('details-e2')).toBeInTheDocument();
    });

    it('closes only the activity that was chosen', async () => {
        mockGet.mockResolvedValue(withDetails);
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('event-e1')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('event-e1'));
        fireEvent.click(screen.getByTestId('event-e2'));
        fireEvent.click(screen.getByTestId('event-e1'));

        expect(screen.queryByTestId('details-e1')).not.toBeInTheDocument();
        expect(screen.getByTestId('details-e2')).toBeInTheDocument();
    });

    it('says so when an activity recorded no further details', async () => {
        mockGet.mockResolvedValue(withDetails);
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('event-e2')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('event-e2'));
        expect(screen.getByTestId('details-e2')).toHaveTextContent('No further details were recorded');
    });

    it('switches to service details and lists the personal information held', async () => {
        mockGet.mockResolvedValue(withDetails);
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('tab-details')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('tab-details'));

        expect(screen.getByTestId('panel-details')).toBeInTheDocument();
        expect(screen.getByTestId('personal-information')).toHaveTextContent('Social Insurance Number');
        expect(screen.getByText('How personal information is used')).toBeInTheDocument();
        expect(screen.getByTestId('legislation-link')).toHaveAttribute('href', 'https://example.alberta.ca/foip');
    });

    it('keeps the chosen tab in the address', async () => {
        mockGet.mockResolvedValue(withDetails);
        renderDetail('rebate', '/accessed-services/rebate?tab=details');

        await waitFor(() => expect(screen.getByTestId('panel-details')).toBeInTheDocument());
        expect(screen.queryByTestId('panel-activity')).not.toBeInTheDocument();
    });

    it('says details are coming for a service that has not published them', async () => {
        mockGet.mockResolvedValue(withoutDetails);
        renderDetail('fines');

        await waitFor(() => expect(screen.getByTestId('tab-details')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('tab-details'));

        expect(screen.getByTestId('details-coming-soon')).toHaveTextContent('Service details coming soon');
        expect(screen.queryByTestId('personal-information')).not.toBeInTheDocument();
    });

    it('says when no activity has been recorded for the service', async () => {
        mockGet.mockResolvedValue(withoutDetails);
        renderDetail('fines');

        await waitFor(() => expect(screen.getByTestId('no-activity')).toBeInTheDocument());
    });

    it('offers a route to filing a privacy complaint', async () => {
        mockGet.mockResolvedValue(withDetails);
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('file-complaint-link')).toBeInTheDocument());
        expect(screen.getByTestId('file-complaint-link').getAttribute('href')).toContain('file-complaint');
    });

    it('goes back to the list', async () => {
        mockGet.mockResolvedValue(withDetails);
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('back-to-list')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('back-to-list'));
        expect(mockNavigate).toHaveBeenCalledWith('/accessed-services');
    });

    it('reports a service it cannot find', async () => {
        mockGet.mockResolvedValue({ serviceActivity: undefined });
        renderDetail('nope');

        await waitFor(() => expect(screen.getByTestId('service-missing')).toBeInTheDocument());
    });

    it('still renders when the request fails', async () => {
        // Reject at call time; a promise rejected at setup time can surface as an
        // unhandled rejection before the component attaches its catch.
        mockGet.mockImplementation(() => Promise.reject(new Error('boom')));
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('service-missing')).toBeInTheDocument());
    });
});
