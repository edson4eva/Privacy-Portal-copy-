import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BasicUserLandingPage from './BasicUserLandingPage';

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

// Mock the external dependencies
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

// Mock window.location.href
const mockWindowLocation = {
    href: '',
};
Object.defineProperty(window, 'location', {
    value: mockWindowLocation,
    writable: true,
});

describe('BasicUserLandingPage', () => {
    const defaultProps = {
        personalInfoLink: 'https://example.com/personal-info',
        verifyAccountLink: 'https://example.com/verify-account',
    };

    beforeEach(() => {
        // Reset window.location.href before each test
        mockWindowLocation.href = '';
    });

    it('renders without crashing', () => {
        render(<BasicUserLandingPage {...defaultProps} />);
        expect(screen.getByTestId('landing-page-template')).toBeInTheDocument();
    });

    it('passes correct props to LandingPageTemplate', () => {
        render(<BasicUserLandingPage {...defaultProps} />);

        expect(screen.getByTestId('template-title')).toHaveTextContent('Verify your account to view services accessed');
        expect(screen.getByTestId('template-alert')).toHaveTextContent(
            'Protecting your personal information is our top priority, and we cannot share any details without verifying your identity.'
        );
        expect(screen.getByTestId('template-list-title')).toHaveTextContent(
            'After verifying your Alberta.ca Account, you will be able to view:'
        );
    });

    it('renders both buttons in the button section', () => {
        render(<BasicUserLandingPage {...defaultProps} />);

        expect(screen.getByTestId('btn-back-to-personal-info')).toBeInTheDocument();
        expect(screen.getByTestId('btn-verify-my-account')).toBeInTheDocument();
    });

    it('configures the back to personal info button correctly', () => {
        render(<BasicUserLandingPage {...defaultProps} />);

        const backButton = screen.getByTestId('btn-back-to-personal-info');
        expect(backButton).toHaveTextContent('Back to personal information');
        expect(backButton).toHaveAttribute('data-type', 'secondary');
        expect(backButton).toHaveAttribute('data-variant', 'normal');
        expect(backButton).toHaveAttribute('data-leading-icon', 'arrow-back');
    });

    it('configures the verify account button correctly', () => {
        render(<BasicUserLandingPage {...defaultProps} />);

        const verifyButton = screen.getByTestId('btn-verify-my-account');
        expect(verifyButton).toHaveTextContent('Verify my account');
        expect(verifyButton).toHaveAttribute('data-type', 'primary');
        expect(verifyButton).toHaveAttribute('data-variant', 'normal');
        expect(verifyButton).not.toHaveAttribute('data-leading-icon');
    });

    it('navigates to personal info link when back button is clicked', () => {
        render(<BasicUserLandingPage {...defaultProps} />);

        const backButton = screen.getByTestId('btn-back-to-personal-info');
        fireEvent.click(backButton);

        expect(mockWindowLocation.href).toBe(defaultProps.personalInfoLink);
    });

    it('navigates to verify account link when verify button is clicked', () => {
        render(<BasicUserLandingPage {...defaultProps} />);

        const verifyButton = screen.getByTestId('btn-verify-my-account');
        fireEvent.click(verifyButton);

        expect(mockWindowLocation.href).toBe(defaultProps.verifyAccountLink);
    });

    it('handles different link URLs correctly', () => {
        const customProperties = {
            personalInfoLink: 'https://custom.com/personal',
            verifyAccountLink: 'https://custom.com/verify',
        };

        render(<BasicUserLandingPage {...customProperties} />);

        // Test back button with custom link
        const backButton = screen.getByTestId('btn-back-to-personal-info');
        fireEvent.click(backButton);
        expect(mockWindowLocation.href).toBe(customProperties.personalInfoLink);

        // Reset and test verify button with custom link
        mockWindowLocation.href = '';
        const verifyButton = screen.getByTestId('btn-verify-my-account');
        fireEvent.click(verifyButton);
        expect(mockWindowLocation.href).toBe(customProperties.verifyAccountLink);
    });

    it('maintains button functionality after multiple renders', () => {
        const { rerender } = render(<BasicUserLandingPage {...defaultProps} />);

        // First click
        const backButton = screen.getByTestId('btn-back-to-personal-info');
        fireEvent.click(backButton);
        expect(mockWindowLocation.href).toBe(defaultProps.personalInfoLink);

        // Rerender with new props
        const newProperties = {
            personalInfoLink: 'https://new.com/personal',
            verifyAccountLink: 'https://new.com/verify',
        };
        rerender(<BasicUserLandingPage {...newProperties} />);

        // Reset and test with new props
        mockWindowLocation.href = '';
        const updatedBackButton = screen.getByTestId('btn-back-to-personal-info');
        fireEvent.click(updatedBackButton);
        expect(mockWindowLocation.href).toBe(newProperties.personalInfoLink);
    });

    it('passes buttonSection as React fragment to LandingPageTemplate', () => {
        render(<BasicUserLandingPage {...defaultProps} />);

        const buttonSection = screen.getByTestId('template-button-section');
        expect(buttonSection).toBeInTheDocument();

        // Verify both buttons are within the button section
        const buttons = buttonSection.querySelectorAll('button');
        expect(buttons).toHaveLength(2);
        expect(buttons[0]).toHaveAttribute('data-testid', 'btn-back-to-personal-info');
        expect(buttons[1]).toHaveAttribute('data-testid', 'btn-verify-my-account');
    });
});
