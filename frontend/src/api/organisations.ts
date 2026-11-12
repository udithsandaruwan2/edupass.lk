import { apiRequest } from './client';

export type ApiBankAccount = {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string | null;
};

export function getOrganisationBankAccount(token: string, organisationId: string) {
  return apiRequest<ApiBankAccount | null>(
    `/organisations/${encodeURIComponent(organisationId)}/bank-account`,
    { method: 'GET', token },
  );
}

export function upsertOrganisationBankAccount(
  token: string,
  organisationId: string,
  body: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branch?: string;
  },
) {
  return apiRequest<ApiBankAccount>(
    `/organisations/${encodeURIComponent(organisationId)}/bank-account`,
    { method: 'PUT', token, body },
  );
}
