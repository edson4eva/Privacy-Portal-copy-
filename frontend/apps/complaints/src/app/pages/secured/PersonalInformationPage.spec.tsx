import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import PersonalInformationPage from './PersonalInformationPage';

jest.mock('@abgov/react-components', () => ({
    GoabBadge: ({ content }: { content: string }) => <span data-testid="badge">{content}</span>,
    GoabCircularProgress: ({ visible }: { visible: boolean }) => <div data-testid="spinner">{String(visible)}</div>,
}));

jest.mock('shared/src/lib/api/dataService', () => ({ get: jest.fn() }));
jest.mock('shared/src/lib/context/auth-provider', () => ({ useAuth: jest.fn() }));

import { get } from 'shared/src/lib/api/dataService';
import { useAuth } from 'shared/src/lib/context/auth-provider';

const mockGet = get as jest.Mock;
const mockUseAuth = useAuth as jest.Mock;

const profile = {
    personalInformation: {
        identity: { legalName: 'Demo User', preferredName: 'Demo', dateOfBirth: '1985-04-12' },
        contact: { email: 'demo.user@example.com', emailVerified: true, phone: '(780) 555-0142', phoneVerified: false },
        address: { street: '123 Jasper Avenue NW', unit: 'Suite 400', city: 'Edmonton', province: 'Alberta', postalCode: 'T5J 0R2' },
        account: { accountType: 'Personal', verificationLevel: 'Verified', lastUpdated: '2026-07-18' },
    },
};

describe('PersonalInformationPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAuth.mockReturnValue({ getCurrentUser: () => ({ name: 'Demo User', email: 'demo.user@example.com', profile: 'personal', isVerified: true }) });
    });

    it('renders the sections and values', async () => {
        mockGet.mockResolvedValue(profile);
        render(<MemoryRouter><PersonalInformationPage /></MemoryRouter>);
        await waitFor(() => expect(screen.getByText('Name and date of birth')).toBeInTheDocument());
        expect(screen.getByText('Contact information')).toBeInTheDocument();
        expect(screen.getByText('Mailing address')).toBeInTheDocument();
        expect(screen.getByText('(780) 555-0142')).toBeInTheDocument();
        expect(mockGet).toHaveBeenCalledWith('/v1/personal-information');
    });

    it('still renders when the request fails', async () => {
        // Reject at call time; a promise rejected at setup time can surface as an
        // unhandled rejection before the component attaches its catch.
        mockGet.mockImplementation(() => Promise.reject(new Error('boom')));
        render(<MemoryRouter><PersonalInformationPage /></MemoryRouter>);
        await waitFor(() => expect(screen.getByText('Name and date of birth')).toBeInTheDocument());
        expect(screen.getAllByText('Not provided').length).toBeGreaterThan(0);
    });
});
