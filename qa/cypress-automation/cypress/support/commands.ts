// cypress/support/commands.ts
// Extend Cypress Chainable interface to include 'typeWithRetry'
export {};

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      typeWithRetry(selector: string, text: string): Chainable<Subject>;
      SignIn(): Chainable<Subject>;
      setDeviceViewport(device: string): Chainable<Subject>;
      uploadFiles(selector: string, fileNames: string[]): Chainable<Subject>;
    }
  }
}

Cypress.Commands.add('typeWithRetry', (selector: string, text: string, options ={timeout: 10000, delay:20}) => {
  cy.get(selector, { timeout: 10000 }) // Wait for the element to appear
    .should('be.visible') // Ensure the element is visible
    .clear() // Clear any existing value
    .type(text, { delay: 30 }) // Type the text with a slight delay
    .should('have.value', text); // Verify the value was typed correctly
});
Cypress.Commands.add('SignIn', () => {
cy.visit('sign-in/signin');
   	 //cy.title().should('include', 'Alberta');
	  cy.title().should('include', 'Alberta.ca Account');
    cy.location('protocol').should('include', 'https:');  
});
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('toLowerCase is not a function')) {
    return false;
  }
});
Cypress.Commands.add('setDeviceViewport', (device: string) => {
  const deviceViewports: Record<string, { width: number; height: number } | string> = {
    'iphone-13': { width: 390, height: 844 },
    'samsung-s22': { width: 360, height: 780 },
    'iphone-15+': { width: 430, height: 932 },
    'ipad-10th': { width: 820, height: 1180 },
    'galaxy-tab-s8': { width: 800, height: 1340 },
    'macbook-15': 'macbook-15'
  };
  const viewport = deviceViewports[device];
  if (!viewport) throw new Error(`Unknown device: ${device}`);
  if (typeof viewport === 'string') {
    cy.viewport(viewport as Cypress.ViewportPreset);
  } else {
    cy.viewport(viewport.width, viewport.height);
  }
});
Cypress.Commands.add('uploadFiles', (selector: string, fileNames: string[]) => {
  fileNames.forEach(fileName => {
    cy.get(selector).attachFile(fileName);
  });
});