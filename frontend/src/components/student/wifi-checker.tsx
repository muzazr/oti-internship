"use client";

import { useEffect, useState, useCallback } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const HEALTH_URL = API_BASE.replace("/api", "") + "/health";

interface SpeedResult {
  latency: number;
  status: "good" | "medium" | "slow" | "offline";
}

export function WifiChecker() {
  const [result, setResult] = useState<SpeedResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkSpeed = useCallback(async () => {
    setChecking(true);
    try {
      const start = performance.now();
      const res = await fetch(HEALTH_URL, { cache: "no-store" });
      if (!res.ok) throw new Error("offline");
      await res.text();
      const latency = Math.round(performance.now() - start);

      let status: SpeedResult["status"] = "good";
      if (latency > 500) status = "slow";
      else if (latency > 200) status = "medium";

      setResult({ latency, status });
    } catch {
      setResult({ latency: 0, status: "offline" });
    } finally {
      setChecking(false);
    }
  }, []);

  // Auto-check on mount and every 30s
  useEffect(() => {
    checkSpeed();
    const interval = setInterval(checkSpeed, 30000);
    return () => clearInterval(interval);
  }, [checkSpeed]);

  const getColor = () => {
    if (!result) return "#737686";
    switch (result.status) {
      case "good": return "#22C55E";
      case "medium": return "#F59E0B";
      case "slow": return "#EF4444";
      case "offline": return "#EF4444";
    }
  };

  const getLabel = () => {
    if (!result) return "Mengecek...";
    switch (result.status) {
      case "good": return "Koneksi Bagus";
      case "medium": return "Koneksi Sedang";
      case "slow": return "Koneksi Lambat";
      case "offline": return "Tidak Terhubung";
    }
  };

  const getBars = () => {
    if (!result || result.status === "offline") return 0;
    if (result.status === "good") return 3;
    if (result.status === "medium") return 2;
    return 1;
  };

  const bars = getBars();

  return (
    <div className="relative">
      {/* WiFi icon button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1 rounded-full hover:bg-[#F3F4F6] transition-colors"
        aria-label="Connection status"
      >
        {result?.status === "offline" ? (
          <WifiOff width="20" height="20" style={{ color: getColor() }} className="sm:w-[22px] sm:h-[22px]" />
        ) : (
          <Wifi width="20" height="20" style={{ color: getColor() }} className="sm:w-[22px] sm:h-[22px]" />
        )}
        {/* Status dot */}
        <span
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
          style={{ backgroundColor: getColor() }}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-[220px] bg-white rounded-xl border border-[#E8E8F0] shadow-lg overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#E8E8F0] bg-[#FAFAFE]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#191B23]">Status Koneksi</h3>
                <button
                  onClick={(e) => { e.stopPropagation(); checkSpeed(); }}
                  className="p-1 rounded hover:bg-[#E8E8F0] transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#737686] ${checking ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 py-3 flex flex-col gap-3">
              {/* Signal bars */}
              <div className="flex items-center gap-3">
                <div className="flex items-end gap-0.5 h-5">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className="w-1.5 rounded-sm transition-colors"
                      style={{
                        height: `${level * 6 + 2}px`,
                        backgroundColor: level <= bars ? getColor() : "#E1E2ED",
                      }}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold" style={{ color: getColor() }}>
                  {getLabel()}
                </span>
              </div>

              {/* Latency */}
              {result && result.status !== "offline" && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#737686]">Latency</span>
                  <span className="text-xs font-medium text-[#191B23]">{result.latency} ms</span>
                </div>
              )}

              {/* Offline message */}
              {result?.status === "offline" && (
                <p className="text-xs text-[#EF4444]">
                  Tidak bisa terhubung ke server. Periksa koneksi internet kamu.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
