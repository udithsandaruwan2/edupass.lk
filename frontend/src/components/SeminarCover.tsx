import React from 'react';
import type { Seminar } from '../types';
import { dayAndMonth } from '../utils/date';
import { subjectIcon } from './icons';
import { Poster } from './ui/Poster';

// Deep, fixed tones so white type stays above 7:1 in either theme
const SUBJECT_TONES: Record<string, string> = {
  Economics: '#1E3A5F',
  'Business Studies': '#4A3517',
  Accounting: '#3F3A14',
  'Combined Maths': '#3B2F63',
  Mathematics: '#2F3B6B',
  Physics: '#0F4C5C',
  Chemistry: '#5C2A2A',
  Biology: '#1F4D3A',
  English: '#5B2A4A',
  ICT: '#233142',
};

interface SeminarCoverProps {
  seminar: Pick<Seminar, 'title' | 'subject' | 'level' | 'startsAt' | 'image'>;
  className?: string;
  /** Compact covers (thumbnails) hide the text */
  compact?: boolean;
  priority?: boolean;
}

/**
 * Generated cover art for seminars without a poster image. Decorative:
 * the seminar title is always present as real text beside it.
 */
export const SeminarCover: React.FC<SeminarCoverProps> = ({ seminar, className = '', compact = false, priority }) => {
  if (seminar.image) return <Poster src={seminar.image} alt="" className={className} priority={priority} />;
  const icon = subjectIcon(seminar.subject);
  const { day, month } = dayAndMonth(seminar.startsAt);
  const tone = SUBJECT_TONES[seminar.subject] ?? '#2A2F3A';
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden text-white ${className}`}
      style={{
        backgroundColor: tone,
        backgroundImage: 'radial-gradient(rgb(255 255 255 / 0.09) 1px, transparent 1px)',
        backgroundSize: '14px 14px',
      }}
    >
      {React.createElement(icon, { className: `absolute text-white/12 ${compact ? '-bottom-2 -right-2 size-14' : '-bottom-6 -right-4 size-40'}`, strokeWidth: 1.25 })}
      {!compact && (
        <>
          <div className="absolute left-4 top-4 flex flex-col items-center rounded-md bg-white px-2.5 py-1.5 text-[#111214] shadow-sm">
            <span className="text-lg font-bold leading-none">{day}</span>
            <span className="mt-0.5 text-[10px] font-bold tracking-wider">{month}</span>
          </div>
          <div className="absolute inset-x-4 bottom-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/75">
              {seminar.level} · {seminar.subject}
            </p>
            <p className="mt-1 line-clamp-2 max-w-[85%] text-lg font-bold leading-snug">{seminar.title}</p>
          </div>
        </>
      )}
      {compact && (
        <span className="absolute inset-0 flex items-center justify-center">
          {React.createElement(icon, { className: 'size-6 text-white/90' })}
        </span>
      )}
    </div>
  );
};
