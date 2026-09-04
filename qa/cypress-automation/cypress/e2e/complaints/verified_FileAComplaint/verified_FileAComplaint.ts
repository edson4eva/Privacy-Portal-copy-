import { Given, When, Then} from '@badeball/cypress-cucumber-preprocessor';
import LoginPage from '../../../pages/login.page';
import PersonalInformationPage from '../../../pages/personal_information.page';
import FileAComplaintPage from '../../../pages/fileacomplaint.page';
import ComplaintHistoryPage from '../../../pages/complainthistory.page';
import LeftNavigation from '../../../pages/leftnavigation.page';

let userIDname: string = '';

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
    PersonalInformationPage.validatebadgeTitle('Verified');
});

Then('I should see the user status {string}', (status: string) => {
	PersonalInformationPage.validatebadgeTitle(status);
});

Then('I capture the firstname and lastname of the user', () => {
	PersonalInformationPage.validate_Store_UserIdentificationName();
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

Then('I validate the collection notice page heading', () => {
	FileAComplaintPage.validateCollectionNoticeHeading();
});

Then('I click on Start a complaint', () => {
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

When('I click on Next button from step-1', () => {
	FileAComplaintPage.clickNextButton();
});

Then('I validate the user is on the provide details page', () => {
	FileAComplaintPage.validate_Step2_Heading();
});

Then('I validate the selected department {string} and service is displayed', (department:string) => {
	FileAComplaintPage.validateDepartmentStep2Value(department);	
});

Then('I click on the privacy concerns checkbox', () => {
	FileAComplaintPage.selectPrivacyConcern(3);
});

Then('I enter details in describe circumstances field {string}', (describecircumstances:string) => {
	FileAComplaintPage.enterDescribeCircumstancesTextArea(describecircumstances);
});

Then('I validate firstName and lastName are pre-filled', () => {
	FileAComplaintPage.validateFirstname_LastName(<string>userIDname);
});

Then('I verify the email field is pre-filled but editable', (userName:string) => {
	FileAComplaintPage.validateEmailExisting(userName);
});

Then('I enter {string} as the email and {string} as the confirm email', (email:string,confirmemail:string) => {
	FileAComplaintPage.enterEmail_ConfirmEmail(email, confirmemail);	
});

// Then('I enter {string} as the confirm email', (args1) => {
// 	console.log(args1);
	
// });

When('I click on Next button from step-2', () => {
	FileAComplaintPage.clickNextButton();
});

Then('I validate the user is on the attach documents page', () => {
	FileAComplaintPage.validate_Step3_Heading();
});

When('I click on Next button from step-3', () => {
	FileAComplaintPage.clickNextButton();
});

Then('I validate the user is on the review and submit page', () => {
	FileAComplaintPage.validate_Step4_Heading();
});

Then('I validate the heading of each container in step-4', () => {
	const expectedHeadings = [
		'Select department',
		'Provide details',
		'Attach documentation'];
	FileAComplaintPage.validateContainerHeadingsFromStep4(expectedHeadings);
});

Then('I validate the attach document container has information modal', () => {
	FileAComplaintPage.validateNoAttachmentMessage_Step4();
});

When('I click on the Submit button', () => {
	FileAComplaintPage.clickSubmitComplaintButton();
});

Then('I validate the success message page', () => {
	FileAComplaintPage.validateSuccessMessage();
});

// When('I click on privacy portal menu', () => {
	
// });

// When('I navigate to Privacy complaint page', () => {
	
// });

When('I click on the view complaint history button', () => {
	FileAComplaintPage.clickViewComplaintHistoryButton();
});

Then('I validate the complaint history page heading', () => {
	ComplaintHistoryPage.validatePageHeading();
});

Then('I validate the latest submitted complaint', () => {
	ComplaintHistoryPage.validateLatestSubmittedComplaintAndLogService();
});
