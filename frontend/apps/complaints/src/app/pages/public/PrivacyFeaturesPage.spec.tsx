import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import PrivacyFeaturesPage from './PrivacyFeaturesPage';

jest.mock('@abgov/react-components', () => ({
    GoabIcon: ({ type }: { type: string }) => <i data-testid={`icon-${type}`} />,
}));

jest.mock('shared/src/lib/utils/demoMode', () => ({ isDemoMode: jest.fn() }));

import { isDemoMode } from 'shared/src/lib/utils/demoMode';
const mockIsDemoMode = isDemoMode as jest.Mock;

const renderPage = () => render(<MemoryRouter><PrivacyFeaturesPage /></MemoryRouter>);

describe('PrivacyFeaturesPage', () => {
    beforeEach(() => jest.clearAllMocks());

    it('renders the heading and the three options', () => {
        mockIsDemoMode.mockReturnValue(true);
        renderPage();

        expect(screen.getByText('Privacy features')).toBeInTheDocument();
        expect(screen.getByText('Service activity')).toBeInTheDocument();
        expect(screen.getByText('Privacy complaint')).toBeInTheDocument();
        expect(screen.getByText('Security settings')).toBeInTheDocument();
    });

    it('sends every option through the demo sign-in in demo mode', () => {
        mockIsDemoMode.mockReturnValue(true);
        renderPage();

        expect(screen.getByTestId('service-activity-view')).toHaveAttribute(
            'href',
            '/sign-in?returnTo=%2Faccount-history%2Faccessed-services'
        );
        expect(screen.getByTestId('privacy-complaint-file')).toHaveAttribute(
            'href',
            '/sign-in?returnTo=%2Fcomplaints%2Ffile-complaint'
        );
        expect(screen.getByTestId('security-settings-manage')).toHaveAttribute(
            'href',
            '/sign-in?returnTo=%2Fcomplaints%2Fsecurity-settings'
        );
    });

    it('points at the account service when demo mode is off', () => {
        mockIsDemoMode.mockReturnValue(false);
        renderPage();

        for (const testId of ['service-activity-view', 'privacy-complaint-file', 'security-settings-manage']) {
            const href = screen.getByTestId(testId).getAttribute('href') ?? '';
            expect(href.startsWith('/sign-in')).toBe(false);
        }
    });
});
