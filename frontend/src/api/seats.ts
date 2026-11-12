import { apiRequest } from './client';

export type ApiSeat = {
  id: string;
  row: number;
  col: number;
  label: string;
  status: string;
};

export type ApiSeatMap = {
  seminarId: string;
  slug: string;
  layoutId: string;
  seats: ApiSeat[];
};

export type ApiSeatHold = {
  id: string;
  seatId: string;
  expiresAt: string;
};

export function getSeminarSeatsBySlug(slug: string) {
  return apiRequest<ApiSeatMap>(`/seminars/${encodeURIComponent(slug)}/seats`, {
    method: 'GET',
  });
}

export function createSeatHolds(
  token: string,
  body: { seminarId: string; seatIds: string[] },
) {
  return apiRequest<ApiSeatHold[]>('/checkout/seat-holds', {
    method: 'POST',
    token,
    body,
  });
}

export function upsertVenueLayout(
  token: string,
  seminarId: string,
  organisationId: string,
  body: { name: string; rows: number; cols: number },
) {
  return apiRequest(
    `/organiser/seminars/${encodeURIComponent(seminarId)}/venue-layout?organisationId=${encodeURIComponent(organisationId)}`,
    { method: 'PUT', token, body },
  );
}
