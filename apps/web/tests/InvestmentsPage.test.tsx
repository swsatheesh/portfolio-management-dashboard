import { render, screen, waitFor } from '@testing-library/react';
import { InvestmentsPage } from '../src/pages/InvestmentsPage';

jest.mock('../src/lib/api', () => ({
  apiRequest: jest.fn(),
}));

import { apiRequest } from '../src/lib/api';

const mockedApiRequest = apiRequest as jest.Mock;

describe('InvestmentsPage', () => {
  beforeEach(() => {
    mockedApiRequest.mockReset();
    localStorage.setItem('accessToken', 'test-token');
  });

  it('renders investments list', async () => {
    mockedApiRequest.mockResolvedValue([
      {
        id: 'investment-1',
        name: 'Apple Inc.',
        symbol: 'AAPL',
        assetType: 'STOCK',
        quantity: 10,
        purchasePrice: 150,
        currentPrice: 200,
        createdAt: '',
        updatedAt: '',
      },
    ]);

    render(<InvestmentsPage />);

    expect(screen.getByText(/loading investments/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    });

    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('$2,000.00')).toBeInTheDocument();
  });

  it('renders empty state when there are no investments', async () => {
    mockedApiRequest.mockResolvedValue([]);

    render(<InvestmentsPage />);

    await waitFor(() => {
      expect(screen.getByText(/no investments found/i)).toBeInTheDocument();
    });
  });
});