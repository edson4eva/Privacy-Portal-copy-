class LoginPage {
   //-----------------------Actions-----------------------------------//

    // Check that the Sign In page heading is visible
    enterEmailAddress(emailAddress: string) {
        cy.typeWithRetry('[data-testid="signin-with-email-input"]', emailAddress);
    }
    // Click the Continue button after entering email address
    clickContinuebtn() {
        this.signInWithEmailContinueBtn.click({ force: true });
    }
    // Enter the password in the password input field
    enterPassword(password: string) {
        cy.typeWithRetry('[data-testid="sign-in-password-input"]', password);
    }
    // Click the Sign In button after entering password
    clickSignInbtn() {
        this.signInButton.click({ force: true });
    }

    //Login as a user with email and password
    loginasUser(email: string, password: string) {
        this.enterEmailAddress(email);
        this.clickContinuebtn();
        this.enterPassword(password);
        this.clickSignInbtn();
    }

    
    //-----------------------Locators-----------------------------------//

    get signInWithEmailInput() {
        return cy.get('[data-testid="signin-with-email-input"]');
    }
    get signInWithEmailContinueBtn() {
        return cy.get('[data-testid="signin-with-email-continue"]');
    }
    get passwordInput() {
        return cy.get('[data-testid="sign-in-password-input"]');
    }
    get signInButton() {
        return cy.get('[data-testid="sign-in-button"]');
    }

} 
export default new LoginPage();


