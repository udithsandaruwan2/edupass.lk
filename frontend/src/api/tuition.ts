import { apiRequest } from './client';

export type ApiTuitionFeePlan = {
  id: string;
  name: string;
  amountLkr: number;
  active: boolean;
};

export type ApiTuitionInvoice = {
  id: string;
  organisationId: string;
  enrollmentId: string;
  title: string;
  amountLkr: number;
  paidAmountLkr: number;
  remainingLkr: number;
  status: string;
  enrollment: { id: string; displayName: string; studentUserId: string | null };
  feePlan: { id: string; name: string } | null;
  payments: {
    id: string;
    method: string;
    amountLkr: number;
    status: string;
    slipReference: string | null;
  }[];
};

export type ApiStudentTuitionBalance = {
  outstandingLkr: number;
  invoices: ApiTuitionInvoice[];
};

export function listTuitionFeePlans(token: string, organisationId: string) {
  return apiRequest<ApiTuitionFeePlan[]>(
    `/institute/tuition/fee-plans?organisationId=${encodeURIComponent(organisationId)}`,
    { token },
  );
}

export function createTuitionFeePlan(
  token: string,
  body: { organisationId: string; name: string; amountLkr: number },
) {
  return apiRequest<ApiTuitionFeePlan>('/institute/tuition/fee-plans', {
    method: 'POST',
    token,
    body,
  });
}

export function listTuitionInvoices(token: string, organisationId: string) {
  return apiRequest<ApiTuitionInvoice[]>(
    `/institute/tuition/invoices?organisationId=${encodeURIComponent(organisationId)}`,
    { token },
  );
}

export function createTuitionInvoice(
  token: string,
  body: {
    organisationId: string;
    enrollmentId: string;
    feePlanId?: string;
    title?: string;
    amountLkr?: number;
  },
) {
  return apiRequest<ApiTuitionInvoice>('/institute/tuition/invoices', {
    method: 'POST',
    token,
    body,
  });
}

export function recordTuitionCash(
  token: string,
  invoiceId: string,
  body: { organisationId: string; amountLkr?: number; note?: string },
) {
  return apiRequest(`/institute/tuition/invoices/${invoiceId}/cash`, {
    method: 'POST',
    token,
    body,
  });
}

export function recordTuitionSlip(
  token: string,
  invoiceId: string,
  body: {
    organisationId: string;
    slipReference: string;
    amountLkr?: number;
    note?: string;
  },
) {
  return apiRequest(`/institute/tuition/invoices/${invoiceId}/slips`, {
    method: 'POST',
    token,
    body,
  });
}

export function reviewTuitionPayment(
  token: string,
  paymentId: string,
  body: { organisationId: string; decision: 'approve' | 'reject'; rejectionReason?: string },
) {
  return apiRequest(`/institute/tuition/payments/${paymentId}/review`, {
    method: 'POST',
    token,
    body,
  });
}

export function getStudentTuitionBalance(token: string) {
  return apiRequest<ApiStudentTuitionBalance>('/student/tuition/invoices', { token });
}

export function uploadStudentTuitionSlip(
  token: string,
  body: { invoiceId: string; slipReference: string; amountLkr?: number; note?: string },
) {
  return apiRequest('/student/tuition/slips', {
    method: 'POST',
    token,
    body,
  });
}
