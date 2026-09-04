class PersonalInfomrationPage {

 //-----------------------Actions-----------------------------------//
    clickOncloseAnnouncementModal() {
        this.closeannouncementmodal.should('be.visible').click({ force: true });
    }
    clickOnAccessPrivacyPortalAnnouncementModal() {
        this.accessprivacyportalannouncementmodal.should('be.visible').click({ force: true });
    }
    validateWelcomeText() {
        this.welcomeText.should('be.visible').contains('Welcome');
    }
    validatebadgeTitle(title: string) {
        this.badgeTitle_VerfiedBasic.contains(title)
    }
    validatePageHeading() {
        this.pageheading.should('be.visible').contains('Personal information');
    }
    // Validate the user identification name and store it as an alias
    validate_Store_UserIdentificationName() {
        this.userIdentificationName.invoke('text').then((textValue) => {
            // You can store the value as a Cypress alias if needed
            cy.wrap(textValue).as('userIDName');
        });
    }


 //-----------------------Locators-----------------------------------//
    get closeannouncementmodal() {
        return cy.get('[data-testid="privacy-portal-announcement-close"]');
    }
    get accessprivacyportalannouncementmodal() {
        return cy.get('[data-testid="privacy-portal-redirection"]');
    }
    get pageheading() {
        return cy.get('h1');
    }
    get welcomeText() {
        return cy.get('h2');
    }
    get badgeTitle_VerfiedBasic() {
        return cy.get('.goa-badge-content.svelte-19poqsl');
    }
    get userIdentificationName(){
        return cy.get('[data-testid="identification_name_value"]');
    }

}
export default new PersonalInfomrationPage();