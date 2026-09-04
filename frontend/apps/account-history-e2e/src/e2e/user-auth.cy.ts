import { AccountHistoryShared } from '../support/app.po';

describe('User Authentication Tests', () => {
    const baseHref = Cypress.env('NX_PUBLIC_BASE_HREF');

    describe('Unauthenticated User Redirection', () => {
        before(() => {
            cy.intercept('GET', /\/api\/v1\/signin/, {
                statusCode: 401,
                body: {
                    message: 'Unauthorized',
                },
            }).as('signinRequest');
            cy.interceptAuth(false);
        });

        it('should make an API call to /api/v1/signin if the user is not authenticated', () => {
            cy.visit(baseHref);

            cy.wait('@getAuthStatus');

            cy.wait('@signinRequest').its('request.url').should('include', '/api/v1/signin');
            cy.wait('@signinRequest').its('request.method').should('equal', 'GET');
        });
    });

    describe('Authenticated User Access', () => {
        const accountHistoryShared = new AccountHistoryShared();

        it('should allow the authenticated user(basic) to access the landing page', () => {
            cy.interceptAuth(true, 'basic');
            cy.visit(baseHref);

            cy.wait('@getAuthStatus');

            cy.url().should('include', baseHref);
            accountHistoryShared.assertPageTitle();
        });

        it('should allow the authenticated user(verified - no accessed services) to access the landing page', () => {
            cy.interceptAuth(true, 'verified');
            cy.interceptAccessedServices(false);

            cy.visit(baseHref);
            cy.wait('@getAuthStatus');
            cy.wait('@getAccessedServices');

            cy.url().should('include', baseHref);
            accountHistoryShared.assertPageTitle();
        });

        it('should allow the authenticated user(verified - with accessed services) to access the landing page', () => {
            cy.interceptAuth(true, 'verified');
            cy.interceptAccessedServices(true);

            cy.visit(baseHref);
            cy.wait('@getAuthStatus');
            cy.wait('@getAccessedServices');

            cy.url().should('include', baseHref);
            accountHistoryShared.assertPageTitle();
        });
    });
});
