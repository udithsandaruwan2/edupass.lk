import React from 'react';
import { Route, Routes } from 'react-router';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { NotificationsPage } from '../shared/NotificationsPage';
import { NotFoundPage } from '../public/InfoPages';
import { AccountSettingsPage, StudentProfilePage, SupportPage } from './StudentAccount';
import { BookingHistoryPage, MyBookingsPage, PastSeminarsPage, StudentOverview, UpcomingSeminarsPage } from './StudentPages';
import { StudentTuitionPage } from './StudentTuitionPage';
import { MyTicketsPage, SavedSeminarsPage, TicketDetailPage } from './StudentTickets';
import { StudentLmsPage } from './StudentLmsPage';

const StudentRoutes: React.FC = () => (
  <Routes>
    <Route element={<DashboardLayout role="student" />}>
      <Route index element={<StudentOverview />} />
      <Route path="bookings" element={<MyBookingsPage />} />
      <Route path="upcoming" element={<UpcomingSeminarsPage />} />
      <Route path="past" element={<PastSeminarsPage />} />
      <Route path="history" element={<BookingHistoryPage />} />
      <Route path="tickets" element={<MyTicketsPage />} />
      <Route path="tickets/:ticketId" element={<TicketDetailPage />} />
      <Route path="class-fees" element={<StudentTuitionPage />} />
      <Route path="learning" element={<StudentLmsPage />} />
      <Route path="saved" element={<SavedSeminarsPage />} />
      <Route path="notifications" element={<NotificationsPage role="student" />} />
      <Route path="profile" element={<StudentProfilePage />} />
      <Route path="settings" element={<AccountSettingsPage role="student" />} />
      <Route path="support" element={<SupportPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);

export default StudentRoutes;
