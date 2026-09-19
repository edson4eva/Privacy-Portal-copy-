import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import StaffAccessDetail from './StaffAccessDetail';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

jest.mock('@abgov/react-components', () => ({
    GoabButton: ({ children, onClick, testId }: { children: React.ReactNode; onClick?: () => void; testId?: string }) => (
        <button data-testid={testId} onClick={onClick}>{children}</button>
    ),
    GoabCircularProgress: ({ visible }: { visible: boolean }) => <div data-testid="spinner">{String(visible)}</div>,
    GoabIcon: ({ type }: { type: string }) => <i data-testid={`icon-${type}`} />,
}));

jest.mock('shared/src/lib/page-title/PageTitle', () => ({
    __esModule: true,
    default: ({ title }: { title: string }) => <div data-testid="page-title">{title}</div>,
}));

jest.mock('shared/src/lib/api/dataService', () => ({ get: jest.fn() }));

import { get } from 'shared/src/lib/api/dataService';
const mockGet = get as jest.Mock;

const payload = {
    staffAccess: {
        record: {
            id: 'sa-1',
            name: 'J. Doe',
            username: 'jdoe01',
            role: 'Benefits Officer 2',
            unit: 'Income Support - Edmonton North',
            accessedAt: '2026-09-19T20:32:00.000Z',
            categories: ['Financial'],
            information: ['Personal income', 'payment history'],
            reasonType: 'Benefit calculation',
            reasonDetail: 'client called re: September shortfall',
            system: 'Income Support Case Management',
            accessType: 'Viewed',
        },
    },
};

const renderDetail = (id = 'sa-1') =>
    render(
        <MemoryRouter initialEntries={[`/transparency/${id}`]}>
            <Routes>
                <Route path="/transparency/:access" element={<StaffAccessDetail />} />
            </Routes>
        </MemoryRouter>
    );

describe('StaffAccessDetail', () => {
    beforeEach(() => jest.clearAllMocks());

    it('shows the record in full', async () => {
        mockGet.mockResolvedValue(payload);
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('access-record')).toBeInTheDocument());
        const card = screen.getByTestId('access-record');
        expect(card).toHaveTextContent('J. Doe');
        expect(card).toHaveTextContent('jdoe01');
        expect(card).toHaveTextContent('Benefits Officer 2');
        expect(card).toHaveTextContent('Income Support - Edmonton North');
        expect(card).toHaveTextContent('Personal income, payment history');
        expect(card).toHaveTextContent('Benefit calculation - client called re: September shortfall');
        expect(mockGet).toHaveBeenCalledWith('/v1/staff-access/sa-1');
    });

    it('names the system used and what was done', async () => {
        mockGet.mockResolvedValue(payload);
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('access-record')).toBeInTheDocument());
        expect(screen.getByTestId('access-record')).toHaveTextContent('Income Support Case Management');
        expect(screen.getByTestId('access-record')).toHaveTextContent('Viewed');
    });

    it('stamps the access in Alberta time', async () => {
        mockGet.mockResolvedValue(payload);
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('access-record')).toBeInTheDocument());
        expect(screen.getByTestId('access-record')).toHaveTextContent('2026-09-19 14:32 MDT');
    });

    it('goes back to the list', async () => {
        mockGet.mockResolvedValue(payload);
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('back-link')).toBeInTheDocument());
        fireEvent.click(screen.getByTestId('back-link'));
        expect(mockNavigate).toHaveBeenCalledWith('/transparency');
    });

    it('offers a route to filing a privacy complaint', async () => {
        mockGet.mockResolvedValue(payload);
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('file-complaint-link')).toBeInTheDocument());
        expect(screen.getByTestId('file-complaint-link').getAttribute('href')).toContain('file-complaint');
    });

    it('reports a record it cannot find', async () => {
        mockGet.mockResolvedValue({ staffAccess: {} });
        renderDetail('nope');

        await waitFor(() => expect(screen.getByTestId('record-missing')).toBeInTheDocument());
    });

    it('still renders when the request fails', async () => {
        // Reject at call time; a promise rejected at setup time can surface as an
        // unhandled rejection before the component attaches its catch.
        mockGet.mockImplementation(() => Promise.reject(new Error('boom')));
        renderDetail();

        await waitFor(() => expect(screen.getByTestId('record-missing')).toBeInTheDocument());
    });
});
