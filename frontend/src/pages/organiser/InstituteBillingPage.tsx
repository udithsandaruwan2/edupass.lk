import React, { useEffect, useState } from 'react';
import {
  getInstituteUsage,
  upgradePlan,
  uploadPlatformSlip,
  type ApiUsage,
} from '../../api/billing';
import { ApiError } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { Card, CardHeader, Notice } from '../../components/ui/Primitives';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../layouts/DashboardLayout';
import { formatLKR } from '../../utils/format';

export const InstituteBillingPage: React.FC = () => {
  useDocumentTitle('Plan & usage');
  const { user, usingMocks } = useAuth();
  const toast = useToast();
  const [usage, setUsage] = useState<ApiUsage | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [slipReference, setSlipReference] = useState('');
  const [bankHint, setBankHint] = useState<string | null>(null);

  const refresh = () => {
    if (usingMocks || !user?.accessToken || !user.organisationId) return;
    void getInstituteUsage(user.accessToken, user.organisationId)
      .then(setUsage)
      .catch(() => setUsage(null));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usingMocks, user?.accessToken, user?.organisationId]);

  const onUpgrade = async (planCode: string) => {
    if (!user?.accessToken || !user.organisationId) return;
    try {
      const res = await upgradePlan(user.accessToken, {
        organisationId: user.organisationId,
        planCode,
      });
      if (res.mode === 'invoice' && res.invoice) {
        setInvoiceId(res.invoice.id);
        setBankHint(
          res.platformBank
            ? `${res.platformBank.bankName} · ${res.platformBank.accountNumber} · ${formatLKR(res.invoice.amountLkr)}`
            : `Pay ${formatLKR(res.invoice.amountLkr)} to EduPass platform bank`,
        );
        toast('Upgrade invoice created — upload your slip', { tone: 'success' });
      } else {
        toast(`Switched to ${res.planCode}`, { tone: 'success' });
        refresh();
      }
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Upgrade failed', { tone: 'error' });
    }
  };

  const onSlip = async () => {
    if (!user?.accessToken || !user.organisationId || !invoiceId) return;
    try {
      await uploadPlatformSlip(user.accessToken, {
        organisationId: user.organisationId,
        invoiceId,
        slipReference,
      });
      toast('Platform slip uploaded — awaiting admin approval', { tone: 'success' });
      setSlipReference('');
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Upload failed', { tone: 'error' });
    }
  };

  if (usingMocks) {
    return (
      <>
        <PageHeader title="Plan & usage" />
        <Notice>Institute billing requires API mode (`VITE_USE_MOCKS=false`).</Notice>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Plan & usage" description="Limits from your current subscription plan." />
      {usage && (
        <Card className="mb-6 p-5">
          <CardHeader
            title={usage.plan ? `${usage.plan.name} (${usage.plan.code})` : 'No plan'}
            description="Counts vs plan caps"
          />
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-2">
              <dt className="text-muted">Batches</dt>
              <dd className="text-fg">
                {usage.counts.batches}
                {usage.plan?.maxBatches != null ? ` / ${usage.plan.maxBatches}` : ''}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted">Students</dt>
              <dd className="text-fg">
                {usage.counts.students}
                {usage.plan?.maxStudents != null ? ` / ${usage.plan.maxStudents}` : ''}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted">Staff</dt>
              <dd className="text-fg">
                {usage.counts.staff}
                {usage.plan?.maxStaff != null ? ` / ${usage.plan.maxStaff}` : ''}
              </dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => void onUpgrade('premium')}>Upgrade to Premium</Button>
            <Button size="sm" variant="secondary" onClick={() => void onUpgrade('platinum')}>
              Upgrade to Platinum
            </Button>
          </div>
        </Card>
      )}
      {invoiceId && (
        <Card className="p-5">
          <CardHeader title="Pay EduPass by bank slip" description={bankHint ?? undefined} />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Input
              label="Transfer reference"
              value={slipReference}
              onValueChange={setSlipReference}
              className="flex-1"
            />
            <Button className="sm:self-end" disabled={slipReference.trim().length < 3} onClick={() => void onSlip()}>
              Upload slip
            </Button>
          </div>
        </Card>
      )}
    </>
  );
};
