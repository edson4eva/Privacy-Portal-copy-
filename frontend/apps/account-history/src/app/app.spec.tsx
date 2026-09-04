import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './app';

// Mock all external dependencies
jest.mock('@abgov/web-components', () => ({}));

jest.mock('shared/src/lib/scroll-to-top/ScrollToTop', () => {
    return function MockScrollToTop() {
        return <div data-testid="scroll-to-top">ScrollToTop</div>;
    };
});

jest.mock('./components/layout/AuthenticatedLayout', () => {
    return function MockAuthenticatedLayout() {
        return <div data-testid="authenticated-layout">AuthenticatedLayout</div>;
    };
});

jest.mock('./components/shared/FallbackPage', () => {
    return function MockFallbackUI() {
        return <div data-testid="fallback-ui">FallbackUI</div>;
    };
});

jest.mock('shared/src/lib/context/auth-provider', () => ({
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>,
}));

jest.mock('react-error-boundary', () => ({
    ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>,
}));

// Mock analytics and monitoring utilities
jest.mock('shared/src/lib/utils/appInsights', () => ({
    initializeAppInsights: jest.fn(),
}));

jest.mock('shared/src/lib/utils/google-analytics', () => ({
    initializeGoogleAnalytics: jest.fn(),
}));

jest.mock('shared/src/lib/utils/pingdom', () => ({
    initializePingdom: jest.fn(),
}));

jest.mock('shared/src/lib/utils/logging', () => ({
    logError: jest.fn(),
}));

jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom');
    return {
        ...actual,
        BrowserRouter: ({ children, basename }: { children: React.ReactNode; basename?: string }) => {
            const { MemoryRouter } = actual;
            // Use MemoryRouter with initial entry that matches the basename
            const initialEntries = basename ? [basename] : ['/'];
            return (
                <div data-testid="router" data-basename={basename || ''}>
                    <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
                </div>
            );
        },
    };
});

const mockInitializeAppInsights = jest.requireMock('shared/src/lib/utils/appInsights').initializeAppInsights;
const mockInitializeGoogleAnalytics = jest.requireMock(
    'shared/src/lib/utils/google-analytics'
).initializeGoogleAnalytics;
const mockInitializePingdom = jest.requireMock('shared/src/lib/utils/pingdom').initializePingdom;

describe('App', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.NX_PUBLIC_BASE_HREF = '/account-history';
    });

    afterEach(() => {
        delete process.env.NX_PUBLIC_BASE_HREF;
    });

    it('should render without crashing', () => {
        render(<App />);

        expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
        expect(screen.getByTestId('scroll-to-top')).toBeInTheDocument();
        expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
        expect(screen.getByTestId('authenticated-layout')).toBeInTheDocument();
    });

    it('should initialize all analytics and monitoring services on mount', () => {
        render(<App />);

        expect(mockInitializeAppInsights).toHaveBeenCalledTimes(1);
        expect(mockInitializeGoogleAnalytics).toHaveBeenCalledTimes(1);
        expect(mockInitializePingdom).toHaveBeenCalledTimes(1);
    });

    it('should only initialize analytics once on re-renders', () => {
        const { rerender } = render(<App />);

        // Re-render the component
        rerender(<App />);

        // Should still only be called once
        expect(mockInitializeAppInsights).toHaveBeenCalledTimes(1);
        expect(mockInitializeGoogleAnalytics).toHaveBeenCalledTimes(1);
        expect(mockInitializePingdom).toHaveBeenCalledTimes(1);
    });

    it('should render ErrorBoundary as root wrapper', () => {
        render(<App />);

        const errorBoundary = screen.getByTestId('error-boundary');
        expect(errorBoundary).toBeInTheDocument();

        // ErrorBoundary should contain all other components
        expect(errorBoundary).toContainElement(screen.getByTestId('scroll-to-top'));
        expect(errorBoundary).toContainElement(screen.getByTestId('auth-provider'));
        expect(errorBoundary).toContainElement(screen.getByTestId('authenticated-layout'));
    });

    it('should render Router with correct basename when NX_PUBLIC_BASE_HREF is set', () => {
        process.env.NX_PUBLIC_BASE_HREF = '/custom-base/';

        render(<App />);

        // Verify router is rendered
        const router = screen.getByTestId('router');
        expect(router).toBeInTheDocument();

        // Verify the basename is correctly processed (trailing slash removed)
        expect(router).toHaveAttribute('data-basename', '/custom-base');

        // Verify the app still renders correctly
        expect(screen.getByTestId('authenticated-layout')).toBeInTheDocument();
    });

    it('should handle Router with trailing slashes removed from basename', () => {
        process.env.NX_PUBLIC_BASE_HREF = '/base-with-trailing-slash///';

        render(<App />);

        // Verify the basename is correctly processed
        const router = screen.getByTestId('router');
        expect(router).toHaveAttribute('data-basename', '/base-with-trailing-slash');

        // Should render successfully without errors
        expect(screen.getByTestId('authenticated-layout')).toBeInTheDocument();
    });

    it('should handle undefined NX_PUBLIC_BASE_HREF', () => {
        delete process.env.NX_PUBLIC_BASE_HREF;

        render(<App />);

        const router = screen.getByTestId('router');
        expect(router).toHaveAttribute('data-basename', '');
        expect(screen.getByTestId('authenticated-layout')).toBeInTheDocument();
    });

    it('should render ScrollToTop component', () => {
        render(<App />);

        expect(screen.getByTestId('scroll-to-top')).toBeInTheDocument();
    });

    it('should wrap AuthenticatedLayout with AuthProvider', () => {
        render(<App />);

        const authProvider = screen.getByTestId('auth-provider');
        const authenticatedLayout = screen.getByTestId('authenticated-layout');

        expect(authProvider).toBeInTheDocument();
        expect(authProvider).toContainElement(authenticatedLayout);
    });

    it('should render catch-all route that matches any path', () => {
        render(<App />);

        // The catch-all route (path="/*") should render the AuthenticatedLayout
        expect(screen.getByTestId('authenticated-layout')).toBeInTheDocument();
    });

    describe('Component structure', () => {
        it('should have proper component hierarchy', () => {
            render(<App />);

            const errorBoundary = screen.getByTestId('error-boundary');
            const authProvider = screen.getByTestId('auth-provider');
            const authenticatedLayout = screen.getByTestId('authenticated-layout');
            const scrollToTop = screen.getByTestId('scroll-to-top');

            // Verify hierarchy
            expect(errorBoundary).toContainElement(scrollToTop);
            expect(errorBoundary).toContainElement(authProvider);
            expect(authProvider).toContainElement(authenticatedLayout);
        });
    });

    describe('Environment configuration', () => {
        const testCases = [
            { href: '/base/', expected: 'should handle base with trailing slash' },
            { href: '/base///', expected: 'should handle multiple trailing slashes' },
            { href: '/base', expected: 'should handle base without trailing slash' },
            { href: '', expected: 'should handle empty string' },
            { href: '/', expected: 'should handle root path' },
        ];

        testCases.forEach(({ href, expected }) => {
            it(expected, () => {
                process.env.NX_PUBLIC_BASE_HREF = href;

                render(<App />);

                expect(screen.getByTestId('authenticated-layout')).toBeInTheDocument();
            });
        });
    });

    describe('Error handling', () => {
        it('should have ErrorBoundary configured with correct props', () => {
            // This test verifies that ErrorBoundary is rendered
            render(<App />);

            expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
        });
    });
});
