"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lock, X, Check, Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface UploadLinkData {
  student_name: string;
  student_code: string;
  class_name: string | null;
  assignment_title: string;
  assignment_description: string | null;
  assignment_instruction: string | null;
  assignment_attachment_url: string | null;
  assignment_subject: string | null;
  deadline: string | null;
  accepts_file: boolean;
  accepts_link: boolean;
  max_files: number;
  max_file_size_mb: number;
  allow_late_submission: boolean;
  already_used: boolean;
  submission: {
    id: string;
    status: string;
    score: number | null;
    feedback: string | null;
    submitted_at: string | null;
  } | null;
}

export default function UploadPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<UploadLinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${API_BASE}/upload-links/${token}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          if (res.status === 410 || res.status === 404) {
            setError("expired");
          } else {
            setError("invalid");
          }
          return;
        }
        const result = await res.json();
        setData(result.data);

        // Mark as accessed
        fetch(`${API_BASE}/upload-links/${token}/access`, { method: "POST" }).catch(() => {});
      } catch {
        setError("network");
      } finally {
        setLoading(false);
      }
    }

    if (token) fetchData();
  }, [token]);

  // Loading state
  if (loading) {
    return (
      <main className="flex justify-center items-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#004AC6]" />
      </main>
    );
  }

  // Error states
  if (error || !data) {
    return (
      <main className="flex justify-center px-4 sm:px-6 py-8 sm:py-14">
        <div className="w-full max-w-[383px] sm:max-w-[500px] lg:max-w-[600px] flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FFDAD6] flex items-center justify-center">
            <X className="w-8 h-8 sm:w-10 sm:h-10 text-[#93000A]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#191B23] mb-2">
              {error === "expired"
                ? "Link Sudah Expired"
                : error === "network"
                ? "Gagal Memuat"
                : "Link Tidak Valid"}
            </h1>
            <p className="text-[#434655] text-sm sm:text-base">
              {error === "expired"
                ? "Link ini sudah melewati batas waktu 30 menit. Ketik 1 di WA bot untuk mendapatkan link baru."
                : error === "network"
                ? "Gagal memuat data. Coba refresh halaman."
                : "Link tidak valid. Hubungi guru atau ketik 1 di WA bot untuk link baru."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const isSubmitted = data.submission?.status === "submitted" || data.submission?.status === "graded";
  const studentName = data.student_name;
  const assignmentTitle = data.assignment_title;
  const className = data.class_name || "-";
  const deadline = data.deadline
    ? new Date(data.deadline).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Tidak ada deadline";

  return (
    <main className="flex justify-center px-4 sm:px-6 py-6 sm:py-10 lg:py-14">
      <div className="w-full max-w-[383px] sm:max-w-[500px] lg:max-w-[600px] flex flex-col gap-6 sm:gap-8">
        {/* Hero Image */}
        <div className="w-full aspect-[2/1] sm:aspect-[5/2] bg-[#B4C5FF] rounded-xl sm:rounded-2xl overflow-hidden relative">
          <Image
            src="/student/studentLanding.webp"
            alt="Student"
            fill
            className="object-cover"
          />
        </div>

        {/* Greeting */}
        <div className="flex flex-col gap-1 sm:gap-2">
          <h1 className="font-bold text-[30px] sm:text-[34px] lg:text-[38px] leading-tight text-[#191B23]">
            Hai, {studentName}! 👋
          </h1>
          <p className="text-[16px] sm:text-[17px] lg:text-[18px] text-[#434655] leading-snug">
            {isSubmitted
              ? "Terimakasih sudah mengumpulkan tugas ini! Tetap semangat dan selamat belajar!"
              : "Kamu dapat mengumpulkan tugas kamu disini! Jangan lupa untuk membaca instruksi tugas terlebih dahulu yaa"}
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E8E8F0] divide-y divide-[#E8E8F0] shadow-sm">
          {/* Nama Tugas */}
          <div className="flex justify-between items-center px-5 py-3 sm:py-4">
            <span className="text-[14px] sm:text-[15px] text-[#737686] font-medium">Nama Tugas</span>
            <span className="text-[16px] sm:text-[17px] text-[#191B23] font-medium text-right max-w-[60%]">{assignmentTitle}</span>
          </div>
          {/* Kelas */}
          <div className="flex justify-between items-center px-5 py-3 sm:py-4">
            <span className="text-[14px] sm:text-[15px] text-[#737686] font-medium">Kelas</span>
            <span className="text-[16px] sm:text-[17px] text-[#191B23] font-medium">{className}</span>
          </div>
          {/* Deadline */}
          <div className="flex justify-between items-center px-5 py-3 sm:py-4">
            <span className="text-[14px] sm:text-[15px] text-[#737686] font-medium">Deadline</span>
            <span className="text-[16px] sm:text-[17px] text-[#191B23] font-medium">{deadline}</span>
          </div>
          {/* Status */}
          <div className="flex justify-between items-center px-5 py-3 sm:py-4">
            <span className="text-[14px] sm:text-[15px] text-[#737686] font-medium">Status</span>
            {isSubmitted ? (
              <span className="flex items-center gap-1.5 bg-[#D6FFD6] text-[#000000] text-[12px] sm:text-[13px] font-bold py-1.5 px-3 rounded-full">
                ✅ Sudah Dikumpulkan
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-[#FFDAD6] text-[#93000A] text-[12px] sm:text-[13px] font-bold py-1.5 px-3 rounded-full">
                <span className="w-3.5 h-3.5 bg-[#93000A] rounded-full flex items-center justify-center">
                  <X className="w-2.5 h-2.5 text-[#FFDAD6]" />
                </span>
                Belum Dikumpulkan
              </span>
            )}
          </div>
        </div>

        {/* Button - only show if not submitted */}
        {!isSubmitted && (
          <Link
            href={`/upload/${token}/detail`}
            className="flex items-center justify-center gap-2 w-full h-12 sm:h-14 bg-[#004AC6] text-white font-bold text-[12px] sm:text-sm rounded-xl hover:bg-[#003A9E] transition-colors shadow-md"
          >
            Kerjakan Sekarang
            <ArrowRight className="w-4.5 h-4.5" />
          </Link>
        )}

        {/* Footer */}
        <p className="flex justify-center items-center gap-2 text-[14px] sm:text-[15px] text-[#737686] font-medium">
          Laman belajar ini hanya untukmu
          <Lock className="w-4 h-4" />
        </p>
      </div>
    </main>
  );
}
