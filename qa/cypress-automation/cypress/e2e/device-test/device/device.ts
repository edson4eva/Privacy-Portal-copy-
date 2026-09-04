import { Given, When, Then} from '@badeball/cypress-cucumber-preprocessor';
import LoginPage from '../../../pages/login.page';
import PersonalInformationPage from '../../../pages/personal_information.page';
import FileAComplaintPage from '../../../pages/fileacomplaint.page';
import LeftNavigation from '../../../pages/leftnavigation.page';
import MobileDevicePage from '../../../pages/mobile_device.page';

Given('I open the login page', () => {
	cy.SignIn();
});

When('I set the device to {string}', (device: string) => {
	cy.setDeviceViewport(device);	
});

When('I enter valid credentials for user {string}, {string}', (userName:string,password:string) => {
	LoginPage.loginasUser(userName, password);
});

Then('I close the modal banner', () => {
	LeftNavigation.navigateTopersonalInformationPage();
	PersonalInformationPage.clickOncloseAnnouncementModal();
});

When('I click on privacy portal menu', () => {
	MobileDevicePage.clickMenuLink();
	MobileDevicePage.clickPrivacyPortalLink();
});

When('I navigate to Privacy complaint page', () => {
	MobileDevicePage.clickPrivacyComplaintLink();
});

When('I click on File a complaint', () => {
	FileAComplaintPage.clickFileAComplaintbtn();
});

When('I click on Start a complaint', () => {
	FileAComplaintPage.clickStartAComplaintbtn();
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

Then('I click on the privacy concerns checkbox', () => {
	FileAComplaintPage.selectPrivacyConcern(6);
});

Then('I enter details in describe circumstances field {string}', (describecircumstances:string) => {
	FileAComplaintPage.enterDescribeCircumstancesTextArea(describecircumstances);
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

When('I click on Next button from step-3', () => {
	FileAComplaintPage.clickNextButton();
});

Then('I click on the submit button', () => {
	FileAComplaintPage.clickSubmitComplaintButton();
});

Then('I validate the success message page', () => {
	FileAComplaintPage.validateSuccessMessage();
});
