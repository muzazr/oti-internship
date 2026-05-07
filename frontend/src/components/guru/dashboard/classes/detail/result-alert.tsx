"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface ResultAlertProps {
  variant: "success" | "error";
  title: string;
  description: string;
  buttonText?: string;
  onClose: () => void;
}

export function ResultAlert({
  variant,
  title,
  description,
  buttonText = "Kembali",
  onClose,
}: ResultAlertProps) {
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
      <div className="w-[480px] bg-white border border-[#F0F5F9] rounded-xl p-8 flex flex-col items-center gap-8">
        {/* Icon Circle */}
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isSuccess ? "bg-[#D1FAE5]" : "bg-[#FFDAD6]"
          }`}
        >
          {isSuccess ? (
            <CheckCircle className="w-12 h-12 text-[#10B981]" />
          ) : (
            <XCircle className="w-12 h-12 text-[#93000A]" />
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-[#191B23] text-center">
          {title}
        </h2>

        {/* Description */}
        <p className="text-sm text-[#475569] text-center leading-relaxed">
          {description}
        </p>

        {/* Button */}
        <button
          onClick={onClose}
          className="w-[253px] h-[50px] bg-[#0055D4] rounded-xl text-base text-white hover:bg-[#0048B8] transition-colors cursor-pointer"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
