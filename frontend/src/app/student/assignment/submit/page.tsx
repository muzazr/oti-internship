"use client"

// Weird thing for dev-ing
let hasRun = false

import React from "react"
import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"

import { Step1, Step2, Step3 } from "@/modules/student/steps"
// For step 1, step 2, and the other pages, just ctrl+click the "@/modules/student/steps". Everything is there

import Progress from "@/components/student/progress"
import Button from "@/components/student/button"
import { imageItem } from "@/components/student/preview"

// vEdit these for backend fetching
const studentClass = "8A"
const studentName = "Maria Taek"
// ^Edit these

const numberOfSteps = 3

export function renameFileWithIndex(file: File, index: number) {
  const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1]

  return new File(
    [file],
    `${studentClass}_${studentName}_Halaman_${index + 1}.${ext}`,
    { type: file.type },
  )
}

const SubmissionPage = () => {
  const [images, setImages] = useState<imageItem[]>([])

  const [indexToEdit, setIndexToEdit] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)

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

      for (let i = 0; i < 4; i++) {
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
    <div className="flex gap-4 flex-col items-start *:w-full">
      {progress !== 2 && (
        <Button
          className="rounded-full w-fit!"
          link={progress === 0 ? "./" : ""}
          onClick={() => {
            if (progress > 0) setProgress(progress - 1)
          }}
        >
          <ArrowLeft className="size-4.5" /> Kembali
        </Button>
      )}
      <div>
        <p className="text-foreground-secondary font-bold text-xs">
          Langkah {progress + 1} dari {numberOfSteps}
        </p>
        <Progress
          className="w-full mt-2 h-2 bg-neutral-300"
          progressColor="var(--primary-500)"
          value={progress + 1}
          max={numberOfSteps}
        />
      </div>
      {progress === 0 && (
        <Step1 onNextClick={() => setProgress(progress + 1)} />
      )}
      {progress === 1 && (
        <Step2
          onNextClick={() => setProgress(progress + 1)}
          images={images}
          setImages={setImages}
          setIndexToEdit={setIndexToEdit}
        />
      )}
      {progress === 2 && (
        <Step3
          setImages={setImages}
          images={images}
          indexToEdit={indexToEdit}
          onNextClick={() => setProgress(progress - 1)}
        />
      )}
    </div>
  )
}

export default SubmissionPage
