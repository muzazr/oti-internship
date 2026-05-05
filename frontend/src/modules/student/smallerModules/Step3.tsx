import CameraComponent from "@/components/student/cameraComponent"
import { imageItem } from "@/components/student/preview"

// vEdit these for backend fetching
const subject = "Integral dan Persamaan Diferensial"
const assignmentName = "Latihan Soal Integral"
// ^Edit these

interface Props {
  setImages: React.Dispatch<React.SetStateAction<imageItem[]>>
  images: imageItem[]
  indexToEdit: number | null
  onNextClick: () => void
}

const Step3 = ({ setImages, images, indexToEdit, onNextClick }: Props) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="border border-neutral-200 rounded-xl p-4 bg-neutral-100 font-bold">
        <h2 className="text-sm text-primary-500">{subject}</h2>
        <h1 className="text-lg">{assignmentName}</h1>
        <p className="text-foreground-secondary font-normal">
          Foto kertas jawabanmu dengan jelas ya!
        </p>
      </div>
      <CameraComponent
        setImages={setImages}
        images={images}
        indexToEdit={indexToEdit}
        onNextClick={onNextClick}
      />
    </div>
  )
}

export default Step3
