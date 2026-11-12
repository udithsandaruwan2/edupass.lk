import { apiRequest } from './client';
import type { Lecturer } from '../types';

export type ApiLecturer = {
  id: string;
  organisationId: string;
  name: string;
  title: string | null;
  subjects: string[];
  bio: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

function mapLecturer(row: ApiLecturer): Lecturer {
  return {
    id: row.id,
    name: row.name,
    title: row.title ?? '',
    subjects: row.subjects,
    bio: row.bio ?? '',
    qualifications: [],
    yearsTeaching: 0,
    rating: 0,
    studentsTaught: 0,
    organiserId: row.organisationId,
    status: row.status === 'active' ? 'active' : 'invited',
  };
}

export function listPublicLecturers() {
  return apiRequest<ApiLecturer[]>('/lecturers', { method: 'GET' }).then((rows) =>
    rows.map(mapLecturer),
  );
}

export function getPublicLecturer(id: string) {
  return apiRequest<ApiLecturer>(`/lecturers/${encodeURIComponent(id)}`, {
    method: 'GET',
  }).then(mapLecturer);
}

export function listOrganiserLecturers(token: string, organisationId: string) {
  return apiRequest<ApiLecturer[]>(
    `/organiser/lecturers?organisationId=${encodeURIComponent(organisationId)}`,
    { method: 'GET', token },
  ).then((rows) => rows.map(mapLecturer));
}

export function createOrganiserLecturer(
  token: string,
  body: {
    organisationId: string;
    name: string;
    title?: string;
    subjects?: string[];
    bio?: string;
    email?: string;
  },
) {
  return apiRequest<ApiLecturer>('/organiser/lecturers', {
    method: 'POST',
    token,
    body,
  }).then(mapLecturer);
}

export function updateOrganiserLecturer(
  token: string,
  id: string,
  organisationId: string,
  body: {
    name?: string;
    title?: string;
    subjects?: string[];
    bio?: string;
    status?: string;
  },
) {
  return apiRequest<ApiLecturer>(
    `/organiser/lecturers/${encodeURIComponent(id)}?organisationId=${encodeURIComponent(organisationId)}`,
    { method: 'PATCH', token, body },
  ).then(mapLecturer);
}

export function deleteOrganiserLecturer(
  token: string,
  id: string,
  organisationId: string,
) {
  return apiRequest<{ id: string; deleted: boolean }>(
    `/organiser/lecturers/${encodeURIComponent(id)}?organisationId=${encodeURIComponent(organisationId)}`,
    { method: 'DELETE', token },
  );
}
