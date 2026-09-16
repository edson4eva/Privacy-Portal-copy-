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
    GoabButton: ({ children, onClick, testId }: { children: React.ReactNode; onClick?: () => void; testId?: string }) => (
        <button data-testid={testId} onClick={onClick}>{children}</button>
    ),
    GoabIcon: ({ type }: { type: string }) => <i data-testid={`icon-${type}`} />,
    GoabInput: ({ value, onChange, testId, type }: { value?: string; onChange?: (d: { name: string; value: string }) => void; testId?: string; type?: string }) => (
        <input data-testid={testId} type={type} value={value} onChange={(e) => onChange?.({ name: 'f', value: e.target.value })} />
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

describe('SignInPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Object.defineProperty(window, 'location', {
            writable: true,
            value: { assign, href: 'http://localhost/sign-in' },
        });
    });

    it('arrives with a fictional account already filled in', () => {
        renderPage();

        expect(screen.getByText('Sign in to Alberta.ca Account')).toBeInTheDocument();
        expect(screen.getByTestId('signin-username')).toHaveValue('demo.user@example.com');
        expect(screen.getByTestId('signin-password')).toHaveValue('demo-account');
        expect(screen.getByTestId('signin-password')).toHaveAttribute('type', 'password');
    });

    it('says it stands in for the real sign-in', () => {
        renderPage();

        expect(screen.getByTestId('demo-notice')).toHaveTextContent('Demonstration sign-in');
        expect(screen.getByTestId('demo-notice')).toHaveTextContent(/nothing is checked or sent anywhere/);
    });

    it('continues to the page the link was headed for', () => {
        renderPage('/sign-in?returnTo=%2Faccount-history%2Faccessed-services');

        fireEvent.click(screen.getByTestId('signin-submit'));
        expect(assign).toHaveBeenCalledWith('/account-history/accessed-services');
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

    it('lets the fields be edited but still just continues', () => {
        renderPage('/sign-in?returnTo=%2Faccount-history%2Faccessed-services');

        fireEvent.change(screen.getByTestId('signin-username'), { target: { value: 'someone@example.com' } });
        expect(screen.getByTestId('signin-username')).toHaveValue('someone@example.com');

        fireEvent.click(screen.getByTestId('signin-submit'));
        expect(assign).toHaveBeenCalledWith('/account-history/accessed-services');
    });

    it('goes back to the privacy features page on cancel', () => {
        renderPage();

        fireEvent.click(screen.getByTestId('signin-cancel'));
        expect(mockNavigate).toHaveBeenCalledWith('/features');
    });
});
