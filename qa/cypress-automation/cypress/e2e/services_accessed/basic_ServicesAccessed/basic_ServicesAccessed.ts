import { Given, When, Then} from '@badeball/cypress-cucumber-preprocessor';
import LoginPage from '../../../pages/login.page';
import PersonalInformationPage from '../../../pages/personal_information.page';
import ServicesAccessedPage from '../../../pages/services_accessed.page';
import LeftNavigation from '../../../pages/leftnavigation.page';
import NewPrivacyFeaturePage from '../../../pages/newprivacyfeature.page';


Given('I open the login page', () => {
	cy.SignIn();
});

When('I enter valid credentials for user {string}, {string}', (userName: string, password: string) => {
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

Then('I validate services accessed page heading', () => {
	ServicesAccessedPage.validatePageHeading();
});

Then('I validate services accessed page title', () => {
	ServicesAccessedPage.validatePageSubTitle('Verify your account to view services accessed');
});

Then('I should see the alert icon', () => {
	ServicesAccessedPage.validateAlertIcon();
});

Then('I get the alert text message', () => {
	ServicesAccessedPage.checkAlertText();
});

When('I click on back to personal information page', () => {
	LeftNavigation.clickonPersonalInformation();
});

Then('I validate personal information page heading', () => {
	PersonalInformationPage.validateWelcomeText();
});
