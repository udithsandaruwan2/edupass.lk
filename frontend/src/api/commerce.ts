import { apiRequest } from './client';

export type ApiOrder = {
  id: string;
  studentUserId: string;
  organisationId: string;
  status: string;
  paymentMethod: string;
  buyer: { name: string; email: string; phone: string };
  subtotalLkr: number;
  bookingFeeLkr: number;
  totalLkr: number;
  commissionPercentSnapshot: number;
  lines: {
    id: string;
    seminarId: string;
    ticketTypeId: string;
    quantity: number;
    unitPriceLkr: number;
    attendeeNames: string[];
  }[];
  createdAt: string;
};

export type BankInstructions = {
  orderId: string;
  status: string;
  totalLkr: number;
  commissionPercentSnapshot: number;
  organisation: { id: string; name: string; slug: string };
  bankAccount: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branch: string | null;
  } | null;
  message: string;
};

export type ApiSlip = {
  id: string;
  orderId: string;
  organisationId: string;
  status: string;
  slipReference: string;
  note: string | null;
  rejectionReason: string | null;
  createdAt: string;
};

export type PendingSlip = ApiSlip & {
  order: {
    id: string;
    totalLkr: number;
    subtotalLkr: number;
    commissionPercentSnapshot: number;
    buyer: { name: string; email: string; phone: string };
    status: string;
  };
};

export function checkoutRequest(
  token: string,
  body: {
    lines: { ticketTypeId: string; quantity: number; attendeeNames?: string[] }[];
    buyer: { name: string; email: string; phone: string };
    paymentMethod?: 'BANK_TRANSFER' | 'CARD';
  },
) {
  return apiRequest<ApiOrder>('/checkout', {
    method: 'POST',
    token,
    body: { ...body, paymentMethod: body.paymentMethod ?? 'BANK_TRANSFER' },
  });
}

export function bankInstructionsRequest(token: string, orderId: string) {
  return apiRequest<BankInstructions>(`/checkout/${orderId}/bank-instructions`, {
    method: 'GET',
    token,
  });
}

export function uploadSlipRequest(
  token: string,
  body: { orderId: string; slipReference: string; note?: string },
) {
  return apiRequest<ApiSlip>('/payments/slips', { method: 'POST', token, body });
}

export function listPendingSlipsRequest(token: string, organisationId: string) {
  return apiRequest<PendingSlip[]>(
    `/organiser/payments/pending-slips?organisationId=${encodeURIComponent(organisationId)}`,
    { method: 'GET', token },
  );
}

export function reviewSlipRequest(
  token: string,
  organisationId: string,
  slipId: string,
  action: 'approve' | 'reject',
  reason?: string,
) {
  return apiRequest<ApiSlip>(
    `/organiser/payments/slips/${slipId}?organisationId=${encodeURIComponent(organisationId)}`,
    {
      method: 'PATCH',
      token,
      body: { action, reason },
    },
  );
}

export type ApiTicket = {
  id: string;
  code: string;
  orderId: string;
  studentUserId: string;
  seminarId: string;
  ticketTypeId: string;
  organisationId: string;
  holderName: string;
  status: string;
  checkedInAt: string | null;
  createdAt: string;
};

export function listStudentOrdersRequest(token: string) {
  return apiRequest<ApiOrder[]>('/orders', { method: 'GET', token });
}

export function listStudentTicketsRequest(token: string) {
  return apiRequest<ApiTicket[]>('/tickets', { method: 'GET', token });
}

export function listOrganiserOrdersRequest(token: string, organisationId: string) {
  return apiRequest<ApiOrder[]>(
    `/organiser/orders?organisationId=${encodeURIComponent(organisationId)}`,
    { method: 'GET', token },
  );
}

export function mapApiOrderStatus(
  status: string,
): 'paid' | 'failed' | 'refunded' | 'pending' {
  const s = status.toUpperCase();
  if (s === 'PAID') return 'paid';
  if (s === 'FAILED' || s === 'CANCELLED') return 'failed';
  if (s === 'REFUNDED') return 'refunded';
  return 'pending';
}

export function mapApiPaymentMethod(
  method: string,
): 'card' | 'bank_transfer' | 'ez_cash' | 'koko' {
  const m = method.toUpperCase();
  if (m === 'CARD') return 'card';
  if (m === 'EZ_CASH') return 'ez_cash';
  if (m === 'KOKO') return 'koko';
  return 'bank_transfer';
}

export function mapApiTicketStatusToUi(
  status: string,
): 'valid' | 'checked_in' | 'cancelled' {
  const s = status.toUpperCase();
  if (s === 'CHECKED_IN') return 'checked_in';
  if (s === 'VOID' || s === 'CANCELLED') return 'cancelled';
  return 'valid';
}
