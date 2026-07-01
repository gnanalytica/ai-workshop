"use client";

import { useCallback, useRef } from "react";

interface CertificateCardProps {
  name: string;
  rollNumber: string | null;
  projectTitle: string | null;
  cohortName: string;
  startsOn: string;
  endsOn: string;
}

/** Strip department/branch suffixes and title-case. */
function cleanName(raw: string): string {
  let base = raw.trim();

  // 1. Strip parenthesized suffixes: "Name (bsc.ai&ml)"
  base = base.replace(/\s*\([^)]*\)\s*$/, "");

  // 2. Strip everything after " - " or trailing " -" (dash with leading space)
  base = base.replace(/\s+-\s*.*$/, "");

  // 3. Strip underscore-separated dept codes: "Name_AIML"
  base = base.replace(/[_](AIML|AI|DS|COMP|CSE|STAT|ML|BSC).*$/i, "");

  // 4. Strip dash-separated dept keywords (no space before dash): "Name-Bsc..."
  base = base.replace(/-(BSC|B\.?SC|AIML|AI|DS|COMP|COMPUTERS?|CSE|STAT|ML).*$/i, "");

  // 5. Strip space-separated dept/degree (full words including "computers"):
  base = base.replace(
    /\s+(BSC\.?\s*COMP\w*|BSC\.?\s*STAT\w*|BSC\.?\s*DS|BSC\.?\s*AI|BSC|B\.SC|COMPUTERS?\s*\d*|AI\s*&\s*ML|AIML|AI|DS|COMP|CSE|STAT|ML)[\s.\-]*\d*$/i,
    ""
  );

  return base.trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Derive department & degree from roll-number prefix. */
function getDeptAndDegree(roll: string | null) {
  if (!roll) return { department: "___", degree: "___" };
  const prefix = roll.trim().slice(0, 4);
  switch (prefix) {
    case "2433":
      return { department: "Computer Science", degree: "B.Sc Honours Computer Science" };
    case "2435":
      return { department: "Statistics", degree: "B.Sc Honours Statistics" };
    case "2452":
      return { department: "Data Science", degree: "B.Sc Honours Data Science" };
    case "2459":
      return { department: "Artificial Intelligence", degree: "B.Sc Honours Artificial Intelligence" };
    default:
      return { department: "___", degree: "___" };
  }
}

/** Title-case a project name with proper acronym handling. */
function formatProjectTitle(raw: string): string {
  const acronyms: Record<string, string> = {
    ai: "AI", ml: "ML", iot: "IoT", api: "API", ui: "UI", ux: "UX",
    erp: "ERP", cms: "CMS", lms: "LMS", hr: "HR", qa: "QA",
  };
  return raw.replace(/\b\w+/g, (word) => {
    const lower = word.toLowerCase();
    if (acronyms[lower]) return acronyms[lower];
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

/** Format ISO date as "04 May 2026". */
function fmtCertDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function CertificateCard({
  name,
  rollNumber,
  projectTitle,
  startsOn,
  endsOn,
}: CertificateCardProps) {
  const displayName = cleanName(name);
  const { department, degree } = getDeptAndDegree(rollNumber);
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
          src="/KBN_Letter_head.jpg"
          alt="Certificate of Completion"
          className="cert-bg"
        />

        {/* Dynamic body paragraph overlay */}
        <div className="cert-body">
          <p>
            This is to certify that Mr./Miss <strong>{displayName}</strong>,
            bearing Roll Number <strong>{rollNumber ?? "___"}</strong>, from the
            Department of <strong>{department}</strong>,{" "}
            <strong>
              Kakaraparthi Bhavanarayana College (Autonomous), VIJAYAWADA
            </strong>
            , has successfully completed{" "}
            <strong>30-day BUILD WITH AI Internship</strong> organized by{" "}
            <strong>Gnanalytica</strong>{" "}with a final project submission titled
            &ldquo;
            <strong>{projectTitle ? formatProjectTitle(projectTitle) : "___"}</strong>
            &rdquo;.
          </p>
          <p>
            The duration of the internship was from{" "}
            <strong>01 May 2026</strong> to{" "}
            <strong>09 June 2026</strong>, with a total of 180 hours.
            This internship was carried out as a part of partial fulfillment of
            the requirements for the award of the degree of{" "}
            <strong>{degree}</strong>.
          </p>
          <p>
            The overall performance of the intern during his/her internship is
            found to be <strong>satisfactory</strong>.
          </p>
        </div>
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
