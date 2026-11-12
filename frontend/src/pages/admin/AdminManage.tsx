import React, { useState } from 'react';
import { Link } from 'react-router';
import { BadgeCheck, Ban, Eye, Pencil, Plus, Sparkles, Trash2, UserCheck } from 'lucide-react';
import { categoryIcon, CATEGORY_ICONS } from '../../components/icons';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/ui/Button';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { ConfirmDialog, Modal } from '../../components/ui/Dialog';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { Avatar, Card, EmptyState, Notice, ProgressBar } from '../../components/ui/Primitives';
import { Tabs } from '../../components/ui/Tabs';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { useCatalog, isUpcoming } from '../../hooks/useCatalog';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../layouts/DashboardLayout';
import type { Category, Organiser, Seminar, Student } from '../../types';
import { seminarStats } from '../../utils/analytics';
import { formatDate, formatShortDate } from '../../utils/date';
import { formatLKR, formatNumber, slugify } from '../../utils/format';
import { makeId } from '../../utils/random';
import { required, runValidators } from '../../utils/validation';
import { useAdminCategories, useAdminOrganisations, useAdminSeminars, useAdminUsers } from './useAdminApi';
import { createAdminCategory, deleteAdminCategory } from '../../api/admin';
import { ApiError } from '../../api/client';
export const UserManagementPage: React.FC = () => {
  useDocumentTitle('User management');
  const apiUsers = useAdminUsers();
  if (!apiUsers.usingMocks) {
    return (
      <>
        <PageHeader title="User management" description={`${apiUsers.rows.length} accounts`} />
        <Card>
          {apiUsers.loading ? (
            <p className="p-5 text-sm text-muted">Loading…</p>
          ) : apiUsers.rows.length === 0 ? (
            <EmptyState icon={<UserCheck className="size-5" aria-hidden="true" />} title="No users" description="No accounts in the database yet." />
          ) : (
            <ul className="divide-y divide-line">
              {apiUsers.rows.map((u) => (
                <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
                  <div>
                    <p className="font-semibold text-fg">{u.name}</p>
                    <p className="text-muted">{u.email}</p>
                  </div>
                  <span className="text-xs text-muted">{u.globalRole} · {formatDate(u.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </>
    );
  }
  const c = useCatalog();
  const { patch } = useData();
  const toast = useToast();
  const [tab, setTab] = useState<'all' | 'active' | 'suspended'>('all');
  const [district, setDistrict] = useState('');
  const [viewing, setViewing] = useState<Student | null>(null);
  const [toggling, setToggling] = useState<Student | null>(null);
  const bookings = (s: Student) => c.orders.filter((o) => o.studentId === s.id && o.status === 'paid').length;
  const rows = c.students.filter((s) => (tab === 'all' || s.status === tab) && (!district || s.district === district));

  const columns: Column<Student>[] = [
    { key: 'name', header: 'Student', sortValue: (s) => s.name, exportValue: (s) => s.name, render: (s) => <div className="flex items-center gap-3"><Avatar name={s.name} size="sm" /><div className="min-w-0"><p className="font-semibold text-fg">{s.name}</p><p className="truncate text-xs text-muted">{s.email}</p></div></div> },
    { key: 'school', header: 'School', sortValue: (s) => s.school, render: (s) => s.school, hideBelow: 'lg' },
    { key: 'district', header: 'District', sortValue: (s) => s.district, render: (s) => s.district, hideBelow: 'md' },
    { key: 'bookings', header: 'Bookings', align: 'right', sortValue: bookings, render: bookings, hideBelow: 'sm' },
    { key: 'joined', header: 'Joined', sortValue: (s) => s.joinedAt, render: (s) => formatDate(s.joinedAt), hideBelow: 'lg' },
    { key: 'status', header: 'Status', sortValue: (s) => s.status, render: (s) => <StatusBadge status={s.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (s) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => setViewing(s)} aria-label={`View ${s.name}`}><Eye className="size-4" aria-hidden="true" /></Button>
          <Button variant="ghost" size="sm" onClick={() => setToggling(s)} aria-label={`${s.status === 'active' ? 'Suspend' : 'Reactivate'} ${s.name}`}>
            {s.status === 'active' ? <Ban className="size-4" aria-hidden="true" /> : <UserCheck className="size-4" aria-hidden="true" />}
          </Button>
        </div>
      ),
    },
  ];
  const studentOrders = viewing ? c.orders.filter((o) => o.studentId === viewing.id) : [];

  return (
    <>
      <PageHeader title="User management" description={`${formatNumber(c.students.length)} student accounts`} />
      <Card>
        <Tabs label="Filter users" value={tab} onChange={setTab} className="px-3" tabs={[{ id: 'all', label: 'All', count: c.students.length }, { id: 'active', label: 'Active', count: c.students.filter((s) => s.status === 'active').length }, { id: 'suspended', label: 'Suspended', count: c.students.filter((s) => s.status === 'suspended').length }]} />
        <DataTable
          key={tab}
          rows={rows}
          columns={columns}
          rowKey={(s) => s.id}
          caption="Students"
          searchText={(s) => `${s.name} ${s.email} ${s.school}`}
          searchPlaceholder="Name, email or school"
          initialSort={{ key: 'joined', dir: 'desc' }}
          exportName="edupass-students"
          toolbar={<Select label="District" hideLabel value={district} onValueChange={setDistrict} options={[{ value: '', label: 'All districts' }, ...[...new Set(c.students.map((s) => s.district))].sort().map((d) => ({ value: d, label: d }))]} className="w-44" />}
        />
      </Card>
      <Modal open={Boolean(viewing)} onClose={() => setViewing(null)} title={viewing?.name ?? ''} description={viewing?.email} placement="right">
        {viewing && (
          <div className="space-y-5 text-sm">
            <dl className="grid grid-cols-2 gap-3">
              {[['Phone', viewing.phone], ['School', viewing.school], ['District', viewing.district], ['Stream', viewing.stream], ['Exam year', String(viewing.examYear)], ['Joined', formatDate(viewing.joinedAt)]].map(([k, v]) => (
                <div key={k}><dt className="text-xs text-muted">{k}</dt><dd className="font-semibold text-fg">{v}</dd></div>
              ))}
            </dl>
            <div>
              <p className="mb-2 font-semibold text-fg">Orders ({studentOrders.length})</p>
              <ul className="divide-y divide-line rounded-md border border-line">
                {studentOrders.slice(0, 8).map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-2 p-3">
                    <span className="min-w-0 truncate">{c.seminarById.get(o.lines[0]!.seminarId)?.title}</span>
                    <StatusBadge status={o.status} />
                  </li>
                ))}
                {studentOrders.length === 0 && <li className="p-3 text-muted">No orders.</li>}
              </ul>
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog
        open={Boolean(toggling)}
        title={toggling?.status === 'active' ? 'Suspend this student?' : 'Reactivate this student?'}
        description={toggling?.status === 'active' ? `${toggling?.name} won't be able to book new tickets. Existing tickets stay valid.` : `${toggling?.name} will be able to book again.`}
        confirmLabel={toggling?.status === 'active' ? 'Suspend' : 'Reactivate'}
        tone={toggling?.status === 'active' ? 'danger' : 'primary'}
        onCancel={() => setToggling(null)}
        onConfirm={() => {
          if (toggling) patch('students', toggling.id, { status: toggling.status === 'active' ? 'suspended' : 'active' });
          toast(toggling?.status === 'active' ? 'Student suspended' : 'Student reactivated', { tone: 'info' });
          setToggling(null);
        }}
      />
    </>
  );
};

export const OrganiserManagementPage: React.FC = () => {
  useDocumentTitle('Organiser management');
  const apiOrgs = useAdminOrganisations();
  if (!apiOrgs.usingMocks) {
    return (
      <>
        <PageHeader title="Organiser management" description={`${apiOrgs.rows.length} organisations`} />
        <Card>
          {apiOrgs.loading ? (
            <p className="p-5 text-sm text-muted">Loading…</p>
          ) : (
            <ul className="divide-y divide-line">
              {apiOrgs.rows.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
                  <div>
                    <p className="font-semibold text-fg">{o.name}</p>
                    <p className="text-muted">{o.slug}</p>
                  </div>
                  <StatusBadge status={o.status === 'ACTIVE' ? 'active' : 'pending'} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </>
    );
  }
  const c = useCatalog();
  const { patch, notify } = useData();
  const toast = useToast();
  const [status, setStatus] = useState('');
  const [action, setAction] = useState<{ org: Organiser; kind: 'approve' | 'suspend' | 'reactivate' } | null>(null);
  const rows = c.organisers.filter((o) => !status || o.status === status);
  const count = (o: Organiser) => c.seminars.filter((s) => s.organiserId === o.id).length;

  const columns: Column<Organiser>[] = [
    { key: 'name', header: 'Organiser', sortValue: (o) => o.name, render: (o) => <div className="flex items-center gap-3"><Avatar name={o.name} size="sm" /><div><p className="flex items-center gap-1.5 font-semibold text-fg">{o.name}{o.verified && <BadgeCheck className="size-4 text-success" aria-label="Verified" />}</p><p className="text-xs text-muted">{o.email}</p></div></div> },
    { key: 'type', header: 'Type', sortValue: (o) => o.type, render: (o) => o.type, hideBelow: 'lg' },
    { key: 'city', header: 'City', sortValue: (o) => o.city, render: (o) => o.city, hideBelow: 'md' },
    { key: 'seminars', header: 'Seminars', align: 'right', sortValue: count, render: count, hideBelow: 'sm' },
    { key: 'joined', header: 'Joined', sortValue: (o) => o.joinedAt, render: (o) => formatDate(o.joinedAt), hideBelow: 'lg' },
    { key: 'status', header: 'Status', sortValue: (o) => o.status, render: (o) => <StatusBadge status={o.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (o) => (
        <div className="flex justify-end gap-1">
          {o.status === 'pending' && <Button size="sm" onClick={() => setAction({ org: o, kind: 'approve' })}>Approve</Button>}
          {o.status === 'active' && <Button variant="ghost" size="sm" onClick={() => setAction({ org: o, kind: 'suspend' })}>Suspend</Button>}
          {o.status === 'suspended' && <Button variant="ghost" size="sm" onClick={() => setAction({ org: o, kind: 'reactivate' })}>Reactivate</Button>}
          {o.status !== 'pending' && <Button to={`/organisers/${o.slug}`} variant="ghost" size="sm" aria-label={`Public page for ${o.name}`}><Eye className="size-4" aria-hidden="true" /></Button>}
        </div>
      ),
    },
  ];

  const run = () => {
    if (!action) return;
    const { org, kind } = action;
    if (kind === 'approve') {
      patch('organisers', org.id, { status: 'active', verified: true });
      notify('organiser', 'Organiser account approved', `${org.name} can now publish seminars.`, '/organiser/seminars');
      toast(`${org.name} approved`);
    } else {
      patch('organisers', org.id, { status: kind === 'suspend' ? 'suspended' : 'active' });
      toast(kind === 'suspend' ? `${org.name} suspended` : `${org.name} reactivated`, { tone: 'info' });
    }
    setAction(null);
  };

  return (
    <>
      <PageHeader title="Organiser management" description="Review new organisers and manage existing ones." />
      <Card>
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(o) => o.id}
          caption="Organisers"
          searchText={(o) => `${o.name} ${o.email} ${o.city}`}
          initialSort={{ key: 'status', dir: 'asc' }}
          exportName="edupass-organisers"
          toolbar={<Select label="Status" hideLabel value={status} onValueChange={setStatus} options={[{ value: '', label: 'All statuses' }, { value: 'pending', label: 'Pending' }, { value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' }]} className="w-40" />}
        />
      </Card>
      {action && (
        <ConfirmDialog
          open
          title={action.kind === 'approve' ? `Approve ${action.org.name}?` : action.kind === 'suspend' ? `Suspend ${action.org.name}?` : `Reactivate ${action.org.name}?`}
          description={action.kind === 'approve' ? 'They will be marked as reviewed and can publish seminars.' : action.kind === 'suspend' ? 'Their public page is hidden. Existing tickets stay valid.' : 'Their public page becomes visible again.'}
          confirmLabel={action.kind === 'approve' ? 'Approve' : action.kind === 'suspend' ? 'Suspend' : 'Reactivate'}
          tone={action.kind === 'suspend' ? 'danger' : 'primary'}
          onCancel={() => setAction(null)}
          onConfirm={run}
        />
      )}
    </>
  );
};

export const AdminSeminarsPage: React.FC = () => {
  useDocumentTitle('Seminar management');
  const apiSeminars = useAdminSeminars();
  if (!apiSeminars.usingMocks) {
    return (
      <>
        <PageHeader title="Seminar management" description={`${apiSeminars.rows.length} seminars`} />
        <Card>
          {apiSeminars.loading ? (
            <p className="p-5 text-sm text-muted">Loading…</p>
          ) : (
            <ul className="divide-y divide-line">
              {apiSeminars.rows.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
                  <div>
                    <p className="font-semibold text-fg">{s.title}</p>
                    <p className="text-muted">{s.slug}</p>
                  </div>
                  <StatusBadge status={s.status === 'PUBLISHED' ? 'published' : s.status === 'DRAFT' ? 'draft' : 'cancelled'} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </>
    );
  }
  const c = useCatalog();
  const { patch } = useData();
  const toast = useToast();
  const [status, setStatus] = useState('');
  const [organiser, setOrganiser] = useState('');
  const [hiding, setHiding] = useState<Seminar | null>(null);
  const rows = c.seminars.filter((s) => (!status || s.status === status) && (!organiser || s.organiserId === organiser));

  const columns: Column<Seminar>[] = [
    { key: 'title', header: 'Seminar', sortValue: (s) => s.title, render: (s) => <div><p className="font-semibold text-fg">{s.title}</p><p className="text-xs text-muted">{c.organiserById.get(s.organiserId)?.name}</p></div> },
    { key: 'date', header: 'Date', sortValue: (s) => s.startsAt, render: (s) => formatShortDate(s.startsAt), hideBelow: 'md' },
    { key: 'status', header: 'Status', sortValue: (s) => s.status, render: (s) => <StatusBadge status={s.status === 'published' && !isUpcoming(s) ? 'completed' : s.status} /> },
    { key: 'fill', header: 'Sold', sortValue: (s) => seminarStats(s, c.orders).fill, hideBelow: 'sm', render: (s) => { const st = seminarStats(s, c.orders); return <div className="w-28"><p className="mb-1 text-xs text-muted">{st.fill}%</p><ProgressBar value={st.sold} max={st.capacity} label="Seats sold" /></div>; } },
    { key: 'rev', header: 'Revenue', align: 'right', sortValue: (s) => seminarStats(s, c.orders).revenue, render: (s) => formatLKR(seminarStats(s, c.orders).revenue), hideBelow: 'lg' },
    {
      key: 'featured',
      header: 'Featured',
      align: 'right',
      render: (s) => (
        <Button
          variant={s.featured ? 'primary' : 'ghost'}
          size="sm"
          aria-pressed={s.featured}
          disabled={s.status !== 'published'}
          onClick={() => { patch('seminars', s.id, { featured: !s.featured }); toast(s.featured ? 'Removed from featured' : 'Marked as featured', { tone: 'info' }); }}
        >
          <Sparkles className="size-4" aria-hidden="true" />
          <span className="sr-only">{s.featured ? 'Unfeature' : 'Feature'} {s.title}</span>
        </Button>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (s) => (
        <div className="flex justify-end gap-1">
          {s.status === 'published' && <Button to={`/seminars/${s.slug}`} variant="ghost" size="sm" aria-label={`Open ${s.title}`}><Eye className="size-4" aria-hidden="true" /></Button>}
          {s.status === 'published' && isUpcoming(s) && <Button variant="ghost" size="sm" onClick={() => setHiding(s)}>Unlist</Button>}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Seminar management" description="Every seminar on the platform, across all organisers." />
      <Card>
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(s) => s.id}
          caption="All seminars"
          searchText={(s) => `${s.title} ${s.subject} ${s.venue}`}
          initialSort={{ key: 'date', dir: 'asc' }}
          exportName="edupass-all-seminars"
          toolbar={
            <>
              <Select label="Status" hideLabel value={status} onValueChange={setStatus} options={[{ value: '', label: 'All statuses' }, { value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }, { value: 'cancelled', label: 'Cancelled' }]} className="w-40" />
              <Select label="Organiser" hideLabel value={organiser} onValueChange={setOrganiser} options={[{ value: '', label: 'All organisers' }, ...c.organisers.map((o) => ({ value: o.id, label: o.name }))]} className="w-48" />
            </>
          }
        />
      </Card>
      <ConfirmDialog
        open={Boolean(hiding)}
        title="Unlist this seminar?"
        description={`${hiding?.title ?? ''} will be moved back to draft and hidden from the public site. Existing tickets stay valid.`}
        confirmLabel="Unlist"
        onCancel={() => setHiding(null)}
        onConfirm={() => { if (hiding) patch('seminars', hiding.id, { status: 'draft', featured: false }); setHiding(null); toast('Seminar unlisted', { tone: 'info' }); }}
      />
    </>
  );
};

export const CategoryManagementPage: React.FC = () => {
  useDocumentTitle('Category management');
  const apiCats = useAdminCategories();
  const toast = useToast();
  const [name, setName] = useState('');
  if (!apiCats.usingMocks) {
    const add = () => {
      if (!apiCats.enabled || name.trim().length < 2) return;
      void createAdminCategory(apiCats.token, { slug: slugify(name), name: name.trim() })
        .then(() => {
          setName('');
          apiCats.reload();
          toast('Category created');
        })
        .catch((err) => toast(err instanceof ApiError ? err.message : 'Create failed', { tone: 'error' }));
    };
    return (
      <>
        <PageHeader title="Category management" />
        <Card className="mb-4 flex gap-3 p-5">
          <Input label="New category" value={name} onValueChange={setName} className="flex-1" />
          <Button className="self-end" onClick={add}>Add</Button>
        </Card>
        <Card>
          <ul className="divide-y divide-line">
            {apiCats.rows.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="font-semibold text-fg">{c.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    void deleteAdminCategory(apiCats.token, c.id).then(() => {
                      apiCats.reload();
                      toast('Category deleted', { tone: 'info' });
                    });
                  }}
                >
                  Delete
                </Button>
              </li>
            ))}
            {apiCats.rows.length === 0 && !apiCats.loading && (
              <li className="px-5 py-8 text-center text-muted">No categories yet.</li>
            )}
          </ul>
        </Card>
      </>
    );
  }
  const c = useCatalog();
  const { upsert, remove } = useData();
  const [editing, setEditing] = useState<Category | 'new' | null>(null);
  const [v, setV] = useState({ name: '', description: '', icon: 'BookOpen' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleting, setDeleting] = useState<Category | null>(null);
  const usage = (cat: Category) => c.seminars.filter((s) => s.categoryId === cat.id).length;

  const open = (cat: Category | 'new') => {
    setEditing(cat);
    setErrors({});
    setV(cat === 'new' ? { name: '', description: '', icon: 'BookOpen' } : { name: cat.name, description: cat.description, icon: cat.icon });
  };
  const save = () => {
    const errs = runValidators(v, { name: [required('Name')], description: [required('Description')] }) as Record<string, string>;
    if (c.categories.some((x) => x.name.toLowerCase() === v.name.trim().toLowerCase() && (editing === 'new' || x.id !== editing?.id))) errs.name = 'A category with this name exists';
    setErrors(errs);
    if (Object.keys(errs).length || !editing) return;
    upsert('categories', editing === 'new' ? { id: makeId('cat').toLowerCase(), slug: slugify(v.name), name: v.name.trim(), description: v.description.trim(), icon: v.icon } : { ...editing, name: v.name.trim(), description: v.description.trim(), icon: v.icon });
    toast(editing === 'new' ? 'Category created' : 'Category updated');
    setEditing(null);
  };

  return (
    <>
      <PageHeader title="Category management" description="Categories organise seminars on the public site." actions={<Button onClick={() => open('new')}><Plus className="size-4" aria-hidden="true" />New category</Button>} />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {c.categories.map((cat) => {
          const Icon = categoryIcon(cat.icon);
          return (
            <li key={cat.id}>
              <Card className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-md bg-brand/10 text-brand"><Icon className="size-5" aria-hidden="true" /></span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => open(cat)} aria-label={`Edit ${cat.name}`}><Pencil className="size-4" aria-hidden="true" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleting(cat)} disabled={usage(cat) > 0} title={usage(cat) > 0 ? 'In use by seminars' : undefined} aria-label={`Delete ${cat.name}`}><Trash2 className="size-4" aria-hidden="true" /></Button>
                  </div>
                </div>
                <p className="mt-3 font-semibold text-fg">{cat.name}</p>
                <p className="mt-1 flex-1 text-sm text-muted">{cat.description}</p>
                <p className="mt-3 text-xs font-semibold text-muted">{usage(cat)} seminars · <Link to={`/categories/${cat.slug}`} className="text-brand hover:underline">/categories/{cat.slug}</Link></p>
              </Card>
            </li>
          );
        })}
      </ul>
      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'New category' : 'Edit category'} footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <div className="grid gap-4">
          <Input label="Name" required value={v.name} onValueChange={(x) => setV({ ...v, name: x })} error={errors.name} />
          <Textarea label="Description" required rows={3} value={v.description} onValueChange={(x) => setV({ ...v, description: x })} error={errors.description} />
          <Select label="Icon" value={v.icon} onValueChange={(x) => setV({ ...v, icon: x })} options={Object.keys(CATEGORY_ICONS).map((k) => ({ value: k, label: k }))} />
          {editing !== 'new' && <Notice>Renaming keeps the existing URL so shared links still work.</Notice>}
        </div>
      </Modal>
      <ConfirmDialog open={Boolean(deleting)} title="Delete category?" description={`${deleting?.name ?? ''} will be removed.`} confirmLabel="Delete" onCancel={() => setDeleting(null)} onConfirm={() => { if (deleting) remove('categories', deleting.id); setDeleting(null); toast('Category deleted', { tone: 'info' }); }} />
    </>
  );
};
