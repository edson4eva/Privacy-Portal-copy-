import { AccountHistoryShared, AccountHistorySharedDesktop, AccountHistorySharedMobile } from '../support/app.po';
import { LandingPage, LandingPageDesktop, LandingPageMobile } from '../support/landing-page.po';

describe('UI Element Visibility Tests', () => {
    const baseHref = Cypress.env('NX_PUBLIC_BASE_HREF');
    const landingPage = new LandingPage();
    const accountHistoryShared = new AccountHistoryShared();

    beforeEach(() => {
        cy.interceptAuth(true, 'basic');
    });

    it('should display all essential landing page elements for Desktop', () => {
        cy.viewport(1920, 1080);
        cy.visit(baseHref);
        accountHistoryShared.assertPageTitle();
        accountHistoryShared.assertPageHeading('Verify your account to view services accessed');
        landingPage.assertAccountVerificationAlert();
        landingPage.assertAbilityListHeading('After verifying your Alberta.ca Account, you will be able to view:');
        landingPage.assertAbilityList();
        landingPage.assertIllustration();
        landingPage.assertBackToPersonalInfoButton();
        landingPage.assertVerifyMyAccountButton();
    });

    it('should display all essential landing page elements for Mobile', () => {
        cy.viewport('iphone-x');
        cy.visit(baseHref);
        accountHistoryShared.assertPageTitle();
        accountHistoryShared.assertPageHeading('Verify your account to view services accessed');
        landingPage.assertAccountVerificationAlert();
        landingPage.assertAbilityListHeading('After verifying your Alberta.ca Account, you will be able to view:');
        landingPage.assertAbilityList();
        landingPage.assertIllustration();
        landingPage.assertBackToPersonalInfoButton();
        landingPage.assertVerifyMyAccountButton();
    });
});

describe('Page Layout, Font, Line Height and Spacing Tests', () => {
    const baseHref = Cypress.env('NX_PUBLIC_BASE_HREF');
    beforeEach(() => {
        cy.interceptAuth(true, 'basic');
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

        it('should have correct layout and font properties for verify account alert', () => {
            accountHistorySharedDesktop.assertAlertLayout('alert-section');
        });

        it('should have correct layout and font properties for ability list heading', () => {
            landingPage.assertAbilityListHeadingLayout('alert-section');
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
            cy.get('[data-testid="button-container"]')
                .should('have.css', 'display', 'flex')
                .should('have.css', 'flex-direction', 'row')
                .should('have.css', 'column-gap', '16px');
            landingPage.assertBtnBackToPersonalInfoStyle();
            landingPage.assertBtnVerifyMyAccountStyle();
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

        it('should have correct layout and font properties for verify account alert', () => {
            accountHistorySharedMobile.assertAlertLayout('alert-section');
        });

        it('should have correct layout and font properties for ability list heading', () => {
            landingPage.assertAbilityListHeadingLayout('alert-section');
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
            cy.get('[data-testid="button-container"]')
                .should('have.css', 'display', 'flex')
                .should('have.css', 'flex-direction', 'column')
                .should('have.css', 'row-gap', '16px');
            landingPage.assertBtnBackToPersonalInfoStyle();
            landingPage.assertBtnVerifyMyAccountStyle();
        });

        it('should have correct bottom spacing', () => {
            landingPage.assertBottomSpacing();
        });
    });
});
