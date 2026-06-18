const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/** Format angka ke Rupiah, mis. 150000 -> "Rp 150.000". */
export function formatIDR(value: number): string {
  return idrFormatter.format(value)
}

/** Parse string input ("150.000" / "Rp 150.000") menjadi number. */
export function parseIDR(value: string): number {
  const digits = value.replace(/[^\d]/g, "")
  return digits ? Number(digits) : 0
}
