class ComplaintHistoryPage {
    //-----------------------Actions-----------------------------------//

    // Check that the Complaint History page heading is visible
    validatePageHeading() {
        this.pageheading.should('be.visible', { timeout: 10000 }).contains('Complaint history');
    }

    // Validate the latest submitted complaint and log the date and service
    validateLatestSubmittedComplaintAndLogService() {
        this.leftColumnComplaintDetails.then($labels => {
            this.rightColumnComplaintHistory.then($values => {
                // Find the index of the first "Submitted on"
                const submittedOnIndex = Cypress._.findIndex($labels, (label: HTMLElement) =>
                    label.innerText.trim() === 'Submitted on'
                );
                // Assert "Submitted on" value is present and matches date/time pattern
                if (submittedOnIndex >= 0) {
                    const submittedOnText = $values[submittedOnIndex].innerText.trim();
                    cy.log('Latest complaint submitted on:', submittedOnText);
                    expect(submittedOnText).to.match(/\w+ \d{1,2}, \d{4} at \d{1,2}:\d{2} (am|pm)/i);
                }
                // Log Service value if present (Service is always just above Submitted on)
                const serviceIndex = submittedOnIndex - 1;
                if (serviceIndex >= 0) {
                    const serviceText = $values[serviceIndex].innerText.trim();
                    cy.log('Service value:', serviceText || '[empty]');
                }
            });
        });
    }

    // Click the "Back to privacy complaint" button and validate navigation
    clickBackToPrivacyComplaintButton() {
        this.backtoprivacycomplaintbutton.scrollIntoView();
        this.backtoprivacycomplaintbutton.should('be.visible').then($goaBtn => {
            // Find the native button inside the custom element and click it
            cy.wrap($goaBtn)
                .shadow()
                .find('button')
                .should('be.visible')
                .click({ force: true });
        });
        cy.get('[data-testid="page-sub-title"]').should('contain', 'File a complaint');
        cy.location('pathname').should('include', '/file-complaint');
    }

    // Click the "View complaint history" button from the File a Complaint page
    clickViewComplaintHistoryButtonfromFileAComplaintpage() {
        this.complainhistorybuttonforfileacomplaint
            .should('exist')
            .and('be.visible')
            .then($goaBtn => {
                cy.wrap($goaBtn)
                    .shadow()
                    .find('button')
                    .should('be.visible')
                    .and('not.be.disabled')
                    .wait(500) // Wait for any potential animation or enablement
                    .click({ force: true });
            });
    }

    
    //-----------------------Locators-----------------------------------//
    get pageheading() {
        return cy.get('[data-testid="page-sub-title"]');
    }
    get leftColumnComplaintDetails() {
        return cy.get('td.ComplaintHistory_left-column__zf18u');
    }
    get rightColumnComplaintHistory() {
        return cy.get('td.ComplaintHistory_right-column__i8bna');
    }
    get backtoprivacycomplaintbutton() {
        return cy.get('goa-button').contains('Back to privacy complaint');
    }
    get complainhistorybuttonforfileacomplaint() {
        //return cy.get('.ComplaintStartPage_only-desktop-button__Q2xQp goa-button[testid="view-complaint-history-button"]');
        return cy.get('goa-button').contains('View complaint history'); // Adjusted selector to match the button
    }



}
export default new ComplaintHistoryPage();