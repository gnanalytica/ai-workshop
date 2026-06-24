"use client";

import { useCallback, useRef } from "react";

interface CertificateCardProps {
  name: string;
  cohortName: string;
  startsOn: string;
  endsOn: string;
}

/** Strip suffixes like "-AI&ML", "-CSE" and title-case each word. */
function cleanName(raw: string): string {
  const base = raw.replace(/\s*-\s*[A-Z&]+$/i, "").trim();
  return base.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function CertificateCard({ name }: CertificateCardProps) {
  const displayName = cleanName(name);
  const certRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    const el = certRef.current;
    if (!el) return;
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(el, { useCORS: true, scale: 2 });
    const link = document.createElement("a");
    link.download = `${displayName.replace(/\s+/g, "_")}_Certificate.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [displayName]);

  return (
    <div className="space-y-6">
      {/* The printable certificate */}
      <div id="certificate" ref={certRef} className="cert-wrap mx-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/CERTIFICATES_AI_WORKSHOP.png"
          alt="Certificate of Completion"
          className="cert-bg"
        />
        <p className="cert-name">{displayName}</p>
      </div>

      {/* Action buttons (hidden in print) */}
      <div className="flex justify-center gap-3 print-hide">
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-cta-ink shadow-soft transition-shadow hover:shadow-lift"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download Certificate
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-md border border-current/15 px-5 py-2.5 text-sm font-medium shadow-soft transition-shadow hover:shadow-lift"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Print Certificate
        </button>
      </div>
    </div>
  );
}
