const apiBaseUrl = 'http://localhost:3000';

export function App() {
  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Portfolio Management Dashboard</p>
        <h1>Docker-first React + Express scaffold</h1>
        <p>
          Commit 1 initializes the assessment project with Vite, Express, TypeScript,
          Jest tests, and Docker Compose development commands.
        </p>
        <code>API: {apiBaseUrl}</code>
      </section>
    </main>
  );
}
