import { apiRequest } from './client';
import type { FaqItem } from '../types';

export type ApiCmsBanner = {
  id: string;
  title: string;
  body: string | null;
  imageUrl: string | null;
  href: string | null;
  sortOrder: number;
  createdAt: string;
};

export type ApiCmsFaq = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
  createdAt: string;
};

const FAQ_GROUP_MAP: Record<string, FaqItem['group']> = {
  booking: 'Booking',
  tickets: 'Tickets',
  payments: 'Payments',
  organisers: 'Organisers',
  account: 'Account',
};

export function mapCmsFaq(f: ApiCmsFaq): FaqItem {
  const key = (f.category ?? 'booking').toLowerCase();
  return {
    id: f.id,
    group: FAQ_GROUP_MAP[key] ?? 'Booking',
    question: f.question,
    answer: f.answer,
  };
}

export function listCmsBanners() {
  return apiRequest<ApiCmsBanner[]>('/cms/banners', { method: 'GET' });
}

export function listCmsFaqs() {
  return apiRequest<ApiCmsFaq[]>('/cms/faqs', { method: 'GET' }).then((rows) =>
    rows.map(mapCmsFaq),
  );
}
