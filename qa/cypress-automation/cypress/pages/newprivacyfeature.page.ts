class NewPrivacyFeaturePage {

  //-----------------------Actions-----------------------------------//
    validatePageHeading() {
        this.pageheading.should('be.visible').contains('Protecting your privacy');
    }
    clickFileAComplaintlink() {
        this.fileAComplaintlink.click();
    }
    clickServicesAccessedlink() {
        this.servicesaccessedlink.click();
    }
    
    validateFirstContainerTitle() {
        this.firstContainerTitle.should('be.visible').contains("What's new");
    }
    /* Validates the bullet points in the first container and logs each point.
     The bullet points are expected to be visible and contain text. */
    validateFirstContainerBulletPoints() {
        this.firstContainerBulletPoints.should('be.visible').each(($el, index = 0) => {
            cy.log(`Bullet point ${index + 1}: ${$el.text()}`);
        });
    }

    validateSecondContainerTitle() {
        this.secondContainerTitle.should('be.visible').contains('Your data and privacy options');
    }
    /* Validates the bullet points in the second container and logs each point.
     The bullet points are expected to be visible and contain text. */
    validateSecondContainerBulletPoints() {
        this.secondContainerBulletPoints.should('be.visible').each(($el, index = 0) => {
            cy.log(`Title ${index + 1}: ${$el.text()}`);
        });
    }

    validateThirdContainerTitle() {
        this.thirdContainerTitle.should('be.visible').contains('Learn more about privacy in Alberta');
    }
    /* Validates the bullet points in the third container and logs each point.
     The bullet points are expected to be visible and contain text. */
    validateThirdContainerBulletPoints() {
        this.thirdContainerBulletPoints.should('be.visible').each(($el, index = 0) => {
            cy.log(`Learn More Title ${index + 1}: ${$el.text().trim()}`);
        });
    }



  //-----------------------Locators-----------------------------------//
    get pageheading() {
        return cy.get('[data-testid="page-sub-title"]');
    }
    get fileAComplaintlink() {
        return cy.get('a').contains('File a complaint');
    }
    get servicesaccessedlink() {
        return cy.get('a').contains('View');
    }
    get firstContainerTitle() {
        return cy.get('[class="PrivacyFeaturesPage_span-label__VnISr"]');
    }
    get firstContainerBulletPoints() {
        return cy.get('.PrivacyFeaturesPage_list-whats-new__YtrxX p');
    }
    get secondContainerTitle() {
        return cy.get('[class="PrivacyFeaturesPage_span-label__VnISr"]');
    }
    get secondContainerBulletPoints() {
        return cy.get('.PrivacyFeaturesPage_options__cD74K label.PrivacyFeaturesPage_options-title__E222Y');
    }
    get thirdContainerTitle() {
        return cy.get('[class="PrivacyFeaturesPage_span-label__VnISr"]');
    }
    get thirdContainerBulletPoints() {
        return cy.get('.PrivacyFeaturesPage_learn-more__ZGUz5 .PrivacyFeaturesPage_title__QLhGy a');
    }


}
export default new NewPrivacyFeaturePage();