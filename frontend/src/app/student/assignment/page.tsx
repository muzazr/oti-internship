import Pill from "@/components/student/pill"
import Button from "@/components/student/button"
import { DateObject, DBtoDate } from "@/lib/student"
import {
  Clock,
  ArrowRight,
  FileText,
  Paperclip,
  ArrowUpRight,
} from "lucide-react"
import Image from "next/image"

const now = new Date()

// vEdit these for backend fetching
const deadlineInDB = "2024-04-24 23:59"
const subject = "Integral dan Persamaan Diferensial"
const details = `Pilih daun yang masih segar dan utuh.

Letakkan daun di atas permukaan yang rata (kertas putih lebih baik).

Ambil foto masing-masing daun dengan jelas menggunakan kamera HP.

Pastikan serat dan tulang daun terlihat dalam foto. Untuk instruksi lebih lanjut dapat diakses melalui link gdrive berikut`
const submissionFormat = "Ditulis di kertas A4"
const attachment = "bit.ly/gauzaganteng"
// ^Edit these

const deadline = DBtoDate(deadlineInDB)

function shiftDate(from: Date, byDate: number) {
  return new Date(
    from.getFullYear(),
    from.getMonth(),
    from.getDate() + byDate,
    from.getHours(),
    from.getMinutes(),
  )
}

function convertToDateClass(dateObject: DateObject) {
  return new Date(
    parseInt(dateObject.year),
    dateObject.monthNumber,
    parseInt(dateObject.date),
    parseInt(dateObject.hour),
    parseInt(dateObject.minute),
  )
}

function compareDates(date1: Date, date2: Date) {
  return date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
    ? true
    : false
}

function deadlineToDisplay() {
  const dlDateClass = convertToDateClass(deadline)
  const yesterday = shiftDate(dlDateClass, -1)
  const tomorrow = shiftDate(dlDateClass, 1)

  let toShow = `${deadline.date} ${deadline.month} ${deadline.year}`

  if (compareDates(now, tomorrow)) toShow = "Besok"
  else if (compareDates(now, yesterday)) toShow = "Kemarin"
  else if (compareDates(now, dlDateClass)) toShow = "Hari ini"

  return `${toShow}, ${deadline.hour}:${deadline.minute}`
}

const InstruksiPengerjaan = () => {
  return (
    <>
      <section className="flex flex-col gap-3 mt-3 mb-4">
        <h2 className="font-semibold text-2xl">Detail Tugas</h2>
        <Pill
          forStatus={false}
          className="font-medium text-xs text-foreground-secondary bg-neutral-200 w-fit"
        >
          Batas: {deadlineToDisplay()} <Clock className="size-3.5" />
        </Pill>
        <h1 className="font-bold text-3xl">{subject}</h1>
        <div className="bg-primary-1200 border border-neutral-300 rounded-2xl p-4 pt-6 pl-6 flex flex-col gap-3">
          <h3 className="flex text-primary-500 gap-2 text-sm font-semibold">
            <FileText className="size-6 fill-current stroke-primary-1200" />
            Instruksi Pengerjaan
          </h3>
          <p className="relative whitespace-pre-line pl-6 text-foreground-secondary before:left-1 before:inset-y-0 before:bg-primary-500 before:w-2 before:absolute">
            {details}
          </p>
          <hr className="border-neutral-300" />
          <div className="grid grid-cols-2 mt-4">
            <p className="text-xs font-medium text-foreground-secondary">
              Format Pengumpulan
            </p>
            <p className="text-xs font-medium text-foreground-secondary text-right">
              Nilai Maksimal
            </p>
            <p className="text-sm font-semibold flex items-center gap-2">
              <Image
                src="/student/image.webp"
                alt="Image of an image"
                height="16"
                width="16"
                className="size-4"
              />
              {submissionFormat}
            </p>
            <p className="text-right font-bold text-primary-500">100</p>
          </div>
        </div>
        <h3>Lampiran Tugas</h3>
        <Button
          className="w-full bg-primary-1100 text-primary-500! flex items-center justify-between! max-w-90 md:w-7/10 mx-auto"
          link={`https://${attachment}`}
        >
          <div className="flex gap-4">
            <Paperclip className="size-12 bg-primary-1000 p-3.5" />
            <div>
              <p className="text-foreground text-sm">{attachment}</p>
              <p className="text-foreground-secondary text-xs">
                Lampiran Tugas Lebih Lanjut
              </p>
            </div>
          </div>
          <ArrowUpRight className="size-6" />
        </Button>
      </section>
      <Button link="./assignment/submit">
        Kumpulkan Sekarang <ArrowRight className="size-3.5" />
      </Button>
    </>
  )
}

export default InstruksiPengerjaan
