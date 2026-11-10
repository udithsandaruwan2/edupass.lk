import React from 'react';
import { GraduationCap, BookOpen, QrCode, Video } from 'lucide-react';
import { container } from './ui/Primitives';

const FEATURES = [
  { icon: GraduationCap, title: 'Experienced lecturers', desc: 'Profiles, subjects and ratings' },
  { icon: BookOpen, title: 'Syllabus aligned', desc: 'Theory & model papers' },
  { icon: QrCode, title: 'QR admission tickets', desc: 'One scan at the door' },
  { icon: Video, title: 'Physical & live stream', desc: 'Hybrid ticket options' },
];

export const FeatureBar: React.FC = () => (
  <section id="why-us" aria-labelledby="why-us-title" className={`${container} py-4`}>
    <h2 id="why-us-title" className="sr-only">Why EduPass</h2>
    <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
      {FEATURES.map(({ icon: Icon, title, desc }) => (
        <li key={title} className="flex items-center gap-4 bg-surface p-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-fg sm:text-base">{title}</h3>
            <p className="mt-0.5 text-sm text-muted">{desc}</p>
          </div>
        </li>
      ))}
    </ul>
  </section>
);
