import "@/app/globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { UploadHeader } from "@/components/student/upload-header";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

export default function UploadLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={plusJakarta.variable}>
      <body className={`${plusJakarta.className} bg-[#FAFAFE] min-h-screen`}>
        <UploadHeader />
        {children}
      </body>
    </html>
  );
}
