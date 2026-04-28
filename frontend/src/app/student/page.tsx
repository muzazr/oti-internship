import Image from "next/image"
import Table, { LeftRight } from "@/components/student/tableThingy"
import Pill from "@/components/student/pill"
import Button from "@/components/student/button"
import { ArrowRight, Lock } from "lucide-react"

// vEdit these for backend fetching
const name = "Maria"
const assignmentName = "Aljabar Dasar"
const studentClass = "8A"
const deadline = {
  date: "24",
  month: "April",
  year: "2024",
}
const completed = false
// ^Edit these

const LandingPageSiswa = () => {
  return (
    <main className="flex justify-center">
      <div className="*:not-[header]:rounded-2xl p-4 flex flex-col gap-8 md:max-w-3/5">
        <Image
          className="w-full aspect-2/1 object-cover self-center md:max-w-3xl"
          src="/student/studentLanding.webp"
          alt="Somoene writing"
          width="720"
          height="360"
        />
        <div>
          <h1 className="font-bold text-2xl">Hai, {name}!👋</h1>
          <p className="text-foreground-secondary">
            Kamu dapat mengumpulkan tugas kamu disini! Jangan lupa untuk membaca
            instruksi tugas terlebih dahulu yaa
          </p>
        </div>
        <Table>
          <LeftRight info="Nama Tugas" content={assignmentName} />
          <LeftRight info="Kelas" content={studentClass} />
          <LeftRight
            info="Deadline"
            content={`${deadline.date} ${deadline.month} ${deadline.year}`}
          />
          <LeftRight info="Status" content={<Pill finished={completed} />} />
        </Table>
        <Button variant="default" link="./student/assignment">
          Kerjakan Sekarang <ArrowRight className="size-4.5" />
        </Button>
        <p className="flex justify-center items-center gap-2 text-sm">
          Laman belajar ini hanya untukmu <Lock className="size-4.5" />
        </p>
      </div>
    </main>
  )
}

export default LandingPageSiswa
