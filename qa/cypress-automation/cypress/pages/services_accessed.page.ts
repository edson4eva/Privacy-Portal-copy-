class ServicesAccessedPage {
 //-----------------------Actions-----------------------------------//

    // Validate the services accessed page heading 
    validatePageHeading() {
        // cy.get('.loader, .spinner, [data-testid="global-loader"]', { timeout: 15000 }).should('not.exist');
        // this.pageheading.should('be.visible').contains('SERVICES ACCESSED');
        cy.get('[class="PageTitle_page-title__eX6sH"]', { timeout: 20000 }).should('be.visible').and('contain', 'SERVICES ACCESSED');
    }
    validatePageSubTitle(title: string) {
        this.pageSubTitle.should('be.visible').contains(title);
    }
    clickViewServicesbtn() {
        this.viewservicesbtn.click({ force: true });
    }
    validateAlertIcon() {
        this.alerticon_Basicuser.should('be.visible');
    }
    checkAlertText() {
        this.alertText.should('exist').invoke('text')
            .then((text) => {
                cy.log('Alert text :', text);
            });
    }
    
    // Validate the table headers against the expected headers
    validateTableHeaders(headers: string[]) {
        // Wait for the correct number of headers to be visible
        this.tableHeaders.should('have.length', headers.length, { timeout: 20000 });
        headers.forEach((header, index) => {
            this.tableHeaders.eq(index).should('include.text', header);
            cy.wait(500);
        });
    }
    validateTable() {
        this.entiretable.should('be.visible', { timeout: 30000 });
    }
    /* Click the service link based on the service name
      The service name should be a string and not empty */
    clickViewServiceLink(serviceName: string) {
        if (typeof serviceName !== 'string' || !serviceName) {
        cy.log('Invalid serviceName passed to clickViewServiceLink');
        return;
        }
        const kebab = serviceName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, ' ')
            .trim()
            .replace(/\s+/g, '-');
        cy.get(`[data-testid="view-${kebab}"]`).click();
    }
    // Validate the service name, category, and access history log
    validateServiceName() {
        this.servicename.should('exist', {timeout:20000}).and('be.visible').invoke('text')
            .then((text) => {
                cy.log('Validated service name:', text);
            });
    }
    validateServiceCategory() {
        this.serviceCategory.should('exist',{timeout:20000}).and('be.visible').invoke('text')
            .then((text) => {
                cy.log('Validated service category:', text);
            });
    }
    validateServiceAccessHistoryLog() {
        this.serviceAccessHistoryLog.should('exist',{timeout:20000}).and('be.visible').invoke('text')
            .then((text) => {
                cy.log('Validated service access history log:', text);
            });
    }
    // Expand and validate each accordion box in the service details section
    expandandvalidateAccordionBoxes() {
        // Scroll to the first accordion to bring the section into view
        this.servicedeatils_accordions.first().scrollIntoView();
        this.servicedeatils_accordions.find('goa-accordion').each(($accordion) => {
            const heading = $accordion.attr('heading');
            cy.log(`Accordion heading: ${heading}`);
            cy.wrap($accordion).click();
            cy.wrap($accordion)
                .find('.Accordion_accordion-body__KFzqg')
                .invoke('text')
                .then((content) => {
                    cy.log(`Accordion content: ${content}`);
                });
            cy.wrap($accordion).click();
            cy.wait(1000);
        });
    }
    clickBacktoServicesAccessedbtn() {
        this.backtoServicesAccessedbtn.click({ force: true });
    }
    validateComingSoonModal() {
        this.servicecommingsoonmodal.should('be.visible')
            .contains('Service details coming soon');
    }
    // Validate the services accessed count is at least the minimum count specified
    checkServicesAccessedCount(minCount = 1) {
        this.entiretable.should('be.visible');
        cy.wait(1000);
        this.servicesaccessedcount
            .should('exist')
            .invoke('text')
            .then((text) => {
                cy.log('Services accessed count text:', text);
                const count = parseInt(text.trim(), 10);
                cy.log(`Parsed services accessed count: ${count}`);
                expect(count).to.be.at.least(minCount);
            });
    }
    // Click the search input, clear it, and type the service name
    clickSearchInput(servicename: string) {
        this.searchInput.first().should('be.visible')
            .clear().wait(2000);
        cy.typeWithRetry('[name="searchBox"]', servicename);
    }
    // Validate the search results by checking the first row of the table
    validateSearchResults(): Cypress.Chainable<string> {
        return this.entiretable
            .should('be.visible')
            .find('tbody', {timeout:10000})
            .should('exist')
            .find('tr')
            .should('have.length.greaterThan', 0)
            .first()
            .find('td:first-child')
            .invoke('text')
            .then((text) => {
                cy.log('Service name text:', text);
            });
    }
    clearSearchInput() {
        this.searchInput.first().should('be.visible')
            .clear().should('have.value', '');
    }
    // Select a filter category by name and log the selection
    selectfilterCategoryByName(category: string) {
        this.filterIcon.click({ force: true });
        this.filterCategoryCheckboxes
            .find(`[name="${category}"]`)
            .click({ force: true, multiple: true });
        cy.log(`Selected filter category: ${category}`);

    }
    // Click the "View Services" button in the filter tab
    clickViewServicesbtninFilterTab() {
        this.viewservicesbtninfiltertab
            .first().should('exist')
            .and('not.be.disabled').click({ force: true });
    }
    clickCloseicon() {
        this.closeicon.should('be.visible')
            .click({ force: true });
        cy.log('Close modal button clicked');
    }
    // Validate the filter results by clicking the first view link in the table
    validateFilterResults() {
        this.entiretable
            .find('tbody tr')
            .first().within(() => {
                cy.get('a[data-testid^="view-"]')
                    .first().click({ force: true });
            });
    }
    // Select a filter category and sort by the specified option
    selectFilterCategoryAndSortBy(category: string, sortBy: string) {
        this.filterIcon.click({ force: true });
        this.filterCategoryCheckboxes
        .find(`[name="${category}"]`)
        .click({ force: true, multiple: true });
        // Select the sort option by clicking the radio button
        this.filterSortbtn.each(($radio) => {
            const label = $radio.attr('label');
            if (
                    typeof label === 'string' &&
                    typeof sortBy === 'string' &&
                    label && sortBy &&
                    label.localeCompare(sortBy, undefined, { sensitivity: 'accent' }) === 0
                ) {
                    cy.wrap($radio).click();
                }
        });
        cy.log(`Selected filter category: ${category} and sort by: ${sortBy}`);
    }
    // Click the filter button to remove a filter category
    clickFilterButtonToRemoveFilter(category: string) {
        this.filterIcon.click({ force: true });
        this.filterCategoryCheckboxes
            .find(`[name="${category}"]`)
            .click({ force: true, multiple: true });
    }
    validatePagination() {
        this.pagination.should('be.visible');
    }
    clickNextPagelink() {
        this.nextprevious_pagelink.should('be.visible')
            .contains('Next').click({ force: true });
    }
    // Validate the current page number is greater than 0
    validateCurrentPageNumber() {
        this.currentPagenumber.should('be.visible')
            .invoke('val')
            .then((val) => {
                cy.log(`Current page number:', ${val}`);
                expect(Number(val)).to.be.greaterThan(0)
            });
    }
    clickPreviousPagelink() {
        this.nextprevious_pagelink.should('be.visible')
            .contains('Previous').click({ force: true });
    }
    // Click the page number from the dropdown and log the selection
    clickPageNumberFromDropdown(pageNumber: string) {
        this.currentPagenumber.scrollIntoView();
        this.currentPagenumber.click({ force: true });
        cy.get(`[data-testid="dropdown-item-${pageNumber}"]`)
            .should('be.visible')
            .click({ force: true });
        cy.log(`Selected page number: ${pageNumber}`);
    }





  //-----------------------Locators-----------------------------------//
    get pageheading() {
        return cy.get('[class="PageTitle_page-title__eX6sH"]');
    }
    get pageSubTitle() {
        return cy.get('[data-testid="page-heading"]');
    }
    get viewservicesbtn() {
        return cy.get('goa-button').find('[data-testid="btn-view-services"]');
    }
    get alerticon_Basicuser() {
        return cy.get('[data-testid="verify-account-alert-icon"]');
    }
    get alertText() {
        return cy.get('[data-testid="verify-account-alert-text"]');
    }
    get tableHeaders() {
        return cy.get('.AccessedServices_tbl-thead__URj7w').find('th');
    }
    get entiretable() {
        //return cy.get('[data-testid="services-table"]');
        return cy.get('table');
    }
    get viewservicelink() {
        return cy.get('[data-testid="view-${kebab}"]')
    }
    get servicename() {
        return cy.get('[data-testid="service-name"]');
    }
    get serviceCategory() {
        return cy.get('.ServiceDetails_badge__a0tUC');
    }
    get serviceAccessHistoryLog() {
        return cy.get('[data-testid="log-table"]');
    }
    get servicedeatils_accordions() {
        return cy.get('.Accordion_accordion__rmGpi');
    }
    get backtoServicesAccessedbtn() {
        return cy.get('[data-testid="btn-back-to-account-history"]');
    }
    get servicecommingsoonmodal() {
        return cy.get('.ServiceDetails_coming-soon-title-text__t61h6');
    }
    get servicesaccessedcount() {
        return cy.get('.AccessedServices_services-count__eaOBW');
    }
    get searchInput() {
        return cy.get('[name="searchBox"]');
    }
    get searchInputLabel() {
        return cy.get('[testid="services-table"] tbody tr td:first-child');
    }
    get filterIcon() {
        return cy.get('.SearchFilter_filter-button-text__es6L3');
    }
    get filterCategoryCheckboxes() {
        return cy.get('.SearchFilter_filter-category-checkbox-container__-2KvI goa-checkbox');
    }
    get viewservicesbtninfiltertab() {
        //return cy.get('.SearchFilter_services-filter-btn__oXtRp > goa-button');
        return cy.get('.ApplyFilterButton_services-filter-btn__d99PC > goa-button');
    }
    get closeicon() {
        return cy.get('button[aria-label="Close the modal"]');
     // return cy.get('goa-icon-button[aria-label="Close the modal"]');
    }
    get filterSortbtn() {
        return cy.get('[data-testid="radio-option-latest-accessed"]');
    }
    get pagination() {
        return cy.get('[data-testid="page-selector"]');
    }
    get nextprevious_pagelink() {
        return cy.get('[data-testid="page-links"]');
    }
    get currentPagenumber() {
        return cy.get('input[data-testid="input"]');
    }
   

}

export default new ServicesAccessedPage();