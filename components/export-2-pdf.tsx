// components/ExportToPDFButton.tsx
"use client";

import { useCallback } from "react";

export default function ExportToPDFButton() {
  const handleExport = useCallback(async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.getElementById("payment-summary");
    if (element) {
      html2pdf().from(element).save("payment-summary.pdf");
    }
  }, []);

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
    >
      Export to PDF
    </button>
  );
}
