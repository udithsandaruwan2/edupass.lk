import { apiRequest } from './client';

export type ApiCourseModule = {
  id: string;
  organisationId: string;
  batchId: string;
  title: string;
  description: string | null;
  sortOrder: number;
  createdAt: string;
};

export type ApiStudentModule = ApiCourseModule & {
  materials: { id: string; title: string; url: string | null; createdAt: string }[];
  assignments: { id: string; title: string; dueAt: string | null; createdAt: string }[];
};

export type ApiGrade = {
  assignmentId: string;
  assignmentTitle: string;
  gradeScore: number | null;
  gradeFeedback: string | null;
  submittedAt: string | null;
};

export function createLmsModule(
  token: string,
  body: {
    organisationId: string;
    batchId: string;
    title: string;
    description?: string;
  },
) {
  return apiRequest<ApiCourseModule>('/institute/lms/modules', {
    method: 'POST',
    token,
    body,
  });
}

export function createLmsAssignment(
  token: string,
  body: {
    organisationId: string;
    moduleId: string;
    title: string;
    description?: string;
    dueAt?: string;
    maxScore?: number;
  },
) {
  return apiRequest('/institute/lms/assignments', { method: 'POST', token, body });
}

export function gradeLmsSubmission(
  token: string,
  submissionId: string,
  body: { organisationId: string; gradeScore: number; gradeFeedback?: string },
) {
  return apiRequest(`/institute/lms/submissions/${encodeURIComponent(submissionId)}/grade`, {
    method: 'PATCH',
    token,
    body,
  });
}

export function listStudentLmsModules(token: string, batchId?: string) {
  const qs = batchId ? `?batchId=${encodeURIComponent(batchId)}` : '';
  return apiRequest<ApiStudentModule[]>(`/student/lms/modules${qs}`, {
    method: 'GET',
    token,
  });
}

export function submitStudentAssignment(
  token: string,
  body: { assignmentId: string; body?: string },
) {
  return apiRequest('/student/lms/submissions', { method: 'POST', token, body });
}

export function listStudentGrades(token: string) {
  return apiRequest<ApiGrade[]>('/student/lms/grades', { method: 'GET', token });
}
