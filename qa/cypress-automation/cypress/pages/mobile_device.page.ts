// This class consists of mobile device page locators and actions.

class MobileDevicePage {

 //-----------------------Actions-----------------------------------//
    clickMenuLink() {
        this.menulink.click({ force: true });
        cy.wait(1000); // Wait for the menu to open
    }
    clickPrivacyPortalLink() {
        this.privacyportalLink.click({ force: true });
        cy.wait(500); // Wait for the privacy portal to load
    }
    clickPrivacyComplaintLink() {
        this.privacyComplaintLink.click({ force: true });
        cy.wait(1000); // Wait for the privacy complaint page to load
    }


 //-----------------------Locators-----------------------------------//
    get menulink(){
        return cy.get('[data-testid="menu-toggle"]');
    }
    get privacyportalLink() {
        return cy.get('a[href="#privacy-portal"]');
    }
    get privacyComplaintLink() {
        return cy.get('[data-testid="privacycomplaintlink"]');
    }
    
}
export default new MobileDevicePage();