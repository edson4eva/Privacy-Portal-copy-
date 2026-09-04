import { render } from '@testing-library/react';

import App from './app';
import { jest } from '@jest/globals';
jest.mock('@abgov/web-components', () => ({
    // Provide mock implementations if needed
}));

describe('App', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<App />);
        expect(baseElement).toBeTruthy();
    });
});
