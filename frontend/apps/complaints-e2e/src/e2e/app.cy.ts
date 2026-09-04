describe('Complaints App - Basic Tests', () => {
    describe('Application Loading', () => {
        it('should load the application', () => {
            cy.visit('/');
            cy.url().should('include', '/');
        });

        it('should have proper document structure', () => {
            cy.visit('/');
            cy.document().should('have.property', 'charset').and('eq', 'UTF-8');
            cy.title().should('not.be.empty');
        });
    });

    describe('Routing', () => {
        it('should navigate to file complaint page', () => {
            cy.visit('/file-complaint');
            cy.url().should('include', '/file-complaint');
        });

        it('should handle root redirect', () => {
            cy.visit('/');
            // Root should either stay at / or redirect to a default page
            cy.url().should('match', /\/($|file-complaint|home)/);
        });

        it('should handle deep linking', () => {
            // Test deep link to form
            cy.visit('/file-complaint/form');
            cy.url().should('include', '/file-complaint/form');
            cy.get('body').should('be.visible');
        });
    });

    describe('Browser Compatibility', () => {
        it('should work in Chrome', () => {
            cy.visit('/');
            cy.get('body').should('be.visible');
        });

        it('should handle browser storage', () => {
            cy.visit('/');
            
            // Test localStorage
            cy.window().then((win) => {
                win.localStorage.setItem('test', 'value');
                expect(win.localStorage.getItem('test')).to.equal('value');
                win.localStorage.removeItem('test');
            });
            
            // Test sessionStorage
            cy.window().then((win) => {
                win.sessionStorage.setItem('test', 'value');
                expect(win.sessionStorage.getItem('test')).to.equal('value');
                win.sessionStorage.removeItem('test');
            });
        });
    });
});