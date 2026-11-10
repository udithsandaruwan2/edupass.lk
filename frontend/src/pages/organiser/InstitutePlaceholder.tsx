import React from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Notice } from '../../components/ui/Primitives';

/** Placeholder until T-007 institute modules ship. */
export const InstitutePlaceholderPage: React.FC<{ title: string }> = ({ title }) => {
  useDocumentTitle(title);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-fg">{title}</h1>
      <Notice tone="info">
        Institute Management UI lands in a later milestone (batches, roster, class attendance, tuition).
        This page is reserved so entitlement-gated navigation works today.
      </Notice>
    </div>
  );
};
