import { render, screen } from '@testing-library/react';
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom';
import { ProtectedRoute } from '../src/components/auth/ProtectedRoute';
import { useAuth } from '../src/context/AuthContext';

jest.mock('../src/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.MockedFunction<
  typeof useAuth
>;

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to login', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isInitializing: false,
      login: jest.fn(),
      logout: jest.fn(),
      restoreSession: jest.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={<p>Dashboard</p>}
            />
          </Route>

          <Route
            path="/login"
            element={<p>Login Page</p>}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByText('Login Page')
    ).toBeInTheDocument();
  });
});