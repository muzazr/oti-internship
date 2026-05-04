// Weird thing for dev-ing
let hasRun = false

import React from "react"
import Button from "@/components/student/button"
import { Camera, SendHorizonal } from "lucide-react"
import { useState, useEffect } from "react"

import Preview, { imageItem } from "@/components/student/preview"

// vEdit these for backend fetching
const studentClass = "8A"
const name = "Maria Taek"
const maxFiles = 5
// ^Edit these

// What needs to be POSTed is the images array in the useState.
// Just ctrl + f "Step2" and go to the second instance, you should see the const "images" on the line below it.
// Oh yeah. I'm also using imageItem. Just POST the "file" property

function renameFileWithIndex(file: File, index: number) {
  const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1]

  return new File(
    [file],
    `${studentClass}_${name}_Halaman_${index + 1}.${ext}`,
    { type: file.type },
  )
}

interface Props {
  onClick: () => void
}

const Step2 = ({ onClick }: Props) => {
  const [images, setImages] = useState<imageItem[]>([])

  const removeImage = (index: number) => {
    setImages((prev) => {
      const filtered = prev.filter((_, i) => i !== index)
      return filtered.map((img, index) => {
        const ext =
          img.file.type === "image/jpeg" ? "jpg" : img.file.type.split("/")[1]
        return { ...img, displayName: `Halaman_${index + 1}.${ext}` }
      })
    })
  }

  // Once developing is complete. Remove these lines
  useEffect(() => {
    if (hasRun) return
    hasRun = true
    const loadMockImage = async () => {
      const res = await fetch("/student/studentLanding.webp")
      const blob = await res.blob()

      const rawFile = new File([blob], "studentLanding.webp", {
        type: blob.type,
      })

      for (let i = 0; i < 5; i++) {
        const file = renameFileWithIndex(rawFile, i)
        setImages((prev) => [
          ...prev,
          {
            file: file,
            displayName: `Halaman_${i + 1}.jpg`,
            isSuccessfullyValidated: i == 1 || i == 2 ? false : true,
          },
        ])
      }
    }

    loadMockImage()
  }, [])
  // Yes. Remove all of them

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold">Upload Foto Tugasmu</h1>
        <p className="text-foreground-secondary">
          Bisa lebih dari 1 foto. Pastikan foto jelas dan tidak buram.
        </p>
      </div>
      <Button
        className="bg-primary-1100! border-2 border-primary-1000 grid justify-items-center"
        disabled={images.length === 5}
        onClick={() => onClick()}
      >
        <Camera className="size-16 p-4 rounded-full bg-primary-600 overflow-visible stroke-primary-600 fill-neutral-100" />
        <p className="text-primary-500 text-lg font-bold">
          Ketuk untuk foto tugas
        </p>
        <p className="text-foreground-secondary text-sm font-medium">
          Maks. {maxFiles} gambar
        </p>
      </Button>
      <div className="grid gap-2.5 mx-auto md:w-7/10">
        <h2 className="text-2xl font-bold">Preview Foto Tugas</h2>
        {images.map((img, i) => (
          <Preview
            key={i}
            imageItem={img}
            onRetakeClick={() => onClick()}
            onDeleteClick={() => removeImage(i)}
          />
        ))}
        <div
          className={`grid w-full gap-3.5 ${images.length === 5 ? "grid-col1" : "grid-cols-2"}`}
        >
          {images.length !== 5 && (
            <Button
              variant="hollow"
              onClick={() => onClick()}
              className="text-foreground-secondary! border-neutral-300!"
            >
              Tambah Foto
            </Button>
          )}
          <Button variant="send" disabled={images.length === 0} link="./result">
            Submit Tugas{" "}
            <SendHorizonal className="size-4.5 fill-current stroke-secondary-600/60" />
          </Button>
        </div>
      </div>
    </>
  )
}

export default Step2
