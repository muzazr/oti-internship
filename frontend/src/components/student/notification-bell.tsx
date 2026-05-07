"use client";

import { useEffect, useState } from "react";
import { Bell, Clock, BookOpen } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface PendingAssignment {
  id: string;
  title: string;
  subject: string | null;
  deadline: string | null;
}

interface NotificationBellProps {
  token: string;
}

export function NotificationBell({ token }: NotificationBellProps) {
  const [pending, setPending] = useState<PendingAssignment[]>([]);
  const [count, setCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPending() {
      try {
        const res = await fetch(`${API_BASE}/upload-links/${token}/pending`);
        if (res.ok) {
          const result = await res.json();
          setPending(result.data.assignments);
          setCount(result.data.count);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }

    if (token) fetchPending();
  }, [token]);

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return "Tidak ada deadline";
    return new Date(deadline).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1 rounded-full hover:bg-[#F3F4F6] transition-colors"
        aria-label="Notifications"
      >
        <Bell width="22" height="22" className="text-[#434655] sm:w-6 sm:h-6" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-10 z-50 w-[320px] sm:w-[360px] bg-white rounded-xl border border-[#E8E8F0] shadow-lg overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#E8E8F0] bg-[#FAFAFE]">
              <h3 className="text-sm font-bold text-[#191B23]">
                Tugas Belum Dikerjakan
              </h3>
              <p className="text-xs text-[#737686]">
                {count > 0
                  ? `Kamu punya ${count} tugas yang belum dikumpulkan`
                  : "Semua tugas sudah dikumpulkan!"}
              </p>
            </div>

            {/* List */}
            <div className="max-h-[300px] overflow-y-auto">
              {loading ? (
                <div className="px-4 py-6 text-center text-sm text-[#737686]">
                  Memuat...
                </div>
              ) : pending.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-[#737686]">
                    Tidak ada tugas yang belum dikerjakan
                  </p>
                </div>
              ) : (
                pending.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="px-4 py-3 border-b border-[#F3F4F6] last:border-b-0 hover:bg-[#F9FAFB] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FEF2F2] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <BookOpen className="w-4 h-4 text-[#EF4444]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#191B23] truncate">
                          {assignment.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {assignment.subject && (
                            <span className="text-xs text-[#737686]">
                              {assignment.subject}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-[#EF4444]">
                            <Clock className="w-3 h-3" />
                            {formatDeadline(assignment.deadline)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
