import {
  CheckInMode,
  ExamLevel,
  Prisma,
  SeminarMode,
  SeminarStatus,
} from '@prisma/client';
import type { SeminarResponse } from './dto/seminar.dto';

export type SeminarWithTickets = {
  id: string;
  organisationId: string;
  slug: string;
  title: string;
  subject: string;
  level: ExamLevel;
  categoryId: string | null;
  lecturerProfileId: string | null;
  mode: SeminarMode;
  venue: string;
  district: string;
  startsAt: Date;
  durationHours: number;
  summary: string;
  description: string;
  highlights: string[];
  agenda: Prisma.JsonValue;
  status: SeminarStatus;
  checkInMode: CheckInMode | null;
  streamJoinUrl: string | null;
  featured: boolean;
  language: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  ticketTypes: {
    id: string;
    name: string;
    description: string;
    priceLkr: number;
    capacity: number;
    sold: number;
  }[];
};

function agendaOf(
  value: Prisma.JsonValue,
): { time: string; title: string }[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is { time: string; title: string } =>
        typeof item === 'object' &&
        item !== null &&
        'time' in item &&
        'title' in item,
    )
    .map((item) => ({ time: String(item.time), title: String(item.title) }));
}

export function toSeminarResponse(s: SeminarWithTickets): SeminarResponse {
  return {
    id: s.id,
    organisationId: s.organisationId,
    slug: s.slug,
    title: s.title,
    subject: s.subject,
    level: s.level,
    categoryId: s.categoryId,
    lecturerProfileId: s.lecturerProfileId,
    mode: s.mode,
    venue: s.venue,
    district: s.district,
    startsAt: s.startsAt.toISOString(),
    durationHours: s.durationHours,
    summary: s.summary,
    description: s.description,
    highlights: s.highlights,
    agenda: agendaOf(s.agenda),
    status: s.status,
    checkInMode: s.checkInMode,
    streamJoinUrl: s.streamJoinUrl,
    featured: s.featured,
    language: s.language,
    image: s.image,
    ticketTypes: s.ticketTypes.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      priceLkr: t.priceLkr,
      capacity: t.capacity,
      sold: t.sold,
    })),
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return base || 'seminar';
}
