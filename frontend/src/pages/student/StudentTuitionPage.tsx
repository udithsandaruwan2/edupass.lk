import React, { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import {
  getStudentTuitionBalance,
  uploadStudentTuitionSlip,
  type ApiStudentTuitionBalance,
} from '../../api/tuition';
import { ApiError } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { Card, CardHeader, EmptyState, Notice } from '../../components/ui/Primitives';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../layouts/DashboardLayout';
import { formatLKR } from '../../utils/format';

export const StudentTuitionPage: React.FC = () => {
  useDocumentTitle('My class fees');
  const { user, usingMocks } = useAuth();
  const toast = useToast();
  const [balance, setBalance] = useState<ApiStudentTuitionBalance | null>(null);
  const [slipByInvoice, setSlipByInvoice] = useState<Record<string, string>>({});

  const refresh = () => {
    if (usingMocks || !user?.accessToken) return;
    void getStudentTuitionBalance(user.accessToken)
      .then(setBalance)
      .catch(() => setBalance(null));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usingMocks, user?.accessToken]);

  if (usingMocks) {
    return (
      <>
        <PageHeader title="My class fees" description="Outstanding tuition for your institute enrollments." />
        <Notice tone="info">Turn off mocks to see live class fee balances.</Notice>
      </>
    );
  }

  const upload = async (invoiceId: string) => {
    if (!user?.accessToken) return;
    const slipReference = (slipByInvoice[invoiceId] ?? '').trim();
    if (slipReference.length < 3) {
      toast('Enter a bank slip reference', { tone: 'error' });
      return;
    }
    try {
      await uploadStudentTuitionSlip(user.accessToken, { invoiceId, slipReference });
      toast('Tuition slip uploaded — awaiting institute review', { tone: 'success' });
      setSlipByInvoice((prev) => ({ ...prev, [invoiceId]: '' }));
      refresh();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Upload failed', { tone: 'error' });
    }
  };

  return (
    <>
      <PageHeader
        title="My class fees"
        description="Tuition balance for institute classes — not seminar booking fees."
      />
      <Card className="mb-4">
        <CardHeader
          title="Outstanding class fees"
          description={balance ? formatLKR(balance.outstandingLkr) : '…'}
        />
      </Card>
      {!balance || balance.invoices.length === 0 ? (
        <EmptyState
          icon={<Wallet className="size-5" aria-hidden="true" />}
          title="No class fee invoices"
          description="When your institute issues a tuition invoice, it appears here."
        />
      ) : (
        <ul className="space-y-3">
          {balance.invoices.map((inv) => (
            <li key={inv.id}>
              <Card className="px-5 py-4">
                <p className="font-semibold text-fg">{inv.title}</p>
                <p className="text-sm text-muted">
                  {inv.status} · remaining {formatLKR(inv.remainingLkr)} of {formatLKR(inv.amountLkr)}
                </p>
                {inv.status === 'OPEN' ? (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
                    <Input
                      label="Bank slip reference"
                      value={slipByInvoice[inv.id] ?? ''}
                      onValueChange={(v) => setSlipByInvoice((prev) => ({ ...prev, [inv.id]: v }))}
                      className="flex-1"
                    />
                    <Button onClick={() => void upload(inv.id)}>Upload tuition slip</Button>
                  </div>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
