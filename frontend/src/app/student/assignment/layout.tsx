import Button from "@/components/student/button"
import { ArrowLeft } from "lucide-react"
import React, { ReactNode } from "react"

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="w-full md:w-3/5">
      <Button className="py-2 w-fit font-medium" link="./">
        <ArrowLeft className="size-4.5" /> Kembali
      </Button>
      {children}
    </div>
  )
}

export default Layout
