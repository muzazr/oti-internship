"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Trash2,
  RefreshCw,
  Upload,
  Send,
  Loader2,
  Check,
  X,
  Phone,
  CloudOff,
} from "lucide-react";
import { motion } from "framer-motion";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const TEACHER_WA = "62895397306279";

type PageState =
  | "IDLE"
  | "CAMERA"
  | "ANALYZING"
  | "VALID"
  | "INVALID"
  | "SUBMITTING"
  | "SUCCESS"
  | "FAILED";

interface PhotoItem {
  id: string;
  blob: Blob;
  url: string;
  name: string;
  size: number;
  valid: boolean;
  croppedBlob?: Blob;
  croppedUrl?: string;
}

interface AssignmentData {
  assignment_title: string;
  assignment_subject: string | null;
  assignment_description: string | null;
  class_name: string | null;
  student_name: string;
}

export default function SubmitPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [state, setState] = useState<PageState>("IDLE");
  const [data, setData] = useState<AssignmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [currentCapture, setCurrentCapture] = useState<Blob | null>(null);
  const [currentCaptureUrl, setCurrentCaptureUrl] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{ valid: boolean; croppedBlob?: Blob; croppedUrl?: string } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasCamera = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

  // Fetch assignment data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${API_BASE}/upload-links/${token}`);
        if (!res.ok) { router.push(`/upload/${token}`); return; }
        const result = await res.json();
        setData(result.data);
      } catch { router.push(`/upload/${token}`); }
      finally { setLoading(false); }
    }
    if (token) fetchData();
  }, [token, router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      photos.forEach(p => URL.revokeObjectURL(p.url));
    };
  }, []);

  // Camera functions
  const startCamera = useCallback(async () => {
    // Check if camera API available (requires HTTPS)
    if (!navigator.mediaDevices?.getUserMedia) {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      // Set state first so video element renders
      setState("CAMERA");
    } catch (err) {
      console.error("Camera error:", err);
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  }, []);

  // Attach stream to video element when CAMERA state is active
  useEffect(() => {
    if (state === "CAMERA" && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(console.error);
    }
  }, [state]);

  // Handle file input (fallback when camera API not available)
  const handleFileCapture = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const blob = file as Blob;
    setCurrentCapture(blob);
    setCurrentCaptureUrl(URL.createObjectURL(blob));
    // Start AI analysis
    analyzePhoto(blob);

    // Reset input so same file can be selected again
    e.target.value = "";
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        setCurrentCapture(blob);
        setCurrentCaptureUrl(URL.createObjectURL(blob));
        stopCamera();
        // Start AI analysis
        analyzePhoto(blob);
      }
    }, "image/jpeg", 0.9);
  }, [stopCamera]);

  // AI Analysis
  const analyzePhoto = async (blob: Blob) => {
    setState("ANALYZING");
    try {
      const formData = new FormData();
      formData.append("image", blob, "photo.jpg");

      const res = await fetch(`${API_BASE}/ai/crop`, {
        method: "POST",
        body: formData,
      });

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("image/jpeg")) {
        // Valid - AI returned cropped image
        const croppedBlob = await res.blob();
        const croppedUrl = URL.createObjectURL(croppedBlob);
        setAiResult({ valid: true, croppedBlob, croppedUrl });
        setState("VALID");
      } else {
        // Invalid
        setAiResult({ valid: false });
        setState("INVALID");
      }
    } catch (err) {
      console.error("AI analysis error:", err);
      // On network error, treat as invalid
      setAiResult({ valid: false });
      setState("INVALID");
    }
  };

  // Save photo to list - SELALU simpan foto original (guru lihat foto asli)
  const savePhoto = (forceValid = false) => {
    if (!currentCapture || !currentCaptureUrl) return;
    // Buat URL baru supaya tidak di-revoke oleh resetCapture
    const savedUrl = URL.createObjectURL(currentCapture);
    const photo: PhotoItem = {
      id: Date.now().toString(),
      blob: currentCapture,        // selalu foto original (yang dikirim ke guru)
      url: savedUrl,               // preview pakai foto original
      name: `Halaman_${photos.length + 1}.jpg`,
      size: currentCapture.size,
      valid: forceValid || (aiResult?.valid ?? false),
      croppedBlob: aiResult?.croppedBlob,
      croppedUrl: aiResult?.croppedUrl,
    };
    setPhotos(prev => [...prev, photo]);
    resetCapture();
    setState("IDLE");
  };

  const cancelPhoto = () => {
    resetCapture();
    setState("IDLE");
  };

  const retakePhoto = () => {
    resetCapture();
    startCamera();
  };

  const resetCapture = () => {
    if (currentCaptureUrl) URL.revokeObjectURL(currentCaptureUrl);
    setCurrentCapture(null);
    setCurrentCaptureUrl(null);
    setAiResult(null);
  };

  const deletePhoto = (id: string) => {
    setPhotos(prev => {
      const photo = prev.find(p => p.id === id);
      if (photo) URL.revokeObjectURL(photo.url);
      return prev.filter(p => p.id !== id);
    });
  };

  // Submit
  const handleSubmit = async () => {
    if (photos.length === 0) return;
    setState("SUBMITTING");
    try {
      const formData = new FormData();
      photos.forEach((photo, i) => {
        formData.append("files", photo.blob, photo.name);
      });

      const res = await fetch(`${API_BASE}/submissions/${token}`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setState("SUCCESS");
      } else {
        setState("FAILED");
      }
    } catch {
      setState("FAILED");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Loading
  if (loading) {
    return (
      <main className="flex justify-center items-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#004AC6]" />
      </main>
    );
  }

  // ============================================================
  // STATE: SUCCESS
  // ============================================================
  if (state === "SUCCESS") {
    const now = new Date();
    const timeStr = now.toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

    return (
      <main className="flex justify-center px-4 sm:px-6 py-8 sm:py-14">
        <div className="w-full max-w-[383px] sm:max-w-[500px] lg:max-w-[600px] flex flex-col items-center gap-6 text-center">
          {/* Animated check icon with expanding ring */}
          <div className="relative">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, duration: 0.6 }}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#D6FFD6] flex items-center justify-center relative z-10"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
              >
                <Check className="w-12 h-12 sm:w-14 sm:h-14 text-[#006B00] stroke-[3]" />
              </motion.div>
            </motion.div>
            {/* Expanding ring pulse */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-[#86EFAC]"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[#BBF7D0]"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2.8, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
            />
          </div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h1 className="text-[24px] sm:text-[28px] font-bold text-[#191B23] mb-2">
              Tugas Berhasil Dikumpulkan! 🎉
            </h1>
            <p className="text-[16px] text-[#434655]">
              Guru kamu sudah menerima tugasmu. Konfirmasi akan dikirim ke WhatsApp mu.
            </p>
          </motion.div>

          {/* Info table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="w-full bg-white rounded-xl border border-[#E8E8F0] divide-y divide-[#E8E8F0] text-left"
          >
            <div className="flex justify-between items-center px-5 py-3">
              <span className="text-[14px] text-[#737686] font-medium">Tugas</span>
              <span className="text-[14px] text-[#191B23] font-medium">{data?.assignment_title}</span>
            </div>
            <div className="flex justify-between items-center px-5 py-3">
              <span className="text-[14px] text-[#737686] font-medium">Dikumpulkan</span>
              <span className="text-[14px] text-[#191B23] font-medium">{timeStr}</span>
            </div>
            <div className="flex justify-between items-center px-5 py-3">
              <span className="text-[14px] text-[#737686] font-medium">Status</span>
              <span className="flex items-center gap-1.5 bg-[#D6FFD6] text-[#006B00] text-[12px] font-bold py-1 px-3 rounded-full">
                <Check className="w-3.5 h-3.5" /> Diterima
              </span>
            </div>
          </motion.div>

          {/* Button */}
          <motion.a
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            href={`https://wa.me/${TEACHER_WA}`}
            className="flex items-center justify-center gap-2 w-full h-12 sm:h-14 bg-[#25D366] text-white font-bold text-sm rounded-xl hover:bg-[#1DA851] transition-colors"
          >
            Kembali ke WhatsApp
            <ArrowRight className="w-4 h-4" />
          </motion.a>
        </div>
      </main>
    );
  }

  // ============================================================
  // STATE: FAILED
  // ============================================================
  if (state === "FAILED") {
    return (
      <main className="flex justify-center px-4 sm:px-6 py-8 sm:py-14">
        <div className="w-full max-w-[383px] sm:max-w-[500px] lg:max-w-[600px] flex flex-col items-center gap-6 text-center">
          {/* Animated fail icon with shake */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#FFDAD6] flex items-center justify-center"
          >
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <CloudOff className="w-12 h-12 sm:w-14 sm:h-14 text-[#93000A]" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h1 className="text-[24px] sm:text-[28px] font-bold text-[#191B23] mb-2">
              Gagal Mengunggah ❌
            </h1>
            <p className="text-[16px] text-[#434655]">
              Koneksi internet kamu sepertinya sedang bermasalah. Periksa koneksi kamu dan coba lagi.
            </p>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="w-full flex flex-col gap-3"
          >
            <button
              onClick={() => setState("IDLE")}
              className="flex items-center justify-center gap-2 w-full h-12 sm:h-14 bg-[#004AC6] text-white font-bold text-sm rounded-xl hover:bg-[#003A9E] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Coba Lagi
            </button>
            <a
              href={`https://wa.me/${TEACHER_WA}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-12 sm:h-14 bg-white border border-[#E1E2ED] text-[#191B23] font-bold text-sm rounded-xl hover:bg-[#F9FAFB] transition-colors"
            >
              <Phone className="w-4 h-4" />
              Bantuan (0895397306279)
            </a>
          </motion.div>
        </div>
      </main>
    );
  }

  // ============================================================
  // STATE: CAMERA
  // ============================================================
  if (state === "CAMERA") {
    return (
      <main className="fixed inset-0 z-50 bg-[#FAF8FF] flex flex-col">
        {/* Progress - Langkah 3/3 */}
        <div className="px-4 pt-4 pb-2 flex flex-col gap-2 bg-[#FAF8FF]">
          <div className="flex justify-between items-center">
            <span className="text-[12px] font-bold text-[#434655]">Langkah 3 dari 3</span>
            <span className="text-[12px] font-bold text-[#004AC6]">100%</span>
          </div>
          <div className="w-full h-2 bg-[#E1E2ED] rounded-full">
            <div className="h-full w-full bg-[#004AC6] rounded-full" />
          </div>
        </div>

        {/* Info bar */}
        <div className="bg-white px-4 py-3 border-b border-[#E8E8F0]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-bold text-[#004AC6]">
              {data?.assignment_subject || "-"}
            </span>
            <span className="bg-[#FD761A] text-[#5C2400] text-[12px] font-bold px-2 py-0.5 rounded-full">
              Wajib
            </span>
          </div>
          <p className="text-[18px] font-bold text-[#191B23] mt-1">{data?.assignment_title}</p>
          <p className="text-[16px] text-[#434655] mt-0.5">Foto kertas jawabanmu dengan jelas ya!</p>
        </div>

        {/* Camera viewfinder */}
        <div className="flex-1 relative bg-black mx-4 my-4 rounded-2xl overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>

        {/* Capture button */}
        <div className="px-4 pb-6 pt-2">
          <button
            onClick={capturePhoto}
            className="flex items-center justify-center gap-2 w-full h-14 bg-[#FD761A] text-white font-semibold text-[14px] rounded-xl hover:bg-[#E5650F] transition-colors"
          >
            <Camera className="w-6 h-6" />
            Ambil Foto Tugas
          </button>
        </div>

        {/* Hidden canvas */}
        <canvas ref={canvasRef} className="hidden" />
      </main>
    );
  }

  // ============================================================
  // STATE: ANALYZING
  // ============================================================
  if (state === "ANALYZING") {
    return (
      <main className="fixed inset-0 z-50 bg-[#FAF8FF] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-[383px] sm:max-w-[500px] flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-[30px] font-bold text-[#191B23]">Hang tight!</h2>
            <p className="text-[18px] text-[#434655]">Checking your photo for clarity...</p>
          </div>

          {/* Preview with scanning animation */}
          <div className="relative w-full aspect-[4/3] bg-[#EDEDF9] rounded-3xl overflow-hidden">
            {currentCaptureUrl && (
              <img src={currentCaptureUrl} alt="Captured" className="w-full h-full object-cover opacity-80" />
            )}
            {/* Scanning lines animation */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute left-0 right-0 h-1 bg-[#FD761A] opacity-80 animate-scan-line" />
              <div className="absolute left-0 right-0 h-0.5 bg-[#004AC6] opacity-60 animate-scan-line-slow" />
            </div>
            {/* Center circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <Loader2 className="w-8 h-8 animate-spin text-[#FD761A]" />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 bg-[#FAF8FF] border border-[#E8E8F0] rounded-2xl px-4 py-3">
            <span className="text-[24px]">⏳</span>
            <span className="text-[14px] font-semibold text-[#191B23]">Analyzing legibility...</span>
          </div>
        </div>

        {/* CSS Animation */}
        <style jsx>{`
          @keyframes scanLine {
            0% { top: 0%; }
            50% { top: 90%; }
            100% { top: 0%; }
          }
          @keyframes scanLineSlow {
            0% { top: 100%; }
            50% { top: 10%; }
            100% { top: 100%; }
          }
          .animate-scan-line {
            animation: scanLine 2s ease-in-out infinite;
          }
          .animate-scan-line-slow {
            animation: scanLineSlow 3s ease-in-out infinite;
          }
        `}</style>
      </main>
    );
  }

  // ============================================================
  // STATE: VALID (foto berhasil tervalidasi)
  // ============================================================
  if (state === "VALID") {
    return (
      <main className="fixed inset-0 z-50 bg-[#FAF8FF] flex flex-col">
        {/* Preview foto */}
        <div className="flex-1 relative bg-black mx-4 mt-4 rounded-2xl overflow-hidden">
          {(aiResult?.croppedUrl || currentCaptureUrl) && (
            <img
              src={aiResult?.croppedUrl || currentCaptureUrl || ""}
              alt="Validated"
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Badge */}
        <div className="flex justify-center py-4">
          <span className="flex items-center gap-2 bg-[#D6FFD6] text-[#006B00] text-[14px] font-bold px-4 py-2 rounded-full">
            <Check className="w-5 h-5" />
            Foto Berhasil Tervalidasi
          </span>
        </div>

        {/* Buttons */}
        <div className="px-4 pb-6">
          <div className="flex gap-3">
            <button
              onClick={cancelPhoto}
              className="flex-1 flex items-center justify-center gap-2 h-12 bg-[#FAF8FF] border border-[#E1E2ED] text-[#191B23] font-bold text-[14px] rounded-lg hover:bg-[#F3F3FE] transition-colors"
            >
              Batal
            </button>
            <button
              onClick={() => savePhoto(true)}
              className="flex-1 flex items-center justify-center gap-2 h-12 bg-[#618BFF] text-white font-bold text-[14px] rounded-lg hover:bg-[#4A6FE0] transition-colors"
            >
              Simpan Foto
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // STATE: INVALID (foto gagal tervalidasi)
  // ============================================================
  if (state === "INVALID") {
    return (
      <main className="fixed inset-0 z-50 bg-[#FAF8FF] flex flex-col">
        {/* Preview foto */}
        <div className="flex-1 relative bg-black mx-4 mt-4 rounded-2xl overflow-hidden">
          {currentCaptureUrl && (
            <img
              src={currentCaptureUrl}
              alt="Invalid"
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Badge */}
        <div className="flex justify-center py-4">
          <span className="flex items-center gap-2 bg-[#FFDAD6] text-[#93000A] text-[14px] font-bold px-4 py-2 rounded-full">
            <X className="w-5 h-5" />
            Foto Gagal Tervalidasi
          </span>
        </div>

        {/* Buttons */}
        <div className="px-4 pb-6">
          <div className="flex gap-3">
            <button
              onClick={() => savePhoto(false)}
              className="flex-1 flex items-center justify-center gap-2 h-12 bg-white border border-[#E1E2ED] text-[#191B23] font-bold text-[14px] rounded-lg hover:bg-[#F9FAFB] transition-colors"
            >
              <Upload className="w-4 h-4" />
              Tetap Simpan
            </button>
            <button
              onClick={retakePhoto}
              className="flex-1 flex items-center justify-center gap-2 h-12 bg-[#BA1A1A] text-white font-bold text-[14px] rounded-lg hover:bg-[#9C1515] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Foto Ulang
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // STATE: IDLE (main upload page - Langkah 2/3)
  // ============================================================
  return (
    <main className="flex justify-center px-4 sm:px-6 py-6 sm:py-10 lg:py-14">
      <div className="w-full max-w-[383px] sm:max-w-[500px] lg:max-w-[600px] flex flex-col gap-5 sm:gap-6">
        {/* Back button */}
        <button
          onClick={() => router.push(`/upload/${token}/confirm`)}
          className="flex items-center gap-2 bg-[#2563EB] text-white text-[12px] font-medium px-4 py-2 rounded-full w-fit hover:bg-[#1D4ED8] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>

        {/* Progress */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-[12px] font-bold text-[#434655]">Langkah 2 dari 3</span>
            <span className="text-[12px] font-bold text-[#004AC6]">66%</span>
          </div>
          <div className="w-full h-2 bg-[#E1E2ED] rounded-full">
            <div className="h-full w-2/3 bg-[#004AC6] rounded-full" />
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-[28px] sm:text-[30px] text-[#191B23]">
            Upload Foto Tugasmu
          </h1>
          <p className="text-[16px] text-[#434655]">
            Bisa lebih dari 1 foto. Pastikan foto jelas dan tidak buram.
          </p>
        </div>

        {/* Camera trigger area */}
        <button
          onClick={startCamera}
          className="flex flex-col items-center justify-center gap-3 w-full py-10 sm:py-12 bg-[#F3F3FE] border-2 border-dashed border-[#C7D2FE] rounded-xl hover:bg-[#EEF2FF] transition-colors"
        >
          <div className="w-16 h-16 rounded-full bg-[#2563EB] flex items-center justify-center">
            <Camera className="w-8 h-8 text-[#EEEFFF]" />
          </div>
          <span className="text-[18px] font-bold text-[#004AC6]">Ketuk untuk foto tugas</span>
          <span className="text-[14px] font-medium text-[#434655]">Fokuskan Kamera</span>
        </button>

        {/* Preview section */}
        <div>
          <h2 className="text-[24px] font-bold text-[#191B23] mb-3">Preview Foto Tugas</h2>

          {photos.length === 0 ? (
            <p className="text-[14px] text-[#737686] text-center py-6">
              Belum ada foto. Ketuk area di atas untuk mulai foto.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    photo.valid
                      ? "bg-[#FAF8FF] border-[#E8E8F0]"
                      : "bg-[#FFF7F6] border-[#FFDAD6]"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 ${
                    photo.valid ? "bg-[#E7E7F3]" : "bg-[#FFDAD6]"
                  }`}>
                    <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[16px] font-semibold truncate ${
                      photo.valid ? "text-[#191B23]" : "text-[#BA1A1A]"
                    }`}>
                      {photo.name}
                    </p>
                    <p className={`text-[14px] ${photo.valid ? "text-[#434655]" : "text-[#BA1A1A]"}`}>
                      {photo.valid
                        ? `${formatSize(photo.size)} • Selesai`
                        : "Foto Tidak Tervalidasi."
                      }
                    </p>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    className="flex-shrink-0 p-2"
                  >
                    {photo.valid ? (
                      <Trash2 className="w-5 h-5 text-[#737686]" />
                    ) : (
                      <X className="w-5 h-5 text-[#BA1A1A]" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={startCamera}
            className="flex-1 flex items-center justify-center gap-2 h-12 sm:h-14 bg-white border border-[#E1E2ED] text-[#434655] font-bold text-[14px] rounded-xl hover:bg-[#F9FAFB] transition-colors"
          >
            Tambah Foto
          </button>
          <button
            onClick={handleSubmit}
            disabled={photos.length === 0 || state === "SUBMITTING"}
            className="flex-1 flex items-center justify-center gap-2 h-12 sm:h-14 bg-[#FD761A] text-white font-bold text-[14px] rounded-xl hover:bg-[#E5650F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state === "SUBMITTING" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Tugas
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file input (fallback for HTTP / no camera API) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileCapture}
        className="hidden"
      />
    </main>
  );
}
