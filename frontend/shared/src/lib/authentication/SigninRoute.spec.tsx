import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import SigninRoute from './SigninRoute';

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

const login = jest.fn();

const renderRoute = () => render(<MemoryRouter><SigninRoute title="Sign in" /></MemoryRouter>);

describe('SigninRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAuth.mockReturnValue({ isLoading: false, isAuthenticated: false, login });
    });

    it('signs the stood-in account in and carries on', async () => {
        mockIsDemoMode.mockReturnValue(true);
        renderRoute();

        await waitFor(() => expect(login).toHaveBeenCalled());
        expect(login.mock.calls[0][0]).toMatchObject({ email: 'demo.user@example.com', isAuthenticated: true });
        expect(mockNavigate).toHaveBeenCalledWith('/');
        expect(mockGetAsync).not.toHaveBeenCalled();
    });

    it('shows progress rather than a blank page', () => {
        mockIsDemoMode.mockReturnValue(false);
        mockGetAsync.mockResolvedValue('');
        renderRoute();

        expect(screen.getByTestId('spinner')).toHaveTextContent('Sign in in progress');
    });

    it('asks the account service to sign in when demo mode is off', async () => {
        mockIsDemoMode.mockReturnValue(false);
        mockGetAsync.mockResolvedValue('');
        renderRoute();

        await waitFor(() => expect(mockGetAsync).toHaveBeenCalled());
        expect(login).not.toHaveBeenCalled();
    });

    it('goes home when the holder is already signed in', async () => {
        mockIsDemoMode.mockReturnValue(false);
        mockUseAuth.mockReturnValue({ isLoading: false, isAuthenticated: true, login });
        renderRoute();

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
        expect(mockGetAsync).not.toHaveBeenCalled();
    });

    it('survives a failed sign in request', async () => {
        mockIsDemoMode.mockReturnValue(false);
        mockGetAsync.mockImplementation(() => Promise.reject(new Error('unreachable')));
        renderRoute();

        await waitFor(() => expect(mockGetAsync).toHaveBeenCalled());
        expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });
});
