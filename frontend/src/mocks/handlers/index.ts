import { authHandlers } from "./auth"
import { patientHandlers } from "./patients"
import { appointmentHandlers } from "./appointments"
import { medicalRecordHandlers } from "./medical-records"
import { paymentHandlers } from "./payments"
import { dashboardHandlers } from "./dashboard"
import { reportHandlers } from "./reports"
import { masterHandlers } from "./master"

export const handlers = [
  ...authHandlers,
  ...patientHandlers,
  ...appointmentHandlers,
  ...medicalRecordHandlers,
  ...paymentHandlers,
  ...dashboardHandlers,
  ...reportHandlers,
  ...masterHandlers,
]
