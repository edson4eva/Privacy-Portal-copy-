describe('End-to-End Complaint Workflow', () => {
    describe('Basic Navigation', () => {
        it('should load the file complaint page', () => {
            cy.visit('/file-complaint');
            cy.url().should('include', '/file-complaint');
        });

        it('should navigate to complaint form', () => {
            cy.visit('/file-complaint/form');
            cy.url().should('include', '/file-complaint/form');
        });

        it('should navigate to collection notice', () => {
            cy.visit('/file-complaint/collection-notice');
            cy.url().should('include', '/collection-notice');
        });
    });

    describe('Authenticated User Flow', () => {
        beforeEach(() => {
            // Setup authenticated user
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

        it('should handle authenticated user flow', () => {
            cy.visit('/file-complaint');
            cy.url().should('include', '/file-complaint');
            
            // Authenticated users might see different content
            cy.get('body').should('be.visible');
        });

        it('should allow navigation between pages', () => {
            // Test navigation flow
            cy.visit('/file-complaint');
            cy.url().should('include', '/file-complaint');
            
            cy.visit('/file-complaint/form');
            cy.url().should('include', '/file-complaint/form');
            
            cy.visit('/complaint-history');
            cy.url().should('include', '/complaint-history');
        });
    });

    describe('Performance', () => {
        it('should load pages within acceptable time', () => {
            const startTime = Date.now();
            
            cy.visit('/file-complaint');
            cy.get('body').should('be.visible');
            
            cy.then(() => {
                const loadTime = Date.now() - startTime;
                expect(loadTime).to.be.lessThan(5000); // 5 seconds
            });
        });

        it('should handle rapid navigation', () => {
            const pages = [
                '/file-complaint',
                '/file-complaint/form',
                '/file-complaint/collection-notice',
                '/complaint-history'
            ];

            pages.forEach(page => {
                cy.visit(page, { failOnStatusCode: false });
                cy.get('body').should('be.visible');
            });
        });
    });

    describe('Error Recovery', () => {
        it('should handle 404 pages', () => {
            cy.visit('/non-existent-page', { failOnStatusCode: false });
            cy.get('body').should('be.visible');
        });

        it('should recover from navigation errors', () => {
            cy.visit('/file-complaint');
            cy.url().should('include', '/file-complaint');
            
            // Try invalid navigation
            cy.visit('/invalid-route', { failOnStatusCode: false });
            
            // Should be able to navigate back to valid route
            cy.visit('/file-complaint');
            cy.url().should('include', '/file-complaint');
        });
    });
});