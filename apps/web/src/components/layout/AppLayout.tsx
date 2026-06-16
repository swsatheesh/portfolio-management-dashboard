import { ReactNode } from 'react';
import { Navbar } from './Navbar';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-layout">
      <Navbar isAuthenticated />
      <main className="app-shell">{children}</main>
    </div>
  );
}