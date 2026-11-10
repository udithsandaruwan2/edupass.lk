import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import App from '../App';
import { DEMO_ACCOUNTS } from '../contexts/AuthContext';
import { Providers } from '../contexts/Providers';
import type { Role } from '../types';

/** Renders the whole app at `path`, optionally signed in as a demo role. */
export function renderApp(path: string, role?: Role) {
  if (role) localStorage.setItem('edupass-demo-user', JSON.stringify(DEMO_ACCOUNTS[role]));
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Providers>
        <App />
      </Providers>
    </MemoryRouter>,
  );
}

export function renderWithProviders(ui: React.ReactElement, path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Providers>{ui}</Providers>
    </MemoryRouter>,
  );
}
