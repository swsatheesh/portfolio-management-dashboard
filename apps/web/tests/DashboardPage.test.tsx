import { render, screen, waitFor } from '@testing-library/react';
import { DashboardPage } from '../src/pages/DashboardPage';

jest.mock('../src/lib/api', () => ({
  apiRequest: jest.fn(),
}));

import { apiRequest } from '../src/lib/api';

const mockedApiRequest = apiRequest as jest.Mock;

describe('DashboardPage', () => {
  beforeEach(() => {
    localStorage.setItem('accessToken', 'test-token');
    mockedApiRequest.mockReset();
  });

  it('renders portfolio summary metrics', async () => {
    mockedApiRequest.mockResolvedValue({
      totalInvested: 2000,
      totalCurrentValue: 2550,
      totalGainLoss: 550,
      totalGainLossPercentage: 27.5,
      assetAllocation: [
        {
          assetType: 'STOCK',
          currentValue: 2000,
          percentage: 78.43,
        },
      ],
    });

    render(<DashboardPage />);

    expect(screen.getByText(/loading dashboard/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    });

    expect(screen.getByText('$2,000.00')).toBeInTheDocument();
    expect(screen.getByText('$2,550.00')).toBeInTheDocument();
    expect(screen.getByText('$550.00')).toBeInTheDocument();
    expect(screen.getByText('27.50%')).toBeInTheDocument();
  });

  it('renders error state when summary request fails', async () => {
    mockedApiRequest.mockRejectedValue(new Error('Failed'));

    render(<DashboardPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('alert', { name: '' })
      ).toHaveTextContent('Unable to load portfolio summary');
    });
  });
});