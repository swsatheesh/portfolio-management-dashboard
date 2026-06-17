import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { App } from '../src/App';
import { ThemeProvider } from '../src/context/ThemeContext';

function renderWithProviders(children: ReactNode) {
  return render(<ThemeProvider>{children}</ThemeProvider>);
}

describe('App', () => {
  it('renders the scaffold title', () => {
    renderWithProviders(<App />);

    expect(screen.getByText(/portfolio manager/i)).toBeInTheDocument();
  });
});