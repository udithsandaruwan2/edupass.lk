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

export function forgotPasswordRequest(email: string) {
  return apiRequest<{ ok: true }>('/auth/forgot-password', {
    method: 'POST',
    body: { email },
  });
}

export function resetPasswordRequest(body: {
  email: string;
  code: string;
  password: string;
}) {
  return apiRequest<{ ok: true }>('/auth/reset-password', {
    method: 'POST',
    body,
  });
}

/** Builds Nest DTO keys inside the client so UI code never names password fields. */
export function changePasswordRequest(
  token: string,
  current: string,
  next: string,
) {
  return apiRequest<{ ok: true }>('/auth/change-password', {
    method: 'POST',
    token,
    body: {
      currentPassword: current,
      newPassword: next,
    },
  });
}

export function updateProfileRequest(
  token: string,
  body: {
    name?: string;
    school?: string;
    district?: string;
    stream?: string;
    examYear?: number;
  },
) {
  return apiRequest<ApiUser>('/auth/profile', {
    method: 'PUT',
    token,
    body,
  });
}

export function contactRequest(body: {
  name: string;
  email: string;
  topic: string;
  message: string;
}) {
  return apiRequest<{ ok: true }>('/auth/contact', { method: 'POST', body });
}
