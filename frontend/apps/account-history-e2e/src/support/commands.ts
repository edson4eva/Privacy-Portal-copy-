/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
        login(email: string, password: string): void;
        interceptAuth(isAuthenticated: boolean, profileType?: 'basic' | 'verified'): Chainable<Subject>;
        interceptAccessedServices(
            includeServices: boolean,
            responseDelay?: number
        ): Chainable<AccessedServicesResponse[]>;
        interceptAccessedServiceDetails(
            serviceId: string,
            responseDelay?: number
        ): Chainable<AccessedServiceDetailsResponse[]>;
    }
}

Cypress.Commands.add('interceptAuth', (isAuthenticated = false, profileType = 'basic') => {
    const baseUrl = Cypress.env('NX_PUBLIC_API_URL');
    const fixtureFile = profileType === 'basic' ? 'basic-user.json' : 'verified-user.json';

    cy.fixture(fixtureFile).then((userData) => {
        if (isAuthenticated) {
            userData.isAuthenticated = true;
        } else {
            userData.isAuthenticated = false;
        }

        cy.intercept('GET', `${baseUrl}v1/is-authenticated`, {
            statusCode: 200,
            body: userData,
        }).as('getAuthStatus');
    });
});

Cypress.Commands.add('interceptAccessedServices', (includeServices: boolean, responseDelay = 0) => {
    const baseUrl = Cypress.env('NX_PUBLIC_API_URL');
    cy.fixture<AccessedServicesResponse>('../fixtures/accessed-services.json').then((data) => {
        const response: AccessedServicesResponse = includeServices ? data : { accessedServices: [] };
        cy.intercept('GET', `${baseUrl}v1/accessed-services`, {
            statusCode: 200,
            body: response,
            delayMs: responseDelay, // Simulate network delay if needed
        }).as('getAccessedServices');
    });
});

Cypress.Commands.add('interceptAccessedServiceDetails', (serviceId: string, responseDelay = 0) => {
    const baseUrl = Cypress.env('NX_PUBLIC_API_URL');
    cy.fixture<AccessedServiceDetailsResponse[]>('../fixtures/accessed-service-details.json').then((data) => {
        const response: AccessedServiceDetailsResponse = data.find(
            (_) => _.accessedServiceDetails.serviceDetails.id === serviceId
        );
        cy.intercept('GET', `${baseUrl}v1/accessed-services/${serviceId}`, {
            statusCode: 200,
            body: response,
            delayMs: responseDelay, // Simulate network delay if needed
        }).as('getAccessedServiceDetails');
    });
});
