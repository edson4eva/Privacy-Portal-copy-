import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './app';
import { jest } from '@jest/globals';
jest.mock('@abgov/web-components', () => ({
    // Provide mock implementations if needed
}));

describe('App', () => {
    it('should render successfully', () => {
        const { baseElement } = render(
            <MemoryRouter>
                <App />
            </MemoryRouter>
        );
        expect(baseElement).toBeTruthy();
    });
});
