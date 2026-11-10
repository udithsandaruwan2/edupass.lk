import React from 'react';
import { Route, Routes } from 'react-router';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { NotFoundPage } from '../public/InfoPages';
import { AdminProfilePage, BannerManagementPage, ContentManagementPage, NotificationsManagementPage, PlatformSettingsPage } from './AdminContent';
import { AdminSeminarsPage, CategoryManagementPage, OrganiserManagementPage, UserManagementPage } from './AdminManage';
import { AdminOverview, ReportsPage, RevenueOverviewPage } from './AdminOverview';
import { AdminPlansPage } from './AdminPlans';
import { AdminBookingsPage, AdminTicketsPage, PaymentRecordsPage, RefundRequestsPage } from './AdminSales';

const AdminRoutes: React.FC = () => (
  <Routes>
    <Route element={<DashboardLayout role="admin" />}>
      <Route index element={<AdminOverview />} />
      <Route path="revenue" element={<RevenueOverviewPage />} />
      <Route path="users" element={<UserManagementPage />} />
      <Route path="organisers" element={<OrganiserManagementPage />} />
      <Route path="seminars" element={<AdminSeminarsPage />} />
      <Route path="categories" element={<CategoryManagementPage />} />
      <Route path="bookings" element={<AdminBookingsPage />} />
      <Route path="tickets" element={<AdminTicketsPage />} />
      <Route path="payments" element={<PaymentRecordsPage />} />
      <Route path="refunds" element={<RefundRequestsPage />} />
      <Route path="content" element={<ContentManagementPage />} />
      <Route path="banners" element={<BannerManagementPage />} />
      <Route path="notifications" element={<NotificationsManagementPage />} />
      <Route path="reports" element={<ReportsPage />} />
      <Route path="plans" element={<AdminPlansPage />} />
      <Route path="settings" element={<PlatformSettingsPage />} />
      <Route path="profile" element={<AdminProfilePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);

export default AdminRoutes;
