import React from "react"
import Progress from "@/components/student/progress"
import Button from "@/components/student/button"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface Props {
  onClick: () => void
}

const Step2 = ({ onClick }: Props) => {
  return (
    <>
      <div className="grid w-full gap-3.5">
        <Button onClick={() => onClick()}>
          Lanjut <ArrowRight className="size-4" />
        </Button>
      </div>
    </>
  )
}

export default Step2
