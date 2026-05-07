"use client";

import { useState } from "react";
import Image from "next/image";
import type { SubmissionFile } from "@/lib/api/submissions";

interface FileViewerProps {
  files: SubmissionFile[];
  studentName: string;
  courseName: string;
  assignmentTitle: string;
}

export function FileViewer({
  files,
  studentName,
  courseName,
  assignmentTitle,
}: FileViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [activeFile, setActiveFile] = useState(0);

  if (files.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-[#F3F4F6] bg-white p-12">
        <p className="text-sm text-[#94A3B8]">No files submitted</p>
      </div>
    );
  }

  const imageFiles = files.filter((f) => f.mime_type?.startsWith("image/"));
  const pdfFiles = files.filter((f) => f.mime_type === "application/pdf");
  const otherFiles = files.filter(
    (f) => !f.mime_type?.startsWith("image/") && f.mime_type !== "application/pdf"
  );

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleZoomReset = () => setZoom(100);

  return (
    <div className="flex flex-1 flex-col gap-4 min-w-0">
      {/* Image files - PDF-like stacked viewer */}
      {imageFiles.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-[#F3F4F6] bg-white">
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-[#F3F4F6] bg-[#FDFDFD] px-4 sm:px-6 py-3">
            <div className="flex items-center gap-2">
              <span className="material-icons text-xl text-[#003FA3]">
                photo_library
              </span>
              <span className="text-sm sm:text-base font-medium text-[#191B23]">
                Foto Tugas ({imageFiles.length} halaman)
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleZoomOut}
                className="flex h-8 w-8 items-center justify-center rounded hover:bg-[#F3F4F6]"
                title="Zoom Out"
              >
                <span className="material-icons text-xl text-[#6B7280]">zoom_out</span>
              </button>
              <button
                onClick={handleZoomReset}
                className="flex h-8 items-center justify-center rounded px-2 hover:bg-[#F3F4F6]"
                title="Reset Zoom"
              >
                <span className="text-xs font-medium text-[#6B7280]">{zoom}%</span>
              </button>
              <button
                onClick={handleZoomIn}
                className="flex h-8 w-8 items-center justify-center rounded hover:bg-[#F3F4F6]"
                title="Zoom In"
              >
                <span className="material-icons text-xl text-[#6B7280]">zoom_in</span>
              </button>
              <div className="mx-2 h-5 w-px bg-[#E5E7EB]" />
              <button
                onClick={() => {
                  if (imageFiles[activeFile]?.signed_url) {
                    window.open(imageFiles[activeFile].signed_url!, "_blank");
                  }
                }}
                className="flex h-8 w-8 items-center justify-center rounded hover:bg-[#F3F4F6]"
                title="Fullscreen"
              >
                <span className="material-icons text-xl text-[#6B7280]">fullscreen</span>
              </button>
            </div>
          </div>

          {/* Stacked image viewer (PDF-like) */}
          <div className="overflow-auto bg-[#F2F3F5] p-4 sm:p-8 lg:p-12" style={{ maxHeight: "70vh" }}>
            <div
              className="mx-auto flex flex-col gap-6"
              style={{
                width: `${Math.min(631, 631 * zoom / 100)}px`,
                maxWidth: "100%",
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
                transition: "transform 0.2s ease",
              }}
            >
              {imageFiles.map((file, index) => (
                <div
                  key={file.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                  id={`page-${index}`}
                >
                  {/* Page header */}
                  <div className="flex items-center justify-between bg-[#FDFDFD] border-b border-[#F3F4F6] px-4 py-2">
                    <span className="text-sm text-[#191B23]">
                      {file.original_file_name}
                    </span>
                    <span className="text-xs text-[#6B7280]">
                      Halaman {index + 1} / {imageFiles.length}
                    </span>
                  </div>

                  {/* Image */}
                  <div className="relative w-full bg-white flex items-center justify-center p-4">
                    {file.signed_url ? (
                      <Image
                        src={file.signed_url}
                        alt={file.original_file_name}
                        width={600}
                        height={800}
                        className="w-full h-auto object-contain rounded"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-[400px] w-full items-center justify-center bg-[#F9FAFB] rounded">
                        <span className="text-sm text-[#6B7280]">
                          Gambar tidak tersedia
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Page navigation */}
          {imageFiles.length > 1 && (
            <div className="flex items-center justify-center gap-2 border-t border-[#F3F4F6] bg-[#FDFDFD] px-4 py-2">
              {imageFiles.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveFile(index);
                    document.getElementById(`page-${index}`)?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`flex h-7 w-7 items-center justify-center rounded text-xs font-medium transition-colors ${
                    activeFile === index
                      ? "bg-[#003FA3] text-white"
                      : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PDF files - iframe embed */}
      {pdfFiles.map((file) => (
        <div key={file.id} className="overflow-hidden rounded-xl border border-[#F3F4F6] bg-white">
          <div className="flex items-center justify-between border-b border-[#F3F4F6] bg-[#FDFDFD] px-4 sm:px-6 py-3">
            <div className="flex items-center gap-2">
              <span className="material-icons text-xl text-[#DC2626]">picture_as_pdf</span>
              <span className="text-sm sm:text-base text-[#191B23]">{file.original_file_name}</span>
            </div>
            {file.signed_url && (
              <a
                href={file.signed_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded hover:bg-[#F3F4F6]"
              >
                <span className="material-icons text-xl text-[#6B7280]">open_in_new</span>
              </a>
            )}
          </div>
          {file.signed_url && (
            <iframe
              src={file.signed_url}
              className="h-[500px] sm:h-[600px] lg:h-[700px] w-full"
              title={file.original_file_name}
            />
          )}
        </div>
      ))}

      {/* Other files - download link */}
      {otherFiles.map((file) => (
        <div key={file.id} className="overflow-hidden rounded-xl border border-[#F3F4F6] bg-white">
          <div className="flex items-center justify-between bg-[#FDFDFD] px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="material-icons text-2xl text-[#003FA3]">description</span>
              <div>
                <span className="text-sm sm:text-base text-[#191B23] block">{file.original_file_name}</span>
                <span className="text-xs text-[#6B7280]">
                  {file.file_size_bytes ? `${(file.file_size_bytes / 1024).toFixed(0)} KB` : ""}
                </span>
              </div>
            </div>
            {file.signed_url && (
              <a
                href={file.signed_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-lg bg-[#003FA3] px-3 py-2 text-xs font-medium text-white hover:bg-[#002D7A]"
              >
                <span className="material-icons text-sm">download</span>
                Download
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
