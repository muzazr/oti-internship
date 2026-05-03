"use client"

import React from "react"
import { Trash, X, RotateCw, ArrowUpFromLine } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import Button from "./button"

function formatSize(fileSize: number) {
  if (fileSize < 500) return `${fileSize.toFixed(1)} B`
  if (fileSize < 500_000) return `${(fileSize / 1000).toFixed(1)} KB`
  if (fileSize < 500_000_000) return `${(fileSize / 1000_000).toFixed(1)} MB`
}

export interface imageItem {
  file: File
  displayName: string
  isSuccessfullyValidated: boolean
}

interface Props {
  imageItem: imageItem
  onRetakeClick: () => void
  onDeleteClick: () => void
}

const Preview = ({ imageItem, onRetakeClick, onDeleteClick }: Props) => {
  const isACTUALLYValid = imageItem.isSuccessfullyValidated
  const [isValidFromUser, setIsValidFromUser] = useState(isACTUALLYValid)
  const fileSize = formatSize(imageItem.file.size)

  let rootClassNames =
    "p-4 gap-3 flex flex-col items-center rounded-xl border *:w-full "
  let source, contentText, deleteIcon

  if (isACTUALLYValid || isValidFromUser) {
    source = URL.createObjectURL(imageItem.file)
    contentText = `${fileSize} • Selesai`
    deleteIcon = <Trash className="stroke-neutral-700 fill-neutral-700" />
    rootClassNames += "bg-neutral-100 border-neutral-200"
  } else {
    source = "/student/brokenImage.webp"
    contentText = "Foto tidak tervalidasi."
    deleteIcon = <X className="stroke-error-200" />
    rootClassNames += "bg-error-400 border-error-300 text-error-200"
  }

  return (
    <div className={rootClassNames}>
      <div className="flex justify-between">
        <div className="flex items-center gap-4">
          <Image
            className={`${isACTUALLYValid || isValidFromUser ? "rounded-lg border border-black" : "bg-error-300 p-5"}`}
            src={source}
            alt="The image you took"
            height="64"
            width="64"
          />
          <div>
            <p className="font-semibold">{imageItem.displayName}</p>
            <p
              className={`whitespace-pre text-sm ${isACTUALLYValid ? "text-foreground-secondary" : ""}`}
            >
              {contentText}
            </p>
          </div>
        </div>
        <Button
          variant="hollow"
          className="border-0"
          onClick={() => onDeleteClick()}
        >
          {deleteIcon}
        </Button>
      </div>
      {isACTUALLYValid || isValidFromUser || (
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="hollow"
            onClick={() => onRetakeClick()}
            className="border-error-200! text-error-200! bg-neutral-100"
          >
            Foto Ulang
            <RotateCw className="size-4.5 stroke-2" />
          </Button>
          <Button
            variant="error"
            onClick={() => {
              setIsValidFromUser((valid) => !valid)
            }}
          >
            Tetap Simpan <ArrowUpFromLine className="size-4.5 stroke-3" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default Preview
