import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SignInPage from './SignInPage';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

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
                onChange={(e) => onChange?.({ checked: e.target.checked })}
            />
            {text}
        </label>
    ),
    GoabIcon: ({ type }: { type: string }) => <i data-testid={`icon-${type}`} />,
    GoabInput: ({
        value,
        onChange,
        testId,
        type,
    }: {
        value?: string;
        onChange?: (d: { name: string; value: string }) => void;
        testId?: string;
        type?: string;
    }) => (
        <input
            data-testid={testId}
            type={type}
            value={value}
            onChange={(e) => onChange?.({ name: 'f', value: e.target.value })}
        />
    ),
}));

const assign = jest.fn();

const renderPage = (entry = '/sign-in') =>
    render(
        <MemoryRouter initialEntries={[entry]}>
            <Routes>
                <Route path="/sign-in" element={<SignInPage />} />
            </Routes>
        </MemoryRouter>
    );

const withReturn = '/sign-in?returnTo=%2Faccount-history%2Faccessed-services';
const destination = '/account-history/accessed-services';

describe('SignInPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Object.defineProperty(window, 'location', {
            writable: true,
            value: { assign, href: 'http://localhost/sign-in' },
        });
    });

    it('follows the account card: heading, account field, Continue and the other options', () => {
        renderPage();

        expect(screen.getByText('Sign in to Alberta.ca Account')).toBeInTheDocument();
        expect(screen.getByText('Email or username')).toBeInTheDocument();
        expect(screen.getByTestId('signin-submit')).toHaveTextContent('Continue');
        expect(screen.getByText('or')).toBeInTheDocument();
        expect(screen.getByTestId('signin-google')).toHaveTextContent('Sign in with Google');
        expect(screen.getByTestId('signin-microsoft')).toHaveTextContent('Sign in with Microsoft');
        expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    });

    it('arrives with a fictional account already filled in', () => {
        renderPage();

        expect(screen.getByTestId('signin-username')).toHaveValue('demo.user@example.com');
    });

    it('asks for no password, as the first step of the account card does not', () => {
        renderPage();

        expect(screen.queryByTestId('signin-password')).not.toBeInTheDocument();
        expect(screen.queryByText('Password')).not.toBeInTheDocument();
    });

    it('says it stands in for the real sign-in', () => {
        renderPage();

        expect(screen.getByTestId('demo-notice')).toHaveTextContent('Demonstration sign-in');
        expect(screen.getByTestId('demo-notice')).toHaveTextContent(/nothing to enter/);
        expect(screen.getByTestId('demo-notice')).toHaveTextContent(/Nothing is checked or sent anywhere/);
    });

    it.each([
        ['Continue', 'signin-submit'],
        ['Google', 'signin-google'],
        ['Microsoft', 'signin-microsoft'],
    ])('continues to the destination from %s', (_label, testId) => {
        const { unmount } = renderPage(withReturn);

        fireEvent.click(screen.getByTestId(testId));
        expect(assign).toHaveBeenCalledWith(destination);
        unmount();
    });

    it('remembers the sign in option when chosen', () => {
        renderPage();

        const checkbox = screen.getByTestId('remember-sign-in') as HTMLInputElement;
        expect(checkbox.checked).toBe(false);
        fireEvent.click(checkbox);
        expect((screen.getByTestId('remember-sign-in') as HTMLInputElement).checked).toBe(true);
    });

    it.each([
        ['Find my account', 'find-account'],
        ['Having trouble signing in?', 'trouble-signing-in'],
        ['Create account', 'create-account'],
    ])('says where %s is handled rather than doing nothing', (_label, testId) => {
        const { unmount } = renderPage();

        expect(screen.queryByTestId('elsewhere-notice')).not.toBeInTheDocument();
        fireEvent.click(screen.getByTestId(testId));
        expect(screen.getByTestId('elsewhere-notice')).toHaveTextContent(/not available from here/);
        unmount();
    });

    it.each([
        ['an absolute url', '/sign-in?returnTo=https%3A%2F%2Fexample.com'],
        ['a protocol-relative url', '/sign-in?returnTo=%2F%2Fexample.com'],
    ])('ignores %s as a destination', (_label, entry) => {
        const { unmount } = renderPage(entry);

        fireEvent.click(screen.getByTestId('signin-submit'));
        expect(assign).toHaveBeenCalledWith('/');
        unmount();
    });

    it('lets the account be edited but still just continues', () => {
        renderPage(withReturn);

        fireEvent.change(screen.getByTestId('signin-username'), { target: { value: 'someone@example.com' } });
        expect(screen.getByTestId('signin-username')).toHaveValue('someone@example.com');

        fireEvent.click(screen.getByTestId('signin-submit'));
        expect(assign).toHaveBeenCalledWith(destination);
    });

    it('goes back to the privacy features page on cancel', () => {
        renderPage();

        fireEvent.click(screen.getByTestId('signin-cancel'));
        expect(mockNavigate).toHaveBeenCalledWith('/features');
    });
});
