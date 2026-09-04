import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ServiceTable from './ServiceTable';
import { AccessedServiceVm } from '../../../../../types/AccessedService';

interface MockGoabTableProperties {
    width: string;
    testId: string;
    children: React.ReactNode;
}

// Mock the GoabTable component
jest.mock('@abgov/react-components', () => ({
    GoabTable: ({ width, testId, children }: MockGoabTableProperties) => (
        <div data-testid={testId} data-width={width}>
            <table>{children}</table>
        </div>
    ),
}));

// Mock CSS modules
jest.mock('./ServiceTable.module.scss', () => ({
    'table-container': 'table-container',
    'tbl-thead': 'tbl-thead',
    'th-service-accessed': 'th-service-accessed',
    'services-count': 'services-count',
    'col-time': 'col-time',
}));

// CSS class constants for tests
const CSS_CLASSES = {
    TABLE_CONTAINER: 'table-container',
    COL_TIME: 'col-time',
};

// Helper function to render component with router
const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
};

// Test constants
const SERVICES_COUNT = {
    DEFAULT: 25,
    EMPTY: 0,
    SINGLE: 1,
};

const NAVIGATION_PATHS = {
    NORMAL: '/accessed-services',
    PREVIEW: '/preview/accessed-services',
};

// Mock data - simplified to only what we need
const mockServices: AccessedServiceVm[] = [
    {
        id: 'service-1',
        serviceName: 'Health Records',
        categoryId: 'health',
        lastAccessedOn: new Date('2024-01-15T10:30:00Z'),
        dateAccessed: 'January 15, 2024',
        timeAccessed: '10:30 AM',
        isAvailable: true,
    },
    {
        id: 'service-2',
        serviceName: 'Education Transcripts',
        categoryId: 'education',
        lastAccessedOn: new Date('2024-01-14T14:45:00Z'),
        dateAccessed: 'January 14, 2024',
        timeAccessed: '2:45 PM',
        isAvailable: true,
    },
    {
        id: 'service-3',
        serviceName: 'Tax Records',
        categoryId: 'finance',
        lastAccessedOn: new Date('2024-01-13T09:15:00Z'),
        dateAccessed: 'January 13, 2024',
        timeAccessed: '9:15 AM',
        isAvailable: false,
    },
];

describe('ServiceTable', () => {
    const defaultProperties = {
        currentPageServices: mockServices,
        servicesCount: SERVICES_COUNT.DEFAULT,
        isPreview: false,
    };

    it('renders without crashing', () => {
        renderWithRouter(<ServiceTable {...defaultProperties} />);
        
        expect(screen.getByTestId('table-container')).toBeInTheDocument();
        expect(screen.getByTestId('services-table')).toBeInTheDocument();
    });

    it('displays table headers', () => {
        renderWithRouter(<ServiceTable {...defaultProperties} />);
        
        expect(screen.getByText('Service accessed')).toBeInTheDocument();
        expect(screen.getByText('Date accessed')).toBeInTheDocument();
        expect(screen.getByText('Time')).toBeInTheDocument();
        expect(screen.getByText('Details')).toBeInTheDocument();
    });

    it('displays services count', () => {
        renderWithRouter(<ServiceTable {...defaultProperties} />);
        
        expect(screen.getByText(SERVICES_COUNT.DEFAULT.toString())).toBeInTheDocument();
    });

    it('renders service data', () => {
        renderWithRouter(<ServiceTable {...defaultProperties} />);
        
        expect(screen.getByText(mockServices[0].serviceName)).toBeInTheDocument();
        expect(screen.getByText(mockServices[0].dateAccessed)).toBeInTheDocument();
        expect(screen.getByText(mockServices[0].timeAccessed)).toBeInTheDocument();
        
        expect(screen.getByText(mockServices[1].serviceName)).toBeInTheDocument();
        expect(screen.getByText(mockServices[1].dateAccessed)).toBeInTheDocument();
        expect(screen.getByText(mockServices[1].timeAccessed)).toBeInTheDocument();
    });

    it('renders View links for normal mode', () => {
        renderWithRouter(<ServiceTable {...defaultProperties} />);
        
        expect(screen.getByTestId('view-service-1')).toHaveAttribute('href', `${NAVIGATION_PATHS.NORMAL}/service-1`);
        expect(screen.getByTestId('view-service-2')).toHaveAttribute('href', `${NAVIGATION_PATHS.NORMAL}/service-2`);
        expect(screen.getByTestId('view-service-3')).toHaveAttribute('href', `${NAVIGATION_PATHS.NORMAL}/service-3`);
    });

    it('renders View links for preview mode', () => {
        const previewProperties = { ...defaultProperties, isPreview: true };
        renderWithRouter(<ServiceTable {...previewProperties} />);
        
        expect(screen.getByTestId('view-service-1')).toHaveAttribute('href', `${NAVIGATION_PATHS.PREVIEW}/service-1`);
        expect(screen.getByTestId('view-service-2')).toHaveAttribute('href', `${NAVIGATION_PATHS.PREVIEW}/service-2`);
        expect(screen.getByTestId('view-service-3')).toHaveAttribute('href', `${NAVIGATION_PATHS.PREVIEW}/service-3`);
    });

    it('handles empty services array', () => {
        const emptyProperties = { 
            ...defaultProperties, 
            currentPageServices: [], 
            servicesCount: SERVICES_COUNT.EMPTY 
        };
        renderWithRouter(<ServiceTable {...emptyProperties} />);
        
        expect(screen.getByText(SERVICES_COUNT.EMPTY.toString())).toBeInTheDocument();
        expect(screen.queryByText('View')).not.toBeInTheDocument();
    });

    it('handles single service', () => {
        const singleServiceProperties = {
            ...defaultProperties,
            currentPageServices: [mockServices[0]],
            servicesCount: SERVICES_COUNT.SINGLE,
        };
        renderWithRouter(<ServiceTable {...singleServiceProperties} />);
        
        expect(screen.getByText(mockServices[0].serviceName)).toBeInTheDocument();
        expect(screen.getByText(SERVICES_COUNT.SINGLE.toString())).toBeInTheDocument();
        expect(screen.getAllByText('View')).toHaveLength(1);
    });

    it('applies CSS classes', () => {
        renderWithRouter(<ServiceTable {...defaultProperties} />);
        
        const tableContainer = screen.getByTestId('table-container');
        expect(tableContainer).toHaveClass(CSS_CLASSES.TABLE_CONTAINER);
    });

    it('applies col-time class for mobile responsiveness', () => {
        renderWithRouter(<ServiceTable {...defaultProperties} />);
        
        // Check Time header has col-time class
        const timeHeader = screen.getByText('Time');
        expect(timeHeader).toHaveClass(CSS_CLASSES.COL_TIME);
        
        // Check time data cells have col-time class  
        const timeCell1 = screen.getByText(mockServices[0].timeAccessed);
        const timeCell2 = screen.getByText(mockServices[1].timeAccessed);
        expect(timeCell1).toHaveClass(CSS_CLASSES.COL_TIME);
        expect(timeCell2).toHaveClass(CSS_CLASSES.COL_TIME);
    });
});