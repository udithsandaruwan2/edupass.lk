import { apiRequest } from './client';

export type ApiEntitlement = { code: string; status: string };
export type ApiMembership = {
  organisationId: string;
  role: string;
  organisation: {
    id: string;
    name: string;
    slug: string;
    type: string;
    status: string;
  };
  entitlements: ApiEntitlement[];
  plan: { code: string; name: string; status: string } | null;
  commissionPercent: number;
};

export type ApiUser = {
  id: string;
  email: string;
  name: string;
  isPlatformAdmin: boolean;
  globalRole: string;
  student: unknown;
  memberships: ApiMembership[];
  platform: { ticketCommissionPercent: number; payhereEnabled: boolean };
};

export type AuthResponse = {
  accessToken: string;
  tokenType: string;
  user: ApiUser;
};

export function loginRequest(email: string, password: string) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function registerStudentRequest(body: {
  email: string;
  password: string;
  name: string;
  district?: string;
  school?: string;
}) {
  return apiRequest<AuthResponse>('/auth/register/student', { method: 'POST', body });
}

export function registerInstitutionRequest(body: {
  email: string;
  password: string;
  name: string;
  organisationName: string;
}) {
  return apiRequest<AuthResponse>('/auth/register/institution', { method: 'POST', body });
}

export function registerLecturerRequest(body: {
  email: string;
  password: string;
  name: string;
  organisationName?: string;
}) {
  return apiRequest<AuthResponse>('/auth/register/lecturer', { method: 'POST', body });
}

export function meRequest(token: string) {
  return apiRequest<ApiUser>('/auth/me', { method: 'GET', token });
}
