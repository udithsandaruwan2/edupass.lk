import React from 'react';
import { Route, Routes } from 'react-router';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { NotFoundPage } from '../public/InfoPages';
import { NotificationsPage } from '../shared/NotificationsPage';
import { LecturerManagementPage, OrganiserProfileSettingsPage, OrganiserSettingsPage } from './OrganiserAccount';
import { EventPerformancePage, RevenueAnalyticsPage, SalesReportsPage } from './OrganiserInsights';
import { OrganiserOverview, SeminarManagementPage, TicketAvailabilityPage, TicketTypesPage } from './OrganiserPages';
import { AttendeesPage, CheckInPage, OrganiserBookingsPage } from './OrganiserSales';
import { SeminarFormPage, SeminarPreviewPage } from './SeminarForm';
import { InstituteBillingPage } from './InstituteBillingPage';
import {
  InstituteClassAttendancePage,
  InstituteClassesPage,
  InstituteRosterPage,
} from './InstitutePages';
import { TuitionFeesPage } from './TuitionPages';

const OrganiserRoutes: React.FC = () => (
  <Routes>
    <Route element={<DashboardLayout role="organiser" />}>
      <Route index element={<OrganiserOverview />} />
      <Route path="seminars" element={<SeminarManagementPage />} />
      <Route path="seminars/new" element={<SeminarFormPage />} />
      <Route path="seminars/:seminarId/edit" element={<SeminarFormPage />} />
      <Route path="seminars/:seminarId/preview" element={<SeminarPreviewPage />} />
      <Route path="tickets" element={<TicketTypesPage />} />
      <Route path="availability" element={<TicketAvailabilityPage />} />
      <Route path="bookings" element={<OrganiserBookingsPage />} />
      <Route path="attendees" element={<AttendeesPage />} />
      <Route path="check-in" element={<CheckInPage />} />
      <Route path="revenue" element={<RevenueAnalyticsPage />} />
      <Route path="reports" element={<SalesReportsPage />} />
      <Route path="performance" element={<EventPerformancePage />} />
      <Route path="lecturers" element={<LecturerManagementPage />} />
      <Route path="classes" element={<InstituteClassesPage />} />
      <Route path="roster" element={<InstituteRosterPage />} />
      <Route path="class-attendance" element={<InstituteClassAttendancePage />} />
      <Route path="fees" element={<TuitionFeesPage />} />
      <Route path="plan" element={<InstituteBillingPage />} />
      <Route path="notifications" element={<NotificationsPage role="organiser" />} />
      <Route path="profile" element={<OrganiserProfileSettingsPage />} />
      <Route path="settings" element={<OrganiserSettingsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);

export default OrganiserRoutes;
