import React, { useEffect, useState } from 'react';
import { ReceiptText } from 'lucide-react';
import { listEnrollments, type ApiEnrollment } from '../../api/institute';
import {
  createTuitionFeePlan,
  createTuitionInvoice,
  listTuitionFeePlans,
  listTuitionInvoices,
  recordTuitionCash,
  reviewTuitionPayment,
  type ApiTuitionFeePlan,
  type ApiTuitionInvoice,
} from '../../api/tuition';
import { ApiError } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Field';
import { Card, CardHeader, EmptyState, Notice } from '../../components/ui/Primitives';
import { useAuth, hasEntitlement } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../layouts/DashboardLayout';
import { formatLKR } from '../../utils/format';

/** Organiser UI for institute class fees (tuition) — never labelled as platform fees. */
export const TuitionFeesPage: React.FC = () => {
  useDocumentTitle('Class fees');
  const { user, usingMocks } = useAuth();
  const toast = useToast();
  const entitled = hasEntitlement(user, 'INSTITUTE');
  const orgId = user?.organisationId;

  const [plans, setPlans] = useState<ApiTuitionFeePlan[]>([]);
  const [invoices, setInvoices] = useState<ApiTuitionInvoice[]>([]);
  const [enrollments, setEnrollments] = useState<ApiEnrollment[]>([]);
  const [planName, setPlanName] = useState('');
  const [planAmount, setPlanAmount] = useState('5000');
  const [enrollmentId, setEnrollmentId] = useState('');
  const [feePlanId, setFeePlanId] = useState('');

  const refresh = () => {
    if (usingMocks || !user?.accessToken || !orgId) return;
    void listTuitionFeePlans(user.accessToken, orgId).then(setPlans).catch(() => setPlans([]));
    void listTuitionInvoices(user.accessToken, orgId).then(setInvoices).catch(() => setInvoices([]));
    void listEnrollments(user.accessToken, orgId).then(setEnrollments).catch(() => setEnrollments([]));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usingMocks, user?.accessToken, orgId]);

  if (!entitled) {
    return (
      <>
        <PageHeader title="Class fees" description="Tuition collection for enrolled students." />
        <Notice tone="warning">Institute entitlement required for class fees.</Notice>
      </>
    );
  }

  if (usingMocks) {
    return (
      <>
        <PageHeader title="Class fees" description="Tuition collection for enrolled students." />
        <Notice tone="info">Turn off mocks (VITE_USE_MOCKS=false) to manage class fees against the API.</Notice>
      </>
    );
  }

  const createPlan = async () => {
    if (!user?.accessToken || !orgId) return;
    const amountLkr = Number(planAmount);
    if (!Number.isFinite(amountLkr) || amountLkr < 1) {
      toast('Enter a valid amount in LKR', { tone: 'error' });
      return;
    }
    try {
      await createTuitionFeePlan(user.accessToken, {
        organisationId: orgId,
        name: planName.trim(),
        amountLkr,
      });
      toast('Class fee plan created', { tone: 'success' });
      setPlanName('');
      refresh();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Could not create plan', { tone: 'error' });
    }
  };

  const issueInvoice = async () => {
    if (!user?.accessToken || !orgId || !enrollmentId) return;
    try {
      await createTuitionInvoice(user.accessToken, {
        organisationId: orgId,
        enrollmentId,
        feePlanId: feePlanId || undefined,
        title: feePlanId ? undefined : 'Class fees',
        amountLkr: feePlanId ? undefined : Number(planAmount) || 5000,
      });
      toast('Tuition invoice issued', { tone: 'success' });
      refresh();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Could not issue invoice', { tone: 'error' });
    }
  };

  const takeCash = async (invoiceId: string) => {
    if (!user?.accessToken || !orgId) return;
    try {
      await recordTuitionCash(user.accessToken, invoiceId, { organisationId: orgId });
      toast('Cash payment recorded', { tone: 'success' });
      refresh();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Cash payment failed', { tone: 'error' });
    }
  };

  const approveSlip = async (paymentId: string) => {
    if (!user?.accessToken || !orgId) return;
    try {
      await reviewTuitionPayment(user.accessToken, paymentId, {
        organisationId: orgId,
        decision: 'approve',
      });
      toast('Tuition slip approved', { tone: 'success' });
      refresh();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Approve failed', { tone: 'error' });
    }
  };

  return (
    <>
      <PageHeader
        title="Class fees"
        description="Tuition invoices for enrolled students. Separate from EduPass platform billing."
      />
      <Notice tone="info" className="mb-4">
        Labels say class fees / tuition only — not platform subscription fees.
      </Notice>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Fee plans" description="Reusable class fee amounts." />
          <div className="flex flex-col gap-3 px-5 pb-5">
            <Input label="Plan name" value={planName} onValueChange={setPlanName} placeholder="Monthly class fees" />
            <Input label="Amount (LKR)" value={planAmount} onValueChange={setPlanAmount} />
            <Button onClick={() => void createPlan()} disabled={planName.trim().length < 2}>
              Create fee plan
            </Button>
            <ul className="divide-y divide-line text-sm">
              {plans.map((p) => (
                <li key={p.id} className="flex justify-between py-2">
                  <span className="font-medium text-fg">{p.name}</span>
                  <span className="text-muted">{formatLKR(p.amountLkr)}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card>
          <CardHeader title="Issue tuition invoice" description="Bill one roster student." />
          <div className="flex flex-col gap-3 px-5 pb-5">
            <Select
              label="Student (roster)"
              value={enrollmentId}
              onValueChange={setEnrollmentId}
              options={[
                { value: '', label: 'Select enrollment' },
                ...enrollments.map((e) => ({ value: e.id, label: e.displayName })),
              ]}
            />
            <Select
              label="Fee plan (optional)"
              value={feePlanId}
              onValueChange={setFeePlanId}
              options={[
                { value: '', label: 'Custom amount' },
                ...plans.map((p) => ({ value: p.id, label: `${p.name} · ${formatLKR(p.amountLkr)}` })),
              ]}
            />
            <Button onClick={() => void issueInvoice()} disabled={!enrollmentId}>
              Issue invoice
            </Button>
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="Tuition invoices" description="Cash at desk or approve bank slips." />
        {invoices.length === 0 ? (
          <EmptyState
            icon={<ReceiptText className="size-5" aria-hidden="true" />}
            title="No tuition invoices yet"
            description="Create a fee plan and issue an invoice to a roster student."
          />
        ) : (
          <ul className="divide-y divide-line">
            {invoices.map((inv) => (
              <li key={inv.id} className="flex flex-col gap-3 px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-fg">{inv.title}</p>
                    <p className="text-sm text-muted">
                      {inv.enrollment.displayName} · {inv.status} · remaining {formatLKR(inv.remainingLkr)}
                    </p>
                  </div>
                  {inv.status === 'OPEN' ? (
                    <Button size="sm" onClick={() => void takeCash(inv.id)}>
                      Record cash
                    </Button>
                  ) : null}
                </div>
                {inv.payments
                  .filter((p) => p.method === 'BANK_SLIP' && p.status === 'PENDING')
                  .map((p) => (
                    <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-surface-2 px-3 py-2 text-sm">
                      <span>
                        Slip {p.slipReference} · {formatLKR(p.amountLkr)}
                      </span>
                      <Button size="sm" variant="secondary" onClick={() => void approveSlip(p.id)}>
                        Approve slip
                      </Button>
                    </div>
                  ))}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
};
