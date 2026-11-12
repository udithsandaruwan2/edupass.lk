import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { ApiError } from '../../api/client';
import {
  listStudentGrades,
  listStudentLmsModules,
  submitStudentAssignment,
  type ApiStudentModule,
} from '../../api/lms';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Field';
import { Card, CardHeader, EmptyState, Notice } from '../../components/ui/Primitives';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../layouts/DashboardLayout';

export const StudentLmsPage: React.FC = () => {
  useDocumentTitle('Class learning');
  const { user, usingMocks } = useAuth();
  const toast = useToast();
  const [modules, setModules] = useState<ApiStudentModule[]>([]);
  const [grades, setGrades] = useState<{ assignmentTitle: string; gradeScore: number | null }[]>([]);
  const [submission, setSubmission] = useState({ assignmentId: '', body: '' });

  useEffect(() => {
    if (usingMocks || !user?.accessToken || user.role !== 'student') return;
    void Promise.all([
      listStudentLmsModules(user.accessToken),
      listStudentGrades(user.accessToken),
    ])
      .then(([mods, g]) => {
        setModules(mods);
        setGrades(g.map((x) => ({ assignmentTitle: x.assignmentTitle, gradeScore: x.gradeScore })));
      })
      .catch(() => {
        setModules([]);
        setGrades([]);
      });
  }, [usingMocks, user?.accessToken, user?.role]);

  if (usingMocks) {
    return (
      <>
        <PageHeader title="Class learning" />
        <Notice>Sign in with API mode to view institute LMS modules.</Notice>
      </>
    );
  }

  const submit = async () => {
    if (!user?.accessToken || !submission.assignmentId || submission.body.trim().length < 5) return;
    try {
      await submitStudentAssignment(user.accessToken, {
        assignmentId: submission.assignmentId,
        body: submission.body.trim(),
      });
      toast('Submission sent', { tone: 'success' });
      setSubmission({ assignmentId: '', body: '' });
      const g = await listStudentGrades(user.accessToken);
      setGrades(g.map((x) => ({ assignmentTitle: x.assignmentTitle, gradeScore: x.gradeScore })));
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Submit failed', { tone: 'error' });
    }
  };

  const firstAssignment = modules.flatMap((m) => m.assignments)[0];

  return (
    <>
      <PageHeader title="Class learning" description="Modules, assignments and grades from your institute." />
      {modules.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-5" aria-hidden="true" />}
          title="No modules yet"
          description="When your institute publishes LMS content, it will appear here."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Modules" />
            <ul className="divide-y divide-line">
              {modules.map((m) => (
                <li key={m.id} className="px-5 py-4">
                  <p className="font-semibold text-fg">{m.title}</p>
                  <p className="text-xs text-muted">{m.assignments.length} assignment(s)</p>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="space-y-4 p-5">
            <CardHeader title="Submit assignment" />
            {firstAssignment ? (
              <>
                <p className="text-sm text-muted">Assignment: {firstAssignment.title}</p>
                <Textarea
                  label="Your answer"
                  value={submission.body}
                  onValueChange={(body) =>
                    setSubmission({ assignmentId: firstAssignment.id, body })
                  }
                  rows={5}
                />
                <Button onClick={() => void submit()}>Submit</Button>
              </>
            ) : (
              <p className="text-sm text-muted">No assignments available.</p>
            )}
          </Card>
          {grades.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader title="Grades" />
              <ul className="divide-y divide-line">
                {grades.map((g) => (
                  <li key={g.assignmentTitle} className="flex justify-between px-5 py-3 text-sm">
                    <span>{g.assignmentTitle}</span>
                    <span className="font-semibold">{g.gradeScore ?? '—'}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </>
  );
};
