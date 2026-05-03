export interface DateObject {
  year: string;
  month: string;
  monthNumber: number;
  date: string;
  hour: string;
  minute: string;
}

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

export function DBtoDate(dateInDB: string): DateObject {
  const monthNumber = parseInt(dateInDB.slice(5, 7))
  const deadline: DateObject = {
    year: dateInDB.slice(0, 4),
    month: months[monthNumber - 1],
    monthNumber: monthNumber - 1,
    date: dateInDB.slice(8, 10),
    hour: dateInDB.slice(11, 13),
    minute: dateInDB.slice(14, 16),
  }

  return deadline
}
