import { Given, When, Then} from '@badeball/cypress-cucumber-preprocessor';
import LoginPage from '../../../pages/login.page';
import PersonalInformationPage from '../../../pages/personal_information.page';
import NewPrivacyFeaturePage from '../../../pages/newprivacyfeature.page';

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

Then('I validate the first title on the new privacy feature page', () => {
	NewPrivacyFeaturePage.validateFirstContainerTitle();
});

Then('I capture the bullet points under the first container', () => {
	NewPrivacyFeaturePage.validateFirstContainerBulletPoints();
});

Then('I validate the second title on the new privacy feature page', () => {
	NewPrivacyFeaturePage.validateSecondContainerTitle();
});

Then('I capture the heading of all the containers names under second title', () => {
	NewPrivacyFeaturePage.validateSecondContainerBulletPoints();
});

Then('I validate the third title on the new privacy feature page', () => {
	NewPrivacyFeaturePage.validateThirdContainerTitle();
});

Then('I capture the heading of all the containers names under third title', () => {
	NewPrivacyFeaturePage.validateThirdContainerBulletPoints();
});
