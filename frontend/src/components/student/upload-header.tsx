"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { NotificationBell } from "./notification-bell";
import { WifiChecker } from "./wifi-checker";

export function UploadHeader() {
  const params = useParams();
  const token = params.token as string;

  return (
    <header className="flex border-b border-[#E8E8F0] px-4 sm:px-8 py-3 sm:py-4 justify-between items-center bg-white">
      <h2 className="flex gap-1.5 font-extrabold text-[#004AC6] text-xl sm:text-2xl items-center">
        <Image
          src="/student/icon.webp"
          alt="Logo"
          width="120"
          height="100"
          className="w-7 sm:w-8 aspect-6/5"
        />
        MitBridge
      </h2>
      <div className="flex items-center gap-2">
        <WifiChecker />
        <NotificationBell token={token} />
      </div>
    </header>
  );
}
