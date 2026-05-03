"use client";

import { useEffect } from "react";

interface GradeResultAlertProps {
  variant: "success" | "error";
  onClose: () => void;
}

export function GradeResultAlert({ variant, onClose }: GradeResultAlertProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isSuccess = variant === "success";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex w-[480px] flex-col items-center gap-8 rounded-xl border border-[#F1F5F9] bg-white p-8">
        {/* Icon Circle */}
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-full ${
            isSuccess ? "bg-[#D1FAE5]" : "bg-[#FFDAD6]"
          }`}
        >
          <span
            className={`material-icons text-[48px] ${
              isSuccess ? "text-[#10B981]" : "text-[#93000A]"
            }`}
          >
            {isSuccess ? "check_circle" : "cancel"}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-center text-2xl font-bold text-[#191B23]">
          {isSuccess ? "Nilai berhasil dikirimkan" : "Nilai Gagal DIkirimkan"}
        </h2>

        {/* Description */}
        <p className="text-center text-sm text-[#475569]">
          {isSuccess
            ? "Bot WA berhasil mengirimkan nilai kepada siswa"
            : "Coba lagi. Periksa koneksi anda."}
        </p>

        {/* Button */}
        <button
          onClick={onClose}
          className="h-[50px] w-[253px] rounded-xl bg-[#0055D4] text-base text-white transition-colors hover:bg-[#0048B8]"
        >
          Kembali Ke Dashboard
        </button>
      </div>
    </div>
  );
}
