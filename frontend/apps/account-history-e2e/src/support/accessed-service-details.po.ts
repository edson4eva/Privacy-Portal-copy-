import { AccountHistoryShared, AccountHistorySharedDesktop, AccountHistorySharedMobile } from './app.po';
import { formatDate } from './util';

export class AccessedServiceDetails {
    assertTopBackButtonDesktop() {
        cy.get('[data-testid="non-mobile-back-button"]').as('topBackButton');
        cy.get('@topBackButton').should('exist').and('be.visible').and('have.text', 'Back to services accessed');
    }
    assertTopBackButtonMobile() {
        cy.get('[data-testid="mobile-back-button"]').as('topBackButton');
        cy.get('@topBackButton').should('exist').and('be.visible').and('have.text', 'Back to services accessed');
    }
    assertServiceName() {
        cy.get('[data-testid="service-name"]').as('serviceName');
        cy.get('@serviceName').should('exist').and('be.visible').and('have.text', 'Child Care Subsidy');
    }
    assertAccessLogHeading() {
        cy.get('[data-testid="service-access-history"]').as('logHeading');
        cy.get('@logHeading').should('exist').and('be.visible').and('have.text', 'Service access history');
    }
    assertAccessLogDescription() {
        cy.get('[data-testid="log-description"]').as('logDescription');
        cy.get('@logDescription')
            .should('exist')
            .and('be.visible')
            .and(
                'have.text',
                'This log shows when you have accessed the child care subsidy service through your Alberta.ca Account.'
            );
    }
    checkPseudoContent($els: JQuery<HTMLElement>, content: string) {
        const win = $els[0].ownerDocument.defaultView;
        const before = win.getComputedStyle($els[0], 'before');
        const contentValue = before.getPropertyValue('content');
        expect(contentValue).to.eq(content);
    }
    assertAccessLogTableDesktop() {
        cy.get('[data-testid="table-container"] table').as('logTable');

        cy.get('@logTable').should('exist').and('be.visible');

        cy.get('@logTable').find('thead tr th:visible').should('have.length', 2);
        cy.get('@logTable')
            .find('thead tr th:visible')
            .eq(0)
            .then(($els) => this.checkPseudoContent($els, '"Date accessed"'));
        cy.get('@logTable')
            .find('thead tr th:visible')
            .eq(1)
            .then(($els) => this.checkPseudoContent($els, '"Time accessed"'));

        const { formattedDate, formattedTime } = formatDate('2024-10-13T17:31:51.5173867+00:00');
        cy.get('@logTable').find('tbody tr:first td:visible').eq(0).should('have.text', formattedDate);
        cy.get('@logTable').find('tbody tr:first td:visible').eq(1).should('have.text', formattedTime);

        cy.get('@logTable').find('tbody tr').should('have.length', 5);
    }
    assertAccessLogTableMobile() {
        cy.get('[data-testid="table-container"] table').as('logTable');

        cy.get('@logTable').should('exist').and('be.visible');

        cy.get('@logTable').find('thead tr th:visible').should('have.length', 2);
        cy.get('@logTable')
            .find('thead tr th:visible')
            .eq(0)
            .then(($els) => this.checkPseudoContent($els, '"Date"'));
        cy.get('@logTable')
            .find('thead tr th:visible')
            .eq(1)
            .then(($els) => this.checkPseudoContent($els, '"Time"'));

        const { formattedDate, formattedTime } = formatDate('2024-10-13T17:31:51.5173867+00:00');
        cy.get('@logTable').find('tbody tr:first td:visible').eq(0).should('have.text', formattedDate);
        cy.get('@logTable').find('tbody tr:first td:visible').eq(1).should('have.text', formattedTime);

        cy.get('@logTable').find('tbody tr').should('have.length', 5);
    }
    assertAccordion() {
        cy.get('[testid^="accordion-"]').as('accordionItems');
        cy.get('@accordionItems').should('have.length', 7);

        cy.get('@accordionItems')
            .eq(0)
            .shadow()
            .find('[data-testid="accordion-0-heading"]')
            .should('have.text', 'About the service');
        cy.get('@accordionItems')
            .eq(0)
            .find('[class^="Accordion_accordion-body"]')
            .should(
                'have.text',
                'This online service can be used to apply for subsidies to offset the cost of child care for eligible families.'
            );
        cy.get('@accordionItems')
            .eq(0)
            .find('[class^="Accordion_accordion-body"]')
            .find('a')
            .should('exist')
            .and('have.text', 'eligible families')
            .and('have.attr', 'href')
            .and('not.be.empty')
            .should('eq', 'https://www.alberta.ca/child-care-subsidy');

        cy.get('@accordionItems')
            .eq(1)
            .shadow()
            .find('[data-testid="accordion-1-heading"]')
            .should('have.text', 'How is personal data being used');
        cy.get('@accordionItems')
            .eq(1)
            .find('[class^="Accordion_accordion-body"]')
            .should(
                'have.text',
                'The information is used to determine eligibility and subsidy rates for providing subsidized childcare to Albertans who need it.'
            );

        cy.get('@accordionItems')
            .eq(2)
            .shadow()
            .find('[data-testid="accordion-2-heading"]')
            .should('have.text', 'Personal information');
        cy.get('@accordionItems')
            .eq(2)
            .find('[class^="Accordion_accordion-body"]')
            .find('div div')
            .should('have.text', 'Personal information the service may maintain for you includes:');
        cy.get('@accordionItems').eq(2).as('li');
        cy.get('@li').should('have.length', 14);
        cy.get('@li').eq(0).should('have.text', 'Name');
        cy.get('@li').eq(1).should('have.text', 'Date of birth');
        cy.get('@li').eq(2).should('have.text', 'Citizenship status');
        cy.get('@li').eq(3).should('have.text', 'Social insurance number');
        cy.get('@li').eq(4).should('have.text', 'Telephone number');
        cy.get('@li').eq(5).should('have.text', 'Mailing address');
        cy.get('@li').eq(6).should('have.text', 'Physical address');
        cy.get('@li').eq(7).should('have.text', 'Indigenous status');
        cy.get('@li').eq(8).should('have.text', 'Employer name');
        cy.get('@li').eq(9).should('have.text', 'Employer phone number');
        cy.get('@li').eq(10).should('have.text', `Co-applicant (other parent's) information`);
        cy.get('@li').eq(11).should('have.text', 'Household income and finances');
        cy.get('@li').eq(12).should('have.text', `Children's information`);
        cy.get('@li').eq(13).should('have.text', 'Child care program information');

        cy.get('@accordionItems')
            .eq(3)
            .shadow()
            .find('[data-testid="accordion-3-heading"]')
            .should('have.text', 'Details from your Alberta.ca Account');
        cy.get('@accordionItems')
            .eq(3)
            .find('[class^="Accordion_accordion-body"]')
            .find('div div')
            .should(
                'have.text',
                'This service uses the following personal information from your Alberta.ca Account to enable the service:'
            );
        cy.get('@accordionItems').eq(3).as('li');
        cy.get('@li').should('have.length', 3);
        cy.get('@li').eq(0).should('have.text', 'Name');
        cy.get('@li').eq(1).should('have.text', 'Date of birth');
        cy.get('@li').eq(2).should('have.text', 'Mailing address');

        cy.get('@accordionItems')
            .eq(4)
            .shadow()
            .find('[data-testid="accordion-4-heading"]')
            .should('have.text', 'Legislation');
        cy.get('@accordionItems')
            .eq(4)
            .find('[class^="Accordion_accordion-body"]')
            .find('div:first div:first')
            .should(
                'have.text',
                'The following are the legal authorities that authorize this service to collect your personal information:'
            );
        cy.get('@accordionItems').eq(4).find('[class^="Accordion_accordion-body"]').find('a').as('a');
        cy.get('@a')
            .should('exist')
            .and('have.text', 'Section 33 (c) of the Freedom of Information and Protection of Privacy Act')
            .and('have.attr', 'href')
            .and('not.be.empty')
            .should(
                'eq',
                'https://kings-printer.alberta.ca/1266.cfm?page=F25.cfm&leg_type=Acts&isbncln=9780779848393&display=html'
            );
        cy.get('@a').find('goa-icon[type="open"]').should('exist');

        cy.get('@accordionItems')
            .eq(5)
            .shadow()
            .find('[data-testid="accordion-5-heading"]')
            .should('have.text', 'Ministry/Data owner');
        cy.get('@accordionItems')
            .eq(5)
            .find('[class^="Accordion_accordion-body"]')
            .find('div')
            .should('have.text', 'Jobs, Economy and Trade');

        cy.get('@accordionItems')
            .eq(6)
            .shadow()
            .find('[data-testid="accordion-6-heading"]')
            .should('have.text', 'Keyword');
        cy.get('@accordionItems')
            .eq(6)
            .find('[class^="Accordion_accordion-body"]')
            .find('div')
            .should('have.text', 'children, childcare, daycare, subsidy');
    }
    assertBackToAccountHistoryButton() {
        cy.get('[data-testid="button-container"]').as('buttonContainer');

        cy.get('@buttonContainer')
            .find('goa-button')
            .eq(0)
            .and('have.text', 'Back to services accessed')
            .shadow()
            .find('button')
            .and('have.class', 'secondary')
            .find('goa-icon')
            .and('be.visible');
    }
    assertAccessServiceButton() {
        cy.get('[data-testid="button-container"]').as('buttonContainer');

        cy.get('@buttonContainer')
            .find('goa-button')
            .eq(1)
            .and('have.text', 'Access service')
            .shadow()
            .find('button')
            .and('have.class', 'primary')
            .and('be.visible');
    }
}

export class AccessedServiceDetailsDesktop {
    private accountHistoryShared = new AccountHistoryShared();
    private accountHistorySharedDesktop = new AccountHistorySharedDesktop();
    assertTopBackToAccountHistoryButtonLayout() {
        cy.get('goa-app-header').shadow().find('div.container.desktop').as('appHeader');
        cy.get('[data-testid="non-mobile-back-button"] goa-button')
            .shadow()
            .find('[data-testid="non-mobile-back-button-btn"]')
            .as('nonMobileBackBtn');

        this.accountHistoryShared.assertTopGapCloseTo('@appHeader', '@nonMobileBackBtn', 36);
        this.accountHistorySharedDesktop.assertLeftGap('@nonMobileBackBtn', 64);
        this.accountHistoryShared.assertFontColorAndLineHeight('@nonMobileBackBtn', 18, 28, 'rgb(0, 112, 196)');
    }

    assertPageTitleLayout() {
        cy.get('[data-testid="non-mobile-back-button"] goa-button')
            .shadow()
            .find('[data-testid="non-mobile-back-button-btn"]')
            .as('nonMobileBackBtn');
        this.accountHistoryShared.assertTopGapCloseTo('@nonMobileBackBtn', '[data-testid="service-name"]', 52);
        this.accountHistorySharedDesktop.assertLeftGap('[data-testid="service-name"]', 64);
        this.accountHistoryShared.assertFontColorAndLineHeight(
            '[data-testid="service-name"]',
            36,
            44,
            'rgb(51, 51, 51)'
        );
    }

    assertLogHeadingLayout() {
        this.accountHistoryShared.assertTopGapCloseTo(
            '[data-testid="service-propery-ministry"]',
            '[data-testid="service-access-history"]',
            48
        );
        this.accountHistorySharedDesktop.assertLeftGap('[data-testid="service-access-history"]', 64);
        this.accountHistoryShared.assertFontColorAndLineHeight(
            '[data-testid="service-access-history"]',
            24,
            32,
            'rgb(51, 51, 51)'
        );
    }

    assertLogDescriptionLayout() {
        this.accountHistoryShared.assertTopGapCloseTo(
            '[data-testid="service-access-history"]',
            '[data-testid="log-description"]',
            28
        );
        this.accountHistorySharedDesktop.assertLeftGap('[data-testid="log-description"]', 64);
        this.accountHistoryShared.assertFontColorAndLineHeight(
            '[data-testid="log-description"]',
            18,
            28,
            'rgb(51, 51, 51)'
        );
    }

    assertLogTableLayout() {
        this.accountHistoryShared.assertTopGapCloseTo(
            '[data-testid="log-description"]',
            '[data-testid="table-container"] table',
            16
        );
        this.accountHistorySharedDesktop.assertLeftGap('[data-testid="table-container"] table', 64);
        cy.get('[data-testid="table-container"] table').then((table) => {
            const parsedWidth = parseFloat(table.css('width'));
            expect(parsedWidth).to.be.eq(720);
        });
        cy.get('[data-testid="table-container"] table').should('have.css', 'border-radius', '15px');
    }

    assertAccordionLayout() {
        this.accountHistoryShared.assertTopGapCloseTo(
            '[data-testid="service-details-title"]',
            '[testid="accordion-0"]',
            12
        );
        for (let index = 0; index < 7; index++) {
            this.accountHistorySharedDesktop.assertLeftGap(`[testid="accordion-${index}"]`, 32);
            cy.get(`[testid="accordion-${index}"]`)
                .shadow()
                .find('summary')
                .should('have.css', 'border-radius', '15px')
                .and('have.css', 'font-size', '18px')
                .find('.heading.heading-small')
                .should('have.css', 'font-weight', '700')
                .and('have.css', 'color', 'rgb(0, 112, 196)');
            cy.get(`[testid="accordion-${index}"]`)
                .find('[class^="Accordion_accordion-body"]')
                .should('have.css', 'font-size', '18px');
            if (index > 0) {
                this.accountHistoryShared.assertTopGapCloseTo(
                    `[testid="accordion-${index - 1}"]`,
                    `[testid="accordion-${index}"]`,
                    8
                );
            }
        }
    }

    assertButtonLayout() {
        this.accountHistoryShared.assertTopGapCloseTo('[testid="accordion-6"]', '[data-testid="button-container"]', 8);
        cy.get('[data-testid="button-container"]')
            .should('have.css', 'display', 'flex')
            .should('have.css', 'flex-direction', 'row')
            .should('have.css', 'column-gap', '16px')
            .should('have.css', 'padding-top', '32px');
        cy.get('[testid="btn-back-to-account-history"]')
            .invoke('width')
            .then((width) => {
                expect(width).to.be.gte(253);
                expect(width).to.be.lte(254);
            });
        cy.get('[testid="btn-access-service"]')
            .invoke('width')
            .then((width) => {
                expect(width).to.be.gte(250);
                expect(width).to.be.lte(251);
            });
    }

    assertBottomSpacing() {
        cy.get('[data-testid="button-container"] goa-button')
            .eq(0)
            .then(($above) => {
                const aboveOffset = $above[0].getBoundingClientRect();
                cy.get('section[slot="footer"]').then(($below) => {
                    const belowOffset = $below[0].getBoundingClientRect();
                    const gap = belowOffset.top - aboveOffset.bottom;
                    expect(gap).to.be.gte(48);
                });
            });
    }
}

export class AccessedServiceDetailsMobile {
    private accountHistoryShared = new AccountHistoryShared();
    private accountHistorySharedMobile = new AccountHistorySharedMobile();
    assertTopBackToAccountHistoryButtonLayout() {
        cy.get('[data-testid="non-mobile-back-button"] goa-button')
            .shadow()
            .find('[data-testid="non-mobile-back-button-btn"]')
            .as('nonMobileBackBtn');
        this.accountHistoryShared.assertTopGap('head', '@nonMobileBackBtn', 0);
        this.accountHistorySharedMobile.assertLeftGap('@nonMobileBackBtn', 0);
        this.accountHistoryShared.assertFontColorAndLineHeight('@nonMobileBackBtn', 18, 28, 'rgb(0, 112, 196)');
    }

    assertPageTitleLayout() {
        cy.get('[data-testid="non-mobile-back-button"] goa-button')
            .shadow()
            .find('[data-testid="non-mobile-back-button-btn"]')
            .as('nonMobileBackBtn');
        this.accountHistoryShared.assertTopGap('@nonMobileBackBtn', '[data-testid="service-name"]', 84);
        this.accountHistorySharedMobile.assertLeftGap('[data-testid="service-name"]', 16);
        this.accountHistoryShared.assertFontColorAndLineHeight(
            '[data-testid="service-name"]',
            36,
            44,
            'rgb(51, 51, 51)'
        );
    }

    assertLogHeadingLayout() {
        this.accountHistoryShared.assertTopGapCloseTo(
            '[data-testid="service-propery-ministry"]',
            '[data-testid="service-access-history"]',
            24
        );
        this.accountHistorySharedMobile.assertLeftGap('[data-testid="service-access-history"]', 16);
        this.accountHistoryShared.assertFontColorAndLineHeight(
            '[data-testid="service-access-history"]',
            24,
            32,
            'rgb(51, 51, 51)'
        );
    }

    assertLogDescriptionLayout() {
        this.accountHistoryShared.assertTopGapCloseTo(
            '[data-testid="service-access-history"]',
            '[data-testid="log-description"]',
            28
        );
        this.accountHistorySharedMobile.assertLeftGap('[data-testid="log-description"]', 16);
        this.accountHistoryShared.assertFontColorAndLineHeight(
            '[data-testid="log-description"]',
            16,
            24,
            'rgb(51, 51, 51)'
        );
    }

    assertLogTableLayout() {
        this.accountHistoryShared.assertTopGapCloseTo(
            '[data-testid="log-description"]',
            '[data-testid="table-container"] table',
            16
        );
        this.accountHistorySharedMobile.assertLeftGap('[data-testid="table-container"] table', 16);
        cy.get('[data-testid="table-container"] table').then((table) => {
            const parsedWidth = parseFloat(table.css('width'));
            expect(parsedWidth).to.be.gte(326);
            expect(parsedWidth).to.be.lte(328);
        });
        cy.get('[data-testid="table-container"] table').should('have.css', 'border-radius', '15px');
    }

    assertAccordionLayout() {
        this.accountHistoryShared.assertTopGapCloseTo(
            '[data-testid="service-details-title"]',
            '[testid="accordion-0"]',
            12
        );
        for (let index = 0; index < 7; index++) {
            this.accountHistorySharedMobile.assertLeftGap(`[testid="accordion-${index}"]`, 16);
            cy.get(`[testid="accordion-${index}"]`)
                .shadow()
                .find('summary')
                .should('have.css', 'border-radius', '15px')
                .and('have.css', 'font-size', '18px')
                .find('.heading.heading-small')
                .should('have.css', 'font-weight', '700')
                .and('have.css', 'color', 'rgb(0, 112, 196)');
            cy.get(`[testid="accordion-${index}"]`)
                .find('[class^="Accordion_accordion-body"]')
                .should('have.css', 'font-size', '16px');
            if (index > 0) {
                this.accountHistoryShared.assertTopGapCloseTo(
                    `[testid="accordion-${index - 1}"]`,
                    `[testid="accordion-${index}"]`,
                    8
                );
            }
        }
    }

    assertButtonLayout() {
        this.accountHistoryShared.assertTopGapCloseTo('[testid="accordion-6"]', '[data-testid="button-container"]', 8);
        cy.get('[data-testid="button-container"]')
            .should('have.css', 'display', 'flex')
            .should('have.css', 'flex-direction', 'column')
            .should('have.css', 'row-gap', '16px')
            .should('have.css', 'padding-top', '24px');
        cy.get('[testid="btn-back-to-account-history"]')
            .invoke('width')
            .then((width) => {
                expect(width).to.be.gte(318);
                expect(width).to.be.lte(320);
            });
        cy.get('[testid="btn-access-service"]')
            .invoke('width')
            .then((width) => {
                expect(width).to.be.gte(318);
                expect(width).to.be.lte(320);
            });
    }

    assertBottomSpacing() {
        cy.get('[data-testid="button-container"] goa-button')
            .eq(0)
            .then(($above) => {
                const aboveOffset = $above[0].getBoundingClientRect();
                cy.get('section[slot="footer"]').then(($below) => {
                    const belowOffset = $below[0].getBoundingClientRect();
                    const gap = belowOffset.top - aboveOffset.bottom;
                    expect(gap).to.be.gte(48);
                });
            });
    }
}
