import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InvestmentsPage } from '../src/pages/InvestmentsPage';

jest.mock('../src/services/api', () => ({
  apiRequest: jest.fn(),
}));

import { apiRequest } from '../src/services/api';

const mockedApiRequest = apiRequest as jest.Mock;

describe('InvestmentsPage', () => {
  beforeEach(() => {
    mockedApiRequest.mockReset();
    localStorage.setItem('portfolio_access_token', 'test-token');
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

  it('shows validation errors when form is invalid', async () => {
    mockedApiRequest.mockResolvedValue([]);

    render(<InvestmentsPage />);

    await waitFor(() => {
      expect(screen.getByText(/no investments found/i)).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByRole('button', {
        name: /create investment/i,
      })
    );

    expect(screen.getByText('Investment name is required')).toBeInTheDocument();
    expect(screen.getByText('Symbol is required')).toBeInTheDocument();
    expect(screen.getByText('Quantity must be greater than 0')).toBeInTheDocument();
    expect(screen.getByText('Purchase price must be greater than 0')).toBeInTheDocument();

    expect(mockedApiRequest).toHaveBeenCalledTimes(1);
  });

  it('creates investment when form is valid', async () => {
    mockedApiRequest
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({
        id: 'investment-1',
        name: 'Apple Inc.',
        symbol: 'AAPL',
        assetType: 'STOCK',
        quantity: 10,
        purchasePrice: 150,
        currentPrice: 200,
        createdAt: '',
        updatedAt: '',
      })
      .mockResolvedValueOnce([
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

    await waitFor(() => {
      expect(screen.getByText(/no investments found/i)).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText(/name/i), 'Apple Inc.');
    await userEvent.type(screen.getByLabelText(/symbol/i), 'aapl');

    await userEvent.clear(screen.getByLabelText(/quantity/i));
    await userEvent.type(screen.getByLabelText(/quantity/i), '10');

    await userEvent.clear(screen.getByLabelText(/purchase price/i));
    await userEvent.type(screen.getByLabelText(/purchase price/i), '150');

    await userEvent.clear(screen.getByLabelText(/current price/i));
    await userEvent.type(screen.getByLabelText(/current price/i), '200');

    await userEvent.click(
      screen.getByRole('button', {
        name: /create investment/i,
      })
    );

    await waitFor(() => {
      expect(mockedApiRequest).toHaveBeenCalledWith('/api/investments', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Apple Inc.',
          symbol: 'AAPL',
          assetType: 'STOCK',
          quantity: 10,
          purchasePrice: 150,
          currentPrice: 200,
        }),
      });
    });
  });

  it('loads investment into form and updates it', async () => {
    mockedApiRequest
      .mockResolvedValueOnce([
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
      ])
      .mockResolvedValueOnce({
        id: 'investment-1',
        name: 'Apple Inc.',
        symbol: 'AAPL',
        assetType: 'STOCK',
        quantity: 20,
        purchasePrice: 150,
        currentPrice: 210,
        createdAt: '',
        updatedAt: '',
      })
      .mockResolvedValueOnce([
        {
          id: 'investment-1',
          name: 'Apple Inc.',
          symbol: 'AAPL',
          assetType: 'STOCK',
          quantity: 20,
          purchasePrice: 150,
          currentPrice: 210,
          createdAt: '',
          updatedAt: '',
        },
      ]);

    render(<InvestmentsPage />);

    const editButton = await screen.findByRole('button', {
      name: /edit/i,
    });

    await userEvent.click(editButton);

    expect(screen.getByDisplayValue('Apple Inc.')).toBeInTheDocument();
    expect(screen.getByDisplayValue('AAPL')).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText(/quantity/i));
    await userEvent.type(screen.getByLabelText(/quantity/i), '20');

    await userEvent.clear(screen.getByLabelText(/current price/i));
    await userEvent.type(screen.getByLabelText(/current price/i), '210');

    await userEvent.click(
      screen.getByRole('button', {
        name: /update investment/i,
      })
    );

    await waitFor(() => {
      expect(mockedApiRequest).toHaveBeenCalledWith('/api/investments/investment-1', {
        method: 'PATCH',
        body: JSON.stringify({
          name: 'Apple Inc.',
          symbol: 'AAPL',
          assetType: 'STOCK',
          quantity: 20,
          purchasePrice: 150,
          currentPrice: 210,
        }),
      });
    });
  });

  it('deletes investment after confirmation', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    mockedApiRequest
      .mockResolvedValueOnce([
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
      ])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([]);

    render(<InvestmentsPage />);

    const deleteButton = await screen.findByRole('button', {
      name: /delete/i,
    });

    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockedApiRequest).toHaveBeenCalledWith('/api/investments/investment-1', {
        method: 'DELETE',
      });
    });
  });
});