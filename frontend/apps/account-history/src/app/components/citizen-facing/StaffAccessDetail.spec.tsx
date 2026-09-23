import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import StaffAccessDetail from './StaffAccessDetail';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

jest.mock('@abgov/react-components', () => ({
    GoabDetails: ({ heading, children }: { heading: string; children: React.ReactNode }) => (
        <details>
            <summary>{heading}</summary>
            {children}
        </details>
    ),
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

jest.mock('shared/src/lib/page-title/PageTitle', () => ({
    __esModule: true,
    default: ({ title }: { title: string }) => <div data-testid="page-title">{title}</div>,
}));

jest.mock('shared/src/lib/api/dataService', () => ({ get: jest.fn() }));

import { get } from 'shared/src/lib/api/dataService';
const mockGet = get as jest.Mock;

const record = {
    id: 'sa-1',
    recordId: 'ACC-2026-0098412',
    caseNumber: 'SR-448271',
    name: 'J. Doe',
    username: 'jdoe01',
    positionId: 'POS-IS-0142',
    role: 'Benefits Assessment Officer 2',
    ministry: 'Seniors, Community and Social Services',
    unit: 'Income Support - Edmonton North',
    officeLocation: 'Edmonton',
    accessProfile: 'IS_CASEWORKER_READ',
    accessLevel: 'Read-only',
    employeeType: 'Employee',
    accessedAt: '2026-09-19T20:32:00.000Z',
    duration: '00:04:11',
    businessHours: 'Business hours',
    recordsViewed: 1,
    clientId: 'CL-2026-4471',
    relationshipDeclared: 'None declared',
    householdViewed: 'None',
    categories: ['Financial'],
    information: ['Personal income', 'payment history'],
    sensitivity: 'Protected B',
    accessType: 'Viewed',
    identifierDisplay: 'Bank account number shown as the last three digits only',
    reasonType: 'Benefit calculation or payment correction',
    reasonDetail: 'client called regarding September payment shortfall',
    legalAuthority: 'Program administration - Income Support',
    consistentUse: 'Original purpose',
    triggeringEvent: 'Inbound call',
    clientAware: 'Yes - you made the call',
    system: 'Income Support Case Management',
    screen: 'Client Financial Summary',
    searchMethod: 'Exact client ID',
    actionPerformed: 'View',
    output: 'Screen only',
    device: 'Workstation EDM-4471',
    networkLocation: 'On-network',
    authMethod: 'Single sign-on with multi-factor',
    anomalyFlags: [],
    reviewOutcome: 'Appropriate',
    reviewer: 'K. Singh',
    reviewedOn: '2026-09-30',
    followUp: 'None',
};

const payload = { staffAccess: { record } };

const renderDetail = (id = 'sa-1') =>
    render(
        <MemoryRouter initialEntries={[`/transparency/${id}`]}>
            <Routes>
                <Route path="/transparency/:access" element={<StaffAccessDetail />} />
            </Routes>
        </MemoryRouter>
    );

describe('StaffAccessDetail', () => {
    beforeEach(() => jest.clearAllMocks());

    it('answers who accessed the information', async () => {
        mockGet.mockResolvedValue(payload);
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('section-who')).toBeInTheDocument());
        const who = screen.getByTestId('section-who');
        expect(who).toHaveTextContent('J. Doe');
        expect(who).toHaveTextContent('jdoe01');
        expect(who).toHaveTextContent('Benefits Assessment Officer 2');
        expect(who).toHaveTextContent('POS-IS-0142');
        expect(who).toHaveTextContent('Seniors, Community and Social Services');
        expect(who).toHaveTextContent('Income Support - Edmonton North');
        expect(who).toHaveTextContent('Employee');
        expect(who).toHaveTextContent('None declared');
        expect(mockGet).toHaveBeenCalledWith('/v1/staff-access/sa-1');
    });

    it('names an outside organization on the record', async () => {
        mockGet.mockResolvedValue({
            staffAccess: {
                record: {
                    ...record,
                    ministry: undefined,
                    organization: 'Imperial Parking Canada Corporation',
                    unit: 'Parking enforcement - Calgary',
                    employeeType: 'Service provider - private sector',
                },
            },
        });
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('section-who')).toBeInTheDocument());
        const who = screen.getByTestId('section-who');
        expect(who).toHaveTextContent('Organization');
        expect(who).toHaveTextContent('Imperial Parking Canada Corporation');
        expect(who).toHaveTextContent('Service provider - private sector');
        expect(who).not.toHaveTextContent('Ministry');
    });

    it('answers when it happened, and for how long', async () => {
        mockGet.mockResolvedValue(payload);
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('section-when')).toBeInTheDocument());
        const when = screen.getByTestId('section-when');
        expect(when).toHaveTextContent('2026-09-19 14:32 MDT');
        expect(when).toHaveTextContent('00:04:11');
        expect(when).toHaveTextContent('Business hours');
    });

    it('answers what was looked at, and how it was displayed', async () => {
        mockGet.mockResolvedValue(payload);
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('section-what')).toBeInTheDocument());
        const what = screen.getByTestId('section-what');
        expect(what).toHaveTextContent('Financial');
        expect(what).toHaveTextContent('Personal income, payment history');
        expect(what).toHaveTextContent('Protected B');
        expect(what).toHaveTextContent('Viewed');
        expect(what).toHaveTextContent('last three digits only');
    });

    it('answers why, including the authority relied on', async () => {
        mockGet.mockResolvedValue(payload);
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('section-why')).toBeInTheDocument());
        const why = screen.getByTestId('section-why');
        expect(why).toHaveTextContent('Benefit calculation or payment correction');
        expect(why).toHaveTextContent('client called regarding September payment shortfall');
        expect(why).toHaveTextContent('Program administration - Income Support');
        expect(why).toHaveTextContent('Original purpose');
        expect(why).toHaveTextContent('Inbound call');
    });

    it('names a reference number the outside party assigned', async () => {
        mockGet.mockResolvedValue({
            staffAccess: {
                record: {
                    ...record,
                    externalReference: { label: 'Parking ticket number', value: 'PT-2026-884213' },
                },
            },
        });
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('section-why')).toBeInTheDocument());
        const why = screen.getByTestId('section-why');
        expect(why).toHaveTextContent('Parking ticket number');
        expect(why).toHaveTextContent('PT-2026-884213');
    });

    it('reports the review of the access', async () => {
        mockGet.mockResolvedValue(payload);
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('section-review')).toBeInTheDocument());
        const review = screen.getByTestId('section-review');
        expect(review).toHaveTextContent('Appropriate');
        expect(review).toHaveTextContent('None');
        expect(review).toHaveTextContent('K. Singh');
        expect(review).toHaveTextContent('2026-09-30');
    });

    it('keeps the system and audit fields in a disclosure', async () => {
        mockGet.mockResolvedValue(payload);
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('section-technical')).toBeInTheDocument());
        const technical = screen.getByTestId('section-technical');
        expect(technical).toHaveTextContent('ACC-2026-0098412');
        expect(technical).toHaveTextContent('SR-448271');
        expect(technical).toHaveTextContent('Income Support Case Management');
        expect(technical).toHaveTextContent('Client Financial Summary');
        expect(technical).toHaveTextContent('Exact client ID');
        expect(technical).toHaveTextContent('Workstation EDM-4471');
    });

    it('leaves out a section the access has nothing to report for', async () => {
        mockGet.mockResolvedValue(payload);
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('access-record')).toBeInTheDocument());
        expect(screen.queryByTestId('section-disclosure')).not.toBeInTheDocument();
    });

    it('reports a disclosure when the information left the program area', async () => {
        mockGet.mockResolvedValue({
            staffAccess: {
                record: {
                    ...record,
                    disclosure: {
                        disclosedTo: 'Alberta Health, eligibility unit',
                        recipientType: 'Other ministry',
                        method: 'System interface',
                        elements: ['Name', 'Personal Health Number'],
                        authority: 'Information-sharing agreement ISA-2024-017',
                        retention: 'Destroy after 90 days',
                        logged: 'Yes',
                    },
                },
            },
        });
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('section-disclosure')).toBeInTheDocument());
        const shared = screen.getByTestId('section-disclosure');
        expect(shared).toHaveTextContent('Alberta Health, eligibility unit');
        expect(shared).toHaveTextContent('Other ministry');
        expect(shared).toHaveTextContent('Name, Personal Health Number');
        expect(shared).toHaveTextContent('Destroy after 90 days');
    });

    it('shows the before and after of anything that was changed', async () => {
        mockGet.mockResolvedValue({
            staffAccess: {
                record: {
                    ...record,
                    accessType: 'Viewed and updated',
                    changes: [{ element: 'Mailing address', before: '100 Demo Street', after: '220 Sample Avenue' }],
                },
            },
        });
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('section-what')).toBeInTheDocument());
        expect(screen.getByTestId('section-what')).toHaveTextContent('100 Demo Street → 220 Sample Avenue');
    });

    it('flags an after-hours access and one still under review', async () => {
        mockGet.mockResolvedValue({
            staffAccess: {
                record: {
                    ...record,
                    businessHours: 'After-hours',
                    anomalyFlags: ['After-hours access', 'High volume'],
                    reviewOutcome: 'Under review',
                },
            },
        });
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('record-flags')).toBeInTheDocument());
        const flags = screen.getByTestId('record-flags');
        expect(flags).toHaveTextContent('Under review');
        expect(flags).toHaveTextContent('After-hours access');
        expect(flags).toHaveTextContent('High volume');
    });

    it('raises no flags on a routine access', async () => {
        mockGet.mockResolvedValue(payload);
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('access-record')).toBeInTheDocument());
        expect(screen.queryByTestId('record-flags')).not.toBeInTheDocument();
    });

    it('goes back to the list', async () => {
        mockGet.mockResolvedValue(payload);
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('back-link')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('back-link'));
        expect(mockNavigate).toHaveBeenCalledWith('/transparency');
    });

    it('offers a route to filing a privacy complaint', async () => {
        mockGet.mockResolvedValue(payload);
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('file-complaint-link')).toBeInTheDocument());
        expect(screen.getByTestId('file-complaint-link').getAttribute('href')).toContain('file-complaint');
    });

    it('reports a record it cannot find', async () => {
        mockGet.mockResolvedValue({ staffAccess: {} });
        renderDetail('nope');

        await waitFor(() => expect(screen.getByTestId('record-missing')).toBeInTheDocument());
    });

    it('still renders when the request fails', async () => {
        // Reject at call time; a promise rejected at setup time can surface as an
        // unhandled rejection before the component attaches its catch.
        mockGet.mockImplementation(() => Promise.reject(new Error('boom')));
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('record-missing')).toBeInTheDocument());
    });
});
