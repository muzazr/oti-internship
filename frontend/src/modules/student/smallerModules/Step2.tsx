import React from "react"
import Progress from "@/components/student/progress"
import Button from "@/components/student/button"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface Props {
  progress: number
  next?: () => void
  prev?: () => void
  stepsAmount: number
}

const Step2 = ({ progress, next, prev, stepsAmount }: Props) => {
  return (
    <>
      <Button
        className="rounded-full"
        link={progress === 0 ? "./" : ""}
        onClick={() => {
          if (prev !== undefined) prev()
        }}
      >
        <ArrowLeft className="size-4.5" /> Kembali
      </Button>

      <div className="w-full">
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
      <div className="grid w-full gap-3.5">
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

export default Step2
