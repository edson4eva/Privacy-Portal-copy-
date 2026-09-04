import { AccountHistoryShared, AccountHistorySharedDesktop, AccountHistorySharedMobile } from './app.po';

export class LandingPage {
    assertAccountVerificationAlert() {
        cy.get('[data-testid="alert-section"]').as('verifiedAlert');

        cy.get('@verifiedAlert').should('exist').and('be.visible');

        cy.get('@verifiedAlert').find('goa-icon').shadow().find('div[role="img"]').and('be.visible');

        cy.get('@verifiedAlert')
            .find('div')
            .eq(1)
            .and(
                'have.text',
                'Protecting your personal information is our top priority, and we cannot share any details without verifying your identity.'
            )
            .and('be.visible');
    }

    assertAbilityListHeading(text: string) {
        cy.get('[data-testid="ability-list-heading"]').as('abilityListHeading');

        cy.get('@abilityListHeading').should('exist').and('be.visible').and('have.text', text);
    }

    assertAbilityList() {
        cy.get('[data-testid="ability-list"]').as('abilityList');

        cy.get('@abilityList')
            .should('exist')
            .and('be.visible')
            .find('li')
            .eq(0)
            .and('have.text', 'When you accessed the digital services')
            .and('be.visible');

        cy.get('@abilityList')
            .should('exist')
            .and('be.visible')
            .find('li')
            .eq(1)
            .and('have.text', 'What personal information is maintained')
            .and('be.visible');

        cy.get('@abilityList')
            .should('exist')
            .and('be.visible')
            .find('li')
            .eq(2)
            .and('have.text', 'How your information is used')
            .and('be.visible');
    }

    assertIllustration() {
        cy.get('[data-testid="landing-page-img"]').as('landingPageImg');

        cy.get('@landingPageImg')
            .find('img')
            .and('have.attr', 'role', 'none')
            .and('have.attr', 'src', './assets/account-history-landing-page-img.svg')
            .and('be.visible');
    }

    assertBackToPersonalInfoButton() {
        cy.get('[data-testid="button-container"]').as('buttonContainer');

        cy.get('@buttonContainer')
            .find('goa-button')
            .eq(0)
            .and('have.text', 'Back to personal information')
            .shadow()
            .find('button')
            .and('have.class', 'secondary')
            .find('goa-icon')
            .and('be.visible');
    }

    assertVerifyMyAccountButton() {
        cy.get('[data-testid="button-container"]').as('buttonContainer');

        cy.get('@buttonContainer')
            .find('goa-button')
            .eq(1)
            .and('have.text', 'Verify my account')
            .shadow()
            .find('button')
            .and('have.class', 'primary')
            .and('be.visible');
    }

    //landing page verified user without services
    assertNoServicesAccessedAlert() {
        cy.get('[data-testid="alert-section"]').as('noServicesAccessedAlert');

        cy.get('@noServicesAccessedAlert').should('exist').and('be.visible');

        cy.get('@noServicesAccessedAlert').find('goa-icon').and('be.visible');

        cy.get('@noServicesAccessedAlert')
            .find('div')
            .eq(1)
            .and(
                'have.text',
                'We are working to include all digital service records connected to your Alberta.ca Account. You either have not accessed any digital services through your Alberta.ca Account or have accessed a digital service that has not been included yet.'
            )
            .and('be.visible');
    }

    //landing page verified user with service
    assertViewServicesButton() {
        cy.get('[data-testid="button-container"] goa-button')
            .and('have.text', 'View services')
            .shadow()
            .find('button')
            .and('have.class', 'primary')
            .and('be.visible');
    }
}

export class LandingPageDesktop {
    private accountHistoryShared = new AccountHistoryShared();
    private accountHistorySharedDesktop = new AccountHistorySharedDesktop();

    assertAbilityListHeadingLayout(selector: string, topSpacing = 16) {
        this.accountHistoryShared.assertTopGapCloseTo(
            `[data-testid="${selector}"]`,
            '[data-testid="ability-list-heading"]',
            topSpacing
        );
        this.accountHistorySharedDesktop.assertLeftGap('[data-testid="ability-list-heading"]');
        this.accountHistoryShared.assertFontColorAndLineHeight(
            '[data-testid="ability-list-heading"]',
            18,
            24,
            'rgb(51, 51, 51)'
        );
    }

    assertAbilityListLayout() {
        this.accountHistoryShared.assertTopGapCloseTo(
            '[data-testid="ability-list-heading"]',
            '[data-testid="ability-list"]',
            0
        );
        this.accountHistorySharedDesktop.assertLeftGap('[data-testid="ability-list"]');
        this.assertListStyle('[data-testid="ability-list"]');
    }

    assertAlertIconStyle(selector: string) {
        cy.get(selector)
            .should('have.attr', 'type', 'alert-circle')
            .should('have.attr', 'theme', 'outline')
            .should('have.attr', 'fillcolor', '#000')
            .should('have.css', 'font-size', '18px')
            .should('have.css', 'color', 'rgb(51, 51, 51)')
            .should('have.css', 'line-height', '28px')
            .should('have.css', 'height', '24px')
            .should('have.css', 'width', '24px');
    }

    assertListStyle(selector: string) {
        this.accountHistoryShared.assertFontColorAndLineHeight(selector, 18, 24, 'rgb(51, 51, 51)');
        cy.get(selector)
            .find('li')
            .eq(0)
            .should('have.css', 'margin-left', '16px')
            .then(($li) => {
                const markerStyle = window.getComputedStyle($li[0], '::marker');
                expect(markerStyle.fontSize).to.equal('8px');
            });
    }

    assertIllustrationStyle() {
        this.accountHistoryShared.assertTopGapCloseTo(
            '[data-testid="ability-list"]',
            '[data-testid="landing-page-img"]',
            18
        );
        this.accountHistorySharedDesktop.assertLeftGap('[data-testid="landing-page-img"] img');
        cy.get('[data-testid="landing-page-img"] img').should('have.css', 'width', '250px');
    }

    assertBtnBackToPersonalInfoStyle() {
        cy.get('[data-testid="button-container"]')
            .find('goa-button')
            .eq(0)
            .shadow()
            .find('[data-testid="btn-back-to-personal-info"]')
            .invoke('width')
            .then((width) => {
                expect(width).to.be.greaterThan(264);
                expect(width).to.be.lessThan(264.8);
            });
    }

    assertBtnVerifyMyAccountStyle() {
        cy.get('[data-testid="button-container"]')
            .find('goa-button')
            .eq(1)
            .shadow()
            .find('[data-testid="btn-verify-my-account"]')
            .invoke('width')
            .then((width) => {
                expect(width).to.be.greaterThan(147);
                expect(width).to.be.lessThan(147.6);
            });
    }

    assertBtnViewServicesStyle() {
        cy.get('[data-testid="button-container"] goa-button')
            .shadow()
            .find('button')
            .invoke('width')
            .then((width) => {
                expect(width).to.be.greaterThan(113);
                expect(width).to.be.lessThan(113.3);
            });
    }

    assertBottomSpacing() {
        cy.get('[data-testid="button-container"]').then(($above) => {
            const aboveOffset = $above[0].getBoundingClientRect();
            cy.get('section[slot="footer"]').then(($below) => {
                const belowOffset = $below[0].getBoundingClientRect();
                const gap = belowOffset.top - aboveOffset.bottom;
                expect(gap).to.be.gte(48);
            });
        });
    }
}

export class LandingPageMobile {
    private accountHistoryShared = new AccountHistoryShared();
    private accountHistorySharedMobile = new AccountHistorySharedMobile();

    assertAbilityListHeadingLayout(selector: string, topSpacing = 16) {
        this.accountHistoryShared.assertTopGapCloseTo(
            `[data-testid="${selector}"]`,
            '[data-testid="ability-list-heading"]',
            topSpacing
        );
        this.accountHistorySharedMobile.assertLeftGap('[data-testid="ability-list-heading"]');
        this.accountHistoryShared.assertFontColorAndLineHeight(
            '[data-testid="ability-list-heading"]',
            16,
            24,
            'rgb(51, 51, 51)'
        );
    }

    assertAbilityListLayout() {
        this.accountHistoryShared.assertTopGapCloseTo(
            '[data-testid="ability-list-heading"]',
            '[data-testid="ability-list"]',
            0
        );
        this.accountHistorySharedMobile.assertLeftGap('[data-testid="ability-list"]');
        this.assertListStyle('[data-testid="ability-list"]');
    }

    assertListStyle(selector: string) {
        this.accountHistoryShared.assertFontColorAndLineHeight(selector, 16, 24, 'rgb(51, 51, 51)');
        cy.get(selector)
            .find('li')
            .eq(0)
            .should('have.css', 'margin-left', '16px')
            .then(($li) => {
                const markerStyle = window.getComputedStyle($li[0], '::marker');
                expect(markerStyle.fontSize).to.equal('8px');
            });
    }

    assertIllustrationStyle() {
        this.accountHistoryShared.assertTopGap(
            '[data-testid="ability-list"]',
            '[data-testid="landing-page-img"] img',
            32
        );
        cy.get('[data-testid="landing-page-img"]').then(($parent) => {
            const parentWidth = $parent.width();
            const parentOffsetLeft = $parent.offset().left;

            cy.get('[data-testid="landing-page-img"] img').then(($img) => {
                const imgWidth = $img.width();
                const imgOffsetLeft = $img.offset().left;
                const parentCenter = parentOffsetLeft + parentWidth / 2;
                const imgCenter = imgOffsetLeft + imgWidth / 2;
                expect(imgCenter).to.be.closeTo(parentCenter, 1);
            });
        });
        cy.get('[data-testid="landing-page-img"] img').should('have.css', 'width', '250px');
    }

    assertBtnBackToPersonalInfoStyle() {
        cy.get('[data-testid="button-container"]')
            .find('goa-button')
            .eq(0)
            .shadow()
            .find('[data-testid="btn-back-to-personal-info"]')
            .invoke('width')
            .then((width) => {
                expect(width).to.be.gte(300);
                expect(width).to.be.lte(302);
            });
    }

    assertBtnVerifyMyAccountStyle() {
        cy.get('[data-testid="button-container"]')
            .find('goa-button')
            .eq(1)
            .shadow()
            .find('[data-testid="btn-verify-my-account"]')
            .invoke('width')
            .then((width) => {
                expect(width).to.be.gte(304);
                expect(width).to.be.lte(306);
            });
    }

    assertBtnViewServicesStyle() {
        cy.get('[data-testid="button-container"]')
            .find('goa-button')
            .eq(0)
            .shadow()
            .find('button')
            .invoke('width')
            .then((width) => {
                expect(width).to.be.gte(304);
                expect(width).to.be.lte(320);
            });
    }

    assertBottomSpacing() {
        cy.get('[data-testid="button-container"]').then(($above) => {
            const aboveOffset = $above[0].getBoundingClientRect();
            cy.get('section[slot="footer"]').then(($below) => {
                const belowOffset = $below[0].getBoundingClientRect();
                const gap = belowOffset.top - aboveOffset.bottom;
                expect(gap).to.be.gte(32);
            });
        });
    }
}
