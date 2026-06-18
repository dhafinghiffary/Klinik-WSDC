import dayjs from "dayjs"
import "dayjs/locale/id"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.locale("id")
dayjs.extend(relativeTime)

/** "20 Mei 2026" */
export function formatDate(date: string | Date, format = "DD MMM YYYY"): string {
  return dayjs(date).format(format)
}

/** "20 Mei 2026 14:30" */
export function formatDateTime(date: string | Date): string {
  return dayjs(date).format("DD MMM YYYY HH:mm")
}

/** "3 hari yang lalu" */
export function fromNow(date: string | Date): string {
  return dayjs(date).fromNow()
}

/** Hitung umur dalam tahun dari tanggal lahir. */
export function calculateAge(birthDate: string | Date): number {
  return dayjs().diff(dayjs(birthDate), "year")
}

export { dayjs }
