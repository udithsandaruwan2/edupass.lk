const DEFAULT_API = 'http://localhost:3000/api';

export function apiBase(): string {
  return process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') || DEFAULT_API;
}

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  isPlatformAdmin: boolean;
  memberships: {
    organisationId: string;
    role: string;
  }[];
};

export type Ticket = {
  id: string;
  code: string;
  status: string;
  seminarId: string;
  holderName: string;
};

export async function login(
  email: string,
  password: string,
): Promise<{ accessToken: string; user: AuthUser }> {
  const res = await fetch(`${apiBase()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Login failed (${res.status})`);
  }
  return res.json() as Promise<{ accessToken: string; user: AuthUser }>;
}

export async function listTickets(token: string): Promise<Ticket[]> {
  const res = await fetch(`${apiBase()}/tickets`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Tickets failed (${res.status})`);
  const data = (await res.json()) as Ticket[] | { items: Ticket[] };
  return Array.isArray(data) ? data : data.items ?? [];
}

export async function checkIn(
  token: string,
  organisationId: string,
  code: string,
  seminarId?: string,
): Promise<{ admitted: boolean; message: string }> {
  const res = await fetch(`${apiBase()}/organiser/check-in`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ organisationId, code, seminarId }),
  });
  const body = (await res.json().catch(() => ({}))) as {
    admitted?: boolean;
    message?: string;
    result?: string;
    ok?: boolean;
  };
  if (!res.ok) {
    throw new Error(body.message || `Check-in failed (${res.status})`);
  }
  const admitted =
    body.admitted === true ||
    body.ok === true ||
    body.result === 'ADMITTED' ||
    body.result === 'admitted';
  return {
    admitted,
    message: body.message || String(body.result || 'Admitted'),
  };
}
