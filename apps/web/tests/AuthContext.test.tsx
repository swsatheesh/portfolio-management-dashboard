import {
  act,
  renderHook,
  waitFor,
} from '@testing-library/react';
import { ReactNode } from 'react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { apiRequest } from '../src/services/api';

jest.mock('../src/services/api', () => ({
  apiRequest: jest.fn(),
}));

const mockedApiRequest = apiRequest as jest.MockedFunction<
  typeof apiRequest
>;

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('restores the user when a stored token is valid', async () => {
    localStorage.setItem(
      'portfolio_access_token',
      'valid-token'
    );

    mockedApiRequest.mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'admin@test.com',
        fullName: 'Admin User',
      },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false);
    });

    expect(mockedApiRequest).toHaveBeenCalledWith(
      '/api/auth/me'
    );

    expect(result.current.user).toEqual({
      id: 'user-1',
      email: 'admin@test.com',
      fullName: 'Admin User',
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it('clears an invalid stored token', async () => {
    localStorage.setItem(
      'portfolio_access_token',
      'invalid-token'
    );

    mockedApiRequest.mockRejectedValue(
      new Error('Unauthorized')
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false);
    });

    expect(
      localStorage.getItem('portfolio_access_token')
    ).toBeNull();

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('does not request the profile when no token exists', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false);
    });

    expect(mockedApiRequest).not.toHaveBeenCalled();
  });

  it('stores the token and user after login', async () => {
    mockedApiRequest.mockResolvedValue({
      accessToken: 'new-token',
      user: {
        id: 'user-1',
        email: 'admin@test.com',
        fullName: 'Admin User',
      },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false);
    });

    await act(async () => {
      await result.current.login(
        'admin@test.com',
        'password123'
      );
    });

    expect(
      localStorage.getItem('portfolio_access_token')
    ).toBe('new-token');

    expect(result.current.isAuthenticated).toBe(true);
  });
});