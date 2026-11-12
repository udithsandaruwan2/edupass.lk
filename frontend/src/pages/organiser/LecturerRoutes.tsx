import React from 'react';
import { Route, Routes } from 'react-router';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { NotFoundPage } from '../public/InfoPages';
import { AccountSettingsPage } from '../student/StudentAccount';
import { InstituteClassesPage } from './InstitutePages';
import { OrganiserLmsPage } from './LmsPages';

const LecturerOverview: React.FC = () => (
  <>
    <h1 className="text-2xl font-bold text-fg">Lecturer workspace</h1>
    <p className="mt-2 text-sm text-muted">Manage class batches and LMS content for your institute.</p>
  </>
);

const LecturerRoutes: React.FC = () => (
  <Routes>
    <Route element={<DashboardLayout role="lecturer" />}>
      <Route index element={<LecturerOverview />} />
      <Route path="classes" element={<InstituteClassesPage />} />
      <Route path="lms" element={<OrganiserLmsPage />} />
      <Route path="settings" element={<AccountSettingsPage role="organiser" />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);

export default LecturerRoutes;
