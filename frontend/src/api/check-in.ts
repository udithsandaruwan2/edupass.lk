import { apiRequest, ApiError } from './client';

export type ApiTicketStatus = 'PENDING' | 'VALID' | 'CHECKED_IN' | 'VOID';

export type ApiCheckInTicket = {
  id: string;
  code: string;
  orderId: string;
  studentUserId: string;
  seminarId: string;
  ticketTypeId: string;
  organisationId: string;
  holderName: string;
  status: ApiTicketStatus;
  checkedInAt: string | null;
};

export type CheckInResponse = {
  ok: boolean;
  result: string;
  message: string;
  ticket?: ApiCheckInTicket;
};

export type AttendanceResponse = {
  seminarId: string;
  organisationId: string;
  totals: { total: number; checkedIn: number; remaining: number };
  tickets: ApiCheckInTicket[];
};

export function mapApiTicketStatus(
  status: ApiTicketStatus,
): 'valid' | 'checked_in' | 'cancelled' {
  if (status === 'CHECKED_IN') return 'checked_in';
  if (status === 'VOID') return 'cancelled';
  return 'valid';
}

export async function checkInRequest(
  token: string,
  body: { organisationId: string; seminarId: string; code: string },
): Promise<CheckInResponse> {
  try {
    return await apiRequest<CheckInResponse>('/organiser/check-in', {
      method: 'POST',
      token,
      body,
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 409 && err.body && typeof err.body === 'object') {
      return err.body as CheckInResponse;
    }
    throw err;
  }
}

export function attendanceRequest(
  token: string,
  seminarId: string,
  organisationId: string,
) {
  return apiRequest<AttendanceResponse>(
    `/organiser/seminars/${seminarId}/attendance?organisationId=${encodeURIComponent(organisationId)}`,
    { method: 'GET', token },
  );
}
