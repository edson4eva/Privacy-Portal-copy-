describe('Complaint History Page - E2E Tests', () => {
    describe('Authenticated Access', () => {
        beforeEach(() => {
            // Mock authenticated user for history page
            cy.window().then(win => {
                win.localStorage.setItem('auth', JSON.stringify({
                    isAuthenticated: true,
                    user: {
                        email: 'test@example.com',
                        firstName: 'John',
                        lastName: 'Doe',
                        isVerified: true
                    }
                }));
            });
            cy.visit('/complaint-history');
        });

        it('should load complaint history page for authenticated users', () => {
            cy.url().should('include', '/complaint-history');
        });

        it('should show page content', () => {
            cy.get('body').should('be.visible');
        });
    });

    describe('Responsive Design', () => {
        beforeEach(() => {
            cy.window().then(win => {
                win.localStorage.setItem('auth', JSON.stringify({
                    isAuthenticated: true,
                    user: { email: 'test@example.com' }
                }));
            });
        });

        it('should display correctly on different viewports', () => {
            const viewports = [
                { name: 'desktop', width: 1280, height: 720 },
                { name: 'tablet', width: 768, height: 1024 },
                { name: 'mobile', width: 375, height: 667 }
            ];

            viewports.forEach(viewport => {
                cy.viewport(viewport.width, viewport.height);
                cy.visit('/complaint-history');
                cy.get('body').should('be.visible');
            });
        });
    });
});