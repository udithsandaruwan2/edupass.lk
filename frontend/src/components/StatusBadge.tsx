import React from 'react';
import { Badge, type BadgeTone } from './ui/Primitives';

const MAP: Record<string, { label: string; tone: BadgeTone }> = {
  // seminars
  published: { label: 'Published', tone: 'success' },
  draft: { label: 'Draft', tone: 'neutral' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
  completed: { label: 'Completed', tone: 'neutral' },
  // orders
  paid: { label: 'Paid', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
  refunded: { label: 'Refunded', tone: 'warning' },
  pending: { label: 'Pending', tone: 'warning' },
  // tickets
  valid: { label: 'Valid', tone: 'brand' },
  checked_in: { label: 'Checked in', tone: 'success' },
  // people
  active: { label: 'Active', tone: 'success' },
  suspended: { label: 'Suspended', tone: 'danger' },
  invited: { label: 'Invited', tone: 'warning' },
  // refunds
  open: { label: 'Open', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
};

/** Status chip: always a text label, never colour alone. */
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = MAP[status] ?? { label: status, tone: 'neutral' as const };
  return <Badge tone={s.tone}>{s.label}</Badge>;
};
