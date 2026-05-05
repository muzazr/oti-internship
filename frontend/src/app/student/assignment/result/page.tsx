"use client"

import { Check, BadgeCheck, CloudOff, RotateCw } from "lucide-react"
import Image from "next/image"
import Table, { LeftRight } from "@/components/student/tableThingy"
import Button from "@/components/student/button"

const succeededToSendToDataBase = false
const now = new Date() // Ganti dengan waktu saat semuanya berhasil diupload ke database

// vEdit these for backend fetching
const teacherName = "Pak Yosef"
const assignmentName = "Aljabar Dasar"
const whatsAppBotLink = "smth"
// ^Edit these

function submitEverything() {
  // Also this. This thing is for uploading the images and everything. Please help
}

const formatIndoTime = (date: Date, zone: "WIB" | "WITA" | "WIT") => {
  const map = {
    WIB: "Asia/Jakarta",
    WITA: "Asia/Makassar",
    WIT: "Asia/Jayapura",
  }

  const time = new Intl.DateTimeFormat("id-ID", {
    timeZone: map[zone],
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)

  const fixedTime = time.replace(".", ":")

  return `${fixedTime} ${zone}`
}

const SpecialInfo = ({ text }: { text: string }) => {
  return <span className="text-foreground-secondary">{text}</span>
}

const SubmissionResult = () => {
  return (
    <div className="absolute inset-0 z-1 bg-background grid place-items-center px-3.5">
      <div className="flex flex-col items-center gap-10 md:max-w-3/5">
        {succeededToSendToDataBase ? (
          <>
            <div className="before:bg-success-100/50 before:block before:rounded-full before:absolute before:-z-1 before:size-14 before:animate-expand">
              <Check className="size-14 bg-success-100 rounded-full stroke-success-200" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold">
                Tugas Berhasil Dikumpulkan!🎉
              </h1>
              <p className="text-foreground-secondary">
                {teacherName} sudah menerima tugasmu. Konfirmasi akan dikirim ke
                WhatsApp mu.
              </p>
            </div>
            <Table>
              <LeftRight
                info={<SpecialInfo text="Tugas" />}
                content={assignmentName}
              />
              <LeftRight
                info={<SpecialInfo text="Dikumpulan" />}
                content={formatIndoTime(now, "WIB")}
              />
              <LeftRight
                info={<SpecialInfo text="Status" />}
                content={
                  <span className="flex items-center gap-1 text-success-100">
                    <BadgeCheck className="size-4.5 stroke-background fill-success-100" />
                    Diterima
                  </span>
                }
              />
            </Table>
            <Button
              variant="hollow"
              className="text-primary-500 w-full"
              link={whatsAppBotLink}
            >
              Kembali ke Whatsapp
            </Button>
          </>
        ) : (
          <>
            <CloudOff className="size-20 stroke-error-200" />
            <div className="text-center">
              <h1 className="text-2xl font-bold">Gagal Mengunggah ❌</h1>
              <p className="text-foreground-secondary">
                Gagal mengirimkan tugas. Mohon periksa kembali koneksi Anda.
                Silakan coba lagi.
              </p>
            </div>
            <div className="w-4/5 *:w-full flex flex-col gap-2">
              <Button
                className="font-normal"
                onClick={() => submitEverything()}
              >
                Coba Lagi <RotateCw className="size-4" />
              </Button>
              <Button
                variant="hollow"
                className="text-foreground-secondary! font-normal"
                link="https://wa.me/62895397306279"
              >
                Bantuan
                <Image
                  src="/student/supportAgent.webp"
                  alt="Icon for Customer Support"
                  height="16"
                  width="16"
                />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SubmissionResult
