import React from "react"
import Image from "next/image"
import { Bell } from "lucide-react"

const Header = () => {
  return (
    <header className="flex border-b border-primary-1000 p-4 justify-between">
      <h2 className="flex gap-1.5 font-extrabold text-primary-500 text-2xl/0 items-center">
        <Image
          src="/student/icon.webp"
          alt="Logo"
          width="120"
          height="100"
          className="w-7.5 aspect-6/5"
        />
        MitBridge
      </h2>
      <Bell width="24" height="24" />
    </header>
  )
}

export default Header
