import React, { useEffect, useState } from 'react';
import { listAdminPlans, type ApiPlan } from '../../api/billing';
import { ApiError } from '../../api/client';
import { Card, CardHeader, Notice } from '../../components/ui/Primitives';
import { useAuth } from '../../contexts/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../layouts/DashboardLayout';
import { formatLKR } from '../../utils/format';

export const AdminPlansPage: React.FC = () => {
  useDocumentTitle('Subscription plans');
  const { user, usingMocks } = useAuth();
  const [plans, setPlans] = useState<ApiPlan[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (usingMocks || !user?.accessToken) return;
    let cancelled = false;
    void listAdminPlans(user.accessToken)
      .then((rows) => {
        if (!cancelled) setPlans(rows);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Could not load plans');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [usingMocks, user?.accessToken]);

  return (
    <>
      <PageHeader
        title="Subscription plans"
        description="Free / Premium / Platinum limits and commission overrides (API)."
      />
      {usingMocks && (
        <Notice tone="warning" className="mb-6">
          Set <code>VITE_USE_MOCKS=false</code> and sign in as platform admin to load plans from Nest.
        </Notice>
      )}
      {error && <Notice tone="danger" className="mb-6">{error}</Notice>}
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.id} className="p-5">
            <CardHeader title={p.name} description={p.code} />
            <dl className="mt-3 space-y-1 text-sm text-muted">
              <div className="flex justify-between gap-2">
                <dt>Price</dt>
                <dd className="text-fg">{formatLKR(p.priceLkr)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Max batches</dt>
                <dd className="text-fg">{p.maxBatches ?? '∞'}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Max students</dt>
                <dd className="text-fg">{p.maxStudents ?? '∞'}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Ticket %</dt>
                <dd className="text-fg">
                  {p.ticketCommissionPercent == null ? 'Global default' : `${p.ticketCommissionPercent}%`}
                </dd>
              </div>
            </dl>
          </Card>
        ))}
      </div>
    </>
  );
};
