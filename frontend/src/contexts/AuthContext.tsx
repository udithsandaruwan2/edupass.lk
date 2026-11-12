import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  loginRequest,
  meRequest,
  registerInstitutionRequest,
  registerLecturerRequest,
  registerStudentRequest,
  type ApiUser,
} from '../api/auth';
import { useMocks } from '../api/client';
import { usePersistentState } from '../hooks/usePersistentState';
import type { Role, StaffRole } from '../types';

export interface SessionUser {
  role: Role;
  id: string;
  name: string;
  email: string;
  accessToken?: string;
  organisationId?: string;
  organisationType?: string;
  entitlements?: { code: string; status: string }[];
  /** Ticket commission % for the active org membership (API). */
  commissionPercent?: number;
  /** Organisation staff role from /auth/me (API). */
  staffRole?: StaffRole;
  studentProfile?: {
    school?: string | null;
    district?: string | null;
    stream?: string | null;
    examYear?: number | null;
  };
}

/** @deprecated use SessionUser — kept for mock demo accounts */
export type DemoUser = SessionUser;

export const DEMO_ACCOUNTS: Partial<Record<Role, SessionUser>> = {
  student: { role: 'student', id: 'stu-demo', name: 'Nethmi Perera', email: 'student@edupass.demo' },
  organiser: { role: 'organiser', id: 'org-lumina', name: 'Ayesha Silva', email: 'organiser@edupass.demo' },
  admin: { role: 'admin', id: 'admin-1', name: 'Platform Admin', email: 'admin@edupass.demo' },
};

export const ROLE_HOME: Record<Role, string> = {
  student: '/student',
  organiser: '/organiser',
  admin: '/admin',
  lecturer: '/lecturer',
  scanner: '/organiser/check-in',
};

export const ROLE_LABEL: Record<Role, string> = {
  student: 'Student',
  organiser: 'Organiser',
  admin: 'Admin',
  lecturer: 'Lecturer',
  scanner: 'Scanner',
};

function staffRoleToUi(role: string): Role {
  if (role === 'SCANNER') return 'scanner';
  if (role === 'TEACHER') return 'lecturer';
  return 'organiser';
}

function mapApiUser(user: ApiUser, accessToken: string): SessionUser {
  if (user.isPlatformAdmin) {
    return {
      role: 'admin',
      id: user.id,
      name: user.name,
      email: user.email,
      accessToken,
      entitlements: [],
    };
  }
  const membership = user.memberships[0];
  if (membership) {
    const staffRole = membership.role as StaffRole;
    const isOwnerAdmin = staffRole === 'OWNER' || staffRole === 'ADMIN';
    const role = isOwnerAdmin ? 'organiser' : staffRoleToUi(staffRole);
    return {
      role,
      id: user.id,
      name: user.name,
      email: user.email,
      accessToken,
      organisationId: membership.organisationId,
      organisationType: membership.organisation.type,
      entitlements: membership.entitlements,
      commissionPercent: membership.commissionPercent,
      staffRole,
    };
  }
  const student = user.student as
    | {
        school?: string | null;
        district?: string | null;
        stream?: string | null;
        examYear?: number | null;
      }
    | null
    | undefined;
  return {
    role: 'student',
    id: user.id,
    name: user.name,
    email: user.email,
    accessToken,
    entitlements: [],
    studentProfile: student ?? undefined,
  };
}

export function hasEntitlement(user: SessionUser | null, code: string): boolean {
  return Boolean(user?.entitlements?.some((e) => e.code === code && e.status === 'ACTIVE'));
}

interface AuthContextValue {
  user: SessionUser | null;
  usingMocks: boolean;
  login: (user: SessionUser) => void;
  loginWithPassword: (email: string, password: string) => Promise<SessionUser>;
  registerStudent: (input: {
    email: string;
    password: string;
    name: string;
    district?: string;
    school?: string;
  }) => Promise<SessionUser>;
  registerInstitution: (input: {
    email: string;
    password: string;
    name: string;
    organisationName: string;
  }) => Promise<SessionUser>;
  registerLecturer: (input: {
    email: string;
    password: string;
    name: string;
    organisationName?: string;
  }) => Promise<SessionUser>;
  switchRole: (role: Role) => void;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'edupass-access-token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const usingMocks = useMocks();
  const [user, setUser] = usePersistentState<SessionUser | null>('edupass-demo-user', () => null);
  const [bootstrapped, setBootstrapped] = useState(usingMocks);

  useEffect(() => {
    if (usingMocks) {
      setBootstrapped(true);
      return;
    }
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(null);
      setBootstrapped(true);
      return;
    }
    meRequest(token)
      .then((me) => setUser(mapApiUser(me, token)))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      })
      .finally(() => setBootstrapped(true));
  }, [usingMocks, setUser]);

  const persistSession = useCallback(
    (session: SessionUser) => {
      if (session.accessToken) {
        localStorage.setItem(TOKEN_KEY, session.accessToken);
      }
      setUser(session);
      return session;
    },
    [setUser],
  );

  const login = useCallback((u: SessionUser) => setUser(u), [setUser]);

  const loginWithPassword = useCallback(
    async (email: string, password: string) => {
      const res = await loginRequest(email, password);
      return persistSession(mapApiUser(res.user, res.accessToken));
    },
    [persistSession],
  );

  const registerStudent = useCallback(
    async (input: { email: string; password: string; name: string; district?: string; school?: string }) => {
      const res = await registerStudentRequest(input);
      return persistSession(mapApiUser(res.user, res.accessToken));
    },
    [persistSession],
  );

  const registerInstitution = useCallback(
    async (input: {
      email: string;
      password: string;
      name: string;
      organisationName: string;
    }) => {
      const res = await registerInstitutionRequest(input);
      return persistSession(mapApiUser(res.user, res.accessToken));
    },
    [persistSession],
  );

  const registerLecturer = useCallback(
    async (input: {
      email: string;
      password: string;
      name: string;
      organisationName?: string;
    }) => {
      const res = await registerLecturerRequest(input);
      return persistSession(mapApiUser(res.user, res.accessToken));
    },
    [persistSession],
  );

  const switchRole = useCallback(
    (role: Role) => {
      if (!usingMocks) return;
      const acc = DEMO_ACCOUNTS[role];
      if (acc) setUser(acc);
    },
    [setUser, usingMocks],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, [setUser]);

  const refreshMe = useCallback(async () => {
    if (usingMocks || !user?.accessToken) return;
    const me = await meRequest(user.accessToken);
    setUser(mapApiUser(me, user.accessToken));
  }, [setUser, user, usingMocks]);

  const value = useMemo(
    () => ({
      user,
      usingMocks,
      login,
      loginWithPassword,
      registerStudent,
      registerInstitution,
      registerLecturer,
      switchRole,
      logout,
      refreshMe,
    }),
    [
      user,
      usingMocks,
      login,
      loginWithPassword,
      registerStudent,
      registerInstitution,
      registerLecturer,
      switchRole,
      logout,
      refreshMe,
    ],
  );

  if (!bootstrapped) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
