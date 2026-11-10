import { apiRequest } from './client';

export type ApiBatch = {
  id: string;
  organisationId: string;
  name: string;
  programme?: string | null;
  createdAt?: string;
};

export type ApiEnrollment = {
  id: string;
  batchId: string | null;
  displayName: string;
  studentUserId: string | null;
  status: string;
  createdAt: string;
};

export type ApiSession = {
  id: string;
  organisationId: string;
  batchId: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  notes: string | null;
};

export type ApiRollRow = {
  enrollmentId: string;
  displayName: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | null;
  markedAt: string | null;
  note: string | null;
};

export function listBatches(token: string, organisationId: string) {
  return apiRequest<ApiBatch[]>(
    `/institute/batches?organisationId=${encodeURIComponent(organisationId)}`,
    { method: 'GET', token },
  );
}

export function createBatch(
  token: string,
  body: { organisationId: string; name: string },
) {
  return apiRequest<ApiBatch>('/institute/batches', { method: 'POST', token, body });
}

export function listEnrollments(
  token: string,
  organisationId: string,
  batchId?: string,
) {
  const qs = new URLSearchParams({ organisationId });
  if (batchId) qs.set('batchId', batchId);
  return apiRequest<ApiEnrollment[]>(`/institute/enrollments?${qs}`, {
    method: 'GET',
    token,
  });
}

export function createEnrollment(
  token: string,
  body: { organisationId: string; displayName: string; batchId?: string },
) {
  return apiRequest('/institute/enrollments', { method: 'POST', token, body });
}

export function listSessions(
  token: string,
  organisationId: string,
  batchId?: string,
) {
  const qs = new URLSearchParams({ organisationId });
  if (batchId) qs.set('batchId', batchId);
  return apiRequest<ApiSession[]>(`/institute/sessions?${qs}`, {
    method: 'GET',
    token,
  });
}

export function createSession(
  token: string,
  body: {
    organisationId: string;
    batchId: string;
    title: string;
    startsAt: string;
    notes?: string;
  },
) {
  return apiRequest<ApiSession>('/institute/sessions', {
    method: 'POST',
    token,
    body,
  });
}

export function getSessionAttendance(
  token: string,
  sessionId: string,
  organisationId: string,
) {
  return apiRequest<{ session: ApiSession; roll: ApiRollRow[] }>(
    `/institute/sessions/${sessionId}/attendance?organisationId=${encodeURIComponent(organisationId)}`,
    { method: 'GET', token },
  );
}

export function markAttendance(
  token: string,
  sessionId: string,
  body: {
    organisationId: string;
    marks: { enrollmentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' }[];
  },
) {
  return apiRequest(`/institute/sessions/${sessionId}/attendance`, {
    method: 'POST',
    token,
    body,
  });
}
