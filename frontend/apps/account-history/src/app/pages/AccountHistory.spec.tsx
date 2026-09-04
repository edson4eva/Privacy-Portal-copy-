import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AccountHistory from './AccountHistory';
import { SideMenuItem, User } from '@frontend/shared';
// Mock the external dependencies
jest.mock('../components/account-history/landing-page/BasicUserLandingPage', () => {
    return function MockBasicUserLandingPage({
        personalInfoLink,
        verifyAccountLink,
    }: {
        personalInfoLink: string;
        verifyAccountLink: string;
    }) {
        return (
            <div data-testid="basic-user-landing-page">
                <div data-testid="personal-info-link">{personalInfoLink}</div>
                <div data-testid="verify-account-link">{verifyAccountLink}</div>
            </div>
        );
    };
});

jest.mock('../components/account-history/landing-page/VerifiedUserLandingPage', () => {
    return function MockVerifiedUserLandingPage({
        personalInfoLink,
        isPreview,
    }: {
        personalInfoLink: string;
        isPreview: boolean;
    }) {
        return (
            <div data-testid="verified-user-landing-page">
                <div data-testid="personal-info-link">{personalInfoLink}</div>
                <div data-testid="is-preview">{isPreview.toString()}</div>
            </div>
        );
    };
});

jest.mock('shared/src/lib/context/auth-provider', () => ({
    useAuth: jest.fn(),
}));

jest.mock('./AccountHistory.module.css', () => ({
    container: 'container',
}));

const mockUseAuth = jest.requireMock('shared/src/lib/context/auth-provider').useAuth;

describe('AccountHistory', () => {
    const createMockUser = (overrides: Partial<User> = {}): User =>
        ({
            isVerified: false,
            profile: 'personal',
            userMenu: {
                top: [],
                left: [
                    {
                        type: 'group',
                        heading: 'Personal',
                        items: [
                            {
                                type: 'link',
                                heading: 'Personal information',
                                href: 'https://example.com/app/portal/personal/info',
                            },
                        ],
                    },
                ],
            },
            ...overrides,
        }) as User;

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock console.error to avoid noise in tests
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Component rendering based on user verification status', () => {
        it('should render loading state when user verification is undefined', () => {
            mockUseAuth.mockReturnValue({
                getCurrentUser: jest.fn(() => null),
            });

            render(<AccountHistory isPreview={false} />);

            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });

        it('should render BasicUserLandingPage for unverified users', async () => {
            const mockUser = createMockUser({ isVerified: false });
            mockUseAuth.mockReturnValue({
                getCurrentUser: jest.fn(() => mockUser),
            });

            render(<AccountHistory isPreview={false} />);

            await waitFor(() => {
                expect(screen.getByTestId('basic-user-landing-page')).toBeInTheDocument();
            });

            expect(screen.queryByTestId('verified-user-landing-page')).not.toBeInTheDocument();
        });

        it('should render VerifiedUserLandingPage for verified users', async () => {
            const mockUser = createMockUser({ isVerified: true });
            mockUseAuth.mockReturnValue({
                getCurrentUser: jest.fn(() => mockUser),
            });

            render(<AccountHistory isPreview={true} />);

            await waitFor(() => {
                expect(screen.getByTestId('verified-user-landing-page')).toBeInTheDocument();
            });

            expect(screen.queryByTestId('basic-user-landing-page')).not.toBeInTheDocument();
        });
    });

    describe('isPreview prop handling', () => {
        it('should pass isPreview=true to landing page component', async () => {
            const mockUser = createMockUser({ isVerified: true });
            mockUseAuth.mockReturnValue({
                getCurrentUser: jest.fn(() => mockUser),
            });

            render(<AccountHistory isPreview={true} />);

            await waitFor(() => {
                expect(screen.getByTestId('is-preview')).toHaveTextContent('true');
            });
        });

        it('should pass isPreview=false to landing page component', async () => {
            const mockUser = createMockUser({ isVerified: true });
            mockUseAuth.mockReturnValue({
                getCurrentUser: jest.fn(() => mockUser),
            });

            render(<AccountHistory isPreview={false} />);

            await waitFor(() => {
                expect(screen.getByTestId('is-preview')).toHaveTextContent('false');
            });
        });
    });

    describe('Link generation', () => {
        it('should generate correct links for user with personal profile', async () => {
            const mockUser = createMockUser({
                isVerified: false,
                profile: 'personal',
                userMenu: {
                    top: [],
                    left: [
                        {
                            type: 'group',
                            heading: 'Personal',
                            items: [
                                {
                                    type: 'link',
                                    heading: 'Personal information',
                                    href: 'https://example.com/app/portal/personal/info',
                                },
                            ],
                        },
                    ],
                },
            });

            mockUseAuth.mockReturnValue({
                getCurrentUser: jest.fn(() => mockUser),
            });

            render(<AccountHistory isPreview={false} />);

            await waitFor(() => {
                expect(screen.getByTestId('personal-info-link')).toHaveTextContent(
                    'https://example.com/app/portal/personal/info'
                );
                expect(screen.getByTestId('verify-account-link')).toHaveTextContent(
                    'https://example.com/app/portal/personal/verify/verify-account-info'
                );
            });
        });

        it('should return default links when user does not have personal profile', async () => {
            const mockUser = createMockUser({
                profile: 'business',
                userMenu: { top: [], left: [] },
            });

            mockUseAuth.mockReturnValue({
                getCurrentUser: jest.fn(() => mockUser),
            });

            render(<AccountHistory isPreview={false} />);

            await waitFor(() => {
                expect(screen.getByTestId('personal-info-link')).toHaveTextContent('#');
                expect(screen.getByTestId('verify-account-link')).toHaveTextContent('#');
            });
        });

        it('should return default links when personal info link is not found', async () => {
            const mockUser = createMockUser({
                profile: 'personal',
                userMenu: {
                    top: [],
                    left: [
                        {
                            type: 'group',
                            heading: 'Other',
                            items: [],
                        },
                    ],
                },
            });

            mockUseAuth.mockReturnValue({
                getCurrentUser: jest.fn(() => mockUser),
            });

            render(<AccountHistory isPreview={false} />);
            await waitFor(() => {
                expect(screen.getByTestId('personal-info-link')).toHaveTextContent('#');
                expect(screen.getByTestId('verify-account-link')).toHaveTextContent('#');
            });
        });
    });

    describe('Error handling', () => {
        it('should handle errors gracefully and return default links', async () => {
            const mockUser = createMockUser({
                profile: 'personal',
                userMenu: null as unknown as User['userMenu'], // This will cause an error
            });

            mockUseAuth.mockReturnValue({
                getCurrentUser: jest.fn(() => mockUser),
            });

            render(<AccountHistory isPreview={false} />);

            await waitFor(() => {
                expect(screen.getByTestId('personal-info-link')).toHaveTextContent('#');
                expect(screen.getByTestId('verify-account-link')).toHaveTextContent('#');
            });

            expect(console.error).toHaveBeenCalledWith('Error extracting landing page links:', expect.any(Error));
        });

        it('should handle malformed userMenu structure', async () => {
            const mockUser = createMockUser({
                profile: 'personal',
                userMenu: {
                    top: [],
                    left: [
                        {
                            heading: 'Personal',
                            items: null, // items is explicitly set to null to simulate malformed structure
                        } as unknown as SideMenuItem,
                    ],
                },
            });

            mockUseAuth.mockReturnValue({
                getCurrentUser: jest.fn(() => mockUser),
            });

            render(<AccountHistory isPreview={false} />);

            await waitFor(() => {
                expect(screen.getByTestId('personal-info-link')).toHaveTextContent('#');
                expect(screen.getByTestId('verify-account-link')).toHaveTextContent('#');
            });
        });
    });

    describe('URL extraction', () => {
        it('should extract base URL correctly from full URL', async () => {
            const mockUser = createMockUser({
                profile: 'personal',
                userMenu: {
                    top: [],
                    left: [
                        {
                            type: 'group',
                            heading: 'Personal',
                            items: [
                                {
                                    type: 'link',
                                    heading: 'Personal information',
                                    href: 'https://mysite.com/app/portal/personal/info/details',
                                },
                            ],
                        },
                    ],
                },
            });

            mockUseAuth.mockReturnValue({
                getCurrentUser: jest.fn(() => mockUser),
            });

            render(<AccountHistory isPreview={false} />);

            await waitFor(() => {
                expect(screen.getByTestId('verify-account-link')).toHaveTextContent(
                    'https://mysite.com/app/portal/personal/verify/verify-account-info'
                );
            });
        });

        it('should handle URLs with different path structures', async () => {
            const mockUser = createMockUser({
                profile: 'personal',
                userMenu: {
                    top: [],
                    left: [
                        {
                            type: 'group',
                            heading: 'Personal',
                            items: [
                                {
                                    type: 'link',
                                    heading: 'Personal information',
                                    href: 'https://test.gov.ab.ca/privacy/portal/page',
                                },
                            ],
                        },
                    ],
                },
            });

            mockUseAuth.mockReturnValue({
                getCurrentUser: jest.fn(() => mockUser),
            });

            render(<AccountHistory isPreview={false} />);

            await waitFor(() => {
                expect(screen.getByTestId('verify-account-link')).toHaveTextContent(
                    'https://test.gov.ab.ca/privacy/portal/personal/verify/verify-account-info'
                );
            });
        });
    });

    describe('Multiple profiles handling', () => {
        it('should handle user with multiple profiles including personal', async () => {
            const mockUser = createMockUser({
                profile: 'business,personal,other',
                userMenu: {
                    top: [],
                    left: [
                        {
                            type: 'group',
                            heading: 'Personal',
                            items: [
                                {
                                    type: 'link',
                                    heading: 'Personal information',
                                    href: 'https://example.com/app/portal/personal/info',
                                },
                            ],
                        },
                    ],
                },
            });

            mockUseAuth.mockReturnValue({
                getCurrentUser: jest.fn(() => mockUser),
            });

            render(<AccountHistory isPreview={false} />);

            await waitFor(() => {
                expect(screen.getByTestId('personal-info-link')).toHaveTextContent(
                    'https://example.com/app/portal/personal/info'
                );
            });
        });

        it('should return default links when personal profile is not included', async () => {
            const mockUser = createMockUser({
                profile: 'business,corporate',
            });

            mockUseAuth.mockReturnValue({
                getCurrentUser: jest.fn(() => mockUser),
            });

            render(<AccountHistory isPreview={false} />);

            await waitFor(() => {
                expect(screen.getByTestId('personal-info-link')).toHaveTextContent('#');
                expect(screen.getByTestId('verify-account-link')).toHaveTextContent('#');
            });
        });
    });

    describe('useUser hook behavior', () => {
        it('should update when getCurrentUser function reference changes', async () => {
            // First render with getCurrentUser that returns null
            const firstGetCurrentUser = jest.fn(() => null);
            mockUseAuth.mockReturnValue({
                getCurrentUser: firstGetCurrentUser,
            });

            const { rerender } = render(<AccountHistory isPreview={false} />);

            expect(screen.getByText('Loading...')).toBeInTheDocument();

            // Create a new function reference that returns a user
            const mockUser = createMockUser({ isVerified: true });
            const secondGetCurrentUser = jest.fn(() => mockUser);

            // Update the auth mock with a new function reference
            mockUseAuth.mockReturnValue({
                getCurrentUser: secondGetCurrentUser,
            });

            rerender(<AccountHistory isPreview={false} />);

            await waitFor(() => {
                expect(screen.getByTestId('verified-user-landing-page')).toBeInTheDocument();
            });
        });

        it('should handle user state transitions correctly', async () => {
            // Test transitioning from unverified to verified user
            const unverifiedUser = createMockUser({ isVerified: false });
            const firstGetCurrentUser = jest.fn(() => unverifiedUser);

            mockUseAuth.mockReturnValue({
                getCurrentUser: firstGetCurrentUser,
            });

            const { rerender } = render(<AccountHistory isPreview={false} />);

            await waitFor(() => {
                expect(screen.getByTestId('basic-user-landing-page')).toBeInTheDocument();
            });

            // Update to verified user with new function reference
            const verifiedUser = createMockUser({ isVerified: true });
            const secondGetCurrentUser = jest.fn(() => verifiedUser);

            mockUseAuth.mockReturnValue({
                getCurrentUser: secondGetCurrentUser,
            });

            rerender(<AccountHistory isPreview={false} />);

            await waitFor(() => {
                expect(screen.getByTestId('verified-user-landing-page')).toBeInTheDocument();
            });

            expect(screen.queryByTestId('basic-user-landing-page')).not.toBeInTheDocument();
        });
    });
});
