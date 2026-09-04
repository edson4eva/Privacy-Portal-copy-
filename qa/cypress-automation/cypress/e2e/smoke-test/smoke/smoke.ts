import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LoginPage from '../../../pages/login.page';
import PersonalInformationPage from '../../../pages/personal_information.page';
import ServicesAccessedPage from '../../../pages/services_accessed.page';
import LeftNavigation from '../../../pages/leftnavigation.page';
import NewPrivacyFeaturePage from '../../../pages/newprivacyfeature.page';
import FileAComplaintPage from '../../../pages/fileacomplaint.page';
import ComplaintHistoryPage from '../../../pages/complainthistory.page';


Given('I open the login page', () => {
	cy.SignIn();
});

When('I enter valid credentials for user {string}, {string}', (email: string, password: string) => {
	LoginPage.loginasUser(email, password);
});

Then('I close the modal banner', () => {
	PersonalInformationPage.clickOncloseAnnouncementModal();
});

When('I click on privacy portal menu', () => {
	LeftNavigation.clickonPrivacyPortal();
});

When('I navigate to new privacy feature page', () => {
	LeftNavigation.clickonNewfeaturePage();
});

Then('I validate new privacy feature page heading', () => {
	NewPrivacyFeaturePage.validatePageHeading();
});

When('I navigate to services accessed page', () => {
	LeftNavigation.clickonServicesAccessed();
});

Then('I validate services accessed page heading', () => {
	ServicesAccessedPage.validatePageHeading();
});

When('I navigate to privacy complaint page', () => {
	LeftNavigation.clickonPrivacyComplaint();
});

Then('I validate privacy complaint page heading', () => {
	FileAComplaintPage.validatePageHeading();
});

When('I navigate to complaints history page', () => {
	ComplaintHistoryPage.clickViewComplaintHistoryButtonfromFileAComplaintpage();
});

Then('I validate complaints history page heading', () => {
	ComplaintHistoryPage.validatePageHeading();
});
