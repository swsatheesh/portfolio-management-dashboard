import { render, screen } from '@testing-library/react';
import { App } from '../src/App';

describe('App', () => {
  it('renders the scaffold title', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /docker-first react \+ express scaffold/i })
    ).toBeInTheDocument();
  });
});
