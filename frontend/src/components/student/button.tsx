import React from "react"
import Link from "next/link"

const variants = {
  default: "bg-primary-500 text-primary-1200",
  hollow: "border border-primary-600 bg-primary-1200 text-primary-100",
  send: "",
  error: "",
}

interface Props {
  children: React.ReactNode
  variant?: "default" | "hollow" | "send" | "error"
  link?: string
  className?: string
  onClick?: () => void
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
  onClick = () => {},
}: Props) => {
  let classNames = `p-4 cursor-pointer rounded-2xl transition-all font-bold flex justify-center items-center text-xs gap-2 hover:opacity-80 ${handleVariants(variant)} ${className}`
  return link === "" ? (
    <button className={classNames} onClick={() => onClick()}>
      {children}
    </button>
  ) : (
    <Link href={link} className={classNames}>
      {children}
    </Link>
  )
}

export default Button
