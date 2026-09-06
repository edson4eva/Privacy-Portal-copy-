import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import SecuritySettingsPage from './SecuritySettingsPage';

jest.mock('@abgov/react-components', () => ({
    GoabButton: ({ children, onClick, testId }: { children: React.ReactNode; onClick?: () => void; testId?: string }) => (
        <button data-testid={testId} onClick={onClick}>{children}</button>
    ),
    GoabCheckbox: ({
        checked,
        onChange,
        testId,
        text,
    }: {
        checked?: boolean;
        onChange?: (d: { checked: boolean }) => void;
        testId?: string;
        text?: string;
    }) => (
        <label>
            <input
                type="checkbox"
                data-testid={testId}
                checked={!!checked}
                onChange={(event) => onChange?.({ checked: event.target.checked })}
            />
            {text}
        </label>
    ),
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
    securitySettings: {
        twoStepVerificationEnabled: false,
        signInEmail: 'demo.user@example.com',
        recoveryEmail: undefined,
        expiryReminderEnabled: false,
    },
};

const renderPage = () => render(<MemoryRouter><SecuritySettingsPage /></MemoryRouter>);

describe('SecuritySettingsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAuth.mockReturnValue({ getCurrentUser: () => ({ email: 'demo.user@example.com' }) });
    });

    it('renders both cards and the delete section', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByText('Security settings')).toBeInTheDocument());
        expect(screen.getByText('Sign-in and recovery information')).toBeInTheDocument();
        expect(screen.getByText('Delete my account')).toBeInTheDocument();
        expect(mockGet).toHaveBeenCalledWith('/v1/security-settings');
    });

    it('turns 2-step verification on and back off', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('two-step-state')).toHaveTextContent('Off'));
        expect(screen.getByTestId('toggle-two-step')).toHaveTextContent('Turn on');

        fireEvent.click(screen.getByTestId('toggle-two-step'));
        expect(screen.getByTestId('two-step-state')).toHaveTextContent('On');
        expect(screen.getByTestId('toggle-two-step')).toHaveTextContent('Turn off');

        fireEvent.click(screen.getByTestId('toggle-two-step'));
        expect(screen.getByTestId('two-step-state')).toHaveTextContent('Off');
    });

    it('masks the password and never shows a real value', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('password')).toBeInTheDocument());
        expect(screen.getByTestId('password')).toHaveTextContent('********************');
    });

    it('offers Add for a missing recovery email and Edit once set', async () => {
        mockGet.mockResolvedValue(payload);
        const { unmount } = renderPage();

        await waitFor(() => expect(screen.getByTestId('recovery-email')).toHaveTextContent('Not provided'));
        expect(screen.getByTestId('edit-recovery-email')).toHaveTextContent('Add');
        unmount();

        mockGet.mockResolvedValue({
            securitySettings: { ...payload.securitySettings, recoveryEmail: 'backup@example.com' },
        });
        renderPage();

        await waitFor(() => expect(screen.getByTestId('recovery-email')).toHaveTextContent('backup@example.com'));
        expect(screen.getByTestId('edit-recovery-email')).toHaveTextContent('Edit');
    });

    it('explains where credentials are changed instead of faking a form', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('edit-password')).toBeInTheDocument());
        expect(screen.queryByTestId('notice-password')).not.toBeInTheDocument();

        fireEvent.click(screen.getByTestId('edit-password'));
        expect(screen.getByTestId('notice-password')).toBeInTheDocument();
    });

    it('toggles the expiry reminder', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('expiry-reminder')).toBeInTheDocument());
        const checkbox = screen.getByTestId('expiry-reminder') as HTMLInputElement;
        expect(checkbox.checked).toBe(false);

        fireEvent.click(checkbox);
        expect((screen.getByTestId('expiry-reminder') as HTMLInputElement).checked).toBe(true);
    });

    it('asks for confirmation rather than deleting anything', async () => {
        mockGet.mockResolvedValue(payload);
        renderPage();

        await waitFor(() => expect(screen.getByTestId('delete-account')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('delete-account'));

        expect(screen.getByTestId('delete-confirm')).toBeInTheDocument();
        expect(screen.getByText(/nothing has been deleted/)).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('cancel-delete'));
        expect(screen.getByTestId('delete-account')).toBeInTheDocument();
    });

    it('still renders when the request fails', async () => {
        // Reject at call time; a promise rejected at setup time can surface as an
        // unhandled rejection before the component attaches its catch.
        mockGet.mockImplementation(() => Promise.reject(new Error('boom')));
        renderPage();

        await waitFor(() => expect(screen.getByText('Security settings')).toBeInTheDocument());
        // Falls back to the account's own email.
        expect(screen.getByTestId('sign-in-email')).toHaveTextContent('demo.user@example.com');
    });
});
