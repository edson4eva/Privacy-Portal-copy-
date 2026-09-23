import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import ServiceDetails from './ServiceDetails';
import { ServiceDetailModel } from './types/ServiceDetailModel';
import { AccessServiceDate } from './types/AccessedServiceDetailsModel';

// Mock external dependencies
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));

jest.mock('@abgov/react-components', () => ({
    GoabSpacer: ({ vSpacing }: { vSpacing: string }) => (
        <div data-testid={`spacer-${vSpacing}`} className={`spacer-${vSpacing}`}></div>
    ),
}));

// Mock child components
jest.mock('./back-button/BackButton', () => {
    return function MockBackButton({ buttonText, onClick }: { buttonText: string; onClick: () => void }) {
        return (
            <button data-testid="back-button" onClick={onClick}>
                {buttonText}
            </button>
        );
    };
});

jest.mock('./preview-banner/PreviewBanner', () => {
    return function MockPreviewBanner({ isPreview, isAdminPanel }: { isPreview: boolean; isAdminPanel: boolean }) {
        return (
            <div data-testid="preview-banner" data-is-preview={isPreview} data-is-admin-panel={isAdminPanel}>
                Preview Banner
            </div>
        );
    };
});

jest.mock('./report-unauthorized-access/ReportUnauthorizedAccess', () => {
    return function MockReportUnauthorizedAccess() {
        return <div data-testid="report-unauthorized-access">Report Unauthorized Access</div>;
    };
});

jest.mock('./service-property/ServiceProperty', () => {
    return function MockServiceProperty({
        icon,
        title,
        value,
        valueList,
        testId,
        isLight,
    }: {
        icon: string;
        title: string;
        value: string | undefined;
        valueList?: string[];
        testId?: string;
        isLight?: boolean;
    }) {
        return (
            <div
                data-testid={testId || 'service-property'}
                data-icon={icon}
                data-title={title}
                data-value={value || ''}
                data-value-list={valueList ? valueList.join(',') : ''}
                data-is-light={isLight}
            >
                {title}: {valueList ? valueList.join(',') : ''}
            </div>
        );
    };
});

jest.mock('./access-history-table/AccessHistoryTable', () => {
    return function MockAccessHistoryTable({ accessedDates }: { accessedDates: AccessServiceDate[] }) {
        return <div data-testid="access-history-table">Access History ({accessedDates.length} entries)</div>;
    };
});

jest.mock('./service-details-section/ServiceDetailsSection', () => {
    return function MockServiceDetailsSection({ serviceDetails }: { serviceDetails: ServiceDetailModel }) {
        return (
            <div data-testid="service-details-section" data-service-id={serviceDetails.id}>
                Service Details Section
            </div>
        );
    };
});

jest.mock('./action-buttons/ActionButtons', () => {
    return function MockActionButtons({ isAdminPanel, onBack }: { isAdminPanel: boolean; onBack: () => void }) {
        return (
            <div data-testid="action-buttons" data-is-admin-panel={isAdminPanel}>
                <button data-testid="action-back-button" onClick={onBack}>
                    Back Action
                </button>
            </div>
        );
    };
});

// Mock CSS modules
jest.mock('./ServiceDetails.module.scss', () => ({
    container: 'container',
    'service-name': 'service-name',
    'service-description': 'service-description',
}));

const mockNavigate = jest.mocked(useNavigate);

// Helper function to render component with router
const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
};

// Test constants and mock data
const mockServiceDetails: ServiceDetailModel = {
    id: 'test-service-1',
    serviceName: 'Health Records Service',
    description: '<p>Access your comprehensive health records and medical history</p>',
    categoryText: 'Health & Medical',
    dataOwnerTexts: ['Alberta Health'],
    accessServiceUrl: 'https://example.com/health-records',
    isAvailable: true,
    showMockInDev: false,
};

const mockAccessedDates: AccessServiceDate[] = [
    { formattedDate: '2024-01-15', formattedTime: '10:30 AM' },
    { formattedDate: '2024-01-14', formattedTime: '2:45 PM' },
    { formattedDate: '2024-01-13', formattedTime: '9:15 AM' },
];

describe('ServiceDetails', () => {
    const mockNavigateFunction = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockNavigate.mockReturnValue(mockNavigateFunction);
        // Mock window.open
        Object.defineProperty(window, 'open', {
            writable: true,
            value: jest.fn(),
        });
    });

    it('renders service details correctly', () => {
        renderWithRouter(
            <ServiceDetails
                isPreview={false}
                accessedDates={mockAccessedDates}
                serviceDetails={mockServiceDetails}
                isAdminPanel={false}
            />
        );

        expect(screen.getByTestId('service-name')).toHaveTextContent('Health Records Service');
        expect(screen.getByTestId('service-name')).toBeInTheDocument();
    });

    it('renders HTML description safely', () => {
        renderWithRouter(
            <ServiceDetails
                isPreview={false}
                accessedDates={mockAccessedDates}
                serviceDetails={mockServiceDetails}
                isAdminPanel={false}
            />
        );

        const descriptionElement = document.querySelector('.service-description');
        expect(descriptionElement).toHaveProperty(
            'innerHTML',
            '<p>Access your comprehensive health records and medical history</p>'
        );
    });

    it('renders service properties with correct data', () => {
        renderWithRouter(
            <ServiceDetails
                isPreview={false}
                accessedDates={mockAccessedDates}
                serviceDetails={mockServiceDetails}
                isAdminPanel={false}
            />
        );

        // Check category property
        const categoryProperty = screen.getByTestId('service-property');
        expect(categoryProperty).toHaveAttribute('data-icon', 'albums');
        expect(categoryProperty).toHaveAttribute('data-title', 'Category');
        expect(categoryProperty).toHaveAttribute('data-value', 'Health & Medical');

        // Check ministry property
        const ministryProperty = screen.getByTestId('service-propery-ministry');
        expect(ministryProperty).toHaveAttribute('data-icon', 'business');
        expect(ministryProperty).toHaveAttribute('data-title', 'Ministry and data owner');
        expect(ministryProperty).toHaveAttribute('data-value-list', 'Alberta Health');
        expect(ministryProperty).toHaveAttribute('data-is-light', 'true');
    });

    it('renders all child components', () => {
        renderWithRouter(
            <ServiceDetails
                isPreview={false}
                accessedDates={mockAccessedDates}
                serviceDetails={mockServiceDetails}
                isAdminPanel={false}
            />
        );

        expect(screen.getByTestId('preview-banner')).toBeInTheDocument();
        expect(screen.getByTestId('back-button')).toBeInTheDocument();
        expect(screen.getByTestId('access-history-table')).toBeInTheDocument();
        expect(screen.getByTestId('report-unauthorized-access')).toBeInTheDocument();
        expect(screen.getByTestId('service-details-section')).toBeInTheDocument();
        expect(screen.getByTestId('action-buttons')).toBeInTheDocument();
    });

    it('passes correct props to child components', () => {
        renderWithRouter(
            <ServiceDetails
                isPreview={true}
                accessedDates={mockAccessedDates}
                serviceDetails={mockServiceDetails}
                isAdminPanel={true}
            />
        );

        // Check preview banner props
        const previewBanner = screen.getByTestId('preview-banner');
        expect(previewBanner).toHaveAttribute('data-is-preview', 'true');
        expect(previewBanner).toHaveAttribute('data-is-admin-panel', 'true');

        // Check access history table props
        expect(screen.getByTestId('access-history-table')).toHaveTextContent('Access History (3 entries)');

        // Check service details section props
        const serviceDetailsSection = screen.getByTestId('service-details-section');
        expect(serviceDetailsSection).toHaveAttribute('data-service-id', 'test-service-1');

        // Check action buttons props
        const actionButtons = screen.getByTestId('action-buttons');
        expect(actionButtons).toHaveAttribute('data-is-admin-panel', 'true');
    });

    describe('Navigation behavior', () => {
        it('navigates to correct URL when back button is clicked in normal mode', () => {
            renderWithRouter(
                <ServiceDetails
                    isPreview={false}
                    accessedDates={mockAccessedDates}
                    serviceDetails={mockServiceDetails}
                    isAdminPanel={false}
                />
            );

            fireEvent.click(screen.getByTestId('back-button'));
            expect(mockNavigateFunction).toHaveBeenCalledWith('/accessed-services');
        });

        it('navigates to correct URL when back button is clicked in preview mode', () => {
            renderWithRouter(
                <ServiceDetails
                    isPreview={true}
                    accessedDates={mockAccessedDates}
                    serviceDetails={mockServiceDetails}
                    isAdminPanel={false}
                />
            );

            fireEvent.click(screen.getByTestId('back-button'));
            expect(mockNavigateFunction).toHaveBeenCalledWith('/preview/accessed-services');
        });

        it('navigates to admin service page when back button is clicked in admin mode', () => {
            renderWithRouter(
                <ServiceDetails
                    isPreview={false}
                    accessedDates={mockAccessedDates}
                    serviceDetails={mockServiceDetails}
                    isAdminPanel={true}
                />
            );

            // Click the first back button (there are 2 when in admin mode)
            const backButtons = screen.getAllByTestId('back-button');
            fireEvent.click(backButtons[0]);
            expect(mockNavigateFunction).toHaveBeenCalledWith('/services/test-service-1');
        });

        it('handles back action from ActionButtons component', () => {
            renderWithRouter(
                <ServiceDetails
                    isPreview={false}
                    accessedDates={mockAccessedDates}
                    serviceDetails={mockServiceDetails}
                    isAdminPanel={false}
                />
            );

            fireEvent.click(screen.getByTestId('action-back-button'));
            expect(mockNavigateFunction).toHaveBeenCalledWith('/accessed-services');
        });
    });

    describe('Admin panel behavior', () => {
        it('shows correct back button text for admin panel', () => {
            renderWithRouter(
                <ServiceDetails
                    isPreview={false}
                    accessedDates={mockAccessedDates}
                    serviceDetails={mockServiceDetails}
                    isAdminPanel={true}
                />
            );

            // In admin mode, both back buttons should have the same text
            const backButtons = screen.getAllByTestId('back-button');
            expect(backButtons[0]).toHaveTextContent('Back to edit service');
        });

        it('shows correct back button text for non-admin panel', () => {
            renderWithRouter(
                <ServiceDetails
                    isPreview={false}
                    accessedDates={mockAccessedDates}
                    serviceDetails={mockServiceDetails}
                    isAdminPanel={false}
                />
            );

            expect(screen.getByTestId('back-button')).toHaveTextContent('Back to services accessed');
        });

        it('shows additional back button when in admin panel', () => {
            renderWithRouter(
                <ServiceDetails
                    isPreview={false}
                    accessedDates={mockAccessedDates}
                    serviceDetails={mockServiceDetails}
                    isAdminPanel={true}
                />
            );

            const backButtons = screen.getAllByTestId('back-button');
            expect(backButtons).toHaveLength(2);
            expect(backButtons[1]).toHaveTextContent('Back to edit service');
        });
    });

    describe('Edge cases', () => {
        it('handles missing description gracefully', () => {
            const serviceWithoutDescription = { ...mockServiceDetails, description: undefined };

            renderWithRouter(
                <ServiceDetails
                    isPreview={false}
                    accessedDates={mockAccessedDates}
                    serviceDetails={serviceWithoutDescription}
                    isAdminPanel={false}
                />
            );

            const descriptionElement = document.querySelector('.service-description');
            expect(descriptionElement).toHaveProperty('innerHTML', '');
        });

        it('handles empty accessed dates array', () => {
            renderWithRouter(
                <ServiceDetails
                    isPreview={false}
                    accessedDates={[]}
                    serviceDetails={mockServiceDetails}
                    isAdminPanel={false}
                />
            );

            expect(screen.getByTestId('access-history-table')).toHaveTextContent('Access History (0 entries)');
        });

        it('handles missing category and data owner text', () => {
            const serviceWithMissingText = {
                ...mockServiceDetails,
                categoryText: undefined,
                dataOwnerText: undefined,
            };

            renderWithRouter(
                <ServiceDetails
                    isPreview={false}
                    accessedDates={mockAccessedDates}
                    serviceDetails={serviceWithMissingText}
                    isAdminPanel={false}
                />
            );

            const categoryProperty = screen.getByTestId('service-property');
            expect(categoryProperty).toHaveAttribute('data-value', '');

            const ministryProperty = screen.getByTestId('service-propery-ministry');
            expect(ministryProperty).toHaveAttribute('data-value', '');
        });
    });
});
