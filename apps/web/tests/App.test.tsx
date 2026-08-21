import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';
import { ThemeProvider } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';

function renderWithProviders(children: ReactNode) {
  return render(
    <MemoryRouter>
      <AuthProvider> {/* 👈 Nest inside the router */}
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('App', () => {
  it('renders the scaffold title', () => {
    renderWithProviders(<App />);

    expect(screen.getByText(/portfolio manager/i)).toBeInTheDocument();
  });
});