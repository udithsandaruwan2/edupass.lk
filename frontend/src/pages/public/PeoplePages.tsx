import React, { useState } from 'react';
import { Link, useParams } from 'react-router';
import { BadgeCheck, Building2, CalendarDays, GraduationCap, Mail, MapPin, Phone, Star, Users } from 'lucide-react';
import { SeminarGrid } from '../../components/SeminarCard';
import { Input } from '../../components/ui/Field';
import { Avatar, Badge, Card, EmptyState, SectionHeader, container } from '../../components/ui/Primitives';
import { useCatalog } from '../../hooks/useCatalog';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDate } from '../../utils/date';
import { formatCompact } from '../../utils/format';
import { NotFoundPage } from './InfoPages';

export const LecturersPage: React.FC = () => {
  useDocumentTitle('Lecturers');
  const { lecturers, listed, organiserById } = useCatalog();
  const [q, setQ] = useState('');
  const visible = lecturers
    .filter((l) => l.status === 'active')
    .filter((l) => `${l.name} ${l.subjects.join(' ')}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className={`${container} py-10 sm:py-14`}>
      <SectionHeader as="h1" eyebrow="Speakers" title="Lecturers" description="Meet the lecturers running seminars on EduPass. All profiles in this demo are fictional." actions={<Input label="Search lecturers" hideLabel type="search" placeholder="Name or subject" value={q} onValueChange={setQ} className="w-full sm:w-64" />} />
      {visible.length === 0 ? (
        <EmptyState icon={<Users className="size-5" aria-hidden="true" />} title="No lecturers found" description="Try another name or subject." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((l) => {
            const upcoming = listed.filter((s) => s.lecturerId === l.id).length;
            return (
              <li key={l.id}>
                <Link to={`/lecturers/${l.id}`} className="flex h-full gap-4 rounded-lg border border-line bg-surface p-5 transition-colors hover:border-brand/40">
                  <Avatar name={l.name} size="lg" />
                  <div className="min-w-0">
                    <p className="font-semibold text-fg">{l.name}</p>
                    <p className="text-sm text-muted">{l.subjects.join(', ')}</p>
                    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                      <span className="flex items-center gap-1"><Star className="size-3.5 fill-current text-warning" aria-hidden="true" />{l.rating}</span>
                      <span>{upcoming} upcoming</span>
                      <span>{organiserById.get(l.organiserId)?.name}</span>
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export const LecturerProfilePage: React.FC = () => {
  const { id } = useParams();
  const { lecturerById, organiserById, listed } = useCatalog();
  const l = id ? lecturerById.get(id) : undefined;
  useDocumentTitle(l?.name ?? 'Lecturer');
  if (!l) return <NotFoundPage />;
  const org = organiserById.get(l.organiserId);
  const seminars = listed.filter((s) => s.lecturerId === l.id);
  return (
    <div className={`${container} py-10 sm:py-14`}>
      <Link to="/lecturers" className="mb-5 inline-flex text-sm font-semibold text-brand hover:underline">← All lecturers</Link>
      <div className="grid gap-8 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <Card className="h-fit p-6 text-center">
          <Avatar name={l.name} size="xl" className="mx-auto" />
          <h1 className="mt-4 text-2xl font-bold text-fg">{l.name}</h1>
          <p className="text-sm text-muted">{l.title}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {l.subjects.map((s) => <Badge key={s}>{s}</Badge>)}
          </div>
          <dl className="mt-6 grid grid-cols-3 gap-2 border-t border-line pt-5 text-center">
            <div><dt className="text-xs text-muted">Rating</dt><dd className="text-lg font-bold text-fg">{l.rating}</dd></div>
            <div><dt className="text-xs text-muted">Years</dt><dd className="text-lg font-bold text-fg">{l.yearsTeaching}</dd></div>
            <div><dt className="text-xs text-muted">Students</dt><dd className="text-lg font-bold text-fg">{formatCompact(l.studentsTaught)}</dd></div>
          </dl>
          {org && (
            <Link to={`/organisers/${org.slug}`} className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-brand hover:underline">
              <Building2 className="size-4" aria-hidden="true" /> {org.name}
            </Link>
          )}
        </Card>
        <div className="min-w-0 space-y-8">
          <section aria-labelledby="bio">
            <h2 id="bio" className="text-xl font-bold text-fg">About</h2>
            <p className="mt-3 leading-relaxed text-muted">{l.bio}</p>
            <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-muted">Qualifications</h3>
            <ul className="mt-3 space-y-2">
              {l.qualifications.map((q) => (
                <li key={q} className="flex items-center gap-2 text-sm text-fg">
                  <GraduationCap className="size-4 text-brand" aria-hidden="true" /> {q}
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="lec-seminars">
            <h2 id="lec-seminars" className="mb-5 text-xl font-bold text-fg">Upcoming seminars</h2>
            {seminars.length ? (
              <SeminarGrid seminars={seminars} />
            ) : (
              <EmptyState icon={<CalendarDays className="size-5" aria-hidden="true" />} title="No upcoming seminars" description="Save a seminar from this lecturer to hear about new dates." />
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export const OrganisersPage: React.FC = () => {
  useDocumentTitle('Organisers');
  const { organisers, listed } = useCatalog();
  return (
    <div className={`${container} py-10 sm:py-14`}>
      <SectionHeader as="h1" eyebrow="Organisers" title="Institutes & organisers" description="The institutes and independent lecturers listing seminars. All organisations in this demo are fictional." />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {organisers.filter((o) => o.status === 'active').map((o) => (
          <li key={o.id}>
            <Link to={`/organisers/${o.slug}`} className="flex h-full flex-col rounded-lg border border-line bg-surface p-5 transition-colors hover:border-brand/40">
              <div className="flex items-center gap-3">
                <Avatar name={o.name} size="lg" />
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-semibold text-fg">
                    {o.name}
                    {o.verified && <BadgeCheck className="size-4 text-success" aria-label="Reviewed organiser" />}
                  </p>
                  <p className="text-sm text-muted">{o.type} · {o.city}</p>
                </div>
              </div>
              <p className="mt-4 line-clamp-3 flex-1 text-sm text-muted">{o.about}</p>
              <p className="mt-4 text-sm font-semibold text-brand">{listed.filter((s) => s.organiserId === o.id).length} upcoming seminars</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const OrganiserProfilePage: React.FC = () => {
  const { slug } = useParams();
  const { organisers, lecturers, listed } = useCatalog();
  const o = organisers.find((x) => x.slug === slug);
  useDocumentTitle(o?.name ?? 'Organiser');
  if (!o || o.status === 'suspended') return <NotFoundPage />;
  const seminars = listed.filter((s) => s.organiserId === o.id);
  const team = lecturers.filter((l) => l.organiserId === o.id && l.status === 'active');
  return (
    <div className={`${container} py-10 sm:py-14`}>
      <Link to="/organisers" className="mb-5 inline-flex text-sm font-semibold text-brand hover:underline">← All organisers</Link>
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar name={o.name} size="xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-fg sm:text-3xl">{o.name}</h1>
              {o.verified ? <Badge tone="success"><BadgeCheck className="size-3.5" aria-hidden="true" />Reviewed</Badge> : <Badge tone="warning">Pending review</Badge>}
            </div>
            <p className="mt-1 text-muted">{o.about}</p>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
              <li className="flex items-center gap-1.5"><MapPin className="size-4" aria-hidden="true" />{o.city}</li>
              <li className="flex items-center gap-1.5"><Mail className="size-4" aria-hidden="true" />{o.email}</li>
              <li className="flex items-center gap-1.5"><Phone className="size-4" aria-hidden="true" />{o.phone}</li>
              <li>On EduPass since {formatDate(o.joinedAt)}</li>
            </ul>
          </div>
        </div>
      </Card>
      {team.length > 0 && (
        <section aria-labelledby="team" className="mt-10">
          <h2 id="team" className="mb-4 text-xl font-bold text-fg">Lecturers</h2>
          <ul className="flex flex-wrap gap-3">
            {team.map((l) => (
              <li key={l.id}>
                <Link to={`/lecturers/${l.id}`} className="flex items-center gap-3 rounded-lg border border-line bg-surface py-2 pl-2 pr-4 hover:border-brand/40">
                  <Avatar name={l.name} size="sm" />
                  <span className="text-sm font-semibold text-fg">{l.name}</span>
                  <span className="text-xs text-muted">{l.subjects[0]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section aria-labelledby="org-seminars" className="mt-10">
        <h2 id="org-seminars" className="mb-5 text-xl font-bold text-fg">Upcoming seminars</h2>
        {seminars.length ? (
          <SeminarGrid seminars={seminars} />
        ) : (
          <EmptyState icon={<CalendarDays className="size-5" aria-hidden="true" />} title="No upcoming seminars" description="This organiser has nothing on sale right now." />
        )}
      </section>
    </div>
  );
};
