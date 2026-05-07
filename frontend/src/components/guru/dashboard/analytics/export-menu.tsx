"use client";

import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, FileSpreadsheet, ImageIcon } from "lucide-react";

interface ExportMenuProps {
  onExportCSV: () => void;
  onExportExcel: () => void;
  onExportImage: () => void;
}

export function ExportMenu({
  onExportCSV,
  onExportExcel,
  onExportImage,
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8]"
      >
        <Download className="h-4 w-4" />
        <span>Download</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-lg border border-[#E5E7EB] bg-white py-1 shadow-lg">
          <button
            onClick={() => handleAction(onExportCSV)}
            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-[#434655] transition-colors hover:bg-[#F9FAFB]"
          >
            <FileSpreadsheet className="h-4 w-4 text-[#16A34A]" />
            <div className="flex flex-col items-start">
              <span className="font-medium">Export CSV</span>
              <span className="text-xs text-[#8C8D91]">
                Format spreadsheet ringan
              </span>
            </div>
          </button>

          <div className="mx-3 h-px bg-[#F3F4F6]" />

          <button
            onClick={() => handleAction(onExportExcel)}
            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-[#434655] transition-colors hover:bg-[#F9FAFB]"
          >
            <FileSpreadsheet className="h-4 w-4 text-[#2563EB]" />
            <div className="flex flex-col items-start">
              <span className="font-medium">Export Excel</span>
              <span className="text-xs text-[#8C8D91]">
                Format .xlsx lengkap
              </span>
            </div>
          </button>

          <div className="mx-3 h-px bg-[#F3F4F6]" />

          <button
            onClick={() => handleAction(onExportImage)}
            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-[#434655] transition-colors hover:bg-[#F9FAFB]"
          >
            <ImageIcon className="h-4 w-4 text-[#D97706]" />
            <div className="flex flex-col items-start">
              <span className="font-medium">Export Image</span>
              <span className="text-xs text-[#8C8D91]">
                Screenshot grafik sebagai PNG
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
