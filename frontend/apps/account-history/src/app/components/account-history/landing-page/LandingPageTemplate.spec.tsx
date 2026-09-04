import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LandingPageTemplate from './LandingPageTemplate';

interface MockPageTitleProperties {
    title: string;
    fontColor: string;
}

interface MockGoabIconProperties {
    type: string;
    fillColor: string;
    theme: string;
    testId: string;
}

// Mock external dependencies
jest.mock('shared/src/lib/page-title/PageTitle', () => {
    return function MockPageTitle({ title, fontColor }: MockPageTitleProperties) {
        return (
            <div data-testid="page-title" data-font-color={fontColor}>
                {title}
            </div>
        );
    };
});

jest.mock('@abgov/react-components', () => ({
    GoabIcon: ({ type, fillColor, theme, testId }: MockGoabIconProperties) => (
        <div data-testid={testId} data-type={type} data-fill-color={fillColor} data-theme={theme}>
            MockIcon
        </div>
    ),
}));

// Mock CSS modules
jest.mock('./LandingPageTemplate.module.scss', () => ({
    heading: 'mock-heading',
    'alert-section': 'mock-alert-section',
    'ability-list-heading': 'mock-ability-list-heading',
    'ability-list': 'mock-ability-list',
    'landing-page-img': 'mock-landing-page-img',
    'button-container': 'mock-button-container',
}));

describe('LandingPageTemplate', () => {
    const defaultProperties = {
        title: 'Test Title',
        listTitle: 'Test List Title',
        buttonSection: <button data-testid="test-button">Test Button</button>,
    };

    describe('Basic rendering', () => {
        it('renders without crashing', () => {
            render(<LandingPageTemplate {...defaultProperties} />);

            expect(screen.getByTestId('page-title')).toBeInTheDocument();
        });

        it('renders all required elements', () => {
            render(<LandingPageTemplate {...defaultProperties} />);

            // Check for PageTitle component
            expect(screen.getByTestId('page-title')).toBeInTheDocument();

            // Check for main heading
            expect(screen.getByTestId('page-heading')).toBeInTheDocument();

            // Check for ability list heading
            expect(screen.getByTestId('ability-list-heading')).toBeInTheDocument();

            // Check for ability list
            expect(screen.getByTestId('ability-list')).toBeInTheDocument();

            // Check for landing page image
            expect(screen.getByTestId('landing-page-img')).toBeInTheDocument();

            // Check for button container
            expect(screen.getByTestId('button-container')).toBeInTheDocument();
        });
    });

    describe('PageTitle component', () => {
        it('renders PageTitle with correct properties', () => {
            render(<LandingPageTemplate {...defaultProperties} />);

            const pageTitle = screen.getByTestId('page-title');
            expect(pageTitle).toHaveTextContent('SERVICES ACCESSED');
            expect(pageTitle).toHaveAttribute('data-font-color', '#004A8F');
        });
    });

    describe('Main heading', () => {
        it('displays the correct title', () => {
            const customTitle = 'Custom Page Title';
            render(<LandingPageTemplate {...defaultProperties} title={customTitle} />);

            const heading = screen.getByTestId('page-heading');
            expect(heading).toHaveTextContent(customTitle);
            expect(heading.tagName).toBe('H2');
        });

        it('applies the correct CSS class', () => {
            render(<LandingPageTemplate {...defaultProperties} />);

            const heading = screen.getByTestId('page-heading');
            expect(heading).toHaveClass('mock-heading');
        });
    });

    describe('Alert section', () => {
        it('does not render alert section when alertText is not provided', () => {
            render(<LandingPageTemplate {...defaultProperties} />);

            expect(screen.queryByTestId('alert-section')).not.toBeInTheDocument();
            expect(screen.queryByTestId('alert-icon')).not.toBeInTheDocument();
            expect(screen.queryByTestId('alert-text')).not.toBeInTheDocument();
        });

        it('renders alert section when alertText is provided', () => {
            const alertText = 'This is an important alert message';
            render(<LandingPageTemplate {...defaultProperties} alertText={alertText} />);

            expect(screen.getByTestId('alert-section')).toBeInTheDocument();
            expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
            expect(screen.getByTestId('alert-text')).toBeInTheDocument();
        });

        it('displays the correct alert text', () => {
            const alertText = 'Warning: System maintenance in progress';
            render(<LandingPageTemplate {...defaultProperties} alertText={alertText} />);

            const alertTextElement = screen.getByTestId('alert-text');
            expect(alertTextElement).toHaveTextContent(alertText);
        });

        it('renders alert icon with correct properties', () => {
            const alertText = 'Alert message';
            render(<LandingPageTemplate {...defaultProperties} alertText={alertText} />);

            const alertIcon = screen.getByTestId('alert-icon');
            expect(alertIcon).toHaveAttribute('data-type', 'alert-circle');
            expect(alertIcon).toHaveAttribute('data-fill-color', '#000');
            expect(alertIcon).toHaveAttribute('data-theme', 'outline');
        });

        it('applies the correct CSS class to alert section', () => {
            const alertText = 'Alert message';
            render(<LandingPageTemplate {...defaultProperties} alertText={alertText} />);

            const alertSection = screen.getByTestId('alert-section');
            expect(alertSection).toHaveClass('mock-alert-section');
        });
    });

    describe('List section', () => {
        it('displays the correct list title', () => {
            const customListTitle = 'Custom List Description';
            render(<LandingPageTemplate {...defaultProperties} listTitle={customListTitle} />);

            const listHeading = screen.getByTestId('ability-list-heading');
            expect(listHeading).toHaveTextContent(customListTitle);
            expect(listHeading.tagName).toBe('P');
        });

        it('applies the correct CSS class to list heading', () => {
            render(<LandingPageTemplate {...defaultProperties} />);

            const listHeading = screen.getByTestId('ability-list-heading');
            expect(listHeading).toHaveClass('mock-ability-list-heading');
        });

        it('renders the ability list with all required items', () => {
            render(<LandingPageTemplate {...defaultProperties} />);

            const abilityList = screen.getByTestId('ability-list');
            expect(abilityList.tagName).toBe('UL');
            expect(abilityList).toHaveClass('mock-ability-list');

            // Check for all list items
            expect(screen.getByText('When you accessed the digital services')).toBeInTheDocument();
            expect(screen.getByText('What personal information is maintained')).toBeInTheDocument();
            expect(screen.getByText('How your information is used')).toBeInTheDocument();

            // Verify all items are list elements
            const listItems = abilityList.querySelectorAll('li');
            expect(listItems).toHaveLength(3);
        });
    });

    describe('Landing page image', () => {
        it('renders the landing page image container', () => {
            render(<LandingPageTemplate {...defaultProperties} />);

            const imageContainer = screen.getByTestId('landing-page-img');
            expect(imageContainer).toBeInTheDocument();
            expect(imageContainer).toHaveClass('mock-landing-page-img');
        });

        it('contains an image with correct properties', () => {
            render(<LandingPageTemplate {...defaultProperties} />);

            const imageContainer = screen.getByTestId('landing-page-img');
            const image = imageContainer.querySelector('img');

            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute('src', './assets/account-history-landing-page-img.svg');
            expect(image).toHaveAttribute('role', 'none');
        });
    });

    describe('Button section', () => {
        it('renders the button container', () => {
            render(<LandingPageTemplate {...defaultProperties} />);

            const buttonContainer = screen.getByTestId('button-container');
            expect(buttonContainer).toBeInTheDocument();
            expect(buttonContainer).toHaveClass('mock-button-container');
        });

        it('renders the provided button section content', () => {
            const customButtonSection = (
                <div>
                    <button data-testid="custom-button-1">Custom Button 1</button>
                    <button data-testid="custom-button-2">Custom Button 2</button>
                </div>
            );

            render(<LandingPageTemplate {...defaultProperties} buttonSection={customButtonSection} />);

            expect(screen.getByTestId('custom-button-1')).toBeInTheDocument();
            expect(screen.getByTestId('custom-button-2')).toBeInTheDocument();
        });
    });

    describe('Component integration', () => {
        it('renders all sections together correctly', () => {
            const properties = {
                title: 'Integration Test Title',
                alertText: 'Integration alert message',
                listTitle: 'Integration list description',
                buttonSection: <button data-testid="integration-button">Integration Button</button>,
            };

            render(<LandingPageTemplate {...properties} />);

            // Verify all sections are present
            expect(screen.getByTestId('page-title')).toBeInTheDocument();
            expect(screen.getByTestId('page-heading')).toHaveTextContent('Integration Test Title');
            expect(screen.getByTestId('alert-section')).toBeInTheDocument();
            expect(screen.getByTestId('alert-text')).toHaveTextContent('Integration alert message');
            expect(screen.getByTestId('ability-list-heading')).toHaveTextContent('Integration list description');
            expect(screen.getByTestId('ability-list')).toBeInTheDocument();
            expect(screen.getByTestId('landing-page-img')).toBeInTheDocument();
            expect(screen.getByTestId('integration-button')).toBeInTheDocument();
        });

        it('maintains proper document structure and accessibility', () => {
            render(<LandingPageTemplate {...defaultProperties} alertText="Accessibility test" />);

            // Check heading hierarchy
            const h2 = screen.getByTestId('page-heading');
            expect(h2.tagName).toBe('H2');

            // Check list structure
            const list = screen.getByTestId('ability-list');
            expect(list.tagName).toBe('UL');
            expect(list.querySelectorAll('li')).toHaveLength(3);

            // Check image accessibility
            const image = screen.getByRole('none');
            expect(image).toBeInTheDocument();
            expect(image.tagName).toBe('IMG');
        });
    });
});
