import { useEffect } from 'react';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · EduPass` : 'EduPass – A/L & O/L Seminar Tickets';
  }, [title]);
}
