import { apiRequest } from './client';

export type ApiAdminUser = {
  id: string;
  email: string;
  name: string;
  globalRole: string;
  isPlatformAdmin: boolean;
  createdAt: string;
};

export type ApiAdminOrg = {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  createdAt: string;
};

export type ApiAdminSeminar = {
  id: string;
  organisationId: string;
  slug: string;
  title: string;
  status: string;
  startsAt: string;
  createdAt: string;
};

export type ApiAdminOrder = {
  id: string;
  studentUserId: string;
  organisationId: string;
  status: string;
  totalLkr: number;
  createdAt: string;
};

export type ApiAdminTicket = {
  id: string;
  code: string;
  orderId: string;
  seminarId: string;
  status: string;
  createdAt: string;
};

export type ApiAdminRefund = {
  id: string;
  orderId: string;
  studentUserId: string;
  amountLkr: number;
  status: string;
  createdAt: string;
};

export type ApiAdminBanner = {
  id: string;
  title: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
};

export type ApiAdminFaq = {
  id: string;
  question: string;
  active: boolean;
  createdAt: string;
};

export type ApiAdminAnnouncement = {
  id: string;
  title: string;
  audience: string;
  active: boolean;
  createdAt: string;
};

export type ApiAdminCategory = {
  id: string;
  slug: string;
  name: string;
  createdAt: string;
};

function adminGet<T>(token: string, path: string) {
  return apiRequest<T>(path, { method: 'GET', token });
}

export const listAdminUsers = (token: string) => adminGet<ApiAdminUser[]>(token, '/admin/users');
export const listAdminOrganisations = (token: string) =>
  adminGet<ApiAdminOrg[]>(token, '/admin/organisations');
export const listAdminSeminars = (token: string) =>
  adminGet<ApiAdminSeminar[]>(token, '/admin/seminars');
export const listAdminOrders = (token: string) => adminGet<ApiAdminOrder[]>(token, '/admin/orders');
export const listAdminTickets = (token: string) =>
  adminGet<ApiAdminTicket[]>(token, '/admin/tickets');
export const listAdminRefunds = (token: string) =>
  adminGet<ApiAdminRefund[]>(token, '/admin/refunds');

export function reviewAdminRefund(
  token: string,
  id: string,
  action: 'approve' | 'reject',
) {
  return apiRequest(`/admin/refunds/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    token,
    body: { action },
  });
}

export const listAdminBanners = (token: string) =>
  adminGet<ApiAdminBanner[]>(token, '/admin/banners');
export function createAdminBanner(
  token: string,
  body: { title: string; body?: string; active?: boolean; sortOrder?: number },
) {
  return apiRequest('/admin/banners', { method: 'POST', token, body });
}
export function updateAdminBanner(
  token: string,
  id: string,
  body: { title?: string; body?: string; active?: boolean; sortOrder?: number },
) {
  return apiRequest(`/admin/banners/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    token,
    body,
  });
}
export function deleteAdminBanner(token: string, id: string) {
  return apiRequest(`/admin/banners/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    token,
  });
}

export const listAdminFaqs = (token: string) => adminGet<ApiAdminFaq[]>(token, '/admin/faqs');
export function createAdminFaq(
  token: string,
  body: { question: string; answer: string; category?: string; active?: boolean },
) {
  return apiRequest('/admin/faqs', { method: 'POST', token, body });
}
export function updateAdminFaq(
  token: string,
  id: string,
  body: { question?: string; answer?: string; category?: string; active?: boolean },
) {
  return apiRequest(`/admin/faqs/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    token,
    body,
  });
}
export function deleteAdminFaq(token: string, id: string) {
  return apiRequest(`/admin/faqs/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    token,
  });
}

export const listAdminAnnouncements = (token: string) =>
  adminGet<ApiAdminAnnouncement[]>(token, '/admin/announcements');
export function createAdminAnnouncement(
  token: string,
  body: { title: string; body: string; audience?: string; active?: boolean },
) {
  return apiRequest('/admin/announcements', { method: 'POST', token, body });
}
export function updateAdminAnnouncement(
  token: string,
  id: string,
  body: { title?: string; body?: string; audience?: string; active?: boolean },
) {
  return apiRequest(`/admin/announcements/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    token,
    body,
  });
}
export function deleteAdminAnnouncement(token: string, id: string) {
  return apiRequest(`/admin/announcements/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    token,
  });
}

export const listAdminCategories = (token: string) =>
  adminGet<ApiAdminCategory[]>(token, '/admin/categories');
export function createAdminCategory(
  token: string,
  body: { slug: string; name: string; description?: string; icon?: string },
) {
  return apiRequest('/admin/categories', { method: 'POST', token, body });
}
export function updateAdminCategory(
  token: string,
  id: string,
  body: { slug?: string; name?: string; description?: string; icon?: string },
) {
  return apiRequest(`/admin/categories/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    token,
    body,
  });
}
export function deleteAdminCategory(token: string, id: string) {
  return apiRequest(`/admin/categories/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    token,
  });
}
