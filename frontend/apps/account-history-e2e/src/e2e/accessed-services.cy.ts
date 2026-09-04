import {
    AccessedServices,
    AccessedServicesDesktopLayout,
    AccessedServicesMobileLayout,
} from '../support/accessed-services.po';
import { AccountHistoryShared, AccountHistorySharedDesktop, AccountHistorySharedMobile } from '../support/app.po';

describe('UI Element Visibility Tests', () => {
    const baseHref = Cypress.env('NX_PUBLIC_BASE_HREF');
    const accountHistoryShared = new AccountHistoryShared();
    const accessedServices = new AccessedServices();

    beforeEach(() => {
        cy.interceptAuth(true, 'verified');
        cy.interceptAccessedServices(true);
    });

    it('should display all essential page elements for Desktop', () => {
        cy.viewport(1920, 1080);
        cy.visit(`${baseHref}accessed-services`);
        cy.wait('@getAuthStatus');
        cy.wait('@getAccessedServices');

        accountHistoryShared.assertPageTitle();
        accountHistoryShared.assertPageHeading('Digital services accessed online');
        accessedServices.assertPageSubHeading();
        accessedServices.assertServiceAccessedAvailabilityAlert();
        accessedServices.assertAccessedServicesTableDesktop();
        accessedServices.assertPagination();
    });

    it('should display all essential page elements for Mobile', () => {
        cy.viewport('iphone-x');
        cy.visit(`${baseHref}accessed-services`);
        cy.wait('@getAuthStatus');
        cy.wait('@getAccessedServices');

        accountHistoryShared.assertPageTitle();
        accountHistoryShared.assertPageHeading('Digital services accessed online');
        accessedServices.assertPageSubHeading();
        accessedServices.assertServiceAccessedAvailabilityAlert();
        accessedServices.assertAccessedServicesTableMobile();
        accessedServices.assertPagination();
    });
});

describe('Page Layout, Font, Line Height and Spacing Tests', () => {
    const baseHref = Cypress.env('NX_PUBLIC_BASE_HREF');
    beforeEach(() => {
        cy.interceptAuth(true, 'basic');
        cy.interceptAccessedServices(true);
    });
    describe('Desktop View', () => {
        const accountHistorySharedDesktop = new AccountHistorySharedDesktop();
        const accessedServicesDesktopLayout = new AccessedServicesDesktopLayout();
        beforeEach(() => {
            cy.viewport(1920, 1080);
            cy.visit(`${baseHref}accessed-services`);
        });

        it('should have correct layout and font properties for page title', () => {
            accountHistorySharedDesktop.assertPageTitleLayout();
        });

        it('should have correct layout and font properties for page heading', () => {
            accountHistorySharedDesktop.assertPageHeadingLayout();
        });

        it('should have correct layout and font properties for verify account alert', () => {
            accessedServicesDesktopLayout.assertAlertLayout();
        });
    });
    describe('Mobile View', () => {
        const accountHistorySharedMobile = new AccountHistorySharedMobile();
        const accessedServicesMobileLayout = new AccessedServicesMobileLayout();
        beforeEach(() => {
            cy.viewport('iphone-x');
            cy.visit(`${baseHref}accessed-services`);
        });

        it('should have correct layout and font properties for page title', () => {
            accountHistorySharedMobile.assertPageTitleLayout();
        });

        it('should have correct layout and font properties for page heading', () => {
            accountHistorySharedMobile.assertPageHeadingLayout();
        });

        it('should have correct layout and font properties for verify account alert', () => {
            accessedServicesMobileLayout.assertAlertLayout();
        });
    });
});

describe('Functionality Tests', () => {
    const baseHref = Cypress.env('NX_PUBLIC_BASE_HREF');
    beforeEach(() => {
        cy.interceptAuth(true, 'basic');
        cy.interceptAccessedServices(true);
        cy.visit(`${baseHref}accessed-services`);
        cy.wait('@getAuthStatus');
        cy.wait('@getAccessedServices');
    });

    it('should go to next page when clicking Next button', () => {
        cy.get('[data-testid="table-container"] table tbody tr:nth-child(5)').should('be.visible');
        cy.wait(1000);
        cy.get('[data-testid="pagination-container"] goa-pagination')
            .shadow()
            .find('[data-testid="page-links"] goa-button:nth-child(2)')
            .click({ force: true });
        cy.get('[data-testid="table-container"] goa-table table')
            .find('tbody tr:first td:visible')
            .eq(0)
            .should('have.text', 'Demo Service 2');
    });

    it('should go to previous page when clicking Previous button', () => {
        cy.get('[data-testid="table-container"] table tbody tr:nth-child(5)').should('be.visible');
        cy.wait(1000);
        cy.get('[data-testid="pagination-container"] goa-pagination')
            .shadow()
            .find('[data-testid="page-links"] goa-button:nth-child(2)')
            .click({ force: true });
        cy.get('[data-testid="table-container"] goa-table table')
            .find('tbody tr:first td:visible')
            .eq(0)
            .should('have.text', 'Demo Service 2');
        cy.get('[data-testid="pagination-container"] goa-pagination')
            .shadow()
            .find('[data-testid="page-links"] goa-button:nth-child(1)')
            .click({ force: true });
        cy.get('[data-testid="table-container"] goa-table table')
            .find('tbody tr:first td:visible')
            .eq(0)
            .should('have.text', 'Child Care Subsidy');
    });

    it('should go to second page when selecting 2 in the pagination dropdown', () => {
        cy.get('[data-testid="table-container"] table tbody tr:nth-child(5)').should('be.visible');
        cy.wait(1000);
        cy.get('[data-testid="pagination-container"] goa-pagination')
            .shadow()
            .find('goa-dropdown')
            .trigger('_change', { force: true, detail: { value: 2 } });
        cy.get('[data-testid="table-container"] goa-table table')
            .find('tbody tr:first td:visible')
            .eq(0)
            .should('have.text', 'Demo Service 2');
    });

    it('should go to first page when selecting 1 in the pagination dropdown', () => {
        cy.get('[data-testid="table-container"] table tbody tr:nth-child(5)').should('be.visible');
        cy.wait(1000);
        cy.get('[data-testid="pagination-container"] goa-pagination')
            .shadow()
            .find('goa-dropdown')
            .trigger('_change', { force: true, detail: { value: 2 } });
        cy.get('[data-testid="table-container"] goa-table table')
            .find('tbody tr:first td:visible')
            .eq(0)
            .should('have.text', 'Demo Service 2');
        cy.get('[data-testid="pagination-container"] goa-pagination')
            .shadow()
            .find('goa-dropdown')
            .trigger('_change', { force: true, detail: { value: 1 } });
        cy.get('[data-testid="table-container"] goa-table table')
            .find('tbody tr:first td:visible')
            .eq(0)
            .should('have.text', 'Child Care Subsidy');
    });

    it('should go to child-care-subsidy page when clicking on the corresponding View button', () => {
        cy.interceptAccessedServiceDetails('child-care-subsidy');
        cy.get('[data-testid="table-container"] [data-testid="view-child-care-subsidy"]').should('be.visible');
        cy.wait(1000);
        cy.get('[data-testid="table-container"] [data-testid="view-child-care-subsidy"]').click();
        cy.wait('@getAccessedServiceDetails');
        cy.url().should('include', '/accessed-services/child-care-subsidy');
    });
});
