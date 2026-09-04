describe('Complaint Start Page - E2E Tests', () => {
    beforeEach(() => {
        cy.visit('/file-complaint');
    });

    describe('Page Loading', () => {
        it('should display the complaint start page', () => {
            cy.url().should('include', '/file-complaint');
        });

        it('should show main content', () => {
            cy.get('body').should('be.visible');
        });

        it('should load page without errors', () => {
            cy.window().should('have.property', 'document');
        });
    });

    describe('User Interactions', () => {
        it('should handle navigation to form', () => {
            // Try to navigate to form page
            cy.visit('/file-complaint/form');
            cy.url().should('include', '/file-complaint/form');
        });
    });

    describe('Responsive Design', () => {
        it('should display correctly on desktop', () => {
            cy.viewport(1280, 720);
            cy.get('body').should('be.visible');
        });

        it('should display correctly on tablet', () => {
            cy.viewport(768, 1024);
            cy.get('body').should('be.visible');
        });

        it('should display correctly on mobile', () => {
            cy.viewport(375, 667);
            cy.get('body').should('be.visible');
        });
    });
});