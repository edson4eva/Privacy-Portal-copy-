import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LoginPage from '../../../pages/login.page';
import PersonalInformationPage from '../../../pages/personal_information.page';
import ServicesAccessedPage from '../../../pages/services_accessed.page';
import LeftNavigation from '../../../pages/leftnavigation.page';

Given('I open the login page', () => {
	cy.SignIn();
});

When('I enter valid credentials for user {string}, {string}', (email: string, password: string) => {
	LoginPage.loginasUser(email, password);
});

Then('I close the modal banner', () => {
	PersonalInformationPage.clickOncloseAnnouncementModal();
});

Then('I should see the personal information page', () => {
	PersonalInformationPage.validateWelcomeText();
	PersonalInformationPage.validatebadgeTitle('Verified');
});

Then('I should see the user status {string}', (status: string) => {
	PersonalInformationPage.validatebadgeTitle(status);
});

When('I click on privacy portal menu', () => {
	LeftNavigation.clickonPrivacyPortal();
});

When('I navigate to services accessed page', () => {
	LeftNavigation.clickonServicesAccessed();
});

Then('I validate the services accessed page heading', () => {
	ServicesAccessedPage.validatePageHeading();
});

Then('I validate the services accessed page title', () => {
	ServicesAccessedPage.validatePageSubTitle('Digital services accessed online');
});

When('I click on View services', () => {
	ServicesAccessedPage.clickViewServicesbtn();
});

Then('I validate the table headers {string}', (headers: string) => {
	const headersArray = headers.split(',').map(h => h.trim());
	ServicesAccessedPage.validateTableHeaders(headersArray);
});

Then('I validate the services accessed table', () => {
	ServicesAccessedPage.validateTable();
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

Then('I validate the service access history log', () => {
	ServicesAccessedPage.validateServiceAccessHistoryLog();
});

Then('I validate the service details accordion boxes', () => {
	ServicesAccessedPage.expandandvalidateAccordionBoxes();
});

When('I click back to services accessed button', () => {
	ServicesAccessedPage.clickBacktoServicesAccessedbtn();
});

Then('I validate the modal message', () => {
	ServicesAccessedPage.validateComingSoonModal();
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

Then('I cancel the searched service', () => {
	ServicesAccessedPage.clearSearchInput();
});

When('I filter the services by {string}', (category: string) => {
	ServicesAccessedPage.selectfilterCategoryByName(category);
});

When('I click on view services button in filter', () => {
	ServicesAccessedPage.clickViewServicesbtninFilterTab();
});

Then('I validate the filtered services', () => {
	ServicesAccessedPage.validateFilterResults();
	ServicesAccessedPage.validateServiceCategory();
	ServicesAccessedPage.clickBacktoServicesAccessedbtn();
});

When('I filter the services by {string} and sort by {string}', (category: string, sortby: string) => {
	ServicesAccessedPage.selectFilterCategoryAndSortBy(category, sortby);
});

When('I click on filter button to remove the filtered {string}', (category: string) => {
	ServicesAccessedPage.clickFilterButtonToRemoveFilter(category);
});

When('I click on cancel icon in filter', () => {
	ServicesAccessedPage.clickCloseicon();
});

Then('I validate the services accessed pagination controls', () => {
	ServicesAccessedPage.validatePagination();
});

When('I click on next page icon', () => {
	ServicesAccessedPage.clickNextPagelink();
});

Then('I validate the services on the next page by checking the page number', () => {
	ServicesAccessedPage.validateCurrentPageNumber();
});

When('I click on previous page icon', () => {
	ServicesAccessedPage.clickPreviousPagelink();
});

Then('I validate the services on the previous page by checking the page number', () => {
	ServicesAccessedPage.validateCurrentPageNumber();
});

When('I click on page number thru dropdown {string}', (page: string) => {
	ServicesAccessedPage.clickPageNumberFromDropdown(page);
});

Then('I validate the services on the selected page', () => {
	ServicesAccessedPage.validateTable();
});

When('I click on personal information page', () => {
	LeftNavigation.clickonPersonal();
	LeftNavigation.clickonPersonalInformation();
});

Then('I validate the personal information page heading', () => {
	PersonalInformationPage.validatePageHeading();
});
