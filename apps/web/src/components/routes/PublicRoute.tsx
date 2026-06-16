import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface PublicRouteProps {
  children: ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const token = localStorage.getItem('accessToken');

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}