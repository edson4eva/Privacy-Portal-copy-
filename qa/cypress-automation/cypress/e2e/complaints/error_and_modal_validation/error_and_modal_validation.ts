import { Given, When, Then} from '@badeball/cypress-cucumber-preprocessor';
import LoginPage from '../../../pages/login.page';
import PersonalInformationPage from '../../../pages/personal_information.page';
import FileAComplaintPage from '../../../pages/fileacomplaint.page';
import ComplaintsErrorMsgPage from '../../../pages/complaints_errrormsg.page';
import LeftNavigation from '../../../pages/leftnavigation.page';
import complaints_errrormsgPage from '../../../pages/complaints_errrormsg.page';

Given('I open the login page', () => {
	cy.SignIn();
});

When('I enter valid credentials for user {string}, {string}', (userName:string,password:string) => {
	LoginPage.loginasUser(userName, password);
});

When('I close the modal banner', () => {
	PersonalInformationPage.clickOncloseAnnouncementModal();
});

Then('I should see the personal information page', () => {
	PersonalInformationPage.validateWelcomeText();
});

When('I click on privacy portal menu', () => {
	LeftNavigation.clickonPrivacyPortal();
});

When('I navigate to Privacy complaint page', () => {
	LeftNavigation.clickonPrivacyComplaint();
});

Then('I validate privacy complaint page heading', () => {
	FileAComplaintPage.validatePageHeading();
});

When('I click on File a complaint', () => {
	FileAComplaintPage.clickFileAComplaintbtn();
});

When('I click on Start a complaint', () => {
	FileAComplaintPage.clickStartAComplaintbtn();
});

Then('I validate the user is on the select department page', () => {
	FileAComplaintPage.validate_Step1_Heading();
});

When('I click on Next button from step-1', () => {
	FileAComplaintPage.clickNextButton();
});

Then('I see the error message for step-1 as {string}', (expectedMsg: string) => {
	ComplaintsErrorMsgPage.checkStep1DeptErrorMsg(expectedMsg);	
});

Then('I select Department {string} from dropdown menu', (department:string) => {
	FileAComplaintPage.selectDropdown();
	FileAComplaintPage.selectDepartmentfromDropdown(department);	
});

Then('I validate the user is on the provide details page', () => {
	FileAComplaintPage.validate_Step2_Heading();
});

When('I click on Next button from step-2', () => {
	FileAComplaintPage.clickNextButton();
});

Then('I see the error message for privacy concern under step-2 as {string}', (expectedprivacyconcernMsg:string) => {
	ComplaintsErrorMsgPage.checkStep2ErrorMsg(expectedprivacyconcernMsg);	
});

Then('I click on the privacy concerns checkbox', () => {
	FileAComplaintPage.selectPrivacyConcern(4);
});

Then('I see the error message for describe circumstances under step-2 as {string}', (expectedCircumstancesMsg: string) => {
	ComplaintsErrorMsgPage.checkStep2ErrorMsg(expectedCircumstancesMsg);	
});

Then('I enter details in describe circumstances field {string}', (describecircumstances:string) => {
	FileAComplaintPage.enterDescribeCircumstancesTextArea(describecircumstances);	
});

Then('I see the error message for first name under step-2 as {string}', (expectedfnameMsg: string) => {
	ComplaintsErrorMsgPage.checkStep2ErrorMsg(expectedfnameMsg);	
});

Then('I see the error message for last name under step-2 as {string}', (expectedlnameMsg: string) => {
	ComplaintsErrorMsgPage.checkStep2ErrorMsg(expectedlnameMsg);	
});

Then('I enter {string} as the first name and {string} as the last name', (wrgformatfirstName:string,lastName:string) => {
	FileAComplaintPage.enterwrgformatfirstName_LastName(wrgformatfirstName, lastName);
});

Then('I see the error message for incorrect format first name under step-2 as {string}', (expectedincorrectformatMsg:string) => {
	ComplaintsErrorMsgPage.checkStep2ErrorMsg(expectedincorrectformatMsg);
});

Then('I clear the first name field', () => {
	FileAComplaintPage.clearFirstNamefield();
});

Then('I enter {string} as the first name', (firstName:string) => {
	FileAComplaintPage.enterFirstName(firstName);
});

Then('I see the error message for email under step-2 as {string}', (expectedemailMsg:string) => {
	ComplaintsErrorMsgPage.checkStep2ErrorMsg(expectedemailMsg);	
});

Then('I see the error message for confirm email under step-2 as {string}', (expectedconfirmemailMsg:string) => {
	ComplaintsErrorMsgPage.checkStep2ErrorMsg(expectedconfirmemailMsg);	
});

Then('I enter {string} as the email and {string} as the confirm email', (email:string,wrgemail:string) => {
	FileAComplaintPage.enterEmail_WrgConfirmEmail(email, wrgemail);	
});

Then('I see the error message for email mismatch under step-2 as {string}', (expectedmismatchMsg:string) => {
	ComplaintsErrorMsgPage.checkStep2ErrorMsg(expectedmismatchMsg);	
});

Then('I clear the confirm your email field', () => {
	FileAComplaintPage.clearConfirmEmailField();
});

Then('I enter incorrect format email {string} as the confirm email', (wrgformatemail:string) => {
	FileAComplaintPage.enterwrgformatconfirmemail(wrgformatemail);	
});

Then('I see the error message for incorrect format email under step-2 as {string}', (expectedincorrectformatemailMsg:string) => {
	ComplaintsErrorMsgPage.checkStep2ErrorMsg(expectedincorrectformatemailMsg);		
});

Then('I enter {string} as the confirm email', (confirmemail:string) => {
	FileAComplaintPage.enterconfirmEmail(confirmemail);	
});

Then('I validate the user is on the attach documents page', () => {
	FileAComplaintPage.validate_Step3_Heading();
});

When('I validate the uplod files container is active', () => {
	FileAComplaintPage.validateFileUploadContainer();
});

Then('I upload the pdf file', () => {
	FileAComplaintPage.UploadFiles(['Test_pdf.pdf']);
});

When('I click on Next button from step-3', () => {
	cy.wait(1000);FileAComplaintPage.clickNextButton();
});

Then('I see the error message for document description under step-3 as {string}', (expectedDocumentssMsg:string) => {
	complaints_errrormsgPage.checkStep3ErrorMsg(expectedDocumentssMsg);	
});

Then('I enter the document description in the {string} field', (describedocuments:string) => {
	FileAComplaintPage.enterDescribeDocumentaionTextArea(describedocuments);	
});

When('I click on Back button from step-3', () => {
	FileAComplaintPage.clickBackButton();
});

When('I click on Back button from step-2', () => {
	FileAComplaintPage.clickBackButton();
});

When('I click on Back button from step-1', () => {
	FileAComplaintPage.clickBackButton();
});

Then('I see a modal popup with the message {string}', (expectedmodalMsg: string) => {
	complaints_errrormsgPage.checkModalMessage(expectedmodalMsg);	
});

When('I click on Cancel in the modal popup', () => {
	complaints_errrormsgPage.clickCancelOnModal();
});

Then('I validate the user is on the review and submit page', () => {
	FileAComplaintPage.validate_Step4_Heading();
});

Then('I click on the submit button', () => {
	FileAComplaintPage.clickSubmitComplaintButton();
});

Then('I validate the success message page', () => {
	FileAComplaintPage.validateSuccessMessage();
});