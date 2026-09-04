describe('Check actual spacing', () => {
    const baseHref = Cypress.env('NX_PUBLIC_BASE_HREF');
    
    beforeEach(() => {
        cy.interceptAuth(true, 'verified');
        cy.interceptAccessedServices(true);
    });

    it('should check the actual left gap', () => {
        cy.viewport(1920, 1080);
        cy.visit(baseHref);
        
        // Wait for page to load
        cy.get('[data-testid="page-title"]').should('be.visible');
        
        // Check actual gap
        cy.get('.uiam--side-menu').then(($leftNav) => {
            const divOffset = $leftNav[0].getBoundingClientRect();
            cy.get('[data-testid="page-title"]').then(($text) => {
                const textOffset = $text[0].getBoundingClientRect();
                const horizontalGap = textOffset.left - divOffset.right;
                cy.log(`Actual gap: ${horizontalGap}px`);
                cy.log(`Side menu right: ${divOffset.right}px`);
                cy.log(`Content left: ${textOffset.left}px`);
            });
        });
    });
});