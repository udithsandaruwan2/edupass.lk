import React, { useState } from 'react';
import { BookOpen, GraduationCap, Award, FileText, Download } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { downloadFile } from '../utils/csv';
import { Badge, FilterChip, SectionHeader, container } from './ui/Primitives';

type Stream = 'arts' | 'science' | 'ol';

const STREAM_TABS: { id: Stream; label: string; icon: typeof BookOpen }[] = [
  { id: 'arts', label: 'Commerce & Arts', icon: BookOpen },
  { id: 'science', label: 'Maths & Science', icon: GraduationCap },
  { id: 'ol', label: 'G.C.E. O/L Subjects', icon: Award },
];

const RESOURCES = [
  { title: 'A/L study planner template', desc: 'A weekly revision schedule you can print', type: 'Planner', stream: 'all' },
  { title: 'Economics key diagrams checklist', desc: 'Every diagram to practise before the exam', type: 'Checklist', stream: 'arts' },
  { title: 'Combined Maths formula summary', desc: 'Core formulas for paper 1 & 2', type: 'Notes', stream: 'science' },
  { title: 'Physics practical revision guide', desc: 'Prescribed practicals and common errors', type: 'Guide', stream: 'science' },
  { title: 'O/L Mathematics structured-question tips', desc: 'How step marks are awarded', type: 'Guide', stream: 'ol' },
];

export const SyllabusResources: React.FC = () => {
  const [activeStream, setActiveStream] = useState<Stream>('arts');
  const toast = useToast();

  const download = (title: string, desc: string) => {
    downloadFile(
      `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`,
      `${title}\n${'='.repeat(title.length)}\n\n${desc}.\n\nEduPass study guide — organisers can publish fuller materials with each seminar.\n`,
      'text/plain;charset=utf-8',
    );
    toast('Study guide downloaded', { description: 'Open the file to plan your revision.', tone: 'info' });
  };

  return (
    <section id="syllabus" aria-labelledby="syllabus-title" className={`${container} py-12 sm:py-16`}>
      <SectionHeader
        id="syllabus-title"
        eyebrow="Free study resources"
        title="Revision planners & study guides"
        description="Free downloads to plan your revision around the seminars you book"
        actions={
          <div role="group" aria-label="Filter resources by subject stream" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
            {STREAM_TABS.map(({ id, label, icon: Icon }) => (
              <FilterChip key={id} active={activeStream === id} onClick={() => setActiveStream(id)}>
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </FilterChip>
            ))}
          </div>
        }
      />

      <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
        {RESOURCES.filter((r) => r.stream === 'all' || r.stream === activeStream).map((res) => (
          <li key={res.title} className="flex items-center gap-4 p-4 transition-colors hover:bg-surface-2 sm:px-6">
            <span className="hidden size-10 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand sm:flex">
              <FileText className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-fg sm:text-base">{res.title}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                <Badge tone="neutral">{res.type}</Badge>
                <span className="text-sm text-muted">{res.desc}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => download(res.title, res.desc)}
              aria-label={`Download ${res.title} (demo file)`}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-line bg-surface px-3 text-sm font-semibold text-fg transition-colors hover:border-brand/50 hover:text-brand"
            >
              <Download className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Download</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};
