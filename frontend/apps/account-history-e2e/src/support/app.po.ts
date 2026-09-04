export class AccountHistoryShared {
    assertPageTitle() {
        cy.get('[data-testid="page-title"]').as('pageTitle');
        cy.get('@pageTitle').should('exist').and('be.visible').and('have.text', 'SERVICES ACCESSED');
    }

    assertPageHeading(text: string) {
        cy.get('[data-testid="page-heading"]').as('pageHeading');
        cy.get('@pageHeading').should('exist').and('be.visible').and('have.text', text);
    }

    assertTopGapCloseTo(aboveSelector: string, belowSelector: string, expectedGap: number) {
        cy.get(aboveSelector).then(($above) => {
            const aboveOffset = $above[0].getBoundingClientRect();
            cy.get(belowSelector).then(($below) => {
                const belowOffset = $below[0].getBoundingClientRect();
                const gap = belowOffset.top - aboveOffset.bottom;
                expect(gap).to.be.closeTo(expectedGap, 1);
            });
        });
    }

    assertTopGap(aboveSelector: string, belowSelector: string, expectedGap: number) {
        cy.get(aboveSelector).then(($above) => {
            const aboveOffset = $above[0].getBoundingClientRect();
            cy.get(belowSelector).then(($below) => {
                const belowOffset = $below[0].getBoundingClientRect();
                const gap = belowOffset.top - aboveOffset.bottom;
                expect(gap).to.be.eq(expectedGap);
            });
        });
    }

    assertFontColorAndLineHeight(selector: string, fontSize: number, lineHeight: number, color = 'rgb(0, 0, 0)') {
        cy.get(selector)
            .should('have.css', 'font-size', `${fontSize}px`)
            .should('have.css', 'color', color)
            .should('have.css', 'line-height', `${lineHeight}px`);
    }

    assertAlertIconStyle(selector: string) {
        cy.get(selector)
            .shadow()
            .find('div[role="img"]')
            .should('have.class', 'goa-icon')
            .should('have.class', 'goa-icon--medium');
    }
}

export class AccountHistorySharedDesktop {
    private accountHistoryShared = new AccountHistoryShared();

    assertLeftGap(selector: string, expectedGap = 64) {
        cy.get('.uiam--side-menu').then(($leftNav) => {
            const divOffset = $leftNav[0].getBoundingClientRect();
            cy.get(selector).then(($text) => {
                const textOffset = $text[0].getBoundingClientRect();
                const horizontalGap = textOffset.left - divOffset.right;
                expect(horizontalGap).to.be.eq(expectedGap);
            });
        });
    }
    assertPageTitleLayout() {
        cy.get('goa-app-header').shadow().find('div.container.desktop').as('appHeader');

        this.accountHistoryShared.assertTopGap('@appHeader', '[data-testid="page-title"]', 48);
        this.assertLeftGap('[data-testid="page-title"]');
        this.accountHistoryShared.assertFontColorAndLineHeight('[data-testid="page-title"]', 16, 24, 'rgb(0, 74, 143)');
    }

    assertPageHeadingLayout() {
        this.accountHistoryShared.assertTopGap('[data-testid="page-title"]', '[data-testid="page-heading"]', 12);
        this.assertLeftGap('[data-testid="page-heading"]');
        this.accountHistoryShared.assertFontColorAndLineHeight(
            '[data-testid="page-heading"]',
            36,
            44,
            'rgb(51, 51, 51)'
        );
    }

    assertAlertLayout(selector: string) {
        this.accountHistoryShared.assertAlertIconStyle(`[data-testid="${selector}"] div:nth-child(1) goa-icon`);
        this.accountHistoryShared.assertTopGap('[data-testid="page-heading"]', `[data-testid="${selector}"]`, 12);
        this.assertLeftGap(`[data-testid="${selector}"]`);
        this.accountHistoryShared.assertFontColorAndLineHeight(
            `[data-testid="${selector}"] div:nth-child(2)`,
            18,
            28,
            'rgb(51, 51, 51)'
        );
    }
}

export class AccountHistorySharedMobile {
    private accountHistoryShared = new AccountHistoryShared();

    assertLeftGap(selector: string, expectedGap = 16) {
        cy.get(selector).then(($text) => {
            const textOffset = $text[0].getBoundingClientRect();
            expect(textOffset.left).to.be.eq(expectedGap);
        });
    }
    assertPageTitleLayout() {
        cy.get('goa-app-header').shadow().find('div.container.mobile').as('goaHeader');

        this.accountHistoryShared.assertTopGapCloseTo('@goaHeader', '[data-testid="page-title"]', 32);
        this.assertLeftGap('[data-testid="page-title"]');
        this.accountHistoryShared.assertFontColorAndLineHeight('[data-testid="page-title"]', 16, 24, 'rgb(0, 74, 143)');
    }

    assertPageHeadingLayout() {
        this.accountHistoryShared.assertTopGap('[data-testid="page-title"]', '[data-testid="page-heading"]', 12);
        this.assertLeftGap('[data-testid="page-heading"]');
        this.accountHistoryShared.assertFontColorAndLineHeight(
            '[data-testid="page-heading"]',
            36,
            44,
            'rgb(51, 51, 51)'
        );
    }

    assertAlertLayout(selector: string) {
        this.accountHistoryShared.assertAlertIconStyle(`[data-testid="${selector}"] div:nth-child(1) goa-icon`);
        this.accountHistoryShared.assertTopGapCloseTo(
            '[data-testid="page-heading"]',
            `[data-testid="${selector}"]`,
            12
        );
        this.assertLeftGap(`[data-testid="${selector}"]`);
        this.accountHistoryShared.assertFontColorAndLineHeight(
            `[data-testid="${selector}"] div:nth-child(2)`,
            16,
            24,
            'rgb(51, 51, 51)'
        );
    }
}
