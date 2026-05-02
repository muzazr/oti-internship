import React from "react"
import Image from "next/image"
import Table, { UpDown } from "@/components/student/tableThingy"
import Progress from "@/components/student/progress"
import Button from "@/components/student/button"
import { ArrowLeft, User, Info, ArrowUpRight, ArrowRight } from "lucide-react"

// vEdit these for backend fetching
const name = "Maria Taek"
const studentClass = "8A"
const subject = "Matematika"
const assignmentName = "Aljabar Dasar"
const teacherNumber = "628111111111"
// ^Edit these

const nameDisplay = (
  <>
    <User className="size-5" />
    {name}
  </>
)

const studentClassDisplay = (
  <>
    <Image
      src="/student/meeting_room.webp"
      alt="Image of opened door"
      height="60"
      width="60"
      className="size-5"
    />
    {studentClass}
  </>
)

const subjectDisplay = (
  <>
    <Image
      src="/student/calculate.webp"
      alt="A group of the four artihmetic operators"
      height="60"
      width="60"
      className="size-5"
    />
    {subject}
  </>
)

const assignmentNameDisplay = (
  <>
    <Image
      src="/student/assignment.webp"
      alt="A simple clipboard"
      height="60"
      width="60"
      className="size-5"
    />
    {assignmentName}
  </>
)

function numberToWhatsAppLink(phoneNumber: string) {
  return 7 <= phoneNumber.length && phoneNumber.length <= 15
    ? `https://wa.me/${phoneNumber}`
    : ""
}

interface Props {
  progress: number
  next?: () => void
  prev?: () => void
  stepsAmount: number
}

const Page = ({ progress, next, prev, stepsAmount }: Props) => {
  const contactLink = numberToWhatsAppLink(teacherNumber)
  return (
    <>
      <Button
        className="rounded-full w-fit!"
        link={progress === 0 ? "./" : ""}
        onClick={() => {
          if (prev !== undefined) prev()
        }}
      >
        <ArrowLeft className="size-4.5" /> Kembali
      </Button>
      <div>
        <p className="text-foreground-secondary font-bold text-xs">
          Langkah {progress + 1} dari {stepsAmount}
        </p>
        <Progress
          className="w-full mt-2 h-2 bg-neutral-300"
          progressColor="var(--primary-500)"
          value={progress + 1}
          max={stepsAmount}
        />
      </div>
      <div>
        <h1 className="font-bold text-2xl">Konfirmasi Datamu</h1>
        <p className="text-foreground-secondary">
          Pastikan data ini sudah benar sebelum melanjutkan dan mengirimkan
          tugas.
        </p>
      </div>
      <Table>
        <UpDown info="Nama Lengkap" content={nameDisplay} />
        <UpDown info="Kelas" content={studentClassDisplay} />
        <UpDown info="Mata Pelajaran" content={subjectDisplay} />
        <UpDown info="Nama Tugas" content={assignmentNameDisplay} />
      </Table>
      <div className="flex items-center gap-2 bg-primary-1100 p-2 rounded-2xl text-sm border border-primary-900">
        <Info className="size-6 shrink-0 fill-primary-500 stroke-primary-1100" />
        <p>
          Data ini otomatis terisi dari sistem. Jika ada data yang salah,
          silahkan hubungi gurumu!
        </p>
      </div>
      <div
        style={{
          gridTemplateColumns: `repeat(${contactLink !== "" ? 2 : 1}, 1fr)`,
        }}
        className="grid gap-3.5"
      >
        {contactLink !== "" && (
          <Button variant="hollow" link={contactLink}>
            Hubungi Guru <ArrowUpRight className="size-5 stroke-primary-500" />
          </Button>
        )}
        <Button
          onClick={() => {
            if (next !== undefined) next()
          }}
        >
          Lanjut <ArrowRight className="size-4" />
        </Button>
      </div>
    </>
  )
}

export default Page
