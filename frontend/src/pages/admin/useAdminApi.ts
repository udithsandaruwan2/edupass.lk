import { useCallback, useEffect, useState } from 'react';
import {
  listAdminCategories,
  listAdminOrders,
  listAdminOrganisations,
  listAdminRefunds,
  listAdminSeminars,
  listAdminTickets,
  listAdminUsers,
  listAdminBanners,
  listAdminFaqs,
  type ApiAdminCategory,
  type ApiAdminOrder,
  type ApiAdminOrg,
  type ApiAdminRefund,
  type ApiAdminSeminar,
  type ApiAdminTicket,
  type ApiAdminUser,
  type ApiAdminBanner,
  type ApiAdminFaq,
} from '../../api/admin';
import { useAuth } from '../../contexts/AuthContext';

function useAdminToken() {
  const { user, usingMocks } = useAuth();
  const token = user?.accessToken;
  const enabled = !usingMocks && Boolean(token);
  return { enabled, token: token!, usingMocks };
}

export function useAdminUsers() {
  const { enabled, token, usingMocks } = useAdminToken();
  const [rows, setRows] = useState<ApiAdminUser[]>([]);
  const [loading, setLoading] = useState(enabled);
  const reload = useCallback(() => {
    if (!enabled) return;
    setLoading(true);
    void listAdminUsers(token)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [enabled, token]);
  useEffect(() => {
    reload();
  }, [reload]);
  return { usingMocks, loading, rows, reload };
}

export function useAdminOrganisations() {
  const { enabled, token, usingMocks } = useAdminToken();
  const [rows, setRows] = useState<ApiAdminOrg[]>([]);
  const [loading, setLoading] = useState(enabled);
  useEffect(() => {
    if (!enabled) return;
    void listAdminOrganisations(token)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [enabled, token]);
  return { usingMocks, loading, rows };
}

export function useAdminSeminars() {
  const { enabled, token, usingMocks } = useAdminToken();
  const [rows, setRows] = useState<ApiAdminSeminar[]>([]);
  const [loading, setLoading] = useState(enabled);
  useEffect(() => {
    if (!enabled) return;
    void listAdminSeminars(token)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [enabled, token]);
  return { usingMocks, loading, rows };
}

export function useAdminCategories() {
  const { enabled, token, usingMocks } = useAdminToken();
  const [rows, setRows] = useState<ApiAdminCategory[]>([]);
  const [loading, setLoading] = useState(enabled);
  const reload = useCallback(() => {
    if (!enabled) return;
    setLoading(true);
    void listAdminCategories(token)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [enabled, token]);
  useEffect(() => {
    reload();
  }, [reload]);
  return { usingMocks, loading, rows, reload, token, enabled };
}

export function useAdminOrders() {
  const { enabled, token, usingMocks } = useAdminToken();
  const [rows, setRows] = useState<ApiAdminOrder[]>([]);
  const [loading, setLoading] = useState(enabled);
  useEffect(() => {
    if (!enabled) return;
    void listAdminOrders(token)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [enabled, token]);
  return { usingMocks, loading, rows };
}

export function useAdminTickets() {
  const { enabled, token, usingMocks } = useAdminToken();
  const [rows, setRows] = useState<ApiAdminTicket[]>([]);
  const [loading, setLoading] = useState(enabled);
  useEffect(() => {
    if (!enabled) return;
    void listAdminTickets(token)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [enabled, token]);
  return { usingMocks, loading, rows };
}

export function useAdminRefunds() {
  const { enabled, token, usingMocks } = useAdminToken();
  const [rows, setRows] = useState<ApiAdminRefund[]>([]);
  const [loading, setLoading] = useState(enabled);
  const reload = useCallback(() => {
    if (!enabled) return;
    setLoading(true);
    void listAdminRefunds(token)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [enabled, token]);
  useEffect(() => {
    reload();
  }, [reload]);
  return { usingMocks, loading, rows, reload, token, enabled };
}

export function useAdminBanners() {
  const { enabled, token, usingMocks } = useAdminToken();
  const [rows, setRows] = useState<ApiAdminBanner[]>([]);
  const [loading, setLoading] = useState(enabled);
  const reload = useCallback(() => {
    if (!enabled) return;
    setLoading(true);
    void listAdminBanners(token)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [enabled, token]);
  useEffect(() => {
    reload();
  }, [reload]);
  return { usingMocks, loading, rows, reload, token, enabled };
}

export function useAdminFaqs() {
  const { enabled, token, usingMocks } = useAdminToken();
  const [rows, setRows] = useState<ApiAdminFaq[]>([]);
  const [loading, setLoading] = useState(enabled);
  const reload = useCallback(() => {
    if (!enabled) return;
    setLoading(true);
    void listAdminFaqs(token)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [enabled, token]);
  useEffect(() => {
    reload();
  }, [reload]);
  return { usingMocks, loading, rows, reload, token, enabled };
}
