import { apiRequest } from './client';
import type { Category, CheckInMode, Level, Seminar, SeminarMode, SeminarStatus } from '../types';

export type ApiCheckInMode = 'QR_GATE' | 'JOIN_LINK' | 'BOTH';
export type ApiSeminarMode = 'PHYSICAL' | 'ONLINE' | 'HYBRID';
export type ApiSeminarStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
export type ApiExamLevel = 'AL' | 'OL';

export type ApiTicketType = {
  id: string;
  name: string;
  description: string;
  priceLkr: number;
  capacity: number;
  sold: number;
};

export type ApiSeminar = {
  id: string;
  organisationId: string;
  slug: string;
  title: string;
  subject: string;
  level: ApiExamLevel;
  categoryId: string | null;
  lecturerProfileId: string | null;
  mode: ApiSeminarMode;
  venue: string;
  district: string;
  startsAt: string;
  durationHours: number;
  summary: string;
  description: string;
  highlights: string[];
  agenda: { time: string; title: string }[];
  status: ApiSeminarStatus;
  checkInMode: ApiCheckInMode | null;
  streamJoinUrl: string | null;
  featured: boolean;
  language: string;
  image: string | null;
  ticketTypes: ApiTicketType[];
  createdAt: string;
  updatedAt: string;
};

export type ApiCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
};

const MODE_TO_FE: Record<ApiSeminarMode, SeminarMode> = {
  PHYSICAL: 'physical',
  ONLINE: 'online',
  HYBRID: 'hybrid',
};
const MODE_TO_API: Record<SeminarMode, ApiSeminarMode> = {
  physical: 'PHYSICAL',
  online: 'ONLINE',
  hybrid: 'HYBRID',
};
const STATUS_TO_FE: Record<ApiSeminarStatus, SeminarStatus> = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled',
};
const CHECKIN_TO_FE: Record<ApiCheckInMode, CheckInMode> = {
  QR_GATE: 'qr_gate',
  JOIN_LINK: 'join_link',
  BOTH: 'both',
};
const CHECKIN_TO_API: Record<CheckInMode, ApiCheckInMode> = {
  qr_gate: 'QR_GATE',
  join_link: 'JOIN_LINK',
  both: 'BOTH',
};

function levelToFe(level: ApiExamLevel): Level {
  return level === 'OL' ? 'O/L' : 'A/L';
}

function levelToApi(level: Level): ApiExamLevel {
  return level === 'O/L' ? 'OL' : 'AL';
}

export function mapApiSeminar(s: ApiSeminar): Seminar {
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    subject: s.subject,
    level: levelToFe(s.level),
    categoryId: s.categoryId ?? '',
    lecturerId: s.lecturerProfileId ?? '',
    organiserId: s.organisationId,
    mode: MODE_TO_FE[s.mode],
    venue: s.venue,
    district: s.district,
    startsAt: s.startsAt,
    durationHours: s.durationHours,
    summary: s.summary,
    description: s.description,
    highlights: s.highlights,
    agenda: s.agenda,
    ticketTypes: s.ticketTypes.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      price: t.priceLkr,
      capacity: t.capacity,
      sold: t.sold,
    })),
    status: STATUS_TO_FE[s.status],
    checkInMode: s.checkInMode ? CHECKIN_TO_FE[s.checkInMode] : undefined,
    streamJoinUrl: s.streamJoinUrl ?? undefined,
    featured: s.featured,
    language: (s.language as Seminar['language']) || 'Sinhala',
    image: s.image ?? undefined,
    createdAt: s.createdAt,
  };
}

export function mapApiCategory(c: ApiCategory): Category {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description ?? '',
    icon: c.icon ?? 'book',
  };
}

export function listPublicSeminars(params?: {
  q?: string;
  subject?: string;
  district?: string;
  level?: Level;
  categoryId?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set('q', params.q);
  if (params?.subject) qs.set('subject', params.subject);
  if (params?.district) qs.set('district', params.district);
  if (params?.level) qs.set('level', levelToApi(params.level));
  if (params?.categoryId) qs.set('categoryId', params.categoryId);
  const suffix = qs.toString() ? `?${qs}` : '';
  return apiRequest<ApiSeminar[]>(`/seminars${suffix}`).then((rows) => rows.map(mapApiSeminar));
}

export function getSeminarBySlug(slug: string) {
  return apiRequest<ApiSeminar>(`/seminars/${encodeURIComponent(slug)}`).then(mapApiSeminar);
}

export function listCategoriesApi() {
  return apiRequest<ApiCategory[]>('/categories').then((rows) => rows.map(mapApiCategory));
}

export function listOrganiserSeminars(organisationId: string, token: string) {
  return apiRequest<ApiSeminar[]>(
    `/organiser/seminars?organisationId=${encodeURIComponent(organisationId)}`,
    { token },
  ).then((rows) => rows.map(mapApiSeminar));
}

export type SeminarWriteInput = {
  organisationId: string;
  title: string;
  subject: string;
  level: Level;
  categoryId?: string;
  lecturerProfileId?: string;
  mode: SeminarMode;
  venue: string;
  district: string;
  startsAt: string;
  durationHours: number;
  summary: string;
  description: string;
  highlights: string[];
  agenda: { time: string; title: string }[];
  checkInMode?: CheckInMode;
  streamJoinUrl?: string;
  featured?: boolean;
  language?: string;
  ticketTypes: { name: string; description: string; price: number; capacity: number }[];
};

function toWriteBody(input: SeminarWriteInput) {
  return {
    organisationId: input.organisationId,
    title: input.title,
    subject: input.subject,
    level: levelToApi(input.level),
    categoryId: input.categoryId || undefined,
    lecturerProfileId: input.lecturerProfileId || undefined,
    mode: MODE_TO_API[input.mode],
    venue: input.venue,
    district: input.district,
    startsAt: input.startsAt,
    durationHours: input.durationHours,
    summary: input.summary,
    description: input.description,
    highlights: input.highlights,
    agenda: input.agenda,
    checkInMode: input.checkInMode ? CHECKIN_TO_API[input.checkInMode] : undefined,
    streamJoinUrl: input.streamJoinUrl || undefined,
    featured: input.featured,
    language: input.language,
    ticketTypes: input.ticketTypes.map((t) => ({
      name: t.name,
      description: t.description,
      priceLkr: t.price,
      capacity: t.capacity,
    })),
  };
}

export function createSeminarApi(input: SeminarWriteInput, token: string) {
  return apiRequest<ApiSeminar>('/organiser/seminars', {
    method: 'POST',
    token,
    body: toWriteBody(input),
  }).then(mapApiSeminar);
}

export function updateSeminarApi(
  id: string,
  organisationId: string,
  input: Omit<SeminarWriteInput, 'organisationId'>,
  token: string,
) {
  return apiRequest<ApiSeminar>(
    `/organiser/seminars/${id}?organisationId=${encodeURIComponent(organisationId)}`,
    {
      method: 'PATCH',
      token,
      body: toWriteBody({ ...input, organisationId }),
    },
  ).then(mapApiSeminar);
}

export function publishSeminarApi(
  id: string,
  organisationId: string,
  checkInMode: CheckInMode,
  token: string,
) {
  return apiRequest<ApiSeminar>(
    `/organiser/seminars/${id}/publish?organisationId=${encodeURIComponent(organisationId)}`,
    {
      method: 'POST',
      token,
      body: { checkInMode: CHECKIN_TO_API[checkInMode] },
    },
  ).then(mapApiSeminar);
}
