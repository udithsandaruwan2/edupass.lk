import React, { useState } from 'react';
import { Link } from 'react-router';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { Button, IconButton } from '../../components/ui/Button';
import { Card, EmptyState } from '../../components/ui/Primitives';
import { Tabs } from '../../components/ui/Tabs';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../layouts/DashboardLayout';
import type { Role } from '../../types';
import { formatDateTime, relativeTime } from '../../utils/date';

/** Notification inbox for any role. */
export const NotificationsPage: React.FC<{ role: Role }> = ({ role }) => {
  useDocumentTitle('Notifications');
  const { data, setData, remove } = useData();
  const toast = useToast();
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const mine = data.notifications.filter((n) => n.audience === role);
  const unread = mine.filter((n) => !n.read);
  const visible = tab === 'unread' ? unread : mine;

  const setRead = (id: string, read: boolean) => setData((d) => ({ ...d, notifications: d.notifications.map((n) => (n.id === id ? { ...n, read } : n)) }));
  const markAll = () => {
    setData((d) => ({ ...d, notifications: d.notifications.map((n) => (n.audience === role ? { ...n, read: true } : n)) }));
    toast('All notifications marked as read');
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        description={`${unread.length} unread`}
        actions={
          <Button variant="secondary" size="sm" onClick={markAll} disabled={!unread.length}>
            <CheckCheck className="size-4" aria-hidden="true" />
            Mark all read
          </Button>
        }
      />
      <Card>
        <Tabs label="Filter notifications" value={tab} onChange={setTab} tabs={[{ id: 'all', label: 'All', count: mine.length }, { id: 'unread', label: 'Unread', count: unread.length }]} className="px-3" />
        {visible.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={<Bell className="size-5" aria-hidden="true" />} title={tab === 'unread' ? 'No unread notifications' : 'No notifications yet'} description="Booking updates and reminders will appear here." className="border-none" />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {visible.map((n) => (
              <li key={n.id} className={`flex gap-4 px-5 py-4 ${n.read ? '' : 'bg-brand/4'}`}>
                <span aria-hidden="true" className={`mt-2 size-2 shrink-0 rounded-full ${n.read ? 'bg-line' : 'bg-brand'}`} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-fg">
                    {n.title}
                    {!n.read && <span className="sr-only"> (unread)</span>}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">{n.body}</p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-3 text-xs text-muted">
                    <time dateTime={n.createdAt} title={formatDateTime(n.createdAt)}>{relativeTime(n.createdAt)}</time>
                    {n.link && (
                      <Link to={n.link} onClick={() => setRead(n.id, true)} className="font-semibold text-brand hover:underline">Open</Link>
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 items-start gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setRead(n.id, !n.read)}>
                    {n.read ? 'Mark unread' : 'Mark read'}
                  </Button>
                  <IconButton label={`Delete notification: ${n.title}`} onClick={() => { remove('notifications', n.id); toast('Notification deleted', { tone: 'info' }); }}>
                    <Trash2 className="size-4" aria-hidden="true" />
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
};
