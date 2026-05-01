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
  className?: string
}

function handleVariants(variant: string) {
  const keysArray = Object.keys(variants)
  const valuesArray = Object.values(variants)
  for (let i = 0; i < keysArray.length; i++) {
    if (keysArray[i] == variant) return valuesArray[i]
  }
}

const Button = ({
  children,
  variant = "default",
  link = "",
  className = "",
}: Props) => {
  let classNames = `p-4 cursor-pointer rounded-2xl transition-all font-bold flex justify-center text-xs gap-2 hover:opacity-80 ${handleVariants(variant)} ${className}`
  return link === "" ? (
    <button className={classNames}>{children}</button>
  ) : (
    <Link href={link} className={classNames}>
      {children}
    </Link>
  )
}

export default Button
