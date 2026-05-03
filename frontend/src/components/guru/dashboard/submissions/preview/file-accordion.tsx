"use client";

import { useState } from "react";
import Image from "next/image";
import type { SubmissionFile } from "@/lib/api/submissions";

interface FileAccordionProps {
  file: SubmissionFile;
  defaultExpanded?: boolean;
  studentName?: string;
  courseName?: string;
  assignmentTitle?: string;
}

export function FileAccordion({
  file,
  defaultExpanded = false,
  studentName = "Student",
  courseName = "Course",
  assignmentTitle = "Assignment",
}: FileAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [zoom, setZoom] = useState(100);

  const isImage = file.mime_type?.startsWith("image/");
  const isPdf = file.mime_type === "application/pdf";

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));

  const handleFullscreen = () => {
    if (file.signed_url) {
      window.open(file.signed_url, "_blank");
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-[#F3F4F6] bg-white">
      {/* Header */}
      <div
        className="flex items-center justify-between border-b border-[#F9FAFB] bg-[#FDFDFD] px-6 py-4"
      >
        {/* Left: file icon + name */}
        <div className="flex items-center gap-3">
          <span className="material-icons text-2xl text-[#003FA3]">
            description
          </span>
          <span className="text-base text-[#191B23]">
            {file.original_file_name}
          </span>
        </div>

        {/* Right: toolbar */}
        <div className="flex items-center gap-1">
          {isExpanded ? (
            <>
              <button
                onClick={handleFullscreen}
                className="flex h-[39px] w-8 items-center justify-center rounded hover:bg-[#F3F4F6]"
              >
                <span className="material-icons text-2xl text-[#6B7280]">
                  fullscreen
                </span>
              </button>
              <button
                onClick={handleZoomOut}
                className="flex items-center justify-center rounded p-1 hover:bg-[#F3F4F6]"
              >
                <span className="material-icons text-2xl text-[#6B7280]">
                  zoom_out
                </span>
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="flex h-[39px] w-8 items-center justify-center rounded hover:bg-[#F3F4F6]"
              >
                <span className="material-icons text-2xl text-[#003FA3]">
                  expand_less
                </span>
              </button>
              <button
                onClick={handleZoomIn}
                className="flex items-center justify-center rounded p-1 hover:bg-[#F3F4F6]"
              >
                <span className="material-icons text-sm text-[#6B7280]">
                  zoom_in
                </span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsExpanded(true)}
              className="flex h-[39px] w-8 items-center justify-center rounded hover:bg-[#F3F4F6]"
            >
              <span className="material-icons text-2xl text-[#94A3B8]">
                expand_more
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="flex items-start justify-center overflow-auto bg-[#F2F3F5] p-12">
          <div
            className="bg-white shadow-sm"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
              transition: "transform 0.2s ease",
            }}
          >
            {isImage && file.signed_url ? (
              /* Image file - render directly */
              <div className="w-[631px] p-16">
                <h1 className="mb-6 text-2xl font-bold text-[#1F2937]">
                  {assignmentTitle}
                </h1>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-base font-bold text-[#1F2937]">Student:</span>
                  <span className="text-base text-[#1F2937]">{studentName}</span>
                </div>
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-base font-bold text-[#1F2937]">Course:</span>
                  <span className="text-base text-[#1F2937]">{courseName}</span>
                </div>
                <hr className="mb-6 border-[#F3F4F6]" />
                <div className="rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] p-4">
                  <p className="mb-3 text-sm text-[#6B7280]">
                    [ {file.original_file_name} ]
                  </p>
                  <div className="relative">
                    <Image
                      src={file.signed_url}
                      alt={file.original_file_name}
                      width={454}
                      height={454}
                      className="rounded object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            ) : isPdf && file.signed_url ? (
              /* PDF file - embed */
              <iframe
                src={file.signed_url}
                className="h-[600px] w-[631px]"
                title={file.original_file_name}
              />
            ) : (
              /* Document-style preview (default) */
              <div className="w-[631px] p-16">
                <h1 className="mb-6 text-2xl font-bold text-[#1F2937]">
                  {assignmentTitle}
                </h1>

                <div className="mb-2 flex items-center gap-2">
                  <span className="text-base font-bold text-[#1F2937]">
                    Student:
                  </span>
                  <span className="text-base text-[#1F2937]">
                    {studentName}
                  </span>
                </div>
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-base font-bold text-[#1F2937]">
                    Course:
                  </span>
                  <span className="text-base text-[#1F2937]">{courseName}</span>
                </div>

                <hr className="mb-6 border-[#F3F4F6]" />

                <h2 className="mb-3 text-lg font-bold text-[#1F2937]">Abstract</h2>
                <p className="mb-6 text-base text-[#1F2937]">
                  This assignment explores the practical applications of B-trees and Red-Black trees in high-concurrency database systems. The focus is on balancing read-write latency while maintaining structural integrity during heavy transactional loads.
                </p>

                <h2 className="mb-3 text-lg font-bold text-[#1F2937]">Introduction</h2>
                <p className="mb-6 text-base text-[#1F2937]">
                  In the evolving landscape of data management, the efficiency of storage engines is paramount. Traditional methods often fall short when dealing with petabyte-scale datasets. This paper analyzes how specialized data structures can mitigate bottlenecking. Furthermore, we examine the implementation of AVL trees for specific use cases involving frequent lookups.
                </p>

                {/* Technical Diagram placeholder */}
                <div className="mb-6 rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] p-4">
                  <p className="mb-3 text-sm text-[#6B7280]">
                    [ Technical Diagram: Comparison of Tree Rotations ]
                  </p>
                  {file.signed_url ? (
                    <Image
                      src={file.signed_url}
                      alt="Technical Diagram"
                      width={454}
                      height={454}
                      className="rounded object-contain"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-[454px] w-[454px] items-center justify-center rounded bg-[#E5E7EB]">
                      <span className="text-sm text-[#6B7280]">Image placeholder</span>
                    </div>
                  )}
                </div>

                <p className="text-base text-[#1F2937]">
                  The results indicate that while Red-Black trees offer superior insertion times, the strict balancing of AVL trees provides a consistent O(log n) search performance that is indispensable for read-heavy environments. In conclusion, the choice of structure must be dictated by the specific workload characteristics of the application.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
