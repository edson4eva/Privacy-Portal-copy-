import {
    AccessedServiceDetails,
    AccessedServiceDetailsDesktop,
    AccessedServiceDetailsMobile,
} from '../support/accessed-service-details.po';

describe('UI Element Visibility Tests', () => {
    const baseHref = Cypress.env('NX_PUBLIC_BASE_HREF');
    const accessedServiceDetails = new AccessedServiceDetails();

    beforeEach(() => {
        cy.interceptAuth(true, 'verified');
        cy.interceptAccessedServiceDetails('child-care-subsidy');
    });

    it('should display all essential page elements for Desktop', () => {
        cy.viewport(1920, 1080);
        cy.visit(`${baseHref}accessed-services/child-care-subsidy`);
        cy.wait('@getAuthStatus');
        cy.wait('@getAccessedServiceDetails');

        accessedServiceDetails.assertTopBackButtonDesktop();
        accessedServiceDetails.assertServiceName();
        accessedServiceDetails.assertAccessLogHeading();
        accessedServiceDetails.assertAccessLogTableDesktop();
        accessedServiceDetails.assertBackToAccountHistoryButton();
    });

    it('should display all essential page elements for Mobile', () => {
        cy.viewport('iphone-x');
        cy.visit(`${baseHref}accessed-services/child-care-subsidy`);
        cy.wait('@getAuthStatus');
        cy.wait('@getAccessedServiceDetails');

        accessedServiceDetails.assertTopBackButtonMobile();
        accessedServiceDetails.assertServiceName();
        accessedServiceDetails.assertAccessLogHeading();
        accessedServiceDetails.assertAccessLogTableMobile();
        accessedServiceDetails.assertBackToAccountHistoryButton();
    });
});

describe('Page Layout, Font, Line Height and Spacing Tests', () => {
    const baseHref = Cypress.env('NX_PUBLIC_BASE_HREF');
    beforeEach(() => {
        cy.interceptAuth(true, 'verified');
        cy.interceptAccessedServiceDetails('child-care-subsidy');
    });
    describe('Desktop View', () => {
        const accessedServiceDetailsDesktop = new AccessedServiceDetailsDesktop();
        beforeEach(() => {
            cy.viewport(1920, 1080);
            cy.visit(`${baseHref}accessed-services/child-care-subsidy`);
            cy.wait('@getAccessedServiceDetails');
            cy.wait(100);
        });

        it('should have correct layout and font properties for top Back to account history button', () => {
            accessedServiceDetailsDesktop.assertTopBackToAccountHistoryButtonLayout();
        });

        it('should have correct layout and font properties for page title', () => {
            accessedServiceDetailsDesktop.assertPageTitleLayout();
        });

        it('should have correct layout and font properties for log heading', () => {
            accessedServiceDetailsDesktop.assertLogHeadingLayout();
        });

        it('should have correct layout and font properties for log description', () => {
            accessedServiceDetailsDesktop.assertLogDescriptionLayout();
        });

        it('should have correct layout for log table', () => {
            accessedServiceDetailsDesktop.assertLogTableLayout();
        });

        /* this needs to be rewritten as accordion are dynamic content now
        it('should have correct layout for accordion', () => {
            accessedServiceDetailsDesktop.assertAccordionLayout();
        });

        it('should have correct layout for buttons', () => {
            accessedServiceDetailsDesktop.assertButtonLayout();
        });*/

        it('should have correct bottom spacing', () => {
            accessedServiceDetailsDesktop.assertBottomSpacing();
        });
    });
    describe('Mobile View', () => {
        const accessedServiceDetailsMobile = new AccessedServiceDetailsMobile();
        beforeEach(() => {
            cy.viewport('iphone-x');
            cy.visit(`${baseHref}accessed-services/child-care-subsidy`);
            cy.wait('@getAccessedServiceDetails');
            cy.wait(100);
        });

        it('should have correct layout and font properties for top Back to account history button', () => {
            accessedServiceDetailsMobile.assertTopBackToAccountHistoryButtonLayout();
        });

        it('should have correct layout and font properties for page title', () => {
            accessedServiceDetailsMobile.assertPageTitleLayout();
        });

        it('should have correct layout and font properties for log heading', () => {
            accessedServiceDetailsMobile.assertLogHeadingLayout();
        });

        it('should have correct layout and font properties for log description', () => {
            accessedServiceDetailsMobile.assertLogDescriptionLayout();
        });

        it('should have correct layout for log table', () => {
            accessedServiceDetailsMobile.assertLogTableLayout();
        });

        /*
        it('should have correct layout for accordion', () => {
            accessedServiceDetailsMobile.assertAccordionLayout();
        });

        it('should have correct layout for buttons', () => {
            accessedServiceDetailsMobile.assertButtonLayout();
        });*/

        it('should have correct bottom spacing', () => {
            accessedServiceDetailsMobile.assertBottomSpacing();
        });
    });
});

describe('Functionality Tests', () => {
    const baseHref = Cypress.env('NX_PUBLIC_BASE_HREF');
    beforeEach(() => {
        cy.interceptAuth(true, 'verified');
        cy.interceptAccessedServiceDetails('child-care-subsidy');
        cy.visit(`${baseHref}accessed-services/child-care-subsidy`);
        cy.wait('@getAuthStatus');
        cy.wait('@getAccessedServiceDetails');
        cy.wait(100);
    });

    it('should allow to open only one accordion at a time', () => {
        cy.get('goa-accordion').as('accordionItems');
        cy.get('@accordionItems').eq(0).click();
        cy.get('@accordionItems').eq(0).shadow().find('details').should('have.attr', 'open');
        cy.get('@accordionItems').eq(1).click();
        cy.get('@accordionItems').eq(1).shadow().find('details').should('have.attr', 'open');
        cy.get('@accordionItems').eq(0).shadow().find('details').should('not.have.attr', 'open');
    });

    it('should have correct icon when open/close accordion', () => {
        cy.get('goa-accordion').eq(0).click();
        cy.get('goa-accordion').eq(0).shadow().find('details').should('have.attr', 'open');
        cy.get('goa-accordion').eq(0)
            .shadow()
            .find('details summary goa-icon')
            .should('have.css', 'transform', 'matrix(-1, 0, 0, -1, 0, 0)');
        cy.get('goa-accordion').eq(0).shadow().find('details summary').click();
        cy.get('goa-accordion').eq(0).shadow().find('details').should('not.have.attr', 'open');
        cy.get('goa-accordion').eq(0)
            .shadow()
            .find('details summary goa-icon')
            .shadow()
            .find('ion-icon')
            .shadow()
            .find('title')
            .should('have.text', 'Chevron Down');
        cy.get('goa-accordion').eq(0)
            .shadow()
            .find('details summary goa-icon')
            .should('not.have.css', 'transform', 'matrix(-1, 0, 0, -1, 0, 0)');
    });

    it('should go back to account history when clicking on the top back button - Desktop', () => {
        cy.interceptAccessedServices(true);
        cy.get('[data-testid="non-mobile-back-button"] goa-button').shadow().find('[data-testid="non-mobile-back-button-btn"]').click({ force: true });
        cy.url().should('match', /\/accessed-services$/);
    });

    it('should go back to account history when clicking on the top back button - Mobile', () => {
        cy.viewport('iphone-x');
        cy.interceptAccessedServices(true);
        cy.get('[data-testid="mobile-back-button"]').click();
        cy.url().should('match', /\/accessed-services$/);
    });

    it('should go back to account history when clicking on the bottom back button', () => {
        cy.interceptAccessedServices(true);
        cy.get('[data-testid="button-container"] goa-button').eq(0).shadow().find('[data-testid="btn-back-to-account-history"]').click({ force: true });
        cy.url().should('match', /\/accessed-services$/);
    });
});
