import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AccessedServiceDetails from './AccessedServiceDetails';
import { AccessedServiceDetailsModel } from 'shared/src/lib/accessed-service-details/types/AccessedServiceDetailsModel';
import { ServiceDetailModel } from 'shared/src/lib/accessed-service-details/types/ServiceDetailModel';

// Mock the API service
jest.mock('shared/src/lib/api/dataService', () => ({
    get: jest.fn(),
}));

// Mock the formatDate utility
jest.mock('shared/src/lib/utils/dateUtils', () => ({
    formatDate: jest.fn((date: Date) => date.toLocaleDateString()),
}));

// Mock the ServiceDetails component - simplified to just check if it receives correct props
jest.mock('shared/src/lib/accessed-service-details/ServiceDetails', () => {
    return jest.fn(() => {
        return <div data-testid="service-details">Service Details Component</div>;
    });
});

const mockGet = jest.requireMock('shared/src/lib/api/dataService').get;
const mockFormatDate = jest.requireMock('shared/src/lib/utils/dateUtils').formatDate;
const MockServiceDetails = jest.requireMock('shared/src/lib/accessed-service-details/ServiceDetails');

// Helper function to render component with router
const renderWithRouter = (
    ui: React.ReactElement, 
    route = '/accessed-services/service-1'
) => {
    return render(
        <MemoryRouter initialEntries={[route]}>
            <Routes>
                <Route path="/accessed-services/:service" element={ui} />
                <Route path="/preview/accessed-services/:service" element={ui} />
            </Routes>
        </MemoryRouter>
    );
};

// Test constants
const ENDPOINTS = {
    NORMAL: '/v1/accessed-services/service-1',
    PREVIEW: '/v1/preview/accessed-services/service-1',
    DIFFERENT_SERVICE: '/v1/accessed-services/different-service-id',
};

// Mock data - simplified to only essential properties
const mockServiceDetails: ServiceDetailModel = {
    id: 'service-1',
    serviceName: 'Health Records',
    description: 'Access your health records and medical history',
    isAvailable: true,
    showMockInDev: false,
};

const mockAccessedDates = [
    new Date('2024-01-15T10:30:00Z'),
    new Date('2024-01-14T14:45:00Z'),
    new Date('2024-01-13T09:15:00Z'),
];

const mockApiResponse: { accessedServiceDetails: AccessedServiceDetailsModel } = {
    accessedServiceDetails: {
        serviceDetails: mockServiceDetails,
        accessedDates: mockAccessedDates,
    },
};

describe('AccessedServiceDetails', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFormatDate.mockImplementation((date: Date) => date.toLocaleDateString());
        MockServiceDetails.mockClear();
    });

    it('renders ServiceDetails with correct props when data is loaded', async () => {
        mockGet.mockResolvedValue(mockApiResponse);

        renderWithRouter(<AccessedServiceDetails isPreview={false} />);

        await waitFor(() => {
            expect(screen.getByTestId('service-details')).toBeInTheDocument();
        });
        
        expect(MockServiceDetails).toHaveBeenCalledWith(
            expect.objectContaining({
                isPreview: false,
                isAdminPanel: false,
                serviceDetails: mockServiceDetails,
                accessedDates: expect.any(Array),
            }),
            undefined
        );
    });

    it('fetches data from correct endpoint for normal mode', async () => {
        mockGet.mockResolvedValue(mockApiResponse);

        renderWithRouter(<AccessedServiceDetails isPreview={false} />);

        await waitFor(() => {
            expect(mockGet).toHaveBeenCalledWith(ENDPOINTS.NORMAL);
        });
    });

    it('fetches data from correct endpoint for preview mode', async () => {
        mockGet.mockResolvedValue(mockApiResponse);

        renderWithRouter(<AccessedServiceDetails isPreview={true} />);

        await waitFor(() => {
            expect(mockGet).toHaveBeenCalledWith(ENDPOINTS.PREVIEW);
        });
    });

    it('passes preview mode to ServiceDetails', async () => {
        mockGet.mockResolvedValue(mockApiResponse);

        renderWithRouter(<AccessedServiceDetails isPreview={true} />);

        await waitFor(() => {
            expect(MockServiceDetails).toHaveBeenCalledWith(
                expect.objectContaining({
                    isPreview: true,
                    isAdminPanel: false,
                }),
                undefined
            );
        });
    });

    it('formats accessed dates before passing to ServiceDetails', async () => {
        mockGet.mockResolvedValue(mockApiResponse);

        renderWithRouter(<AccessedServiceDetails isPreview={false} />);

        await waitFor(() => {
            expect(mockFormatDate).toHaveBeenCalledTimes(3);
        });
    });

    it('handles missing accessed dates gracefully', async () => {
        mockGet.mockResolvedValue({
            accessedServiceDetails: {
                serviceDetails: mockServiceDetails,
                accessedDates: undefined,
            },
        });

        renderWithRouter(<AccessedServiceDetails isPreview={false} />);

        await waitFor(() => {
            expect(MockServiceDetails).toHaveBeenCalledWith(
                expect.objectContaining({
                    accessedDates: [],
                }),
                undefined
            );
        });
    });

    it('handles empty accessed dates array', async () => {
        mockGet.mockResolvedValue({
            accessedServiceDetails: {
                serviceDetails: mockServiceDetails,
                accessedDates: [],
            },
        });

        renderWithRouter(<AccessedServiceDetails isPreview={false} />);

        await waitFor(() => {
            expect(MockServiceDetails).toHaveBeenCalledWith(
                expect.objectContaining({
                    accessedDates: [],
                }),
                undefined
            );
        });
    });

    it('does not render ServiceDetails when service details are missing', async () => {
        mockGet.mockResolvedValue({
            accessedServiceDetails: {
                serviceDetails: undefined,
                accessedDates: mockAccessedDates,
            },
        });

        renderWithRouter(<AccessedServiceDetails isPreview={false} />);

        await waitFor(() => {
            expect(mockGet).toHaveBeenCalled();
        });

        expect(screen.queryByTestId('service-details')).not.toBeInTheDocument();
        expect(MockServiceDetails).not.toHaveBeenCalled();
    });

    it('handles different service IDs from URL params', async () => {
        mockGet.mockResolvedValue(mockApiResponse);

        renderWithRouter(<AccessedServiceDetails isPreview={false} />, '/accessed-services/different-service-id');

        await waitFor(() => {
            expect(mockGet).toHaveBeenCalledWith(ENDPOINTS.DIFFERENT_SERVICE);
        });
    });
});
