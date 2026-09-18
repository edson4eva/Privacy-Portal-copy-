import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import SignoutRoute from './SignoutRoute';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

jest.mock('@abgov/react-components', () => ({
    GoabCircularProgress: ({ message }: { message?: string }) => <div data-testid="spinner">{message}</div>,
}));

jest.mock('../api', () => ({ getAsync: jest.fn() }));
jest.mock('../context/auth-provider', () => ({ useAuth: jest.fn() }));
jest.mock('../utils/demoMode', () => ({ isDemoMode: jest.fn() }));

import { getAsync } from '../api';
import { useAuth } from '../context/auth-provider';
import { isDemoMode } from '../utils/demoMode';

const mockGetAsync = getAsync as jest.Mock;
const mockUseAuth = useAuth as jest.Mock;
const mockIsDemoMode = isDemoMode as jest.Mock;

const logout = jest.fn();
const assign = jest.fn();

const renderRoute = () => render(<MemoryRouter><SignoutRoute title="Sign Out" /></MemoryRouter>);

describe('SignoutRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAuth.mockReturnValue({ isAuthenticated: true, logout });
        Object.defineProperty(window, 'location', { writable: true, value: { assign } });
    });

    it('drops the stood-in account and goes where signing back in is possible', async () => {
        mockIsDemoMode.mockReturnValue(true);
        renderRoute();

        await waitFor(() => expect(logout).toHaveBeenCalled());
        expect(assign).toHaveBeenCalled();
        // The account service is unreachable in a demonstration, so it is not called.
        expect(mockGetAsync).not.toHaveBeenCalled();
    });

    it('signs out through the account service when demo mode is off', async () => {
        mockIsDemoMode.mockReturnValue(false);
        mockGetAsync.mockResolvedValue({});
        renderRoute();

        await waitFor(() => expect(mockGetAsync).toHaveBeenCalled());
        expect(logout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('still completes when the sign out request fails', async () => {
        mockIsDemoMode.mockReturnValue(false);
        // Reject at call time; a promise rejected at setup time can surface as an
        // unhandled rejection before the component attaches its catch.
        mockGetAsync.mockImplementation(() => Promise.reject(new Error('unreachable')));
        renderRoute();

        // Previously the await threw and neither of these ran, leaving the
        // spinner up for good.
        await waitFor(() => expect(logout).toHaveBeenCalled());
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('shows progress while it works', () => {
        mockIsDemoMode.mockReturnValue(false);
        mockGetAsync.mockResolvedValue({});
        renderRoute();

        expect(screen.getByTestId('spinner')).toHaveTextContent('Sign out in progress');
    });
});
