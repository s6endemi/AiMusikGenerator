import Link from "next/link";

export const metadata = {
  title: "Imprint – VibeSync Pro",
};

export default function Imprint() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-2xl mx-auto px-6 py-20">
        <Link href="/" className="text-[12px] text-white/30 hover:text-white/60 transition-colors mb-8 inline-block">
          &larr; Back to VibeSync Pro
        </Link>

        <h1 className="text-[22px] font-semibold tracking-[-0.03em] mb-2">Imprint</h1>
        <p className="text-[12px] text-white/30 mb-10">Angaben gem&auml;&szlig; &sect;5 TMG</p>

        <div className="space-y-8 text-[13px] text-white/60 leading-[1.8]">
          <section>
            <h2 className="text-[14px] font-medium text-white/90 mb-2">Responsible</h2>
            <p>
              Eren<br />
              {/* TODO: Add full legal name and address before going live */}
              Glasstrasse 7<br />
              Köln, 50823<br />
              Germany
            </p>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/90 mb-2">Contact</h2>
            <p>
              Email:{" "}
              <a href="mailto:erendemir10022@gmail.com" className="text-[var(--accent)] hover:underline">
                erendemir10022@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/90 mb-2">Dispute Resolution</h2>
            <p>
              The European Commission provides an online dispute resolution platform:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                ec.europa.eu/consumers/odr
              </a>
              . We are not obligated or willing to participate in dispute resolution
              proceedings before a consumer arbitration board.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
