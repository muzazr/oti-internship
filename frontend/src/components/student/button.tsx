import React from "react"
import Link from "next/link"

const variants = {
  default: "bg-primary-500 text-primary-1200",
  hollow:
    "border border-primary-600 bg-primary-1200 text-primary-100 hover:opacity-60!",
  send: "bg-secondary-600 text-neutral-100",
  error: "bg-error-200! text-neutral-100",
}

interface Props {
  children: React.ReactNode
  variant?: "default" | "hollow" | "send" | "error"
  link?: string
  className?: string
  onClick?: () => void
  disabled?: boolean
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
  disabled = false,
}: Props) => {
  let classNames = `p-4 not-[:disabled]:cursor-pointer rounded-2xl transition-all font-bold flex justify-center items-center text-xs gap-2 hover:not-[:disabled]:opacity-80 disabled:opacity-60 ${handleVariants(variant)} ${className}`
  return link === "" ? (
    <button
      className={classNames}
      onClick={() => onClick()}
      disabled={disabled}
    >
      {children}
    </button>
  ) : (
    <Link href={link} className={classNames}>
      {children}
    </Link>
  )
}

export default Button
