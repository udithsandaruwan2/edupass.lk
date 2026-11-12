import React, { useEffect, useState } from 'react';
import { BookOpen, ClipboardList } from 'lucide-react';
import {
  createBatch,
  createEnrollment,
  createSession,
  getSessionAttendance,
  inviteStaff,
  listBatches,
  listEnrollments,
  listSessions,
  listStaff,
  markAttendance,
  type ApiBatch,
  type ApiEnrollment,
  type ApiRollRow,
  type ApiSession,
  type ApiStaffMember,
} from '../../api/institute';
import { ApiError } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Field';
import { Card, CardHeader, EmptyState, Notice } from '../../components/ui/Primitives';
import { useAuth, hasEntitlement } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../layouts/DashboardLayout';
import { formatDateTime } from '../../utils/date';

function useInstituteOrg() {
  const { user, usingMocks } = useAuth();
  const entitled = hasEntitlement(user, 'INSTITUTE');
  return {
    user,
    usingMocks,
    entitled,
    orgId: user?.organisationId,
    token: user?.accessToken,
    apiReady: !usingMocks && Boolean(user?.accessToken && user.organisationId && entitled),
  };
}

export const InstituteClassesPage: React.FC = () => {
  useDocumentTitle('Classes');
  const { apiReady, orgId, token, usingMocks, entitled } = useInstituteOrg();
  const toast = useToast();
  const [batches, setBatches] = useState<ApiBatch[]>([]);
  const [name, setName] = useState('');

  const refresh = () => {
    if (!apiReady || !token || !orgId) return;
    void listBatches(token, orgId).then(setBatches).catch(() => setBatches([]));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiReady, token, orgId]);

  if (usingMocks) {
    return (
      <>
        <PageHeader title="Classes" />
        <Notice>Turn off mocks and sign in as an institution to manage batches.</Notice>
      </>
    );
  }
  if (!entitled) {
    return (
      <>
        <PageHeader title="Classes" />
        <Notice tone="warning">This organisation does not have Institute entitlement.</Notice>
      </>
    );
  }

  const create = async () => {
    if (!token || !orgId || name.trim().length < 2) return;
    try {
      await createBatch(token, { organisationId: orgId, name: name.trim() });
      setName('');
      toast('Batch created', { tone: 'success' });
      refresh();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Could not create batch', { tone: 'error' });
    }
  };

  return (
    <>
      <PageHeader title="Classes / batches" description="Plan limits apply when creating batches." />
      <Card className="mb-6 p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input label="Batch name" value={name} onValueChange={setName} className="flex-1" placeholder="A/L Physics 2026" />
          <Button className="sm:self-end" onClick={() => void create()} disabled={name.trim().length < 2}>
            Create batch
          </Button>
        </div>
      </Card>
      {batches.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="size-5" aria-hidden="true" />}
          title="No batches yet"
          description="Create your first class batch above."
        />
      ) : (
        <ul className="space-y-2">
          {batches.map((b) => (
            <li key={b.id}>
              <Card className="px-5 py-4">
                <p className="font-semibold text-fg">{b.name}</p>
                <p className="text-xs text-muted">{b.id}</p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export const InstituteRosterPage: React.FC = () => {
  useDocumentTitle('Roster');
  const { apiReady, orgId, token, usingMocks, entitled } = useInstituteOrg();
  const toast = useToast();
  const [batches, setBatches] = useState<ApiBatch[]>([]);
  const [batchId, setBatchId] = useState('');
  const [rows, setRows] = useState<ApiEnrollment[]>([]);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (!apiReady || !token || !orgId) return;
    void listBatches(token, orgId).then((b) => {
      setBatches(b);
      if (b[0] && !batchId) setBatchId(b[0].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiReady, token, orgId]);

  useEffect(() => {
    if (!apiReady || !token || !orgId || !batchId) {
      setRows([]);
      return;
    }
    void listEnrollments(token, orgId, batchId).then(setRows).catch(() => setRows([]));
  }, [apiReady, token, orgId, batchId]);

  if (usingMocks || !entitled) {
    return (
      <>
        <PageHeader title="Roster" />
        <Notice tone={usingMocks ? 'info' : 'warning'}>
          {usingMocks ? 'API mode required.' : 'Institute entitlement required.'}
        </Notice>
      </>
    );
  }

  const add = async () => {
    if (!token || !orgId || !batchId || displayName.trim().length < 2) return;
    try {
      await createEnrollment(token, {
        organisationId: orgId,
        batchId,
        displayName: displayName.trim(),
      });
      setDisplayName('');
      toast('Student enrolled', { tone: 'success' });
      const next = await listEnrollments(token, orgId, batchId);
      setRows(next);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Enroll failed', { tone: 'error' });
    }
  };

  return (
    <>
      <PageHeader title="Roster" description="Students enrolled in a batch (not seminar tickets)." />
      <Card className="mb-6 space-y-4 p-5">
        <Select
          label="Batch"
          value={batchId}
          onValueChange={setBatchId}
          options={batches.map((b) => ({ value: b.id, label: b.name }))}
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input label="Student name" value={displayName} onValueChange={setDisplayName} className="flex-1" />
          <Button className="sm:self-end" onClick={() => void add()} disabled={!batchId || displayName.trim().length < 2}>
            Add to roster
          </Button>
        </div>
      </Card>
      <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
        {rows.map((r) => (
          <li key={r.id} className="flex justify-between px-5 py-3 text-sm">
            <span className="font-semibold text-fg">{r.displayName}</span>
            <span className="text-muted">{r.status}</span>
          </li>
        ))}
        {rows.length === 0 && <li className="px-5 py-8 text-center text-sm text-muted">No students in this batch.</li>}
      </ul>
    </>
  );
};

export const InstituteStaffPage: React.FC = () => {
  useDocumentTitle('Staff');
  const { apiReady, orgId, token, usingMocks, entitled } = useInstituteOrg();
  const toast = useToast();
  const [staff, setStaff] = useState<ApiStaffMember[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('TEACHER');

  const refresh = () => {
    if (!apiReady || !token || !orgId) return;
    void listStaff(token, orgId).then(setStaff).catch(() => setStaff([]));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiReady, token, orgId]);

  if (usingMocks) {
    return (
      <>
        <PageHeader title="Staff" />
        <Notice>API mode required to invite institute staff.</Notice>
      </>
    );
  }
  if (!entitled) {
    return (
      <>
        <PageHeader title="Staff" />
        <Notice tone="warning">Institute entitlement required.</Notice>
      </>
    );
  }

  const sendInvite = async () => {
    if (!token || !orgId || email.trim().length < 3) return;
    try {
      await inviteStaff(token, { organisationId: orgId, email: email.trim(), role });
      setEmail('');
      toast('Staff invite sent', { tone: 'success' });
      refresh();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Invite failed', { tone: 'error' });
    }
  };

  return (
    <>
      <PageHeader title="Staff" description="Invite teachers, scanners and admins to your institute." />
      <Card className="mb-6 space-y-4 p-5">
        <Input label="Email" type="email" value={email} onValueChange={setEmail} />
        <Select
          label="Role"
          value={role}
          onValueChange={setRole}
          options={[
            { value: 'TEACHER', label: 'Teacher' },
            { value: 'SCANNER', label: 'Scanner' },
            { value: 'ADMIN', label: 'Admin' },
          ]}
        />
        <Button onClick={() => void sendInvite()} disabled={email.trim().length < 3}>
          Send invite
        </Button>
      </Card>
      <Card>
        <CardHeader title="Team members" />
        <ul className="divide-y divide-line">
          {staff.map((s) => (
            <li key={s.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <div>
                <p className="font-semibold text-fg">{s.name}</p>
                <p className="text-muted">{s.email}</p>
              </div>
              <span className="font-mono text-xs text-muted">{s.role}</span>
            </li>
          ))}
          {staff.length === 0 && (
            <li className="px-5 py-8 text-center text-sm text-muted">No staff listed yet.</li>
          )}
        </ul>
      </Card>
    </>
  );
};

export const InstituteClassAttendancePage: React.FC = () => {
  useDocumentTitle('Class attendance');
  const { apiReady, orgId, token, usingMocks, entitled } = useInstituteOrg();
  const toast = useToast();
  const [batches, setBatches] = useState<ApiBatch[]>([]);
  const [batchId, setBatchId] = useState('');
  const [sessions, setSessions] = useState<ApiSession[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [title, setTitle] = useState('Class session');
  const [roll, setRoll] = useState<ApiRollRow[]>([]);

  useEffect(() => {
    if (!apiReady || !token || !orgId) return;
    void listBatches(token, orgId).then((b) => {
      setBatches(b);
      if (b[0] && !batchId) setBatchId(b[0].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiReady, token, orgId]);

  useEffect(() => {
    if (!apiReady || !token || !orgId || !batchId) {
      setSessions([]);
      return;
    }
    void listSessions(token, orgId, batchId).then((s) => {
      setSessions(s);
      setSessionId(s[0]?.id ?? '');
    });
  }, [apiReady, token, orgId, batchId]);

  useEffect(() => {
    if (!apiReady || !token || !orgId || !sessionId) {
      setRoll([]);
      return;
    }
    void getSessionAttendance(token, sessionId, orgId)
      .then((res) => setRoll(res.roll))
      .catch(() => setRoll([]));
  }, [apiReady, token, orgId, sessionId]);

  if (usingMocks || !entitled) {
    return (
      <>
        <PageHeader title="Class attendance" />
        <Notice tone={usingMocks ? 'info' : 'warning'}>
          {usingMocks
            ? 'API mode required. Class roll uses AttendanceRecord — not seminar CheckInEvent.'
            : 'Institute entitlement required.'}
        </Notice>
      </>
    );
  }

  const addSession = async () => {
    if (!token || !orgId || !batchId) return;
    try {
      const s = await createSession(token, {
        organisationId: orgId,
        batchId,
        title: title.trim() || 'Class session',
        startsAt: new Date().toISOString(),
      });
      toast('Session created', { tone: 'success' });
      const list = await listSessions(token, orgId, batchId);
      setSessions(list);
      setSessionId(s.id);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Could not create session', { tone: 'error' });
    }
  };

  const setStatus = async (enrollmentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    if (!token || !orgId || !sessionId) return;
    try {
      await markAttendance(token, sessionId, {
        organisationId: orgId,
        marks: [{ enrollmentId, status }],
      });
      const res = await getSessionAttendance(token, sessionId, orgId);
      setRoll(res.roll);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Mark failed', { tone: 'error' });
    }
  };

  return (
    <>
      <PageHeader
        title="Class attendance"
        description="Class roll (AttendanceRecord). Seminar gate check-in is a separate system."
      />
      <Card className="mb-6 space-y-4 p-5">
        <Select
          label="Batch"
          value={batchId}
          onValueChange={(v) => {
            setBatchId(v);
            setSessionId('');
          }}
          options={batches.map((b) => ({ value: b.id, label: b.name }))}
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input label="New session title" value={title} onValueChange={setTitle} className="flex-1" />
          <Button className="sm:self-end" onClick={() => void addSession()} disabled={!batchId}>
            Start session
          </Button>
        </div>
        <Select
          label="Session"
          value={sessionId}
          onValueChange={setSessionId}
          options={sessions.map((s) => ({
            value: s.id,
            label: `${s.title} · ${formatDateTime(s.startsAt)}`,
          }))}
        />
      </Card>
      {!sessionId ? (
        <EmptyState
          icon={<ClipboardList className="size-5" aria-hidden="true" />}
          title="No session selected"
          description="Create a session for this batch to take the roll."
        />
      ) : (
        <Card>
          <CardHeader title="Roll call" description="Marks write AttendanceRecord rows only." />
          <ul className="divide-y divide-line">
            {roll.map((r) => (
              <li key={r.enrollmentId} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-fg">{r.displayName}</p>
                  <p className="text-xs text-muted">{r.status ?? 'Not marked'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant={r.status === 'PRESENT' ? 'primary' : 'secondary'} onClick={() => void setStatus(r.enrollmentId, 'PRESENT')}>
                    Present
                  </Button>
                  <Button size="sm" variant={r.status === 'LATE' ? 'primary' : 'secondary'} onClick={() => void setStatus(r.enrollmentId, 'LATE')}>
                    Late
                  </Button>
                  <Button size="sm" variant={r.status === 'ABSENT' ? 'primary' : 'ghost'} onClick={() => void setStatus(r.enrollmentId, 'ABSENT')}>
                    Absent
                  </Button>
                </div>
              </li>
            ))}
            {roll.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-muted">Enroll students in this batch first.</li>
            )}
          </ul>
        </Card>
      )}
    </>
  );
};
