const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
]

export interface DateObject {
  year: string
  monthNumber: number
  month: string
  date: string
  hour: string
  minute: string
}

export function DBtoDate(dateInDB: string) {
  const deadline = {
    year: dateInDB.slice(0, 4),
    monthNumber: parseInt(dateInDB.slice(5, 7)),
    month: "",
    date: dateInDB.slice(8, 10),
    hour: dateInDB.slice(11, 13),
    minute: dateInDB.slice(14, 16),
  }

  deadline.month = months[deadline.monthNumber - 1]

  return deadline
}
