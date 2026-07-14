import { tokenStorage } from '../components/auth/token-storage';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  process.env.VITE_API_BASE_URL || 
  'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiErrorResponse {
  error?: {
    message?: string;
  };
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = tokenStorage.get();

  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = 'Request failed';

    try {
      const body = (await response.json()) as ApiErrorResponse;
      message = body.error?.message ?? message;
    } catch {
      // Response did not contain JSON.
    }

    if (response.status === 401) {
      tokenStorage.remove();
    }

    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}