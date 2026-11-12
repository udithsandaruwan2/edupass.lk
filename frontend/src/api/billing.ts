import { apiRequest } from './client';

export type ApiPlan = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  priceLkr: number;
  maxBatches: number | null;
  maxStudents: number | null;
  maxStaff: number | null;
  ticketCommissionPercent: number | null;
  active: boolean;
  sortOrder: number;
};

export type ApiAdminSettings = {
  ticketCommissionPercent: number;
  payhereEnabled: boolean;
  updatedAt: string;
};

export type ApiUsage = {
  organisationId: string;
  plan: {
    code: string;
    name: string;
    maxBatches: number | null;
    maxStudents: number | null;
    maxStaff: number | null;
    priceLkr: number;
  } | null;
  counts: {
    batches: number;
    students: number;
    staff: number;
    seminarsThisMonth: number;
  };
  remaining: {
    batches: number | null;
    students: number | null;
    staff: number | null;
    seminarsThisMonth: number | null;
  };
};

export function listAdminPlans(token: string) {
  return apiRequest<ApiPlan[]>('/admin/plans', { method: 'GET', token });
}

export function getAdminSettings(token: string) {
  return apiRequest<ApiAdminSettings>('/admin/settings', { method: 'GET', token });
}

export function updateAdminSettings(
  token: string,
  body: { ticketCommissionPercent?: number; payhereEnabled?: boolean },
) {
  return apiRequest<ApiAdminSettings>('/admin/settings', {
    method: 'PUT',
    token,
    body,
  });
}

export function getInstituteUsage(token: string, organisationId: string) {
  return apiRequest<ApiUsage>(
    `/institute/billing/usage?organisationId=${encodeURIComponent(organisationId)}`,
    { method: 'GET', token },
  );
}

export function upgradePlan(
  token: string,
  body: { organisationId: string; planCode: string },
) {
  return apiRequest<{
    mode: 'immediate' | 'invoice';
    planCode: string;
    invoice: { id: string; amountLkr: number; status: string } | null;
    platformBank: {
      bankName: string;
      accountName: string;
      accountNumber: string;
      branch: string | null;
    } | null;
  }>('/institute/billing/upgrade', { method: 'POST', token, body });
}

export function uploadPlatformSlip(
  token: string,
  body: {
    organisationId: string;
    invoiceId: string;
    slipReference: string;
    note?: string;
  },
) {
  return apiRequest('/institute/billing/slips', { method: 'POST', token, body });
}

export type ApiPlatformFeeLine = {
  id: string;
  orderId: string;
  organisationId: string;
  organisationName: string;
  organisationSlug: string;
  commissionPercent: number;
  ticketSubtotalLkr: number;
  feeAmountLkr: number;
  status: 'ACTIVE' | 'VOID' | string;
  createdAt: string;
};

export type ApiPlatformFeesResponse = {
  summary: {
    activeFeeLkr: number;
    voidedFeeLkr: number;
    activeTicketSubtotalLkr: number;
    lineCount: number;
    activeCount: number;
  };
  lines: ApiPlatformFeeLine[];
};

export type ApiSubscriptionInvoice = {
  id: string;
  organisationId: string;
  organisationName: string;
  planCode: string;
  amountLkr: number;
  status: string;
  slipReference: string | null;
  paidAt: string | null;
  createdAt: string;
};

export function listAdminPlatformFees(token: string) {
  return apiRequest<ApiPlatformFeesResponse>('/admin/revenue/platform-fees', {
    method: 'GET',
    token,
  });
}

export function listAdminSubscriptionInvoices(token: string) {
  return apiRequest<ApiSubscriptionInvoice[]>('/admin/revenue/subscriptions', {
    method: 'GET',
    token,
  });
}
