import * as XLSX from "xlsx";
import html2canvas from "html2canvas";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StudentRecapExport {
  name: string;
  avgScore: number;
  submitted: number;
  late: number;
  notSubmitted: number;
  status: string;
}

export interface ParticipationExport {
  assignment: string;
  sudah: number;
  terlambat: number;
  belum: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeCsvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function getDateString(): string {
  return new Date().toISOString().split("T")[0];
}

// ─── CSV Export ──────────────────────────────────────────────────────────────

export function exportToCSV(
  students: StudentRecapExport[],
  className: string
): void {
  const headers = [
    "No",
    "Nama Siswa",
    "Rata-rata Nilai",
    "Sudah",
    "Terlambat",
    "Belum",
    "Status",
  ];

  const rows = students.map((s, i) =>
    [
      i + 1,
      escapeCsvField(s.name),
      s.avgScore.toFixed(1),
      s.submitted,
      s.late,
      s.notSubmitted,
      escapeCsvField(s.status),
    ].join(",")
  );

  const csvContent = [
    `Analisis Kelas: ${escapeCsvField(className)}`,
    `Tanggal Export: ${getDateString()}`,
    "",
    headers.join(","),
    ...rows,
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const filename = `analisis_${className.replace(/\s+/g, "_")}_${getDateString()}.csv`;
  triggerDownload(blob, filename);
}

// ─── Excel Export ────────────────────────────────────────────────────────────

export function exportToExcel(
  students: StudentRecapExport[],
  participation: ParticipationExport[],
  className: string
): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Rekap Siswa
  const studentData = students.map((s, i) => ({
    No: i + 1,
    "Nama Siswa": s.name,
    "Rata-rata Nilai": Number(s.avgScore.toFixed(1)),
    Sudah: s.submitted,
    Terlambat: s.late,
    Belum: s.notSubmitted,
    Status: s.status,
  }));

  const ws1 = XLSX.utils.json_to_sheet(studentData);

  // Auto-width columns
  const colWidths = [
    { wch: 5 },
    { wch: 25 },
    { wch: 15 },
    { wch: 8 },
    { wch: 10 },
    { wch: 8 },
    { wch: 18 },
  ];
  ws1["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws1, "Rekap Siswa");

  // Sheet 2: Partisipasi
  const participationData = participation.map((p) => ({
    Tugas: p.assignment,
    Sudah: p.sudah,
    Terlambat: p.terlambat,
    Belum: p.belum,
    Total: p.sudah + p.terlambat + p.belum,
  }));

  const ws2 = XLSX.utils.json_to_sheet(participationData);
  ws2["!cols"] = [
    { wch: 30 },
    { wch: 8 },
    { wch: 10 },
    { wch: 8 },
    { wch: 8 },
  ];

  XLSX.utils.book_append_sheet(wb, ws2, "Partisipasi");

  // Generate and download
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const filename = `analisis_${className.replace(/\s+/g, "_")}_${getDateString()}.xlsx`;
  triggerDownload(blob, filename);
}

// ─── Image Export ────────────────────────────────────────────────────────────

export async function exportToImage(
  elementId: string,
  className: string
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: "#FAF8FF",
      scale: 2,
      useCORS: true,
      logging: false,
    });

    canvas.toBlob((blob) => {
      if (blob) {
        const filename = `analisis_${className.replace(/\s+/g, "_")}_${getDateString()}.png`;
        triggerDownload(blob, filename);
      }
    }, "image/png");
  } catch (error) {
    console.error("Failed to export image:", error);
  }
}
