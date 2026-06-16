import { render, screen, waitFor } from '@testing-library/react';
import { TransactionsPage } from '../src/pages/TransactionsPage';

jest.mock('../src/lib/api', () => ({
  apiRequest: jest.fn(),
}));

import { apiRequest } from '../src/lib/api';

const mockedApiRequest = apiRequest as jest.Mock;

describe('TransactionsPage', () => {
  beforeEach(() => {
    mockedApiRequest.mockReset();

    mockedApiRequest
      .mockResolvedValueOnce([
        {
          id: 'tx-1',
          type: 'BUY',
          quantity: 10,
          price: 150,
          transactionDate: '2026-06-16',
          investment: {
            id: 'inv-1',
            symbol: 'AAPL',
            name: 'Apple Inc.',
          },
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 'inv-1',
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
  });

  it('renders transaction history', async () => {
    render(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('2026-06-16')).toBeInTheDocument();
    });

    expect(screen.getAllByText('AAPL').length).toBeGreaterThan(0);
    expect(screen.getAllByText('BUY').length).toBeGreaterThan(0);
    expect(screen.getByText('$150')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create transaction/i }))
      .toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i }))
      .toBeInTheDocument();
  });
});