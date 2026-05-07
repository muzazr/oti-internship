"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, FileText, Paperclip, Loader2, X } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface AssignmentData {
  student_name: string;
  assignment_title: string;
  assignment_description: string | null;
  assignment_attachment_url: string | null;
  assignment_subject: string | null;
  deadline: string | null;
  class_name: string | null;
}

export default function DetailPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [data, setData] = useState<AssignmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${API_BASE}/upload-links/${token}`);
        if (!res.ok) {
          setError("expired");
          return;
        }
        const result = await res.json();
        setData(result.data);
      } catch {
        setError("network");
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchData();
  }, [token]);

  if (loading) {
    return (
      <main className="flex justify-center items-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#004AC6]" />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex justify-center px-4 sm:px-6 py-8 sm:py-14">
        <div className="w-full max-w-[383px] sm:max-w-[500px] lg:max-w-[600px] flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[#FFDAD6] flex items-center justify-center">
            <X className="w-8 h-8 text-[#93000A]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#191B23] mb-2">Link Tidak Valid</h1>
            <p className="text-[#434655] text-sm">
              Link sudah expired atau tidak valid. Ketik 1 di WA bot untuk mendapatkan link baru.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const deadline = data.deadline
    ? new Date(data.deadline).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Tidak ada deadline";

  const hasDescription = data.assignment_description && data.assignment_description.trim().length > 0;
  const hasAttachment = data.assignment_attachment_url && data.assignment_attachment_url.trim().length > 0;
  const hasContent = hasDescription || hasAttachment;

  return (
    <main className="flex justify-center px-4 sm:px-6 py-6 sm:py-10 lg:py-14">
      <div className="w-full max-w-[383px] sm:max-w-[500px] lg:max-w-[600px] flex flex-col gap-5 sm:gap-6">
        {/* Back button */}
        <button
          onClick={() => router.push(`/upload/${token}`)}
          className="flex items-center gap-2 text-sm text-[#434655] font-medium w-fit hover:text-[#191B23] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>

        {/* Title + Deadline */}
        <div className="flex flex-col gap-2">
          <h1 className="font-bold text-[24px] sm:text-[28px] lg:text-[32px] leading-tight text-[#191B23]">
            {data.assignment_title}
          </h1>
          <div className="flex items-center gap-2 text-[14px] sm:text-[15px] text-[#737686]">
            <Clock className="w-4 h-4" />
            <span>Deadline: {deadline}</span>
          </div>
          {data.assignment_subject && (
            <div className="flex items-center gap-2 text-[14px] sm:text-[15px] text-[#737686]">
              <FileText className="w-4 h-4" />
              <span>Mapel: {data.assignment_subject}</span>
            </div>
          )}
        </div>

        {/* Detail Tugas */}
        {hasDescription && (
          <div className="flex flex-col gap-2">
            <h2 className="text-[14px] sm:text-[15px] font-bold text-[#191B23]">Detail Tugas</h2>
            <div className="border-l-4 border-[#004AC6] bg-[#F0F4FF] rounded-r-xl px-4 sm:px-5 py-4 sm:py-5">
              <p className="text-[14px] sm:text-[15px] text-[#434655] leading-relaxed whitespace-pre-wrap">
                {data.assignment_description}
              </p>
            </div>
          </div>
        )}

        {/* Lampiran Tugas */}
        {hasAttachment && (
          <div className="flex flex-col gap-2">
            <h2 className="text-[14px] sm:text-[15px] font-bold text-[#191B23] flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Lampiran Tugas
            </h2>
            <a
              href={data.assignment_attachment_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white border border-[#E8E8F0] rounded-xl px-4 py-3 sm:py-4 hover:bg-[#F9FAFB] hover:border-[#004AC6] transition-colors group"
            >
              <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-[#004AC6]" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="text-[13px] sm:text-[14px] text-[#004AC6] font-medium underline underline-offset-2 truncate block group-hover:text-[#003A9E]">
                  {data.assignment_attachment_url}
                </span>
                <span className="text-[11px] sm:text-[12px] text-[#737686]">Klik untuk membuka lampiran</span>
              </span>
            </a>
          </div>
        )}

        {/* No content message */}
        {!hasContent && (
          <div className="bg-[#F9FAFB] border border-[#E8E8F0] rounded-xl px-4 py-6 text-center">
            <p className="text-[14px] text-[#737686]">
              Tidak ada detail tugas dari guru. Silakan langsung kumpulkan tugas.
            </p>
          </div>
        )}

        {/* Button Lanjut */}
        <Link
          href={`/upload/${token}/confirm`}
          className="flex items-center justify-center gap-2 w-full h-12 sm:h-14 bg-[#004AC6] text-white font-bold text-[12px] sm:text-sm rounded-xl hover:bg-[#003A9E] transition-colors shadow-md mt-2"
        >
          Lanjut
          <ArrowRight className="w-4.5 h-4.5" />
        </Link>
      </div>
    </main>
  );
}
