import { time } from "console";

class FileAComplaintPage {
  //-----------------------Actions-----------------------------------//

    //----------------------- File A Complaint - Landing Page & Collection Notice Page -----------------------//

    // Check that the File a Complaint page heading is visible and contains the expected text
    validatePageHeading() {
        this.pageheading.should('be.visible').contains('File a complaint');
    }
    // Click the "File a complaint" button
    clickFileAComplaintbtn() {
        cy.wait(200); // Wait for the page to load
        this.fileAComplaintbutton.should('be.visible').click({ force: true });
    }
    // Validate the Collection Notice heading is visible and contains the expected text
    validateCollectionNoticeHeading() {
        this.collectionnoticeheading.should('be.visible').contains('Collection notice');
    }
    // Click the "Start a complaint" button
    clickStartAComplaintbtn() {
        this.startAComplaintbutton.should('be.visible').click({ force: true });
    }

    //----------------------- Common Actions -----------------------//

    // Click the "Next" button 
    clickNextButton() {
        this.nextbutton.should('be.visible').click({ force: true });
    }
    // Click the "Back" button
    clickBackButton() {
        this.backbutton.should('be.visible').click({ force: true });
    }

    //----------------------- Step 1: Select Department -----------------------//

    // Validate the Step 1 heading is visible and contains the expected text
    validate_Step1_Heading() {
        this.step_1_heading.should('be.visible').contains('Select department').invoke('text')
            .then((text) => {
                cy.log('Step-1 heading is validated:', text);
            });
    }
    // Select a department from the dropdown
    selectDropdown() {
        this.selectdropdown.should('be.visible').click({ force: true });
    }
    // Select a department from the dropdown options
    // This method uses a more specific selector to ensure the dropdown is visible before clicking
    selectDepartmentfromDropdown(department: string) {
        this.selectdepartmentfromDropdown.should('be.visible').contains(department).click({ force: true });
    }
    // Enter a service in the text area
    enterServiceTextArea(service: string) {
        this.serviceTextArea.should('be.visible').type(service, { force: true });
    }

    //----------------------- Step 2: Provide Details -----------------------//

    // Validate the Step 2 heading is visible and contains the expected text
    validate_Step2_Heading() {
        this.step_2_heading.should('be.visible').contains('Provide details').invoke('text')
            .then((text) => {
                cy.log('Step-2 heading is validated:', text);
            });
    }
    // Validate the department value in Step 2 that is selected from Step 1
    validateDepartmentStep2Value(department: string) {
        this.departmentStep2Value.should('be.visible').contains(department).invoke('text')
            .then((text) => {
                cy.log('Department in Step-2 is validated:', text);
            });
    }
    // Validate the service value in Step 2 that is entered in Step 1
    validateServiceStep2Value(service: string) {
        this.serviceStep2Value.should('be.visible').contains(service).invoke('text')
            .then((text) => {
                cy.log('Service in Step-2 is validated:', text);
            });
    }
    // Click the "Edit Step 1" button
    clickEditStepOneButton() {
        this.editStepOneButton.should('be.visible').click({ force: true });
    }
    // Capture the selected department from Step 1
    captureSelectedDepartmentStep1() {
        this.readDepartmentfromStep1
        .should('be.visible')
        .invoke('val')
        .then((department) => {
            cy.log('Selected department in Step 1:', department);
        });
    }
    // Select a privacy concern option based on the provided value
    selectPrivacyConcern(option: string | number) {
        this.privacyConcernOptions.first().scrollIntoView();
            // If option is a number or string number, select by value
        if (!isNaN(Number(option))) {
            this.privacyConcernOptions
            .filter(`[data-testid="radio-option-${option}"]`)
            .click({ force: true });
        } else {
            // Otherwise, select by label (case-insensitive)
            this.privacyConcernOptions.each(($el) => {
            if (
                $el.text().trim().toLowerCase() === option.toString().trim().toLowerCase()
            ) {
                cy.wrap($el).click({ force: true });
            }
            });
        }
    }
    // Enter text in the "Describe circumstances" text area
    enterDescribeCircumstancesTextArea(text: string) {
        this.describecircumstancesTextArea.should('be.visible').type(text);
    }
    //Enter employee name in the input field
    enterEmployeeName(name: string) {
        this.writeemployeename.should('be.visible').type(name);
    }
    //Enter first name and last name in the respective input fields
    enterFirstName_LastName(firstName: string, lastName: string) {
        this.inputfirstname.should('be.visible').type(firstName);
        this.inputlastname.should('be.visible').type(lastName);
    }
    //Enter first name in the input field with wrong format
    enterwrgformatfirstName_LastName(wrgformatfirstName: string, lastName: string) {
        this.inputfirstname.should('be.visible').type(wrgformatfirstName);
        this.inputlastname.should('be.visible').type(lastName);
    }
    // Clear the first name input field
    clearFirstNamefield() {
        this.inputfirstname.should('be.visible').clear();
    }
    // Enter first name in the input field
    enterFirstName(firstName: string) {
        this.inputfirstname.should('be.visible').type(firstName);
    }
    // Validate the user ID name format (FirstName LastName)
    // This method splits the userIDname by space and checks if the first name and last name match the input fields
    validateFirstname_LastName(userIDname: string) {
        const [firstName,lastName] = userIDname.split(''); 
        this.inputfirstname.should('be.visible').invoke('val').should('eq', firstName);
        this.inputlastname.should('be.visible').invoke('val').should('eq', lastName);
    }
    // Validate the email input field contains the expected email
    validateEmailExisting(email: string) {
        this.inputemail.should('exist').should('have.attr', 'value').and('include', email);
    }
    //Enter the email and confirm email in the respective input fields
    enterEmail_ConfirmEmail(email: string, confirmEmail: string) {
        // this.inputemail.should('be.visible').type(email);
        // this.inputconfirmemail.should('be.visible').type(confirmEmail);
         cy.typeWithRetry('[data-testid="email"]', email);
         cy.typeWithRetry('[data-testid="confirm-email"]', confirmEmail);
    }
    // Enter email in the input field with wrong format
    enterEmail_WrgConfirmEmail(email: string, wrgemail: string) {
        this.inputemail.should('be.visible').type(email);
        cy.typeWithRetry('[data-testid="confirm-email"]', wrgemail);
    }
    // Clear the confirm email input field
    clearConfirmEmailField() {
        this.inputconfirmemail.should('be.visible').clear();
    }
    // Enter confirm email in the input field with wrong format
    enterwrgformatconfirmemail(wrgformatemail: string) {
        this.inputconfirmemail.should('be.visible').type(wrgformatemail);
    }
    // Enter confirm email in the input field
    enterconfirmEmail(confirmEmail: string) {
        cy.typeWithRetry('[data-testid="confirm-email"]', confirmEmail);
    }

    //----------------------- Step 3: Attach Documentation -----------------------//

    // Validate the Step 3 heading is visible and contains the expected text
    validate_Step3_Heading() {
        this.step3_heading.should('be.visible').contains('Attach documentation').invoke('text')
            .then((text) => {
                cy.log('Step-3 heading is validated:', text);
            });
    }
    // Validate the file upload container is visible
    validateFileUploadContainer() {
        this.fileUploadcontainer.should('be.visible');
    }
    // Upload files using the provided file names
    UploadFiles(fileNames: string[], loadTimeout: number = 10000) {
        this.fileUploadcontainer.should('be.visible', { timeout: loadTimeout }).click();
        cy.uploadFiles('[data-testid="file-upload"] input[type="file"][data-testid="input"]', fileNames);
        // fileNames.forEach((fileName) => {
        // this.uploadFile.attachFile(fileName)
        // });
    }
    // Log the number of files uploaded
    logNumberOfFilesUploaded() {
        this.numberOfFilesUploaded
        .should('exist')
        .then($items => {
        cy.log(`Number of files attached: ${$items.length} files attached`);
      });
    }
    // Validate the number of files uploaded
    uploadLargeFile(fileName: string) {
        // Simulate a file >10MB (10 * 1024 * 1024 + 1 bytes)
        const largeContent = '0'.repeat(10 * 1024 * 1024 + 1);
        const blob = new Blob([largeContent], { type: 'application/pdf' });
        this.uploadFile.attachFile({
            fileContent: blob,
            fileName: fileName,
            mimeType: 'application/pdf'
        });
    }
    // Upload a file with a specific type
    uploadFileWithType(fileName: string) {
        this.uploadFile.attachFile(fileName);
    }
    // Validate the number of files uploaded
    validateNoFileUploadErrors() {
        const errorMessages = [
            'You cannot upload more than 5 documents',
            'The file must be less than 10MB',
            'Invalid file type'
        ];
        errorMessages.forEach(msg => {
        cy.contains(msg).should('not.exist');
        });
    }
    // Validate the error message for file upload
    validateFileUploadErrorMessage(expectedMessage: string) {
        this.fileuploadErrorMessage.should('be.visible').and('contain', expectedMessage);
    }
    // Validate the error message for large file upload
    validateLargeFileUploadErrorMessage(expectedMessage: string) {
        this.largeFileUploadErrorMessage.should('be.visible').and('contain', expectedMessage);
    }
    // Enter text in the "Describe documentation" text area
    enterDescribeDocumentaionTextArea(text: string) {
        this.describedocumentationTextArea.should('be.visible').type(text);
    }

    //----------------------- Step 4: Review and Submit -----------------------//

    // Validate the Step 4 heading is visible and contains the expected text
    validate_Step4_Heading() {
        this.step4_heading.should('be.visible').contains('Review and submit').invoke('text')
            .then((text) => {
                cy.log('Step-4 heading is validated:', text);
            });
    }
    // Click the "Edit Step 1" button from Step 4
    clickEditStep1ButtonFromStep4() {
        this.clickeditforstep1_fromstep4.should('be.visible').click({ force: true, multiple: true });
    }
    // Click the "Edit Step 2" button from Step 4
    clickEditStep2ButtonFromStep4() {
        this.clickeditforstep2_fromstep4.should('be.visible').click({ force: true, multiple: true });
    }
    // Click the "Edit Step 3" button from Step 4
    clickEditStep3ButtonFromStep4() {
        this.clickeditforstep3_fromstep4.should('be.visible').click({ force: true, multiple: true });
    }
    // Click the "Submit Complaint" button
    clickSubmitComplaintButton() {
        this.submitComplaintButton.should('be.visible').click({ force: true });
    }
    // Validate the success message after submitting the complaint
    validateSuccessMessage() {
        this.successContainer.should('be.visible');
        this.successCheckmarkIcon.should('exist');
        this.successMessageText
            .should('be.visible')
            .and('contain', 'Complaint submitted successfully')
            .invoke('text')
            .then((msg) => {
            cy.log(`Success message:, ${msg}`);
            });
    }

    // Click the "View complaint history" button
    clickViewComplaintHistoryButton() {
        //cy.contains('button', 'View complaint history').should('be.visible').click();
        this.viewcomplainthistorybutton.first().should('be.visible').then($goaBtn => {
        // Find the native button inside the custom element and click it
        cy.wrap($goaBtn)
          .shadow()
          .find('button')
          .should('be.visible').wait(500)
          .click({ force: true });
      });
        cy.get('[data-testid="page-sub-title"]').should('contain', 'Complaint history');
        cy.location('pathname').should('include', '/complaint-history');
    }
    validateContainerHeadingsFromStep4(expectedHeadings: string[]) {
        this.containerheadingsfromstep4.should('have.length', expectedHeadings.length)
            .each(($el, index: number) => {
            const headingText = $el.text().trim();
            expect(headingText).to.eq(expectedHeadings[index]);
            cy.log(`Container heading: ${headingText}`);
        });
    }
    validateNoAttachmentMessage_Step4() {
        this.lblNoAttachmentStep4Value.should('exist');
    }



  //-----------------------Locators-----------------------------------//

    //----------------------- File A Complaint - Landing Page & Collection Notice Page -----------------------//
    get pageheading() {
        return cy.get('[data-testid="page-sub-title"]');
    }
    get fileAComplaintbutton() {
        return cy.get('[data-testid="file-complaint-button"]');
    }
    get collectionnoticeheading() {
        return cy.get('[class="ComplaintCollectionNoticePage_tertiary-title__cH0+j"]');
    }
    get startAComplaintbutton() {
        return cy.get('[data-testid="start-complaint-button"]');
    }

    //----------------------- Common Actions -----------------------//
    get nextbutton(){
        return cy.get('[data-testid="complaint-navigation-next-button"]');
    }
    get backbutton(){
        return cy.get('[data-testid="complaint-navigation-back-button"]');
    }
 
    //----------------------- Step 1: Select Department -----------------------//
    get step_1_heading() {
        return cy.get('.details.svelte-6d3t92');
    }
    get selectdropdown() {
        return cy.get('.dropdown-input-group input[data-testid="input"]');
    }
    get selectdepartmentfromDropdown() {
        return cy.get('[data-testid="dropdown-menu"]');
    }
    get serviceTextArea() {
        return cy.get('[data-testid="service-text-area"]');
    }
    
    //----------------------- Step 2: Provide Details -----------------------//
    get step_2_heading() {
        return cy.get('.details.svelte-6d3t92');
    }
    get departmentStep2Value() {
        return cy.get('[data-testid="department-step2-value"]');
    }
    get serviceStep2Value() {
        return cy.get('[data-testid="service-step2-value"]');
    }
    get editStepOneButton() {
        return cy.get('[data-testid="edit-step-one-button"]');
    }
    get readDepartmentfromStep1() {
        return cy.get('.dropdown-input-group input[data-testid="input"]');
    }
    get privacyConcernOptions() {
        return cy.get('[data-testid^="radio-option-"]');
    }
    get describecircumstancesTextArea() {
        return cy.get('[data-testid="circumstances-text-area"]');
    }
    get writeemployeename(){
        return cy.get('[data-testid="employee-name"]');
    }
    get inputfirstname() {
        return cy.get('[data-testid="first-name"]');
    }
    get inputlastname() {
        return cy.get('[data-testid="last-name"]');
    }
    get inputemail() {
        return cy.get('[data-testid="email"]');
    }
    get inputconfirmemail() {
        return cy.get('[data-testid="confirm-email"]');
    }

    //----------------------- Step 3: Attach Documentation -----------------------//
    get step3_heading() {
        return cy.get('[data-testid="text"]');
    }
    get fileUploadcontainer() {
        return cy.get('[data-testid="file-upload"]');
    }
    get uploadFile() {
        return cy.get('[data-testid="file-upload"] input[type="file"][data-testid="input"]');
    }
    get numberOfFilesUploaded() {
        return cy.get('[data-testid="file-upload-card"]');
    }
    get fileuploadErrorMessage() {
        return cy.get('[data-testid="warning-indicator"]');
    }
    get largeFileUploadErrorMessage() {
        return cy.get('[data-testid="error"]');
    }
    get describedocumentationTextArea() {
        return cy.get('[data-testid="documentation-text-area"]');
    }

    //----------------------- Step 4: Review and Submit -----------------------//
    get step4_heading() {
        return cy.get('[data-testid="text"]');
    }
    get clickeditforstep1_fromstep4() {
        return cy.get('[data-testid="complaint-go-to-step-one-button"]');
    }
    get clickeditforstep2_fromstep4() {
        return cy.get('[data-testid="complaint-go-to-step-two-button"]');
    }
    get clickeditforstep3_fromstep4() {
        return cy.get('[data-testid="complaint-go-to-step-three-button"]');
    }
    get submitComplaintButton() {  
        return cy.get('[data-testid="complaint-navigation-submit-button"]');
    }
    get successContainer() {
        return cy.get('.success-container-heading');
    }
    get successCheckmarkIcon() {
        return cy.get('[data-type="checkmark-circle"]');
    }
    get successMessageText() {
        return cy.get('.Step4_section-heading-value__TIT4U');
    }
    get viewcomplainthistorybutton(){
        return cy.get('goa-button').contains('View complaint history');
    }
    get containerheadingsfromstep4() {
        return cy.get('.Step4_section-heading-label__KPOQQ');
    }
    get lblNoAttachmentStep4Value() {
        return cy.get('[data-testid="no-attachments-step4-value"]');
    }
    
}
export default new FileAComplaintPage();