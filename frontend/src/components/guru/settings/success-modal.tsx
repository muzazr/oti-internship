"use client";

import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
}

export function SuccessModal({ isOpen, title, onClose }: SuccessModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleBackToDashboard = () => {
    onClose();
    router.push("/guru/dashboard");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-[416px] rounded-xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center text-center gap-5">
          {/* Green Check Circle */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D1FAE5]">
            <CheckCircle className="h-12 w-12 text-[#10B981]" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-[#191B23] leading-tight">
            {title}
          </h2>

          {/* Button */}
          <button
            onClick={handleBackToDashboard}
            className="w-full max-w-[240px] h-[48px] rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-base font-medium transition-colors"
          >
            Kembali Ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
