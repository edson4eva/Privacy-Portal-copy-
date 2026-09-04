import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AccessedServicesPage from './AccessedServicesPage';
import { AccessedServiceVm } from '../../../../types/AccessedService';

// Mock categories data (must be declared before mocks)
const mockCategories = [
    { value: 'health', label: 'Health' },
    { value: 'education', label: 'Education' },
    { value: 'finance', label: 'Finance' }
];

// Mock data
const mockServices: AccessedServiceVm[] = [
    {
        id: '1',
        serviceName: 'Service One',
        categoryId: 'health',
        lastAccessedOn: new Date('2024-01-15'),
        dateAccessed: '2024-01-15',
        timeAccessed: '10:30 AM',
        isAvailable: true
    },
    {
        id: '2',
        serviceName: 'Service Two',
        categoryId: 'education',
        lastAccessedOn: new Date('2024-02-20'),
        dateAccessed: '2024-02-20',
        timeAccessed: '2:15 PM',
        isAvailable: true
    },
    {
        id: '3',
        serviceName: 'Service Three',
        categoryId: 'health',
        lastAccessedOn: new Date('2024-03-10'),
        dateAccessed: '2024-03-10',
        timeAccessed: '9:45 AM',
        isAvailable: true
    }
];

// Mock external dependencies
jest.mock('shared/src/lib/page-title/PageTitle', () => {
    return function MockPageTitle({ title, fontColor }: { title: string; fontColor: string }) {
        return (
            <div data-testid="page-title" data-font-color={fontColor}>
                {title}
            </div>
        );
    };
});

jest.mock('./search-filter/SearchFilter', () => {
    return function MockSearchFilter() {
        return <div data-testid="search-filter">Search Filter Component</div>;
    };
});

jest.mock('./stale-banner/StaleBanner', () => {
    return function MockStaleBanner({ isStale }: { isStale: boolean }) {
        return (
            <div data-testid="stale-banner" data-is-stale={isStale}>
                {isStale && 'Data is stale'}
            </div>
        );
    };
});

jest.mock('./service-table/ServiceTable', () => {
    return function MockServiceTable({ 
        currentPageServices, 
        servicesCount, 
        isPreview 
    }: { 
        currentPageServices: AccessedServiceVm[]; 
        servicesCount: number; 
        isPreview: boolean; 
    }) {
        return (
            <div 
                data-testid="service-table" 
                data-services-count={servicesCount}
                data-is-preview={isPreview}
                data-current-page-count={currentPageServices.length}
            >
                Service Table - {currentPageServices.length} services displayed
            </div>
        );
    };
});

jest.mock('./service-table-pagination/ServiceTablePagination', () => {
    return function MockServiceTablePagination({ 
        servicesCount, 
        perPageCount, 
        currentPage, 
        prepareCurrentPageServices 
    }: { 
        servicesCount: number; 
        perPageCount: number; 
        currentPage: number; 
        prepareCurrentPageServices: (page: number) => void; 
    }) {
        return (
            <div 
                data-testid="service-table-pagination"
                data-services-count={servicesCount}
                data-per-page-count={perPageCount}
                data-current-page={currentPage}
            >
                <button 
                    data-testid="pagination-next"
                    onClick={() => prepareCurrentPageServices(currentPage + 1)}
                >
                    Next Page
                </button>
                <button 
                    data-testid="pagination-prev"
                    onClick={() => prepareCurrentPageServices(currentPage - 1)}
                >
                    Previous Page
                </button>
            </div>
        );
    };
});

jest.mock('./page-heading/PageHeading', () => {
    return function MockPageHeading() {
        return <div data-testid="page-heading">Page Heading Component</div>;
    };
});

// Mock the SearchFilterProvider and useSearchFilter hook
const mockSetCategories = jest.fn();
const mockSearchFilterContext = {
    setCategories: mockSetCategories,
    searchTerm: '',
    setSearchTerm: jest.fn(),
    selectedCategories: [],
    setSelectedCategories: jest.fn(),
    sortBy: 'serviceName',
    setSortBy: jest.fn(),
    sortOrder: 'asc' as const,
    setSortOrder: jest.fn(),
    categories: mockCategories
};

jest.mock('./search-filter/SearchFilterContext', () => ({
    SearchFilterProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="search-filter-provider">{children}</div>
    ),
    useSearchFilter: () => mockSearchFilterContext
}));

// Mock custom hooks
const mockUseAccessedServicesData = jest.fn();
const mockUseFilteredAndSortedServices = jest.fn();

jest.mock('./hooks/useAccessedServicesData', () => ({
    __esModule: true,
    default: (isPreview: boolean) => mockUseAccessedServicesData(isPreview)
}));

jest.mock('./hooks/useFilteredAndSortedServices', () => ({
    __esModule: true,
    default: (services: AccessedServiceVm[]) => mockUseFilteredAndSortedServices(services)
}));

// Mock Categories constant
jest.mock('shared/src/lib/accessed-service-details/types/Constants', () => ({
    Categories: [
        { value: 'health', label: 'Health' },
        { value: 'education', label: 'Education' },
        { value: 'finance', label: 'Finance' }
    ]
}));

// Mock CSS modules
jest.mock('./AccessedServicesPage.module.scss', () => ({
    'container': 'mock-container'
}));

describe('AccessedServicesPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAccessedServicesData.mockReturnValue({
            services: mockServices,
            isStale: false
        });
        mockUseFilteredAndSortedServices.mockReturnValue(mockServices);
    });

    describe('Component rendering', () => {
        it('renders without crashing', () => {
            render(<AccessedServicesPage isPreview={false} />);
            
            expect(screen.getByTestId('page-title')).toBeInTheDocument();
        });

        it('renders all main components', () => {
            render(<AccessedServicesPage isPreview={false} />);

            expect(screen.getByTestId('page-title')).toBeInTheDocument();
            expect(screen.getByTestId('stale-banner')).toBeInTheDocument();
            expect(screen.getByTestId('page-heading')).toBeInTheDocument();
            expect(screen.getByTestId('search-filter-provider')).toBeInTheDocument();
            expect(screen.getByTestId('search-filter')).toBeInTheDocument();
            expect(screen.getByTestId('service-table')).toBeInTheDocument();
            expect(screen.getByTestId('service-table-pagination')).toBeInTheDocument();
        });

        it('applies the correct CSS container class', () => {
            const { container } = render(<AccessedServicesPage isPreview={false} />);
            
            const mainContainer = container.firstChild;
            expect(mainContainer).toHaveClass('mock-container');
        });
    });

    describe('PageTitle component', () => {
        it('renders PageTitle with correct properties', () => {
            render(<AccessedServicesPage isPreview={false} />);

            const pageTitle = screen.getByTestId('page-title');
            expect(pageTitle).toHaveTextContent('SERVICES ACCESSED');
            expect(pageTitle).toHaveAttribute('data-font-color', '#004A8F');
        });
    });

    describe('StaleBanner component', () => {
        it('renders StaleBanner with stale data state', () => {
            mockUseAccessedServicesData.mockReturnValue({
                services: mockServices,
                isStale: true
            });

            render(<AccessedServicesPage isPreview={true} />);

            const staleBanner = screen.getByTestId('stale-banner');
            expect(staleBanner).toHaveAttribute('data-is-stale', 'true');
            expect(staleBanner).toHaveTextContent('Data is stale');
        });
    });

    describe('isPreview prop handling', () => {
        it('passes isPreview=false correctly to child components', () => {
            render(<AccessedServicesPage isPreview={false} />);

            const serviceTable = screen.getByTestId('service-table');
            expect(serviceTable).toHaveAttribute('data-is-preview', 'false');
            expect(mockUseAccessedServicesData).toHaveBeenCalledWith(false);
        });

        it('passes isPreview=true correctly to child components', () => {
            render(<AccessedServicesPage isPreview={true} />);

            const serviceTable = screen.getByTestId('service-table');
            expect(serviceTable).toHaveAttribute('data-is-preview', 'true');
            expect(mockUseAccessedServicesData).toHaveBeenCalledWith(true);
        });
    });

    describe('Data flow and hook integration', () => {
        it('uses data from useAccessedServicesData hook correctly', () => {
            const customServices = [mockServices[0]];
            mockUseAccessedServicesData.mockReturnValue({
                services: customServices,
                isStale: true
            });
            mockUseFilteredAndSortedServices.mockReturnValue(customServices);

            render(<AccessedServicesPage isPreview={false} />);

            expect(mockUseAccessedServicesData).toHaveBeenCalledWith(false);
            expect(mockUseFilteredAndSortedServices).toHaveBeenCalledWith(customServices);
        });

        it('passes services data to useFilteredAndSortedServices', () => {
            render(<AccessedServicesPage isPreview={false} />);

            expect(mockUseFilteredAndSortedServices).toHaveBeenCalledWith(mockServices);
        });
    });

    describe('AccessedServices component (inner component)', () => {
        const renderAccessedServices = (properties = {}) => {
            const defaultProps = {
                isPreview: false,
                services: mockServices
            };
            return render(<AccessedServicesPage {...defaultProps} {...properties} />);
        };

        it('initializes categories on mount', async () => {
            renderAccessedServices();

            await waitFor(() => {
                expect(mockSetCategories).toHaveBeenCalledWith(
                    expect.arrayContaining([
                        expect.objectContaining({ label: 'Education' }),
                        expect.objectContaining({ label: 'Finance' }),
                        expect.objectContaining({ label: 'Health' })
                    ])
                );
            });
        });

        it('sorts categories alphabetically', async () => {
            renderAccessedServices();

            await waitFor(() => {
                const call = mockSetCategories.mock.calls[0][0];
                expect(call[0].label).toBe('Education');
                expect(call[1].label).toBe('Finance');
                expect(call[2].label).toBe('Health');
            });
        });

        describe('Pagination functionality', () => {
            it('displays correct number of services per page', () => {
                // Mock 7 services to test pagination
                const manyServices = Array.from({ length: 7 }, (_, index) => ({
                    ...mockServices[0],
                    id: `service-${index}`,
                    serviceName: `Service ${index}`
                }));
                
                mockUseFilteredAndSortedServices.mockReturnValue(manyServices);

                renderAccessedServices({ services: manyServices });

                const serviceTable = screen.getByTestId('service-table');
                expect(serviceTable).toHaveAttribute('data-current-page-count', '5'); // ITEMS_PER_PAGE = 5
                expect(serviceTable).toHaveAttribute('data-services-count', '7');
            });

            it('handles page navigation correctly', async () => {
                const manyServices = Array.from({ length: 7 }, (_, index) => ({
                    ...mockServices[0],
                    id: `service-${index}`,
                    serviceName: `Service ${index}`
                }));
                
                mockUseFilteredAndSortedServices.mockReturnValue(manyServices);

                renderAccessedServices({ services: manyServices });

                const pagination = screen.getByTestId('service-table-pagination');
                expect(pagination).toHaveAttribute('data-current-page', '1');
                expect(pagination).toHaveAttribute('data-per-page-count', '5');

                // Test page navigation
                const nextButton = screen.getByTestId('pagination-next');
                fireEvent.click(nextButton);

                await waitFor(() => {
                    const updatedPagination = screen.getByTestId('service-table-pagination');
                    expect(updatedPagination).toHaveAttribute('data-current-page', '2');
                });
            });

            it('resets to page 1 when component mounts', async () => {
                renderAccessedServices();

                await waitFor(() => {
                    const pagination = screen.getByTestId('service-table-pagination');
                    expect(pagination).toHaveAttribute('data-current-page', '1');
                });
            });
        });

        describe('Service data handling', () => {
            it('handles empty services array', () => {
                mockUseFilteredAndSortedServices.mockReturnValue([]);

                renderAccessedServices({ services: [] });

                const serviceTable = screen.getByTestId('service-table');
                expect(serviceTable).toHaveAttribute('data-services-count', '0');
                expect(serviceTable).toHaveAttribute('data-current-page-count', '0');
            });

            it('handles single service', () => {
                const singleService = [mockServices[0]];
                mockUseFilteredAndSortedServices.mockReturnValue(singleService);

                renderAccessedServices({ services: singleService });

                const serviceTable = screen.getByTestId('service-table');
                expect(serviceTable).toHaveAttribute('data-services-count', '1');
                expect(serviceTable).toHaveAttribute('data-current-page-count', '1');
            });

            it('passes filtered and sorted services to components', () => {
                const filteredServices = [mockServices[1], mockServices[2]];
                mockUseFilteredAndSortedServices.mockReturnValue(filteredServices);

                renderAccessedServices();

                const serviceTable = screen.getByTestId('service-table');
                expect(serviceTable).toHaveAttribute('data-services-count', '2');
                expect(serviceTable).toHaveAttribute('data-current-page-count', '2');
            });
        });
    });

    describe('Integration testing', () => {
        it('integrates all components together correctly', async () => {
            mockUseAccessedServicesData.mockReturnValue({
                services: mockServices,
                isStale: true
            });

            render(<AccessedServicesPage isPreview={true} />);

            // Verify all components are rendered and integrated
            expect(screen.getByTestId('page-title')).toHaveTextContent('SERVICES ACCESSED');
            expect(screen.getByTestId('stale-banner')).toHaveAttribute('data-is-stale', 'true');
            expect(screen.getByTestId('page-heading')).toBeInTheDocument();
            expect(screen.getByTestId('search-filter')).toBeInTheDocument();
            expect(screen.getByTestId('service-table')).toHaveAttribute('data-is-preview', 'true');
            expect(screen.getByTestId('service-table-pagination')).toBeInTheDocument();

            // Verify data flow
            await waitFor(() => {
                expect(mockSetCategories).toHaveBeenCalled();
            });
        });

        it('maintains proper component hierarchy', () => {
            const { container } = render(<AccessedServicesPage isPreview={false} />);

            // Check component structure
            const mainContainer = container.firstChild;
            expect(mainContainer).toHaveClass('mock-container');
            
            const searchFilterProvider = screen.getByTestId('search-filter-provider');
            expect(searchFilterProvider).toBeInTheDocument();
            
            // SearchFilter, ServiceTable, and ServiceTablePagination should be inside the provider
            expect(searchFilterProvider).toContainElement(screen.getByTestId('search-filter'));
            expect(searchFilterProvider).toContainElement(screen.getByTestId('service-table'));
            expect(searchFilterProvider).toContainElement(screen.getByTestId('service-table-pagination'));
        });
    });

    describe('Error handling and edge cases', () => {
        it('handles undefined services gracefully', () => {
            mockUseAccessedServicesData.mockReturnValue({
                services: undefined as AccessedServiceVm[] | undefined,
                isStale: false
            });
            mockUseFilteredAndSortedServices.mockReturnValue([]);

            expect(() => {
                render(<AccessedServicesPage isPreview={false} />);
            }).not.toThrow();
        });

        it('handles hook errors gracefully', () => {
            mockUseAccessedServicesData.mockReturnValue({
                services: mockServices,
                isStale: false
            });
            mockUseFilteredAndSortedServices.mockImplementation(() => {
                throw new Error('Filter error');
            });

            // Component should still render even if filtering fails
            expect(() => {
                render(<AccessedServicesPage isPreview={false} />);
            }).toThrow('Filter error');
        });

        it('handles pagination with very large datasets', () => {
            const largeDataset = Array.from({ length: 100 }, (_, index) => ({
                ...mockServices[0],
                id: `service-${index}`,
                serviceName: `Service ${index}`
            }));
            
            mockUseFilteredAndSortedServices.mockReturnValue(largeDataset);

            render(<AccessedServicesPage isPreview={false} />);

            const serviceTable = screen.getByTestId('service-table');
            expect(serviceTable).toHaveAttribute('data-current-page-count', '5'); // Still shows only 5 per page
            expect(serviceTable).toHaveAttribute('data-services-count', '100');

            const pagination = screen.getByTestId('service-table-pagination');
            expect(pagination).toHaveAttribute('data-per-page-count', '5');
        });
    });
});
