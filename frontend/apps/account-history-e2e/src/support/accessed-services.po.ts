import { AccountHistoryShared, AccountHistorySharedDesktop, AccountHistorySharedMobile } from './app.po';
import { formatDate } from './util';

export class AccessedServices {
    assertPageSubHeading() {
        cy.get('[data-testid="sub-heading"]').as('subHeading');
        cy.get('@subHeading')
            .should('exist')
            .and('be.visible')
            .and(
                'have.text',
                'View details about the digital services you have accessed through your Alberta.ca Account.'
            );
    }
    assertServiceAccessedAvailabilityAlert() {
        cy.get('[data-testid="service-accessed-availability-alert"]').as('serviceAccessedAvailabilityAlert');

        cy.get('@serviceAccessedAvailabilityAlert').should('exist').and('be.visible');

        cy.get('@serviceAccessedAvailabilityAlert')
            .find('goa-icon')
            .shadow()
            .find('div')
            .and('have.class', 'goa-icon')
            .and('have.class', 'goa-icon--medium')
            .and('be.visible');

        cy.get('@serviceAccessedAvailabilityAlert')
            .find('div')
            .eq(1)
            .and(
                'have.text',
                'Access records for some digital services are only available starting October 24, 2024, after the Alberta.ca Account update.'
            )
            .and('be.visible');
    }
    assertAccessedServicesTableDesktop() {
        const baseHref = Cypress.env('NX_PUBLIC_BASE_HREF');
        cy.get('[data-testid="table-container"] goa-table table').as('servicesTable');

        cy.get('@servicesTable').find('thead tr th:visible').should('have.length', 4);
        cy.get('@servicesTable')
            .find('thead tr th:visible')
            .eq(0)
            .find('div div')
            .eq(0)
            .should('have.text', 'Service accessed');
        cy.get('@servicesTable').find('thead tr th:visible').eq(0).find('div div').eq(1).should('have.text', '7');
        cy.get('@servicesTable').find('thead tr th:visible').eq(1).should('have.text', 'Date accessed');
        cy.get('@servicesTable').find('thead tr th:visible').eq(2).should('have.text', 'Time');
        cy.get('@servicesTable').find('thead tr th:visible').eq(3).should('have.text', 'Details');

        const { formattedDate, formattedTime } = formatDate('2024-12-13T17:31:51.5173867+00:00');
        cy.get('@servicesTable').find('tbody tr:first td:visible').eq(0).should('have.text', 'Child Care Subsidy');
        cy.get('@servicesTable').find('tbody tr:first td:visible').eq(1).should('have.text', formattedDate);
        cy.get('@servicesTable').find('tbody tr:first td:visible').eq(2).should('have.text', formattedTime);
        cy.get('@servicesTable').find('tbody tr:first td:visible').eq(3).should('have.text', 'View');
        cy.get('@servicesTable')
            .find('tbody tr:first td:visible')
            .eq(3)
            .find('a')
            .should('exist')
            .and('have.attr', 'href')
            .and('not.be.empty')
            .should('eq', `${baseHref}accessed-services/child-care-subsidy`);
    }

    assertAccessedServicesTableMobile() {
        const baseHref = Cypress.env('NX_PUBLIC_BASE_HREF');
        cy.get('[data-testid="table-container"] goa-table table').as('servicesTable');

        cy.get('@servicesTable').find('thead tr th:visible').should('have.length', 3);
        cy.get('@servicesTable')
            .find('thead tr th:visible')
            .eq(0)
            .find('div div')
            .eq(0)
            .should('have.text', 'Service accessed');
        cy.get('@servicesTable').find('thead tr th:visible').eq(0).find('div div').eq(1).should('have.text', '7');
        cy.get('@servicesTable').find('thead tr th:visible').eq(1).should('have.text', 'Date accessed');
        cy.get('@servicesTable').find('thead tr th:visible').eq(2).should('have.text', 'Details');

        const { formattedDate } = formatDate('2024-12-13T17:31:51.5173867+00:00');
        cy.get('@servicesTable').find('tbody tr:first td:visible').eq(0).should('have.text', 'Child Care Subsidy');
        cy.get('@servicesTable').find('tbody tr:first td:visible').eq(1).should('have.text', formattedDate);
        cy.get('@servicesTable').find('tbody tr:first td:visible').eq(2).should('have.text', 'View');
        cy.get('@servicesTable')
            .find('tbody tr:first td:visible')
            .eq(2)
            .find('a')
            .should('exist')
            .and('have.attr', 'href')
            .and('not.be.empty')
            .should('eq', `${baseHref}accessed-services/child-care-subsidy`);
    }

    assertPagination() {
        cy.get('[data-testid="pagination-container"] goa-pagination').as('pagination');
        cy.get('@pagination').should('exist').and('be.visible');
        cy.get('@pagination').shadow().find('[data-testid="page-selector"]').should('exist').and('be.visible');
        cy.get('@pagination').shadow().find('[data-testid="page-links"]').should('exist').and('be.visible');
    }
}

export class AccessedServicesDesktopLayout {
    private accountHistoryShared = new AccountHistoryShared();
    private accountHistorySharedDesktop = new AccountHistorySharedDesktop();
    assertAlertLayout() {
        this.accountHistoryShared.assertAlertIconStyle(
            `[data-testid="service-accessed-availability-alert"] div:nth-child(1) goa-icon`
        );
        this.accountHistoryShared.assertTopGapCloseTo(
            '[data-testid="sub-heading"]',
            `[data-testid="service-accessed-availability-alert"]`,
            16
        );
        this.accountHistorySharedDesktop.assertLeftGap(`[data-testid="service-accessed-availability-alert"]`);
        this.accountHistoryShared.assertFontColorAndLineHeight(
            `[data-testid="service-accessed-availability-alert"] div:nth-child(2)`,
            18,
            28,
            'rgb(51, 51, 51)'
        );
    }
}

export class AccessedServicesMobileLayout {
    private accountHistoryShared = new AccountHistoryShared();
    private accountHistorySharedMobile = new AccountHistorySharedMobile();
    assertAlertLayout() {
        this.accountHistoryShared.assertAlertIconStyle(
            `[data-testid="service-accessed-availability-alert"] div:nth-child(1) goa-icon`
        );
        this.accountHistoryShared.assertTopGapCloseTo(
            '[data-testid="sub-heading"]',
            `[data-testid="service-accessed-availability-alert"]`,
            16
        );
        this.accountHistorySharedMobile.assertLeftGap(`[data-testid="service-accessed-availability-alert"]`);
        this.accountHistoryShared.assertFontColorAndLineHeight(
            `[data-testid="service-accessed-availability-alert"] div:nth-child(2)`,
            18,
            28,
            'rgb(51, 51, 51)'
        );
    }
}
