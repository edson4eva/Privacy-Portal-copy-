import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import LoginPage from '../../../pages/login.page';
import PersonalInformationPage from '../../../pages/personal_information.page';
import FileAComplaintPage from '../../../pages/fileacomplaint.page';
import LeftNavigation from '../../../pages/leftnavigation.page';

Given('I open the login page', () => {
    cy.SignIn();
});

When('I enter valid credentials for user {string}, {string}', (userName: string, password: string) => {
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

When('I click on the select department button', () => {
    FileAComplaintPage.selectDropdown();
});

Then('I select Department {string} from dropdown menu', (department: string) => {
    FileAComplaintPage.selectDepartmentfromDropdown(department);
});

When('I click on Next button from step-1', () => {
    FileAComplaintPage.clickNextButton();
});

Then('I validate the user is on the provide details page', () => {
    FileAComplaintPage.validate_Step2_Heading();
});

Then('I click on the privacy concerns checkbox', () => {
    FileAComplaintPage.selectPrivacyConcern(2);
});

Then('I enter details in describe circumstances field {string}', (describecircumstances: string) => {
    FileAComplaintPage.enterDescribeCircumstancesTextArea(describecircumstances);
});

Then('I enter {string} as the first name and {string} as the last name', (firstName: string, lastName: string) => {
    FileAComplaintPage.enterFirstName_LastName(firstName, lastName);
});

Then('I enter {string} as the email and {string} as the confirm email', (email: string, confirmemail: string) => {
    FileAComplaintPage.enterEmail_ConfirmEmail(email, confirmemail);
});

When('I click on Next button from step-2', () => {
    FileAComplaintPage.clickNextButton();
});

Then('I validate the user is on the attach documents page', () => {
    FileAComplaintPage.validate_Step3_Heading();
});

When('I validate the upload files container is active', () => {
    FileAComplaintPage.validateFileUploadContainer();
});

When('I upload the following valid files:', (dataTable: { hashes: () => Array<{ fileName: string }> }) => {
    const fileNames = dataTable.hashes().map(row => row.fileName);
    FileAComplaintPage.UploadFiles(fileNames);
});

When('I enter the document description in the field as {string}', (describedocuments: string) => {
    cy.wait(2000); // Wait for the file upload to complete
    FileAComplaintPage.enterDescribeDocumentaionTextArea(describedocuments);
});

Then('I should not see any file upload error messages', () => {
    FileAComplaintPage.validateNoFileUploadErrors();
});

When('I click on Next button from step-3', () => {
    FileAComplaintPage.clickNextButton();
});

Then('I validate the user is on the review and submit page', () => {
    FileAComplaintPage.validate_Step4_Heading();
});

When('I upload the following files:', (dataTable: { hashes: () => Array<{ fileName: string }> }) => {
    const fileNames = dataTable.hashes().map(row => row.fileName);
    FileAComplaintPage.UploadFiles(fileNames);
});

When('I enter the document description in the {string} field', (describedocuments: string) => {
    cy.wait(2000); // Wait for the file upload to complete
    FileAComplaintPage.enterDescribeDocumentaionTextArea(describedocuments);
});

Then('I should see the file count error message {string}', (errorMessage: string) => {
    FileAComplaintPage.validateFileUploadErrorMessage(errorMessage);
});

When('I upload a file named {string} with size greater than 10MB', (fileName: string) => {
    FileAComplaintPage.uploadLargeFile(fileName);
});

Then('I should see the file size error message {string}', (errorMessage: string) => {
    FileAComplaintPage.validateLargeFileUploadErrorMessage(errorMessage);
});

When('I upload a file named {string} with file type {string}', (fileName: string, fileType: string) => {
    FileAComplaintPage.uploadFileWithType(fileName);
    cy.log(`Uploaded file: ${fileName} with type: ${fileType}`);
});

Then('I should see the file type error message {string}', (errorMessage: string) => {
    FileAComplaintPage.validateLargeFileUploadErrorMessage(errorMessage);
});
