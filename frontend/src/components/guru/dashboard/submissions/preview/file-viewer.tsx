"use client";

import { FileAccordion } from "./file-accordion";
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
  if (files.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-[#F3F4F6] bg-white p-12">
        <p className="text-sm text-[#94A3B8]">No files submitted</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      {files.map((file, index) => (
        <FileAccordion
          key={file.id}
          file={file}
          defaultExpanded={index === 0}
          studentName={studentName}
          courseName={courseName}
          assignmentTitle={assignmentTitle}
        />
      ))}
    </div>
  );
}
