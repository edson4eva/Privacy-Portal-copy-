import { Given, When, Then} from '@badeball/cypress-cucumber-preprocessor';
import LoginPage from '../../../pages/login.page';
import PersonalInformationPage from '../../../pages/personal_information.page';
import NewPrivacyFeaturePage from '../../../pages/newprivacyfeature.page';
import FileAComplaintPage from '../../../pages/fileacomplaint.page';
import ComplaintHistoryPage from '../../../pages/complainthistory.page';
import LeftNavigation from '../../../pages/leftnavigation.page';


Given('I open the login page', () => {
	cy.SignIn();
});

When('I enter valid credentials for user {string}, {string}', (userName:string,password:string) => {
	LoginPage.loginasUser(userName, password);
});

When('I click Access Privacy Portal in the modal banner', () => {
    LeftNavigation.navigateTopersonalInformationPage();
    PersonalInformationPage.clickOnAccessPrivacyPortalAnnouncementModal();
});

Then('I validate the new privacy feature page heading', () => {
	NewPrivacyFeaturePage.validatePageHeading();
});

When('I click on file a complaint from the new privacy feature page', () => {
	NewPrivacyFeaturePage.clickFileAComplaintlink();
	cy.wait(500); // Wait for the page to load
});

Then('I validate the privacy complaint page heading', () => {
	FileAComplaintPage.validatePageHeading();
});

When('I click on File a complaint', () => {
	FileAComplaintPage.clickFileAComplaintbtn();
});

Then('I validate the collection notice page heading', () => {
	FileAComplaintPage.validateCollectionNoticeHeading();
});

When('I click on Start a complaint', () => {
	FileAComplaintPage.clickStartAComplaintbtn();
});

Then('I validate the user is on the select department page', () => {
	FileAComplaintPage.validate_Step1_Heading();
});

When('I click on the select department button', () => {
	FileAComplaintPage.selectDropdown();
});

Then('I select Department {string} from dropdown menu', (department:string) => {
	FileAComplaintPage.selectDepartmentfromDropdown(department);
});

Then('I enter {string} in the service textbox field', (service:string) => {
	FileAComplaintPage.enterServiceTextArea(service);
});

When('I click on Next button from step-1', () => {
	FileAComplaintPage.clickNextButton();
});

Then('I validate the user is on the provide details page', () => {
	FileAComplaintPage.validate_Step2_Heading();
});

Then('I validate the selected department {string} and service {string} is displayed', (department:string,service:string) => {
	FileAComplaintPage.validateDepartmentStep2Value(department);
    FileAComplaintPage.validateServiceStep2Value(service);
});

When('I click on edit button in the step-2', () => {
	FileAComplaintPage.clickEditStepOneButton();
});

Then('I capture the mandatory field entered on step-1 department', () => {
	FileAComplaintPage.captureSelectedDepartmentStep1();
});

Then('I click the on the privacy concerns checkbox', () => {
	FileAComplaintPage.selectPrivacyConcern(4);
//FileAComplaintPage.selectPrivacyConcern('Unauthorized disclosure'); // by label
});

Then('I enter details in describe circumstances field {string}', (describecircumstances:string) => {
	FileAComplaintPage.enterDescribeCircumstancesTextArea(describecircumstances);
});

Then('I enter {string} in the employee name field', (employeename:string) => {
	FileAComplaintPage.enterEmployeeName(employeename);
});

Then('I enter {string} as the first name and {string} as the last name', (firstName:string,lastName:string) => {
	FileAComplaintPage.enterFirstName_LastName(firstName, lastName);
});

Then('I enter {string} as the email and {string} as the confirm email', (email:string,confirmemail:string) => {
	FileAComplaintPage.enterEmail_ConfirmEmail(email, confirmemail);
});

When('I click on Next button from step-2', () => {
	FileAComplaintPage.clickNextButton();
});

Then('I validate the user is on the attach documents page', () => {
	FileAComplaintPage.validate_Step3_Heading();
});

When('I validate the uplod files container is active', () => {
	FileAComplaintPage.validateFileUploadContainer();
});

Then('I upload the png file and pdf file', () => {
	FileAComplaintPage.UploadFiles(['Image_png.png', 'Test_pdf.pdf']);
    cy.wait(2000); // Wait for files to upload
    FileAComplaintPage.logNumberOfFilesUploaded();
});

Then('I enter the document description in the {string} field', (describedocuments:string) => {
	FileAComplaintPage.enterDescribeDocumentaionTextArea(describedocuments);
});

When('I click on Next button from step-3', () => {
	FileAComplaintPage.clickNextButton();
});

Then('I validate the user is on the review and submit page', () => {
	FileAComplaintPage.validate_Step4_Heading();
});

When('I click on the edit button in the step-4 for select department', () => {
	FileAComplaintPage.clickEditStep1ButtonFromStep4();
});

Then('I validate that user is on the select department page', () => {
	FileAComplaintPage.validate_Step1_Heading();
});

When('I click on the edit button in the step-4 for provide details', () => {
	FileAComplaintPage.clickEditStep2ButtonFromStep4();
});

Then('I validate that user is on the provide details page', () => {
	FileAComplaintPage.validate_Step2_Heading();
});

When('I click on the edit button in the step-4 for attach documents', () => {
    FileAComplaintPage.clickEditStep3ButtonFromStep4();
});

Then('I validate that user is on the attach documents page', () => {
    FileAComplaintPage.validate_Step3_Heading();
});

Then('I click on the submit button', () => {
	FileAComplaintPage.clickSubmitComplaintButton();
});

Then('I validate the success message page', () => {
	FileAComplaintPage.validateSuccessMessage();
});

When('I click on the view complaint history button', () => {
	FileAComplaintPage.clickViewComplaintHistoryButton();
});

Then('I validate the complaint history page heading', () => {
	ComplaintHistoryPage.validatePageHeading();
});

Then('I validate the latest submitted complaint', () => {
    ComplaintHistoryPage.validateLatestSubmittedComplaintAndLogService();
});

When('I click on back to privacy complaint button', () => {
	ComplaintHistoryPage.clickBackToPrivacyComplaintButton();
});

