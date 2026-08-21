import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '../src/pages/DashboardPage';
import { ThemeProvider } from '../src/context/ThemeContext';
import { apiRequest } from '../src/services/api';

jest.mock('../src/services/api', () => ({
  apiRequest: jest.fn(),
}));

const mockedApiRequest = apiRequest as jest.Mock;

function renderDashboardPage() {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <DashboardPage />
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('portfolio_access_token', 'test-token');
  });

  it('renders portfolio summary metrics', async () => {
    mockedApiRequest.mockResolvedValue({
      totalInvested: 10000,
      totalCurrentValue: 12000,
      totalGainLoss: 2000,
      totalGainLossPercentage: 20,
      assetAllocation: [
        {
          assetType: 'STOCK',
          value: 12000,
          percentage: 100,
        },
      ],
    });

    renderDashboardPage();

    expect(screen.getByText(/loading dashboard/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/portfolio overview/i)).toBeInTheDocument();
    });

    expect(screen.getByText('$10,000.00')).toBeInTheDocument();
    expect(screen.getByText('$12,000.00')).toBeInTheDocument();
    expect(screen.getByText('$2,000.00')).toBeInTheDocument();
    expect(screen.getByText('20.00%')).toBeInTheDocument();
  });

  it('renders error state when summary request fails', async () => {
    mockedApiRequest.mockRejectedValue(new Error('Request failed'));

    renderDashboardPage();

    await waitFor(() => {
      expect(
        screen.getByRole('alert', {
          name: '',
        })
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/unable to load portfolio summary/i)
    ).toBeInTheDocument();
  });
});