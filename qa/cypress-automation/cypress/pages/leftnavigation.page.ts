class LeftNavigation {
 //-----------------------Actions-----------------------------------//
    // Click on the Personal link in the left navigation
    clickonPersonal() {
        this.LeftNav_Personal.click({ force: true });
    }
    // Click on the Personal Information link in the left navigation
    clickonPersonalInformation() {
        this.LeftNav_PersonalInformation.click({ force: true });
    }
    // Click on the Privacy Portal link in the left navigation
    clickonPrivacyPortal() {
        this.LeftNav_PrivacyPortal.click();
    }
    // Click on the New Feature Page link in the left navigation
    clickonNewfeaturePage() {
        this.LeftNav_NewfeaturePage.click();
    }
    // Click on the Services Accessed link in the left navigation
    clickonServicesAccessed() {
        this.LeftNav_ServicesAccessed.click();
    }
    // Click on the Privacy Complaint link in the left navigation
    clickonPrivacyComplaint() {
        this.LeftNav_PrivacyComplaint.click({ force: true });
    }  
    // Navigate to the Personal Information page if not already there 
    navigateTopersonalInformationPage() {
        const personalInfoPath = '/account/personal';
            return cy.url().then((url) => {
            if (!url.includes(personalInfoPath)) {
            cy.wait(1000);
            cy.get('body').then($body => {
                if ($body.find('[data-testid="personalinformationlink"]').length > 0) {
                    cy.get('[data-testid="personalinformationlink"]').should('be.visible').click({ force: true });
                } else {
                    cy.visit(personalInfoPath);
                }
            });
            cy.url({ timeout: 10000 }).should('include', personalInfoPath);
            cy.wait(500);
                } else {
            cy.url().should('include', personalInfoPath);
            cy.wait(500); 
                }
                });
    }

    
   //-----------------------Locators-----------------------------------//

    get LeftNav_Personal() {
        return cy.get('[data-testid="personalheading"]');
    }
    get LeftNav_PersonalInformation() {
        return cy.get('[data-testid="personalinformationlink"]');
    }
    get LeftNav_PrivacyPortal(){
        return cy.get('[heading="Privacy Portal"]');
    }
    get LeftNav_NewfeaturePage(){
        return cy.get('[data-testid="newprivacy featureslink"]');
    }
    get LeftNav_ServicesAccessed() {
        return cy.get('[data-testid="servicesaccessedlink"]');
    }
    get LeftNav_PrivacyComplaint() {
        return cy.get('[data-testid="privacycomplaintlink"]');
    }

}
export default new LeftNavigation();