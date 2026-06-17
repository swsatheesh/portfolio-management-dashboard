import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionsPage } from '../src/pages/TransactionsPage';
import { apiRequest } from '../src/lib/api';

jest.mock('../src/lib/api', () => ({
  apiRequest: jest.fn(),
}));

jest.mock('../src/components/layout/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const mockedApiRequest = apiRequest as jest.Mock;

describe('TransactionsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders transactions after loading', async () => {
    mockedApiRequest
      .mockResolvedValueOnce([
        {
          id: 'trx-1',
          type: 'BUY',
          quantity: 50,
          price: 1270,
          transactionDate: '2026-06-16T00:00:00.000Z',
          investment: {
            id: 'inv-1',
            symbol: 'HINDUNILVR',
          },
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 'inv-1',
          symbol: 'HINDUNILVR',
          name: 'Hindustan Unilever',
          assetType: 'STOCK',
          quantity: 50,
          purchasePrice: 1200,
          currentPrice: 1270,
        },
      ]);

    render(<TransactionsPage />);

    expect(screen.getByText('Loading transactions...')).toBeInTheDocument();

    expect(await screen.findByText('Transactions')).toBeInTheDocument();

    const rows = screen.getAllByRole('row');

    expect(rows[1]).toHaveTextContent('HINDUNILVR');
    expect(rows[1]).toHaveTextContent('BUY');
    expect(rows[1]).toHaveTextContent('50');
    expect(rows[1]).toHaveTextContent('$1,270.00');
    expect(rows[1]).toHaveTextContent('16 Jun 2026');
  });

  it('shows validation errors when required fields are invalid', async () => {
    mockedApiRequest.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    render(<TransactionsPage />);

    const submitButton = await screen.findByRole('button', {
      name: /create transaction/i,
    });

    await userEvent.click(submitButton);

    expect(screen.getByText('Investment is required')).toBeInTheDocument();
    expect(screen.getByText('Quantity must be greater than 0')).toBeInTheDocument();
    expect(screen.getByText('Price must be greater than 0')).toBeInTheDocument();

    expect(mockedApiRequest).toHaveBeenCalledTimes(2);
    expect(mockedApiRequest).not.toHaveBeenCalledWith('/api/transactions', {
      method: 'POST',
      body: expect.any(String),
    });
  });

  it('creates transaction when form is valid', async () => {
    mockedApiRequest
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 'inv-1',
          symbol: 'HDFCBANK',
          name: 'HDFC Bank',
          assetType: 'STOCK',
          quantity: 100,
          purchasePrice: 700,
          currentPrice: 780,
        },
      ])
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 'inv-1',
          symbol: 'HDFCBANK',
          name: 'HDFC Bank',
          assetType: 'STOCK',
          quantity: 100,
          purchasePrice: 700,
          currentPrice: 780,
        },
      ]);

    render(<TransactionsPage />);

    await screen.findByText('Transactions');

    fireEvent.change(screen.getByLabelText(/investment/i), {
      target: { value: 'inv-1' },
    });

    fireEvent.change(screen.getByLabelText(/quantity/i), {
      target: { value: '10' },
    });

    fireEvent.change(screen.getByLabelText(/price/i), {
      target: { value: '780' },
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /create transaction/i,
      })
    );

    await waitFor(() => {
      expect(mockedApiRequest).toHaveBeenCalledWith(
        '/api/transactions',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    const postCall = mockedApiRequest.mock.calls.find(
      ([url, options]) =>
        url === '/api/transactions' && options?.method === 'POST'
    );

    expect(postCall).toBeDefined();

    const body = JSON.parse(postCall[1].body);

    expect(body).toEqual({
      investmentId: 'inv-1',
      type: 'BUY',
      quantity: 10,
      price: 780,
      transactionDate: expect.any(String),
    });
  });

  it('deletes transaction after confirmation', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    mockedApiRequest
      .mockResolvedValueOnce([
        {
          id: 'trx-1',
          type: 'BUY',
          quantity: 50,
          price: 1270,
          transactionDate: '2026-06-16T00:00:00.000Z',
          investment: {
            id: 'inv-1',
            symbol: 'HINDUNILVR',
          },
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 'inv-1',
          symbol: 'HINDUNILVR',
          name: 'Hindustan Unilever',
          assetType: 'STOCK',
          quantity: 50,
          purchasePrice: 1200,
          currentPrice: 1270,
        },
      ])
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 'inv-1',
          symbol: 'HINDUNILVR',
          name: 'Hindustan Unilever',
          assetType: 'STOCK',
          quantity: 50,
          purchasePrice: 1200,
          currentPrice: 1270,
        },
      ]);

    render(<TransactionsPage />);

    const deleteButton = await screen.findByRole('button', {
      name: /delete/i,
    });

    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockedApiRequest).toHaveBeenCalledWith('/api/transactions/trx-1', {
        method: 'DELETE',
      });
    });
  });
});