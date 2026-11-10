import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router';
import { Skeleton } from './components/ui/Primitives';
import { AuthLayout } from './layouts/AuthLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { RequireRole, ScrollManager } from './layouts/common';
import * as Browse from './pages/public/BrowsePages';
import { HomePage } from './pages/public/HomePage';
import * as Info from './pages/public/InfoPages';
import * as People from './pages/public/PeoplePages';
import { SeminarDetailsPage } from './pages/public/SeminarDetailsPage';

// Dashboards are split into their own chunks so the public site stays light
const StudentRoutes = lazy(() => import('./pages/student/StudentRoutes'));
const OrganiserRoutes = lazy(() => import('./pages/organiser/OrganiserRoutes'));
const AdminRoutes = lazy(() => import('./pages/admin/AdminRoutes'));

// Auth and checkout pages are loaded on demand (checkout pulls in the QR library)
const auth = () => import('./pages/auth/AuthPages');
const checkout = () => import('./pages/public/CheckoutPages');
const Auth = {
  LoginPage: lazy(() => auth().then((m) => ({ default: m.LoginPage }))),
  RegisterStudentPage: lazy(() => auth().then((m) => ({ default: m.RegisterStudentPage }))),
  RegisterOrganiserPage: lazy(() => auth().then((m) => ({ default: m.RegisterOrganiserPage }))),
  ForgotPasswordPage: lazy(() => auth().then((m) => ({ default: m.ForgotPasswordPage }))),
  VerifyOtpPage: lazy(() => auth().then((m) => ({ default: m.VerifyOtpPage }))),
  ResetPasswordPage: lazy(() => auth().then((m) => ({ default: m.ResetPasswordPage }))),
  SelectAccountPage: lazy(() => auth().then((m) => ({ default: m.SelectAccountPage }))),
  LogoutPage: lazy(() => auth().then((m) => ({ default: m.LogoutPage }))),
};
const Checkout = {
  CartPage: lazy(() => checkout().then((m) => ({ default: m.CartPage }))),
  CheckoutPage: lazy(() => checkout().then((m) => ({ default: m.CheckoutPage }))),
  OrderConfirmationPage: lazy(() => checkout().then((m) => ({ default: m.OrderConfirmationPage }))),
  PaymentFailedPage: lazy(() => checkout().then((m) => ({ default: m.PaymentFailedPage }))),
  BankSlipPage: lazy(() => checkout().then((m) => ({ default: m.BankSlipPage }))),
};


const DashboardFallback: React.FC = () => (
  <div className="flex min-h-screen bg-page" role="status" aria-label="Loading dashboard">
    <div className="hidden w-64 border-r border-line bg-surface p-5 lg:block">
      <Skeleton className="h-8 w-32" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-8" />)}
      </div>
    </div>
    <div className="flex-1 space-y-6 p-8">
      <Skeleton className="h-9 w-64" />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-32" />)}
      </div>
      <Skeleton className="h-72" />
    </div>
  </div>
);

export function App() {
  return (
    <>
      <ScrollManager />
      <Suspense fallback={<DashboardFallback />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="seminars" element={<Browse.ExplorePage />} />
            <Route path="seminars/filters" element={<Browse.AdvancedFiltersPage />} />
            <Route path="seminars/:slug" element={<SeminarDetailsPage />} />
            <Route path="search" element={<Browse.SearchResultsPage />} />
            <Route path="categories" element={<Browse.CategoriesPage />} />
            <Route path="categories/:slug" element={<Browse.CategoryPage />} />
            <Route path="featured" element={<Browse.FeaturedPage />} />
            <Route path="upcoming" element={<Browse.UpcomingPage />} />
            <Route path="lecturers" element={<People.LecturersPage />} />
            <Route path="lecturers/:id" element={<People.LecturerProfilePage />} />
            <Route path="organisers" element={<People.OrganisersPage />} />
            <Route path="organisers/:slug" element={<People.OrganiserProfilePage />} />
            <Route path="about" element={<Info.AboutPage />} />
            <Route path="contact" element={<Info.ContactPage />} />
            <Route path="faq" element={<Info.FaqPage />} />
            <Route path="help" element={<Info.HelpCenterPage />} />
            <Route path="terms" element={<Info.TermsPage />} />
            <Route path="privacy" element={<Info.PrivacyPage />} />
            <Route path="refunds" element={<Info.RefundPolicyPage />} />
            <Route path="cart" element={<Checkout.CartPage />} />
            <Route path="checkout" element={<Checkout.CheckoutPage />} />
            <Route path="checkout/bank/:orderId" element={<RequireRole role="student"><Checkout.BankSlipPage /></RequireRole>} />
            <Route path="checkout/confirmation/:orderId" element={<RequireRole role="student"><Checkout.OrderConfirmationPage /></RequireRole>} />
            <Route path="checkout/failed/:orderId" element={<Checkout.PaymentFailedPage />} />
            <Route path="*" element={<Info.NotFoundPage />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="login" element={<Auth.LoginPage />} />
            <Route path="register" element={<Auth.RegisterStudentPage />} />
            <Route path="register/organiser" element={<Auth.RegisterOrganiserPage />} />
            <Route path="forgot-password" element={<Auth.ForgotPasswordPage />} />
            <Route path="verify-otp" element={<Auth.VerifyOtpPage />} />
            <Route path="reset-password" element={<Auth.ResetPasswordPage />} />
            <Route path="select-account" element={<Auth.SelectAccountPage />} />
            <Route path="logout" element={<Auth.LogoutPage />} />
          </Route>

          <Route path="student/*" element={<RequireRole role="student"><StudentRoutes /></RequireRole>} />
          <Route path="organiser/*" element={<RequireRole role="organiser"><OrganiserRoutes /></RequireRole>} />
          <Route path="admin/*" element={<RequireRole role="admin"><AdminRoutes /></RequireRole>} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
