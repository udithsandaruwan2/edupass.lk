import React, { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { ApiError } from '../../api/client';
import { listBatches } from '../../api/institute';
import { createLmsAssignment, createLmsModule } from '../../api/lms';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Field';
import { Card, EmptyState, Notice } from '../../components/ui/Primitives';
import { useAuth, hasEntitlement } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../layouts/DashboardLayout';

/** Organiser / lecturer: create LMS module + assignment (happy path). */
export const OrganiserLmsPage: React.FC = () => {
  useDocumentTitle('LMS');
  const { user, usingMocks } = useAuth();
  const toast = useToast();
  const entitled = hasEntitlement(user, 'INSTITUTE');
  const [batches, setBatches] = useState<{ id: string; name: string }[]>([]);
  const [batchId, setBatchId] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');

  const apiReady =
    !usingMocks && Boolean(user?.accessToken && user.organisationId && entitled);

  useEffect(() => {
    if (!apiReady || !user?.accessToken || !user.organisationId) return;
    void listBatches(user.accessToken, user.organisationId).then((rows) => {
      setBatches(rows);
      if (rows[0]) setBatchId(rows[0].id);
    });
  }, [apiReady, user?.accessToken, user?.organisationId]);

  if (usingMocks) {
    return (
      <>
        <PageHeader title="LMS" />
        <Notice>API mode required for LMS modules and assignments.</Notice>
      </>
    );
  }
  if (!entitled) {
    return (
      <>
        <PageHeader title="LMS" />
        <Notice tone="warning">Institute entitlement required.</Notice>
      </>
    );
  }

  const createModule = async () => {
    if (!user?.accessToken || !user.organisationId || !batchId || moduleTitle.trim().length < 2) return;
    try {
      const mod = await createLmsModule(user.accessToken, {
        organisationId: user.organisationId,
        batchId,
        title: moduleTitle.trim(),
      });
      setModuleId(mod.id);
      toast('Module created', { tone: 'success' });
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Could not create module', { tone: 'error' });
    }
  };

  const createAssignment = async () => {
    if (!user?.accessToken || !user.organisationId || !moduleId || assignmentTitle.trim().length < 2) return;
    try {
      await createLmsAssignment(user.accessToken, {
        organisationId: user.organisationId,
        moduleId,
        title: assignmentTitle.trim(),
      });
      toast('Assignment created', { tone: 'success' });
      setAssignmentTitle('');
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Could not create assignment', { tone: 'error' });
    }
  };

  return (
    <>
      <PageHeader title="LMS modules" description="Create a module and assignment for a class batch." />
      {batches.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="size-5" aria-hidden="true" />}
          title="No batches"
          description="Create a class batch first, then add LMS content."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="space-y-4 p-5">
            <Select
              label="Batch"
              value={batchId}
              onValueChange={setBatchId}
              options={batches.map((b) => ({ value: b.id, label: b.name }))}
            />
            <Input label="Module title" value={moduleTitle} onValueChange={setModuleTitle} />
            <Button onClick={() => void createModule()} disabled={moduleTitle.trim().length < 2}>
              Create module
            </Button>
            {moduleId && (
              <p className="text-xs text-muted">
                Active module: <span className="font-mono">{moduleId}</span>
              </p>
            )}
          </Card>
          <Card className="space-y-4 p-5">
            <Input
              label="Assignment title"
              value={assignmentTitle}
              onValueChange={setAssignmentTitle}
              hint={moduleId ? undefined : 'Create a module first'}
            />
            <Button onClick={() => void createAssignment()} disabled={!moduleId || assignmentTitle.trim().length < 2}>
              Add assignment
            </Button>
          </Card>
        </div>
      )}
    </>
  );
};
