import { Given, When, Then} from '@badeball/cypress-cucumber-preprocessor';
import LoginPage from '../../../pages/login.page';
import PersonalInformationPage from '../../../pages/personal_information.page';
import NewPrivacyFeaturePage from '../../../pages/newprivacyfeature.page';
import ServicesAccessedPage from '../../../pages/services_accessed.page';
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

Then('I click Access Privacy Portal in the modal banner', () => {
	PersonalInformationPage.clickOnAccessPrivacyPortalAnnouncementModal();
});

Then('I validate the new privacy feature page heading', () => {
	NewPrivacyFeaturePage.validatePageHeading();
});

When('I click on services accessed from the new privacy feature page', () => {
	NewPrivacyFeaturePage.clickServicesAccessedlink();
});

Then('I validate the services accessed page heading', () => {
	ServicesAccessedPage.validatePageHeading()
});

Then('I validate the services accessed page title', () => {
	ServicesAccessedPage.validatePageSubTitle('Digital services accessed online');
});

When('I click on View services', () => {
	ServicesAccessedPage.clickViewServicesbtn();
});

Then('I validate the services accessed count', () => {
	ServicesAccessedPage.checkServicesAccessedCount();
});

When('I search for {string} service', (search: string) => {
	ServicesAccessedPage.clickSearchInput(search);
});

Then('I validate the searched services', () => {
	ServicesAccessedPage.validateSearchResults();
});

When('I click on the {string} view details link', (service: string) => {
	if (typeof service === 'string' && service) {
	ServicesAccessedPage.clickViewServiceLink(service); }
});

Then('I validate the service details page heading', () => {
	ServicesAccessedPage.validateServiceName();
});

Then('I validate the service category', () => {
	ServicesAccessedPage.validateServiceCategory();
});

When('I click on Back to services accessed page', () => {
	ServicesAccessedPage.clickBacktoServicesAccessedbtn();
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

Then('I select Department {string} from dropdown menu', (department:string) => {
	FileAComplaintPage.selectDepartmentfromDropdown(department);
});

When('I click on Next button from step-1', () => {
	FileAComplaintPage.clickNextButton();
});

Then('I validate the user is on the provide details page', () => {
	FileAComplaintPage.validate_Step2_Heading();
});

Then('I click on the privacy concerns checkbox', () => {
	FileAComplaintPage.selectPrivacyConcern(5);
});

Then('I enter details in describe circumstances field {string}', (describecircumstances:string) => {
	FileAComplaintPage.enterDescribeCircumstancesTextArea(describecircumstances);
});

Then('I validate firstName and lastName are pre-filled', () => {
	FileAComplaintPage.validateFirstname_LastName(<string>userIDname);
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

When('I click on the view complaint history button', () => {
	FileAComplaintPage.clickViewComplaintHistoryButton();
});

Then('I validate the complaint history page heading', () => {
	ComplaintHistoryPage.validatePageHeading();
});

Then('I validate the latest submitted complaint', () => {
	ComplaintHistoryPage.validateLatestSubmittedComplaintAndLogService();
});
