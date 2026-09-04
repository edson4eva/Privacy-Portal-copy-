import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import VerifiedUserLandingPage from './VerifiedUserLandingPage';
import * as dataService from 'shared/src/lib/api/dataService';
import * as tagManagerService from 'shared/src/lib/api/tagManagerService';

interface MockGoabButtonProperties {
    children: React.ReactNode;
    testId: string;
    onClick: () => void;
    type: string;
    variant: string;
    leadingIcon?: string;
}

interface MockLandingPageTemplateProperties {
    title: string;
    alertText?: string;
    listTitle: string;
    buttonSection: React.ReactNode;
}

// Mock external dependencies
jest.mock('@abgov/react-components', () => ({
    GoabButton: ({ children, testId, onClick, type, variant, leadingIcon }: MockGoabButtonProperties) => (
        <button
            data-testid={testId}
            onClick={onClick}
            data-type={type}
            data-variant={variant}
            data-leading-icon={leadingIcon}
        >
            {children}
        </button>
    ),
}));

jest.mock('./LandingPageTemplate', () => {
    return function MockLandingPageTemplate({
        title,
        alertText,
        listTitle,
        buttonSection,
    }: MockLandingPageTemplateProperties) {
        return (
            <div data-testid="landing-page-template">
                <h2 data-testid="template-title">{title}</h2>
                {alertText && <div data-testid="template-alert">{alertText}</div>}
                <p data-testid="template-list-title">{listTitle}</p>
                <div data-testid="template-button-section">{buttonSection}</div>
            </div>
        );
    };
});

// Mock API service
jest.mock('shared/src/lib/api/dataService', () => ({
    get: jest.fn(),
}));

// Mock tag manager service
jest.mock('shared/src/lib/api/tagManagerService', () => ({
    trackEvent: jest.fn(),
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// Mock window.location.href
const mockWindowLocation = {
    href: '',
};
Object.defineProperty(window, 'location', {
    value: mockWindowLocation,
    writable: true,
});

// Get the mocked functions
const mockGet = jest.mocked(dataService.get);
const mockTrackEvent = jest.mocked(tagManagerService.trackEvent);

// Test data constants
const TEST_DATA = {
    MOCK_SERVICES: [
        { id: 1, name: 'Service 1' },
        { id: 2, name: 'Service 2' },
    ],
    EMPTY_SERVICES: [],
    API_ENDPOINTS: {
        REGULAR: '/v1/accessed-services',
        PREVIEW: '/v1/preview/accessed-services',
    },
    NAVIGATION_PATHS: {
        REGULAR: '/accessed-services',
        PREVIEW: '/preview/accessed-services',
    },
    TRACKING_EVENT: {
        action: 'pp_view_services_btn_click',
        category: 'pp_account_history',
        label: 'pp_view_services_account_history',
    },
} as const;

// Wrapper component for router context
const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <MemoryRouter>{children}</MemoryRouter>
);

describe('VerifiedUserLandingPage', () => {
    const defaultProperties = {
        isPreview: false,
        personalInfoLink: 'https://example.com/personal-info',
    };

    // Helper function to render component with router context
    const renderComponent = (componentProperties = defaultProperties) => {
        return render(
            <RouterWrapper>
                <VerifiedUserLandingPage {...componentProperties} />
            </RouterWrapper>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockWindowLocation.href = '';
    });

    describe('Loading state', () => {
        it('shows loading message while fetching data', () => {
            // Mock API call to return a pending promise
            mockGet.mockReturnValue(new Promise(() => {}));

            render(
                <RouterWrapper>
                    <VerifiedUserLandingPage {...defaultProperties} />
                </RouterWrapper>
            );

            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });
    });

    describe('API integration', () => {
        it('calls the correct endpoint for regular mode', async () => {
            mockGet.mockResolvedValue({ accessedServices: TEST_DATA.MOCK_SERVICES });

            renderComponent();

            await waitFor(() => {
                expect(mockGet).toHaveBeenCalledWith(TEST_DATA.API_ENDPOINTS.REGULAR);
            });
        });

        it('calls the correct endpoint for preview mode', async () => {
            mockGet.mockResolvedValue({ accessedServices: TEST_DATA.EMPTY_SERVICES });

            renderComponent({ ...defaultProperties, isPreview: true });

            await waitFor(() => {
                expect(mockGet).toHaveBeenCalledWith(TEST_DATA.API_ENDPOINTS.PREVIEW);
            });
        });

        it('handles API response with services correctly', async () => {
            mockGet.mockResolvedValue({ accessedServices: TEST_DATA.MOCK_SERVICES });

            renderComponent();

            await waitFor(() => {
                expect(screen.getByTestId('btn-view-services')).toBeInTheDocument();
            });
        });

        it('handles API response with no services correctly', async () => {
            mockGet.mockResolvedValue({ accessedServices: TEST_DATA.EMPTY_SERVICES });

            renderComponent();

            await waitFor(() => {
                expect(screen.getByTestId('btn-back-to-personal-info')).toBeInTheDocument();
            });
        });

        it('handles null API response correctly', async () => {
            // Mock console.error to avoid error output in test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            mockGet.mockResolvedValue(null);

            render(
                <RouterWrapper>
                    <VerifiedUserLandingPage {...defaultProperties} />
                </RouterWrapper>
            );

            // The component properly handles null responses with optional chaining.
            // When response is null, the optional chaining prevents errors and
            // the component stays in loading state as intended (no state update occurs).
            await waitFor(() => {
                expect(screen.getByText('Loading...')).toBeInTheDocument();
            });

            consoleSpy.mockRestore();
        });

        it('handles API error gracefully by staying in loading state', async () => {
            // Mock console.error to avoid error output in test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            mockGet.mockRejectedValue(new Error('API Error'));

            render(
                <RouterWrapper>
                    <VerifiedUserLandingPage {...defaultProperties} />
                </RouterWrapper>
            );

            // The component now properly catches API errors but stays in loading state
            await waitFor(() => {
                expect(screen.getByText('Loading...')).toBeInTheDocument();
            });

            // Verify that the error was logged
            expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch accessed services:', expect.any(Error));

            consoleSpy.mockRestore();
        });
    });

    describe('Services accessed section', () => {
        beforeEach(() => {
            mockGet.mockResolvedValue({ accessedServices: TEST_DATA.MOCK_SERVICES });
        });

        it('renders correct content when user has accessed services', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByTestId('template-title')).toHaveTextContent('Digital services accessed online');
                expect(screen.getByTestId('template-list-title')).toHaveTextContent(
                    'View details about the digital services you have accessed through your Alberta.ca Account including:'
                );
                expect(screen.queryByTestId('template-alert')).not.toBeInTheDocument();
            });
        });

        it('renders view services button with correct properties', async () => {
            renderComponent();

            await waitFor(() => {
                const viewButton = screen.getByTestId('btn-view-services');
                expect(viewButton).toHaveTextContent('View services');
                expect(viewButton).toHaveAttribute('data-type', 'primary');
                expect(viewButton).toHaveAttribute('data-variant', 'normal');
                expect(viewButton).not.toHaveAttribute('data-leading-icon');
            });
        });

        it('handles view services button click correctly in regular mode', async () => {
            renderComponent();

            await waitFor(() => {
                const viewButton = screen.getByTestId('btn-view-services');
                fireEvent.click(viewButton);
            });

            expect(mockTrackEvent).toHaveBeenCalledWith(TEST_DATA.TRACKING_EVENT);
            expect(mockNavigate).toHaveBeenCalledWith(TEST_DATA.NAVIGATION_PATHS.REGULAR);
        });

        it('handles view services button click correctly in preview mode', async () => {
            mockGet.mockResolvedValue({ accessedServices: TEST_DATA.MOCK_SERVICES });

            renderComponent({ ...defaultProperties, isPreview: true });

            await waitFor(() => {
                const viewButton = screen.getByTestId('btn-view-services');
                fireEvent.click(viewButton);
            });

            expect(mockTrackEvent).toHaveBeenCalledWith(TEST_DATA.TRACKING_EVENT);
            expect(mockNavigate).toHaveBeenCalledWith(TEST_DATA.NAVIGATION_PATHS.PREVIEW);
        });
    });

    describe('No services accessed section', () => {
        beforeEach(() => {
            mockGet.mockResolvedValue({ accessedServices: TEST_DATA.EMPTY_SERVICES });
        });

        it('renders correct content when user has no accessed services', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByTestId('template-title')).toHaveTextContent('Digital services accessed online');
                expect(screen.getByTestId('template-alert')).toHaveTextContent(
                    'We are working to include all digital service records connected to your Alberta.ca Account. You either have not accessed any digital services through your Alberta.ca Account or have accessed a digital service that has not been included yet.'
                );
                expect(screen.getByTestId('template-list-title')).toHaveTextContent(
                    'After accessing digital services through your Alberta.ca Account, you will be able to view:'
                );
            });
        });

        it('renders back button with correct properties', async () => {
            renderComponent();

            await waitFor(() => {
                const backButton = screen.getByTestId('btn-back-to-personal-info');
                expect(backButton).toHaveTextContent('Back to personal information');
                expect(backButton).toHaveAttribute('data-type', 'secondary');
                expect(backButton).toHaveAttribute('data-variant', 'normal');
                expect(backButton).toHaveAttribute('data-leading-icon', 'arrow-back');
            });
        });

        it('handles back button click correctly', async () => {
            renderComponent();

            await waitFor(() => {
                const backButton = screen.getByTestId('btn-back-to-personal-info');
                fireEvent.click(backButton);
            });

            expect(mockWindowLocation.href).toBe(defaultProperties.personalInfoLink);
        });

        it('handles back button click with custom personal info link', async () => {
            const customProperties = {
                ...defaultProperties,
                personalInfoLink: 'https://custom.com/personal',
            };

            renderComponent(customProperties);

            await waitFor(() => {
                const backButton = screen.getByTestId('btn-back-to-personal-info');
                fireEvent.click(backButton);
            });

            expect(mockWindowLocation.href).toBe(customProperties.personalInfoLink);
        });
    });

    describe('Effect dependencies', () => {
        it('refetches data when isPreview prop changes', async () => {
            mockGet.mockResolvedValue({ accessedServices: TEST_DATA.EMPTY_SERVICES });

            const { rerender } = renderComponent({ ...defaultProperties, isPreview: false });

            await waitFor(() => {
                expect(mockGet).toHaveBeenCalledWith(TEST_DATA.API_ENDPOINTS.REGULAR);
            });

            // Clear previous calls
            mockGet.mockClear();

            // Rerender with different isPreview value
            rerender(
                <RouterWrapper>
                    <VerifiedUserLandingPage {...defaultProperties} isPreview={true} />
                </RouterWrapper>
            );

            await waitFor(() => {
                expect(mockGet).toHaveBeenCalledWith(TEST_DATA.API_ENDPOINTS.PREVIEW);
            });
        });

        it('does not refetch data when other props change', async () => {
            mockGet.mockResolvedValue({ accessedServices: TEST_DATA.EMPTY_SERVICES });

            const { rerender } = renderComponent();

            await waitFor(() => {
                expect(mockGet).toHaveBeenCalledTimes(1);
            });

            // Clear previous calls
            mockGet.mockClear();

            // Rerender with different personalInfoLink
            rerender(
                <RouterWrapper>
                    <VerifiedUserLandingPage {...defaultProperties} personalInfoLink="https://new.com/personal" />
                </RouterWrapper>
            );

            // Should not trigger new API call
            expect(mockGet).not.toHaveBeenCalled();
        });
    });

    describe('Component state transitions', () => {
        it('transitions from loading to services accessed state', async () => {
            mockGet.mockResolvedValue({ accessedServices: TEST_DATA.MOCK_SERVICES });

            renderComponent();

            // Initially loading
            expect(screen.getByText('Loading...')).toBeInTheDocument();

            // Wait for transition to services accessed state
            await waitFor(() => {
                expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
                expect(screen.getByTestId('btn-view-services')).toBeInTheDocument();
            });
        });

        it('transitions from loading to no services state', async () => {
            mockGet.mockResolvedValue({ accessedServices: TEST_DATA.EMPTY_SERVICES });

            renderComponent();

            // Initially loading
            expect(screen.getByText('Loading...')).toBeInTheDocument();

            // Wait for transition to no services state
            await waitFor(() => {
                expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
                expect(screen.getByTestId('btn-back-to-personal-info')).toBeInTheDocument();
            });
        });
    });

    describe('Performance and optimization', () => {
        it('makes only one API call on initial render', async () => {
            mockGet.mockResolvedValue({ accessedServices: TEST_DATA.MOCK_SERVICES });

            renderComponent();

            await waitFor(() => {
                expect(screen.getByTestId('btn-view-services')).toBeInTheDocument();
            });

            expect(mockGet).toHaveBeenCalledTimes(1);
        });

        it('does not make duplicate API calls on rapid re-renders', async () => {
            mockGet.mockResolvedValue({ accessedServices: TEST_DATA.MOCK_SERVICES });

            const { rerender } = renderComponent();

            // Force multiple re-renders
            rerender(
                <RouterWrapper>
                    <VerifiedUserLandingPage {...defaultProperties} />
                </RouterWrapper>
            );
            rerender(
                <RouterWrapper>
                    <VerifiedUserLandingPage {...defaultProperties} />
                </RouterWrapper>
            );

            await waitFor(() => {
                expect(screen.getByTestId('btn-view-services')).toBeInTheDocument();
            });

            // Should still only be called once due to useEffect dependency array
            expect(mockGet).toHaveBeenCalledTimes(1);
        });
    });

    describe('Edge cases', () => {
        it('handles empty personal info link gracefully', async () => {
            mockGet.mockResolvedValue({ accessedServices: TEST_DATA.EMPTY_SERVICES });

            renderComponent({ ...defaultProperties, personalInfoLink: '' });

            await waitFor(() => {
                const backButton = screen.getByTestId('btn-back-to-personal-info');
                fireEvent.click(backButton);
            });

            expect(mockWindowLocation.href).toBe('');
        });

        it('handles response with null accessedServices property correctly', async () => {
            // Mock console.error to avoid error output in test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            mockGet.mockResolvedValue({ accessedServices: null });

            renderComponent();

            // When accessedServices is null, it safely evaluates to false and shows the no-services state
            await waitFor(() => {
                expect(screen.getByTestId('btn-back-to-personal-info')).toBeInTheDocument();
            });

            consoleSpy.mockRestore();
        });

        it('handles response with undefined accessedServices property correctly', async () => {
            // Mock console.error to avoid error output in test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            mockGet.mockResolvedValue({ someOtherProperty: 'value' });

            renderComponent();

            // When accessedServices is undefined, it safely evaluates to false and shows the no-services state
            await waitFor(() => {
                expect(screen.getByTestId('btn-back-to-personal-info')).toBeInTheDocument();
            });

            consoleSpy.mockRestore();
        });
    });
});
