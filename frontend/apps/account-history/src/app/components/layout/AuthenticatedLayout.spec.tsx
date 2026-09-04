import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import AuthenticatedLayout from './AuthenticatedLayout';
import { SideMenuItem, SideMenuProperties } from 'shared/src/lib/app-side-menu';

// Mock all external dependencies
jest.mock('shared/src/lib/authentication/SignedInOnly', () => {
    return function MockSignedInOnly({ children }: { children: React.ReactNode }) {
        return <div data-testid="signed-in-only">{children}</div>;
    };
});

jest.mock('shared/src/lib/app-header', () => ({
    AppHeader: () => <header data-testid="app-header">Header</header>,
}));

jest.mock('shared/src/lib/app-footer', () => ({
    AppFooter: () => <footer data-testid="app-footer">Footer</footer>,
}));

jest.mock('shared/src/lib/app-side-menu', () => ({
    AppSideMenu: ({ items, basePath }: SideMenuProperties) => (
        <nav data-testid="app-side-menu" data-base-path={basePath}>
            {items?.map((item: SideMenuItem, index: number) => <div key={index}>{item.heading}</div>)}
        </nav>
    ),
}));

jest.mock('shared/src/lib/context/auth-provider', () => ({
    useAuth: jest.fn(),
    ProfileRoute: ({ children }: { children: React.ReactNode }) => <div data-testid="profile-route">{children}</div>,
}));

jest.mock('shared/src/lib/utils/useWindowWidth', () => jest.fn());

jest.mock('../../pages/AccountHistory', () => {
    return function MockAccountHistory({ isPreview }: { isPreview: boolean }) {
        return (
            <div data-testid="account-history" data-preview={isPreview}>
                Account History
            </div>
        );
    };
});

jest.mock('../../pages/NotFound', () => {
    return function MockNotFoundPage() {
        return <div data-testid="not-found">Not Found</div>;
    };
});

jest.mock('../account-history/accessed-services/service-list/AccessedServicesPage', () => {
    return function MockAccessedServicesPage({ isPreview }: { isPreview: boolean }) {
        return (
            <div data-testid="accessed-services-page" data-preview={isPreview}>
                Accessed Services
            </div>
        );
    };
});

jest.mock('../account-history/accessed-services/service-details/AccessedServiceDetails', () => {
    return function MockAccessedServiceDetails({ isPreview }: { isPreview: boolean }) {
        return (
            <div data-testid="accessed-service-details" data-preview={isPreview}>
                Service Details
            </div>
        );
    };
});

jest.mock('../no-access/NoAccess', () => {
    return function MockNoAccess() {
        return <div data-testid="no-access">No Access</div>;
    };
});

jest.mock('../shared/InternalServerError', () => {
    return function MockInternalServerError() {
        return <div data-testid="internal-server-error">Internal Server Error</div>;
    };
});

jest.mock('shared/src/lib/authentication/SignoutRoute', () => {
    return function MockSignoutRoute({ title }: { title: string }) {
        return <div data-testid="signout-route">{title}</div>;
    };
});

jest.mock('shared/src/lib/authentication/auth-routes', () => ({
    SHARED_ROUTES: {
        signout: '/signout',
    },
}));

jest.mock('react-error-boundary', () => ({
    ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>,
}));

jest.mock('shared/src/lib/utils/logging', () => ({
    logError: jest.fn(),
}));

jest.mock('./AuthenticatedLayout.module.scss', () => ({
    container: 'container',
    content: 'content',
}));

const mockUseAuth = jest.requireMock('shared/src/lib/context/auth-provider').useAuth;
const mockUseWindowWidth = jest.requireMock('shared/src/lib/utils/useWindowWidth');

describe('AuthenticatedLayout', () => {
    const defaultAuthState = {
        getCurrentUser: jest.fn(() => ({
            userMenu: {
                left: [
                    { heading: 'Menu Item 1', href: '/item1' },
                    { heading: 'Menu Item 2', href: '/item2' },
                ],
            },
        })),
        hasLoaded: true,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAuth.mockReturnValue(defaultAuthState);
        mockUseWindowWidth.mockReturnValue(1024); // Desktop by default
        process.env.NX_PUBLIC_BASE_HREF = '/base/';
    });

    afterEach(() => {
        delete process.env.NX_PUBLIC_BASE_HREF;
    });

    const renderComponent = (initialEntries = ['/']) => {
        return render(
            <MemoryRouter initialEntries={initialEntries}>
                <AuthenticatedLayout />
            </MemoryRouter>
        );
    };

    describe('Loading state', () => {
        it('should show loading when hasLoaded is false', () => {
            mockUseAuth.mockReturnValue({ ...defaultAuthState, hasLoaded: false });

            renderComponent();

            expect(screen.getByText('Loading...')).toBeInTheDocument();
            expect(screen.queryByTestId('signed-in-only')).not.toBeInTheDocument();
        });
    });

    describe('Header visibility', () => {
        it('should show header on desktop', () => {
            mockUseWindowWidth.mockReturnValue(1024);

            renderComponent();

            expect(screen.getByTestId('app-header')).toBeInTheDocument();
        });

        it('should show header on mobile for non-excluded routes', () => {
            mockUseWindowWidth.mockReturnValue(500);

            renderComponent(['/']);

            expect(screen.getByTestId('app-header')).toBeInTheDocument();
        });

        it('should hide header on mobile for accessed-services detail route', () => {
            mockUseWindowWidth.mockReturnValue(500);

            renderComponent(['/accessed-services/service123']);

            expect(screen.queryByTestId('app-header')).not.toBeInTheDocument();
        });

        it('should show header on desktop even for excluded routes', () => {
            mockUseWindowWidth.mockReturnValue(1024);

            renderComponent(['/accessed-services/service123']);

            expect(screen.getByTestId('app-header')).toBeInTheDocument();
        });
    });

    describe('Menu items', () => {
        it('should render menu items from user data', () => {
            renderComponent();

            const sideMenu = screen.getByTestId('app-side-menu');
            expect(sideMenu).toBeInTheDocument();
            expect(screen.getByText('Menu Item 1')).toBeInTheDocument();
            expect(screen.getByText('Menu Item 2')).toBeInTheDocument();
        });

        it('should pass correct basePath to AppSideMenu', () => {
            renderComponent();

            const sideMenu = screen.getByTestId('app-side-menu');
            expect(sideMenu).toHaveAttribute('data-base-path', '/base');
        });
    });

    describe('Routes', () => {
        it('should render AccountHistory for root route', () => {
            renderComponent(['/']);

            expect(screen.getByTestId('account-history')).toBeInTheDocument();
            expect(screen.getByTestId('account-history')).toHaveAttribute('data-preview', 'false');
        });

        it('should render AccountHistory preview for /preview route', () => {
            renderComponent(['/preview']);

            expect(screen.getByTestId('account-history')).toBeInTheDocument();
            expect(screen.getByTestId('account-history')).toHaveAttribute('data-preview', 'true');
        });

        it('should render AccessedServicesPage for /accessed-services route', () => {
            renderComponent(['/accessed-services']);

            expect(screen.getByTestId('accessed-services-page')).toBeInTheDocument();
            expect(screen.getByTestId('accessed-services-page')).toHaveAttribute('data-preview', 'false');
        });

        it('should render AccessedServicesPage preview for /preview/accessed-services route', () => {
            renderComponent(['/preview/accessed-services']);

            expect(screen.getByTestId('accessed-services-page')).toBeInTheDocument();
            expect(screen.getByTestId('accessed-services-page')).toHaveAttribute('data-preview', 'true');
        });

        it('should render AccessedServiceDetails for service detail route', () => {
            renderComponent(['/accessed-services/service123']);

            expect(screen.getByTestId('accessed-service-details')).toBeInTheDocument();
            expect(screen.getByTestId('accessed-service-details')).toHaveAttribute('data-preview', 'false');
        });

        it('should render AccessedServiceDetails preview for preview service detail route', () => {
            renderComponent(['/preview/accessed-services/service123']);

            expect(screen.getByTestId('accessed-service-details')).toBeInTheDocument();
            expect(screen.getByTestId('accessed-service-details')).toHaveAttribute('data-preview', 'true');
        });

        it('should render NoAccess for /no-access route', () => {
            renderComponent(['/no-access']);

            expect(screen.getByTestId('no-access')).toBeInTheDocument();
        });

        it('should render InternalServerError for /error route', () => {
            renderComponent(['/error']);

            expect(screen.getByTestId('internal-server-error')).toBeInTheDocument();
        });

        it('should render SignoutRoute for signout route', () => {
            renderComponent(['/signout']);

            expect(screen.getByTestId('signout-route')).toBeInTheDocument();
            expect(screen.getByText('Sign Out')).toBeInTheDocument();
        });

        it('should render NotFound for unknown routes', () => {
            renderComponent(['/unknown-route']);

            expect(screen.getByTestId('not-found')).toBeInTheDocument();
        });
    });

    describe('Layout structure', () => {
        it('should render all main layout elements', () => {
            renderComponent();

            expect(screen.getByTestId('signed-in-only')).toBeInTheDocument();
            expect(screen.getByTestId('app-header')).toBeInTheDocument();
            expect(screen.getByTestId('app-side-menu')).toBeInTheDocument();
            expect(screen.getByTestId('app-footer')).toBeInTheDocument();
        });

        it('should have correct CSS classes structure', () => {
            const { container } = renderComponent();

            const containerDiv = container.querySelector('.container');
            expect(containerDiv).toBeInTheDocument();

            const sideMenuContainer = container.querySelector('.uiam--side-menu');
            expect(sideMenuContainer).toBeInTheDocument();

            const contentContainer = container.querySelector('.content');
            expect(contentContainer).toBeInTheDocument();
        });
    });

    describe('Error handling', () => {
        it('should wrap routes in ErrorBoundary', () => {
            renderComponent();

            expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
            expect(screen.getByTestId('account-history')).toBeInTheDocument();
        });
    });
});
