"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { imageItem } from "./preview"
import { renameFileWithIndex } from "@/app/student/assignment/submit/page"
import { Camera, Check, X, Hourglass } from "lucide-react"
import Button from "./button"

async function validateImage(imageFile: File): Promise<boolean> {
  // do whatever the AI needs I guess. For now aku kasih setTimeout aja
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = Math.random() > 0.3 // 70% true, 30% false
      resolve(result)
    }, 2000) // 2 seconds delay
  })
}

interface Props {
  setImages: React.Dispatch<React.SetStateAction<imageItem[]>>
  images: imageItem[]
  indexToEdit: number | null
  onNextClick: () => void
}

const CameraComponent = ({
  setImages,
  images,
  indexToEdit,
  onNextClick,
}: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraStatus, setCameraStatus] = useState<
    "idle" | "granted" | "denied" | "error"
  >("idle")

  const [imageIsValid, setImageIsValid] = useState<boolean | null>(null)
  const [imageComponentSource, setImageComponentSource] = useState(
    "/student/placeholder.webp",
  )

  const [validationImageStatus, setValidationImageStatus] = useState<
    "loading" | "success" | "error"
  >("loading")

  const actualIndex = indexToEdit ? indexToEdit + 1 : images.length + 1

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch((err) => {
          console.log("Play failed:", err)
        })
      }

      setCameraStatus("granted")
    } catch (err) {
      console.error(err)

      if ((err as DOMException).name === "NotAllowedError") {
        setCameraStatus("denied")
      } else {
        setCameraStatus("error")
      }
    }
  }

  useEffect(() => {
    startCamera()
  }, [])

  const stopCamera = () => {
    if (!streamRef.current) return

    setCameraStatus("idle")

    streamRef.current.getTracks().forEach((track) => {
      track.stop()
    })

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    streamRef.current = null
  }

  const takePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.drawImage(video, 0, 0)
    stopCamera()

    canvas.toBlob(async (blob) => {
      if (!blob) return

      const rawFile = new File([blob], `photo-${Date.now()}.jpg`, {
        type: "image/jpeg",
      })

      const file = renameFileWithIndex(rawFile, actualIndex)

      setImageComponentSource(URL.createObjectURL(file))
      const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1]

      setImageIsValid(await validateImage(file))

      const img: imageItem = {
        file: file,
        displayName: `Halaman_${actualIndex}.${ext}`,
        isSuccessfullyValidated: imageIsValid === true,
      }

      setImages((prev) => {
        if (indexToEdit === null) {
          return [...prev, img]
        } else {
          const updated = [...prev]
          updated[indexToEdit] = img
          return updated
        }
      })
    })
  }

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
  if (
    cameraStatus === "idle" &&
    imageIsValid === null &&
    imageComponentSource !== "/student/placeholder.webp"
  ) {
    // basically if the system is checking the image
    return (
      <div className="absolute bg-background inset-0 grid place-items-center text-center">
        <div className="md:max-w-3/5 flex flex-col gap-8 py-22.5">
          <section>
            <h1 className="text-3xl font-bold">Hang tight!</h1>
            <p className="text-foreground-secondary">
              Checking your photo for clarity...
            </p>
          </section>
          {/* The scanning thing */}
          <div className="relative">
            <Image
              src="/student/verifyImage.webp"
              alt="Image Checking"
              width="335"
              height="450"
              className=""
              onLoad={() => setValidationImageStatus("success")}
              onError={() => setValidationImageStatus("error")}
            />
            <div className="absolute inset-0 flex items-end min-h-3 animate-scan">
              <div className="bg-linear-180 from-40% from-secondary-700 to-transparent h-3 w-full"></div>
            </div>
          </div>

          <div className="border border-neutral-200 p-4 rounded-2xl center flex items-center justify-center gap-2">
            <Hourglass className="size-6 stroke-secondary-700 animate-spin" />
            <p className="text-sm font-semibold">Analyzing Legibility</p>
          </div>
        </div>
      </div>
    )
  } else
    return (
      // Actual camera thingy
      <>
        <div className="flex flex-col items-center gap-6">
          <div className="bg-primary-100 rounded-xl overflow-hidden">
            {cameraStatus === "granted" ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={imageComponentSource}
                alt="Placeholder"
                width="330"
                height="420"
              />
            )}
          </div>
          {cameraStatus !== "granted" && imageIsValid === null && (
            <p>Please allow your camera</p>
          )}

          <canvas ref={canvasRef} className="hidden" />
          <div className="*:font-semibold *:text-sm! w-full *:w-full *:p-3 *:text-center *:flex *:gap-2 *:justify-center *:items-center">
            {imageIsValid === null ? (
              <Button variant="send" onClick={takePhoto}>
                Ambil Foto Tugas{" "}
                <Camera className="stroke-secondary-600 fill-neutral-100" />
              </Button>
            ) : imageIsValid === true ? (
              <div className="bg-success-200 text-success-100">
                <Check className="size-4.5 rounded-full bg-success-100 stroke-success-200 stroke-3 p-0.5" />
                Foto Berhasil Divalidasi
              </div>
            ) : (
              <div className="bg-error-300 text-primary-100">
                <X className="size-4.5 rounded-full bg-error-100 stroke-error-300 stroke-3 p-0.5" />
                Foto Gagal Divalidasi
              </div>
            )}
          </div>
        </div>
        <div>
          <hr className="border-neutral-200 -mx-4" />
          <div className="grid grid-cols-2 gap-4 p-4 *:rounded-lg">
            {imageIsValid !== false ? (
              <>
                <Button
                  onClick={() => {
                    if (imageIsValid === null) return onNextClick()
                    removeImage(images.length - 1)
                    onNextClick()
                  }}
                  variant="hollow"
                >
                  Batal
                </Button>
                <Button
                  disabled={imageIsValid === null}
                  onClick={() => onNextClick()}
                >
                  Simpan Foto
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="hollow"
                  onClick={() => {
                    removeImage(images.length - 1)
                    setImageIsValid(null)
                    setCameraStatus("granted")
                    startCamera()
                  }}
                >
                  Foto Ulang
                </Button>
                <Button variant="error" onClick={() => onNextClick()}>
                  Tetap Simpan
                </Button>
              </>
            )}
          </div>
        </div>
      </>
    )
}

export default CameraComponent
