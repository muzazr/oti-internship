import "@/app/globals.css"
import Header from "@/components/student/header"
import { QueryProvider } from "@/components/providers/query-provider"

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Header />
        <main className="flex justify-center p-4 relative">
          <QueryProvider>{children}</QueryProvider>
        </main>
      </body>
    </html>
  )
}
