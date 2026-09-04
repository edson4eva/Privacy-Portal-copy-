import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchFilter from './SearchFilter';
import { DropDownEntry } from 'shared/src/lib/accessed-service-details/types/Constants';

// TypeScript interfaces for mock components
interface MockGoabInputProperties {
    type: string;
    leadingIcon: string;
    width: string;
    name: string;
    placeholder: string;
    value: string;
    onChange: (event: { value: string }) => void;
}

interface MockGoabButtonProperties {
    type: string;
    variant: string;
    onClick: () => void;
    width: string;
    children: React.ReactNode;
}

interface MockGoabCheckboxProperties {
    name: string;
    text: string;
    onChange: (event: { name: string; checked: boolean }) => void;
}

interface MockGoabRadioGroupProperties {
    name: string;
    onChange: (event: { value: string }) => void;
    children: React.ReactNode;
}

interface MockGoabRadioItemProperties {
    value: string;
    label: string;
    groupName?: string;
    groupOnChange?: (event: { value: string }) => void;
}

interface MockGoabModalProperties {
    role: string;
    open: boolean;
    heading: string;
    onClose: () => void;
    maxWidth: string;
    actions: React.ReactNode;
    children: React.ReactNode;
}

// Mock data
const mockCategories: DropDownEntry[] = [
    { id: 'health', label: 'Health' },
    { id: 'education', label: 'Education' },
    { id: 'finance', label: 'Finance' },
    { id: 'government', label: 'Government Services' }
];

const mockSelectedCategories: DropDownEntry[] = [
    { id: 'health', label: 'Health' }
];

// Mock GoA components
jest.mock('@abgov/react-components', () => ({
    GoabInput: (properties: MockGoabInputProperties) => (
        <input
            data-testid="goa-input"
            type={properties.type}
            name={properties.name}
            placeholder={properties.placeholder}
            value={properties.value}
            onChange={(event) => properties.onChange({ value: event.target.value })}
            data-leading-icon={properties.leadingIcon}
            data-width={properties.width}
        />
    ),
    GoabButton: (properties: MockGoabButtonProperties) => (
        <button
            data-testid="goa-button"
            onClick={properties.onClick}
            data-type={properties.type}
            data-variant={properties.variant}
            data-width={properties.width}
        >
            {properties.children}
        </button>
    ),
    GoabCheckbox: (properties: MockGoabCheckboxProperties) => (
        <label data-testid={`checkbox-${properties.name}`}>
            <input
                type="checkbox"
                name={properties.name}
                onChange={(event) => properties.onChange({ name: properties.name, checked: event.target.checked })}
                data-testid={`checkbox-input-${properties.name}`}
            />
            {properties.text}
        </label>
    ),
    GoabRadioGroup: (properties: MockGoabRadioGroupProperties) => (
        <div data-testid="radio-group" data-name={properties.name}>
            <div data-testid="radio-group-children">
                {/* Simplified radio group - children will be rendered separately in tests */}
                {properties.children}
            </div>
        </div>
    ),
    GoabRadioItem: (properties: MockGoabRadioItemProperties) => (
        <label data-testid={`radio-item-${properties.value}`}>
            <input
                type="radio"
                name={properties.groupName || 'sort-by'}
                value={properties.value}
                onChange={(event) => {
                    if (properties.groupOnChange) {
                        properties.groupOnChange({ value: event.target.value });
                    }
                }}
                data-testid={`radio-input-${properties.value}`}
            />
            {properties.label}
        </label>
    ),
    GoabModal: (properties: MockGoabModalProperties) =>
        properties.open ? (
            <div
                data-testid="goa-modal"
                role={properties.role}
                data-heading={properties.heading}
                data-max-width={properties.maxWidth}
            >
                <div data-testid="modal-header">
                    <h2>{properties.heading}</h2>
                    <button data-testid="modal-close" onClick={properties.onClose}>
                        Close
                    </button>
                </div>
                <div data-testid="modal-content">{properties.children}</div>
                <div data-testid="modal-actions">{properties.actions}</div>
            </div>
        ) : null,
}));

// Mock ApplyFilterButton
jest.mock('./ApplyFilterButton', () => {
    return function MockApplyFilterButton({ applyFilters }: { applyFilters: () => void }) {
        return (
            <button data-testid="apply-filter-button" onClick={applyFilters}>
                Apply Filters
            </button>
        );
    };
});

// Mock SearchFilterContext
const mockSearchFilterContext = {
    searchTerm: '',
    setSearchTerm: jest.fn(),
    categories: mockCategories,
    selectedCategories: [],
    setSelectedCategories: jest.fn(),
    setSortBy: jest.fn(),
    openFilter: false,
    setOpenFilter: jest.fn(),
    sortBy: null,
    setSortOrder: jest.fn(),
    sortOrder: 'asc' as const
};

jest.mock('./SearchFilterContext', () => ({
    useSearchFilter: () => mockSearchFilterContext
}));

// Mock Categories constant
jest.mock('shared/src/lib/accessed-service-details/types/Constants', () => ({
    Categories: [
        { id: 'health', label: 'Health' },
        { id: 'education', label: 'Education' },
        { id: 'finance', label: 'Finance' },
        { id: 'government', label: 'Government Services' }
    ],
    DropDownEntry: {} // Type export
}));

// Mock CSS modules
jest.mock('./SearchFilter.module.scss', () => ({
    'search-filter-container': 'mock-search-filter-container',
    'search-box-container': 'mock-search-box-container',
    'search-filter-divider': 'mock-search-filter-divider',
    'filter-button-container': 'mock-filter-button-container',
    'selected': 'mock-selected',
    'filter-button-body': 'mock-filter-button-body',
    'filter-button-icon': 'mock-filter-button-icon',
    'filter-button-text': 'mock-filter-button-text',
    'filter-selection-count': 'mock-filter-selection-count',
    'filter-modal-body': 'mock-filter-modal-body',
    'filter-title-category': 'mock-filter-title-category',
    'filter-category-checkbox-container': 'mock-filter-category-checkbox-container',
    'filter-title-sortby': 'mock-filter-title-sortby',
    'filter-sortby-radio-container': 'mock-filter-sortby-radio-container'
}));

// Mock DOM manipulation for autocomplete
const mockQuerySelector = jest.fn();
const mockSetAttribute = jest.fn();

Object.defineProperty(document, 'querySelector', {
    value: mockQuerySelector,
    writable: true
});

describe('SearchFilter', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSearchFilterContext.searchTerm = '';
        mockSearchFilterContext.selectedCategories = [];
        mockSearchFilterContext.openFilter = false;
        
        // Setup DOM mocking
        mockQuerySelector.mockReturnValue({
            shadowRoot: {
                querySelector: jest.fn().mockReturnValue({
                    setAttribute: mockSetAttribute
                })
            }
        });
    });

    describe('Component rendering', () => {
        it('renders without crashing', () => {
            render(<SearchFilter />);
            expect(screen.getByTestId('goa-input')).toBeInTheDocument();
        });

        it('renders all main sections', () => {
            render(<SearchFilter />);

            expect(screen.getByTestId('goa-input')).toBeInTheDocument();
            expect(screen.getByTestId('goa-button')).toBeInTheDocument();
            expect(screen.getByText('Filters')).toBeInTheDocument();
        });

        it('applies correct CSS classes to containers', () => {
            const { container } = render(<SearchFilter />);
            
            expect(container.querySelector('.mock-search-filter-container')).toBeInTheDocument();
            expect(container.querySelector('.mock-search-box-container')).toBeInTheDocument();
            expect(container.querySelector('.mock-search-filter-divider')).toBeInTheDocument();
        });
    });

    describe('Search input functionality', () => {
        it('renders search input with correct properties', () => {
            render(<SearchFilter />);

            const searchInput = screen.getByTestId('goa-input');
            expect(searchInput).toHaveAttribute('type', 'search');
            expect(searchInput).toHaveAttribute('placeholder', 'Type keyword or service');
            expect(searchInput).toHaveAttribute('data-leading-icon', 'search');
            expect(searchInput).toHaveAttribute('data-width', '100%');
        });

        it('displays current search term value', () => {
            mockSearchFilterContext.searchTerm = 'test search';
            render(<SearchFilter />);

            const searchInput = screen.getByTestId('goa-input');
            expect(searchInput).toHaveValue('test search');
        });

        it('calls setSearchTerm when input value changes', () => {
            render(<SearchFilter />);

            const searchInput = screen.getByTestId('goa-input');
            fireEvent.change(searchInput, { target: { value: 'new search term' } });

            expect(mockSearchFilterContext.setSearchTerm).toHaveBeenCalledWith('new search term');
        });

        it('handles empty search input properly', () => {
            // Test that the component can handle empty search terms
            mockSearchFilterContext.searchTerm = '';
            render(<SearchFilter />);

            const searchInput = screen.getByTestId('goa-input');
            expect(searchInput).toHaveValue('');
            
            // Test that onChange works with non-empty values
            fireEvent.change(searchInput, { target: { value: 'test' } });
            expect(mockSearchFilterContext.setSearchTerm).toHaveBeenCalledWith('test');
        });

        it('disables autocomplete on mount', () => {
            render(<SearchFilter />);

            expect(mockQuerySelector).toHaveBeenCalledWith('goa-input');
            expect(mockSetAttribute).toHaveBeenCalledWith('autocomplete', 'off');
        });
    });

    describe('Filter button functionality', () => {
        it('renders filter button with correct properties', () => {
            render(<SearchFilter />);

            const filterButton = screen.getByTestId('goa-button');
            expect(filterButton).toHaveAttribute('data-type', 'secondary');
            expect(filterButton).toHaveAttribute('data-variant', 'normal');
            expect(filterButton).toHaveAttribute('data-width', '8.3125rem');
        });

        it('shows filter button without selection count when no categories selected', () => {
            render(<SearchFilter />);

            expect(screen.getByText('Filters')).toBeInTheDocument();
            expect(screen.queryByText('1')).not.toBeInTheDocument();
        });

        it('shows selection count when categories are selected', () => {
            mockSearchFilterContext.selectedCategories = mockSelectedCategories;
            render(<SearchFilter />);

            expect(screen.getByText('1')).toBeInTheDocument();
        });

        it('applies selected CSS class when categories are selected', () => {
            mockSearchFilterContext.selectedCategories = mockSelectedCategories;
            const { container } = render(<SearchFilter />);

            const filterButtonContainer = container.querySelector('.mock-filter-button-container');
            expect(filterButtonContainer).toHaveClass('mock-selected');
        });

        it('opens filter modal when button is clicked', () => {
            render(<SearchFilter />);

            const filterButton = screen.getByTestId('goa-button');
            fireEvent.click(filterButton);

            expect(mockSearchFilterContext.setOpenFilter).toHaveBeenCalledWith(true);
        });
    });

    describe('Filter modal functionality', () => {
        beforeEach(() => {
            mockSearchFilterContext.openFilter = true;
        });

        it('renders modal when openFilter is true', () => {
            render(<SearchFilter />);

            expect(screen.getByTestId('goa-modal')).toBeInTheDocument();
            expect(screen.getByTestId('modal-header')).toHaveTextContent('Filters');
        });

        it('does not render modal when openFilter is false', () => {
            mockSearchFilterContext.openFilter = false;
            render(<SearchFilter />);

            expect(screen.queryByTestId('goa-modal')).not.toBeInTheDocument();
        });

        it('renders modal with correct properties', () => {
            render(<SearchFilter />);

            const modal = screen.getByTestId('goa-modal');
            expect(modal).toHaveAttribute('role', 'dialog');
            expect(modal).toHaveAttribute('data-heading', 'Filters');
            expect(modal).toHaveAttribute('data-max-width', '480px');
        });

        it('closes modal when close button is clicked', () => {
            render(<SearchFilter />);

            const closeButton = screen.getByTestId('modal-close');
            fireEvent.click(closeButton);

            expect(mockSearchFilterContext.setOpenFilter).toHaveBeenCalledWith(false);
        });
    });

    describe('Category filtering', () => {
        beforeEach(() => {
            mockSearchFilterContext.openFilter = true;
        });

        it('renders category section with title', () => {
            render(<SearchFilter />);

            expect(screen.getByText('Category')).toBeInTheDocument();
        });

        it('renders all category checkboxes', () => {
            render(<SearchFilter />);

            mockCategories.forEach((category) => {
                expect(screen.getByTestId(`checkbox-${category.id}`)).toBeInTheDocument();
                expect(screen.getByText(category.label)).toBeInTheDocument();
            });
        });

        it('allows user interaction with checkboxes and applies filters', () => {
            render(<SearchFilter />);

            // Test that checkboxes respond to user interactions
            const healthCheckbox = screen.getByTestId('checkbox-input-health');
            
            // Initially unchecked
            expect(healthCheckbox).not.toBeChecked();
            
            // Can be checked
            fireEvent.click(healthCheckbox);
            expect(healthCheckbox).toBeChecked();
            
            // Can be unchecked
            fireEvent.click(healthCheckbox);
            expect(healthCheckbox).not.toBeChecked();

            // Apply filters button works
            const applyButton = screen.getByTestId('apply-filter-button');
            fireEvent.click(applyButton);

            expect(mockSearchFilterContext.setSelectedCategories).toHaveBeenCalled();
            expect(mockSearchFilterContext.setSortBy).toHaveBeenCalled();
            expect(mockSearchFilterContext.setOpenFilter).toHaveBeenCalledWith(false);
        });
    });

    describe('Sort by functionality', () => {
        beforeEach(() => {
            mockSearchFilterContext.openFilter = true;
        });

        it('renders sort by section with title', () => {
            render(<SearchFilter />);

            expect(screen.getByText('Sort by')).toBeInTheDocument();
        });

        it('renders radio group with correct name', () => {
            render(<SearchFilter />);

            const radioGroup = screen.getByTestId('radio-group');
            expect(radioGroup).toHaveAttribute('data-name', 'sort-by');
        });

        it('renders both sort options', () => {
            render(<SearchFilter />);

            expect(screen.getByTestId('radio-item-earliest-accessed')).toBeInTheDocument();
            expect(screen.getByTestId('radio-item-latest-accessed')).toBeInTheDocument();
            expect(screen.getByText('Earliest accessed')).toBeInTheDocument();
            expect(screen.getByText('Latest accessed')).toBeInTheDocument();
        });

        it('allows users to select earliest accessed sort option', () => {
            render(<SearchFilter />);

            const earliestRadio = screen.getByTestId('radio-input-earliest-accessed');
            fireEvent.click(earliestRadio);

            expect(earliestRadio).toBeChecked();
        });

        it('allows users to select latest accessed sort option', () => {
            render(<SearchFilter />);

            const latestRadio = screen.getByTestId('radio-input-latest-accessed');
            fireEvent.click(latestRadio);

            expect(latestRadio).toBeChecked();
        });

        it('ensures only one sort option can be selected at a time', () => {
            render(<SearchFilter />);

            const earliestRadio = screen.getByTestId('radio-input-earliest-accessed');
            const latestRadio = screen.getByTestId('radio-input-latest-accessed');

            // Select earliest first
            fireEvent.click(earliestRadio);
            expect(earliestRadio).toBeChecked();
            expect(latestRadio).not.toBeChecked();

            // Select latest - should deselect earliest
            fireEvent.click(latestRadio);
            expect(latestRadio).toBeChecked();
            expect(earliestRadio).not.toBeChecked();
        });
    });

    describe('Apply filters functionality', () => {
        beforeEach(() => {
            mockSearchFilterContext.openFilter = true;
        });

        it('renders apply filter button', () => {
            render(<SearchFilter />);

            expect(screen.getByTestId('apply-filter-button')).toBeInTheDocument();
        });

        it('calls context methods when applying filters', () => {
            render(<SearchFilter />);

            const applyButton = screen.getByTestId('apply-filter-button');
            fireEvent.click(applyButton);

            expect(mockSearchFilterContext.setSelectedCategories).toHaveBeenCalled();
            expect(mockSearchFilterContext.setSortBy).toHaveBeenCalled();
            expect(mockSearchFilterContext.setOpenFilter).toHaveBeenCalledWith(false);
        });

        it('applies selected categories and sort options', () => {
            mockSearchFilterContext.openFilter = true;
            render(<SearchFilter />);

            // Select a category
            const healthCheckbox = screen.getByTestId('checkbox-input-health');
            fireEvent.click(healthCheckbox);
            expect(healthCheckbox).toBeChecked();

            // Select a sort option
            const earliestRadio = screen.getByTestId('radio-input-earliest-accessed');
            fireEvent.click(earliestRadio);
            expect(earliestRadio).toBeChecked();

            // Apply filters
            const applyButton = screen.getByTestId('apply-filter-button');
            fireEvent.click(applyButton);

            // Verify the context methods are called to apply the user's selections
            expect(mockSearchFilterContext.setSelectedCategories).toHaveBeenCalled();
            expect(mockSearchFilterContext.setSortBy).toHaveBeenCalled();
            expect(mockSearchFilterContext.setOpenFilter).toHaveBeenCalledWith(false);
        });
    });

    describe('Integration testing', () => {
        it('integrates search and filter functionality together', () => {
            render(<SearchFilter />);

            // User types in search box
            const searchInput = screen.getByTestId('goa-input');
            fireEvent.change(searchInput, { target: { value: 'health services' } });

            // User opens filter modal
            const filterButton = screen.getByTestId('goa-button');
            fireEvent.click(filterButton);

            // Verify all user actions triggered the expected system behavior
            expect(mockSearchFilterContext.setSearchTerm).toHaveBeenCalledWith('health services');
            expect(mockSearchFilterContext.setOpenFilter).toHaveBeenCalledWith(true);
        });
    });

    describe('Error handling and edge cases', () => {
        it('handles missing categories gracefully', () => {
            mockSearchFilterContext.categories = [];
            render(<SearchFilter />);

            expect(screen.getByTestId('goa-input')).toBeInTheDocument();
            expect(screen.getByTestId('goa-button')).toBeInTheDocument();
        });

        it('handles undefined search term', () => {
            mockSearchFilterContext.searchTerm = undefined as string | undefined;
            render(<SearchFilter />);

            const searchInput = screen.getByTestId('goa-input');
            expect(searchInput).toBeInTheDocument();
        });

        it('handles DOM manipulation failures gracefully', () => {
            // Test various DOM manipulation failure scenarios
            const scenarios = [
                () => mockQuerySelector.mockReturnValue(null),
                () => mockQuerySelector.mockReturnValue({ shadowRoot: null }),
                () => mockQuerySelector.mockReturnValue({ shadowRoot: { querySelector: jest.fn().mockReturnValue(null) } })
            ];

            scenarios.forEach((setup) => {
                setup();
                expect(() => {
                    render(<SearchFilter />);
                }).not.toThrow();
            });
        });
    });

    describe('Accessibility', () => {
        it('renders modal with correct role', () => {
            mockSearchFilterContext.openFilter = true;
            render(<SearchFilter />);

            const modal = screen.getByTestId('goa-modal');
            expect(modal).toHaveAttribute('role', 'dialog');
        });

        it('provides proper labels and headings for form elements', () => {
            mockSearchFilterContext.openFilter = true;
            render(<SearchFilter />);

            // Check that radio buttons have labels
            expect(screen.getByText('Earliest accessed')).toBeInTheDocument();
            expect(screen.getByText('Latest accessed')).toBeInTheDocument();

            // Check for proper section headings structure
            expect(screen.getByText('Category')).toBeInTheDocument();
            expect(screen.getByText('Sort by')).toBeInTheDocument();
        });
    });
});
