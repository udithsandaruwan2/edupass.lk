import { useEffect, useState } from 'react';
import { listPublicLecturers } from '../../api/lecturers';
import { useMocks } from '../../api/client';
import { useCatalog } from '../../hooks/useCatalog';
import type { Lecturer } from '../../types';

export function usePublicLecturers() {
  const catalog = useCatalog();
  const usingMocks = useMocks();
  const [apiLecturers, setApiLecturers] = useState<Lecturer[] | null>(null);

  useEffect(() => {
    if (usingMocks) {
      setApiLecturers(null);
      return;
    }
    let cancelled = false;
    void listPublicLecturers()
      .then((rows) => {
        if (!cancelled) setApiLecturers(rows);
      })
      .catch(() => {
        if (!cancelled) setApiLecturers([]);
      });
    return () => {
      cancelled = true;
    };
  }, [usingMocks]);

  const lecturers = usingMocks ? catalog.lecturers : (apiLecturers ?? []);
  const lecturerById = new Map(lecturers.map((l) => [l.id, l]));

  return { lecturers, lecturerById, loading: !usingMocks && apiLecturers === null, catalog, usingMocks };
}
