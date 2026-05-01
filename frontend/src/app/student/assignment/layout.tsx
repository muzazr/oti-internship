import React, { ReactNode } from "react"

const Layout = ({ children }: { children: ReactNode }) => {
  return <div className="w-full md:w-3/5">{children}</div>
}

export default Layout
