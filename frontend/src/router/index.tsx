import { createBrowserRouter, Navigate } from "react-router-dom"
import { ProtectedRoute } from "./ProtectedRoute"
import { ROLES } from "@/constants/roles"
import AuthLayout from "@/layouts/AuthLayout"
import AppLayout from "@/layouts/AppLayout"
import LoginPage from "@/pages/auth/LoginPage"
import DashboardPage from "@/pages/dashboard/DashboardPage"
import PatientListPage from "@/pages/patients/PatientListPage"
import PatientDetailPage from "@/pages/patients/PatientDetailPage"
import PatientFormPage from "@/pages/patients/PatientFormPage"
import AppointmentListPage from "@/pages/appointments/AppointmentListPage"
import AppointmentFormPage from "@/pages/appointments/AppointmentFormPage"
import MedicalRecordFormPage from "@/pages/medical-records/MedicalRecordFormPage"
import MedicalRecordDetailPage from "@/pages/medical-records/MedicalRecordDetailPage"
import PaymentFormPage from "@/pages/payments/PaymentFormPage"
import PaymentHistoryPage from "@/pages/payments/PaymentHistoryPage"
import PaymentDetailPage from "@/pages/payments/PaymentDetailPage"
import ReportsPage from "@/pages/reports/ReportsPage"
import SettingsPage from "@/pages/settings/SettingsPage"
import ProfilePage from "@/pages/profile/ProfilePage"
import ForbiddenPage from "@/pages/errors/ForbiddenPage"
import NotFoundPage from "@/pages/errors/NotFoundPage"

const { ADMIN, DOCTOR, OWNER } = ROLES

export const router = createBrowserRouter([
  // ── Public ──────────────────────────────────────────────
  {
    element: <AuthLayout />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },

  // ── Terproteksi (wajib login) ───────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "profile", element: <ProfilePage /> },

          // Pasien
          {
            element: <ProtectedRoute roles={[ADMIN, OWNER]} />,
            children: [{ path: "patients", element: <PatientListPage /> }],
          },
          {
            element: <ProtectedRoute roles={[ADMIN, OWNER, DOCTOR]} />,
            children: [{ path: "patients/:id", element: <PatientDetailPage /> }],
          },
          {
            element: <ProtectedRoute roles={[ADMIN]} />,
            children: [
              { path: "patients/create", element: <PatientFormPage /> },
              { path: "patients/:id/edit", element: <PatientFormPage /> },
            ],
          },

          // Janji Temu
          {
            element: <ProtectedRoute roles={[ADMIN, DOCTOR]} />,
            children: [{ path: "appointments", element: <AppointmentListPage /> }],
          },
          {
            element: <ProtectedRoute roles={[ADMIN]} />,
            children: [{ path: "appointments/create", element: <AppointmentFormPage /> }],
          },

          // Rekam Medis
          {
            element: <ProtectedRoute roles={[DOCTOR]} />,
            children: [
              { path: "medical-records/create", element: <MedicalRecordFormPage /> },
              { path: "medical-records/:id/edit", element: <MedicalRecordFormPage /> },
            ],
          },
          {
            element: <ProtectedRoute roles={[DOCTOR, ADMIN, OWNER]} />,
            children: [{ path: "medical-records/:id", element: <MedicalRecordDetailPage /> }],
          },

          // Pembayaran
          {
            element: <ProtectedRoute roles={[ADMIN]} />,
            children: [{ path: "payments/create", element: <PaymentFormPage /> }],
          },
          {
            element: <ProtectedRoute roles={[ADMIN, OWNER]} />,
            children: [
              { path: "payments", element: <PaymentHistoryPage /> },
              { path: "payments/:id", element: <PaymentDetailPage /> },
            ],
          },

          // Laporan & Pengaturan
          {
            element: <ProtectedRoute roles={[OWNER]} />,
            children: [
              { path: "reports", element: <ReportsPage /> },
              { path: "settings", element: <SettingsPage /> },
            ],
          },

          { path: "403", element: <ForbiddenPage /> },
        ],
      },
    ],
  },

  // ── 404 ─────────────────────────────────────────────────
  { path: "*", element: <NotFoundPage /> },
])
