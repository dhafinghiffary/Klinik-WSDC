import { setupWorker } from "msw/browser"
import { handlers } from "./handlers"

/** Service worker MSW untuk mocking API di browser (mode dev). */
export const worker = setupWorker(...handlers)
