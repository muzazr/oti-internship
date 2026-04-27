import React from "react"
import Link from "next/link"

const variants = {
  default: "bg-primary-500 text-primary-1200",
  hollow: "",
  send: "",
  error: "",
}

interface Props {
  children: React.ReactNode
  variant?: "default" | "hollow" | "send" | "error"
  link?: string
}

function handleVariants(variant: string) {
  const keysArray = Object.keys(variants)
  const valuesArray = Object.values(variants)
  for (let i = 0; i < keysArray.length; i++) {
    if (keysArray[i] == variant) return valuesArray[i]
  }
}

const Button = ({ children, variant = "default", link = "" }: Props) => {
  return link === "" ? (
    <button
      className={`p-4 font-bold flex justify-center text-xs gap-2 ${handleVariants(variant)}`}
    >
      {children}
    </button>
  ) : (
    <Link
      href={link}
      className={`p-4 flex justify-center text-xs gap-2 ${handleVariants(variant)}`}
    >
      {children}
    </Link>
  )
}

export default Button
