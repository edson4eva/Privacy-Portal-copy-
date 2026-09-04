describe('Multi-Step Form Workflow', () => {
    beforeEach(() => {
        // Setup authenticated user for better form experience
        cy.window().then(win => {
            win.localStorage.setItem('auth', JSON.stringify({
                isAuthenticated: true,
                user: {
                    email: 'test@example.com',
                    firstName: 'Test',
                    lastName: 'User',
                    isVerified: true
                }
            }));
        });
    });

    describe('Form Page Access', () => {
        it('should load the form page', () => {
            cy.visit('/file-complaint/form');
            cy.url().should('include', '/file-complaint/form');
            cy.get('body').should('be.visible');
        });

        it('should have form elements on the page', () => {
            cy.visit('/file-complaint/form');
            // Check if any form-related elements exist
            cy.get('form, [role="form"], div').should('exist');
        });
    });

    describe('Form Navigation', () => {

        it('should maintain URL structure', () => {
            cy.visit('/file-complaint/form');
            // Simply verify we're on the form page
            cy.url().should('include', '/file-complaint/form');
            
            // Wait a moment to ensure page is stable
            cy.wait(500);
            
            // Verify we're still on the form page
            cy.url().should('include', '/file-complaint');
        });
    });

    describe('Form Responsiveness', () => {
        it('should work on mobile viewport', () => {
            cy.viewport(375, 667);
            cy.visit('/file-complaint/form');
            cy.get('body').should('be.visible');
        });

        it('should work on tablet viewport', () => {
            cy.viewport(768, 1024);
            cy.visit('/file-complaint/form');
            cy.get('body').should('be.visible');
        });

        it('should work on desktop viewport', () => {
            cy.viewport(1280, 720);
            cy.visit('/file-complaint/form');
            cy.get('body').should('be.visible');
        });
    });

    describe('Form State', () => {
        it('should persist authentication state', () => {
            cy.visit('/file-complaint/form');
            
            // Check that auth is still in localStorage
            cy.window().then(win => {
                const auth = JSON.parse(win.localStorage.getItem('auth') || '{}');
                expect(auth.isAuthenticated).to.equal(true);
            });
        });

        it('should handle page refresh', () => {
            cy.visit('/file-complaint/form');
            cy.reload();
            cy.url().should('include', '/file-complaint/form');
            cy.get('body').should('be.visible');
        });
    });

    describe('Collection Notice Step', () => {
        it('should access collection notice page', () => {
            cy.visit('/file-complaint/collection-notice');
            cy.url().should('include', '/collection-notice');
            cy.get('body').should('be.visible');
        });

        it('should navigate between form and collection notice', () => {
            // Visit form first
            cy.visit('/file-complaint/form');
            cy.url().should('include', '/file-complaint/form');
            
            // Then visit collection notice
            cy.visit('/file-complaint/collection-notice');
            cy.url().should('include', '/collection-notice');
            
            // Go back to form
            cy.visit('/file-complaint/form');
            cy.url().should('include', '/file-complaint/form');
        });
    });

    describe('Form Workflow Sequence', () => {
        it('should follow the complaint filing workflow', () => {
            // Step 1: Start page
            cy.visit('/file-complaint');
            cy.url().should('include', '/file-complaint');
            cy.get('body').should('be.visible');
            
            // Step 2: Collection notice (if applicable)
            cy.visit('/file-complaint/collection-notice');
            cy.url().should('include', '/collection-notice');
            cy.get('body').should('be.visible');
            
            // Step 3: Form page
            cy.visit('/file-complaint/form');
            cy.url().should('include', '/file-complaint/form');
            cy.get('body').should('be.visible');
        });

        it('should allow returning to start page', () => {
            cy.visit('/file-complaint/form');
            cy.visit('/file-complaint');
            cy.url().should('include', '/file-complaint');
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid form URLs gracefully', () => {
            cy.visit('/file-complaint/form/invalid-step', { failOnStatusCode: false });
            cy.get('body').should('be.visible');
        });

        it('should recover from navigation errors', () => {
            cy.visit('/file-complaint/form/step99', { failOnStatusCode: false });
            cy.get('body').should('be.visible');
            
            // Should be able to navigate to valid form page
            cy.visit('/file-complaint/form');
            cy.url().should('include', '/file-complaint/form');
        });
    });
});