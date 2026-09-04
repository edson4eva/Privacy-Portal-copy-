import { AccountHistoryShared, AccountHistorySharedDesktop, AccountHistorySharedMobile } from '../support/app.po';
import { LandingPage, LandingPageDesktop, LandingPageMobile } from '../support/landing-page.po';

describe('UI Element Visibility Tests', () => {
    const baseHref = Cypress.env('NX_PUBLIC_BASE_HREF');
    const landingPage = new LandingPage();
    const accountHistoryShared = new AccountHistoryShared();

    beforeEach(() => {
        cy.interceptAuth(true, 'verified');
        cy.interceptAccessedServices(true);
    });

    it('should display all essential landing page elements for Desktop', () => {
        cy.viewport(1920, 1080);
        cy.visit(baseHref);
        accountHistoryShared.assertPageTitle();
        accountHistoryShared.assertPageHeading('Digital services accessed online');
        landingPage.assertAbilityListHeading(
            'View details about the digital services you have accessed through your Alberta.ca Account including:'
        );
        landingPage.assertAbilityList();
        landingPage.assertIllustration();
        landingPage.assertViewServicesButton();
    });

    it('should display all essential landing page elements for Mobile', () => {
        cy.viewport('iphone-x');
        cy.visit(baseHref);
        accountHistoryShared.assertPageTitle();
        accountHistoryShared.assertPageHeading('Digital services accessed online');
        landingPage.assertAbilityListHeading(
            'View details about the digital services you have accessed through your Alberta.ca Account including:'
        );
        landingPage.assertAbilityList();
        landingPage.assertIllustration();
        landingPage.assertViewServicesButton();
    });
});

describe('Page Layout, Font, Line Height and Spacing Tests', () => {
    const baseHref = Cypress.env('NX_PUBLIC_BASE_HREF');
    beforeEach(() => {
        cy.interceptAuth(true, 'verified');
        cy.interceptAccessedServices(true);
    });

    describe('Desktop View', () => {
        const landingPage = new LandingPageDesktop();
        const accountHistoryShared = new AccountHistoryShared();
        const accountHistorySharedDesktop = new AccountHistorySharedDesktop();
        beforeEach(() => {
            cy.viewport(1920, 1080);
            cy.visit(baseHref);
        });

        it('should have correct layout and font properties for page title', () => {
            accountHistorySharedDesktop.assertPageTitleLayout();
        });

        it('should have correct layout and font properties for page heading', () => {
            accountHistorySharedDesktop.assertPageHeadingLayout();
        });

        it('should have correct layout and font properties for after ability list heading', () => {
            landingPage.assertAbilityListHeadingLayout('page-heading');
        });

        it('should have correct layout and font properties for ability list', () => {
            landingPage.assertAbilityListLayout();
        });

        it('should have correct layout for illustration', () => {
            landingPage.assertIllustrationStyle();
        });

        it('should have correct layout for buttons', () => {
            accountHistoryShared.assertTopGapCloseTo(
                '[data-testid="landing-page-img"] img',
                '[data-testid="button-container"]',
                54
            );
            landingPage.assertBtnViewServicesStyle();
        });

        it('should have correct bottom spacing', () => {
            landingPage.assertBottomSpacing();
        });
    });

    describe('Mobile View', () => {
        const landingPage = new LandingPageMobile();
        const accountHistoryShared = new AccountHistoryShared();
        const accountHistorySharedMobile = new AccountHistorySharedMobile();
        beforeEach(() => {
            cy.viewport('iphone-x');
            cy.visit(baseHref);
        });

        it('should have correct layout and font properties for page title', () => {
            accountHistorySharedMobile.assertPageTitleLayout();
        });

        it('should have correct layout and font properties for page heading', () => {
            accountHistorySharedMobile.assertPageHeadingLayout();
        });

        it('should have correct layout and font properties for after ability list heading', () => {
            landingPage.assertAbilityListHeadingLayout('page-heading');
        });

        it('should have correct layout and font properties for ability list', () => {
            landingPage.assertAbilityListLayout();
        });

        it('should have correct layout for illustration', () => {
            landingPage.assertIllustrationStyle();
        });

        it('should have correct layout for buttons', () => {
            accountHistoryShared.assertTopGap(
                '[data-testid="landing-page-img"] img',
                '[data-testid="button-container"]',
                32
            );
            landingPage.assertBtnViewServicesStyle();
        });

        it('should have correct bottom spacing', () => {
            landingPage.assertBottomSpacing();
        });
    });
});

describe('Functionality Tests', () => {
    const baseHref = Cypress.env('NX_PUBLIC_BASE_HREF');
    beforeEach(() => {
        cy.interceptAuth(true, 'verified');
        cy.interceptAccessedServices(true);
        cy.visit(baseHref);
        cy.wait('@getAuthStatus');
        cy.wait('@getAccessedServices');
    });

    it('should go to accessed-services page when clicking View services button', () => {
        cy.get('[data-testid="button-container"]')
            .find('goa-button')
            .eq(0)
            .shadow()
            .find('[data-testid="btn-view-services"]')
            .should('be.visible');
        cy.get('[data-testid="button-container"]')
            .find('goa-button')
            .eq(0)
            .shadow()
            .find('[data-testid="btn-view-services"]')
            .click({ force: true });
        cy.url().should('include', '/accessed-services');
    });
});
