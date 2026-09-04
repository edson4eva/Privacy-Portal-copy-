class ComplaintsErrorMsgPage {
 //-----------------------Actions-----------------------------------//

    // Validate the error message for Step 1 Department is visible and matches the expected message
    checkStep1DeptErrorMsg(expectedMsg: string) {
        this.step1_dept_errormsg.contains(expectedMsg).should('be.visible');
    }

    // Validate the error message for Step 2 and Step 3 is visible and matches the expected message
    checkStep2ErrorMsg(expectedMsg: string){
        this.step2_errormsg.contains(expectedMsg).should('be.visible');
    }

    // Validate the unsaved changes modal message is visible and matches the expected message
    checkStep3ErrorMsg(expectedMsg: string){
        this.step2_errormsg.scrollIntoView();
        this.step2_errormsg.contains(expectedMsg).should('be.visible');
    }

    // Validate the unsaved changes modal is visible and contains the expected message
    checkModalMessage(expectedmodalMsg: string) {
        this.modalMessage.should('be.visible').and('have.text', expectedmodalMsg);
    }

    // Click the "Cancel" button on the unsaved changes modal
    clickCancelOnModal() {
    this.modalMessage.should('be.visible'); 
    this.btnCancel.last().click({ force: true });
    this.btnCancel.should('not.exist');
    }
  

  //-----------------------Locators-----------------------------------//

    get step1_dept_errormsg(){
        return cy.get('[data-testid="warning-indicator"]');
    }
    get step2_errormsg(){
        return cy.get('.WarningIndicator_message__v2B4t');
    }
    get modalMessage() {
        return cy.get('p');
    }
    get btnLeave() {
        return cy.get('[data-testid="modal-button-leave"]');
    }
    get btnCancel() {
        return cy.get('[data-testid="modal-button-cancel"]');
    }
    

}
export default new ComplaintsErrorMsgPage();