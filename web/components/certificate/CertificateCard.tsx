"use client";

interface CertificateCardProps {
  name: string;
  cohortName: string;
  startsOn: string;
  endsOn: string;
}

function fmtCertDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function CertificateCard({ name, cohortName, startsOn, endsOn }: CertificateCardProps) {
  return (
    <div className="space-y-6">
      {/* The printable certificate */}
      <div
        id="certificate"
        className="certificate-outer mx-auto"
      >
        <div className="certificate-inner">
          {/* Logo */}
          <div className="certificate-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg.jpg" alt="Gnanalytica" className="certificate-logo-img" />
          </div>

          {/* Title */}
          <h2 className="certificate-title">Certificate of Completion</h2>

          <p className="certificate-certify">This is to certify that</p>

          {/* Student name */}
          <p className="certificate-name">{name}</p>

          <p className="certificate-body">
            has successfully completed the
          </p>
          <p className="certificate-workshop">30-Day AI Workshop</p>

          {/* Cohort details */}
          <p className="certificate-cohort">{cohortName}</p>
          <p className="certificate-dates">
            {fmtCertDate(startsOn)} &mdash; {fmtCertDate(endsOn)}
          </p>

          {/* Signature */}
          <div className="certificate-signature">
            <div className="certificate-sig-line" />
            <p className="certificate-sig-label">Director, Gnanalytica</p>
          </div>
        </div>
      </div>

      {/* Download button (hidden in print) */}
      <div className="flex justify-center print-hide">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-cta-ink shadow-soft transition-shadow hover:shadow-lift"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download PDF
        </button>
      </div>
    </div>
  );
}
