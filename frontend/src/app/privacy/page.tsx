import Link from "next/link";

export const metadata = {
  title: "Privacy Policy – VibeSync Pro",
};

export default function Privacy() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-2xl mx-auto px-6 py-20">
        <Link href="/" className="text-[12px] text-white/30 hover:text-white/60 transition-colors mb-8 inline-block">
          &larr; Back to VibeSync Pro
        </Link>

        <h1 className="text-[22px] font-semibold tracking-[-0.03em] mb-2">Privacy Policy</h1>
        <p className="text-[12px] text-white/30 mb-10">Last updated: March 8, 2026</p>

        <div className="space-y-8 text-[13px] text-white/60 leading-[1.8]">
          <section>
            <h2 className="text-[14px] font-medium text-white/90 mb-2">1. What we collect</h2>
            <p>
              <strong className="text-white/80">Account data:</strong> Email address, display name,
              and avatar (from OAuth provider). Stored in Supabase (EU region).
            </p>
            <p className="mt-2">
              <strong className="text-white/80">Uploaded videos:</strong> Processed temporarily for
              AI analysis and music generation. Videos are not stored permanently — they are deleted
              from our servers after processing is complete.
            </p>
            <p className="mt-2">
              <strong className="text-white/80">Payment data:</strong> Handled entirely by Stripe.
              We never see or store your card details.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/90 mb-2">2. How we use it</h2>
            <p>
              Your data is used exclusively to provide the Service: authenticating you,
              tracking your credit balance, generating music for your videos,
              and processing payments. We do not sell your data. We do not use your
              content to train AI models.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/90 mb-2">3. Third-party services</h2>
            <ul className="list-none space-y-1.5 mt-2">
              <li><strong className="text-white/80">Supabase</strong> — Authentication &amp; database (EU)</li>
              <li><strong className="text-white/80">Google Cloud / Vertex AI</strong> — Video analysis &amp; music generation</li>
              <li><strong className="text-white/80">Stripe</strong> — Payment processing</li>
              <li><strong className="text-white/80">Vercel</strong> — Frontend hosting</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/90 mb-2">4. Cookies</h2>
            <p>
              We use essential cookies only (authentication session). No tracking cookies,
              no analytics cookies, no advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/90 mb-2">5. Your rights (GDPR)</h2>
            <p>
              You have the right to access, correct, or delete your personal data at any time.
              You can delete your account by contacting us. Upon deletion, all associated
              data (profile, credit balance, generation history) will be permanently removed.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/90 mb-2">6. Data retention</h2>
            <p>
              Account data is kept as long as your account exists.
              Uploaded videos are deleted immediately after processing.
              Generated audio files are available for download for 24 hours, then deleted.
              Payment records are retained as required by tax law.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/90 mb-2">7. Contact</h2>
            <p>
              For privacy-related requests:{" "}
              <a href="mailto:erendemir10022@gmail.com" className="text-[var(--accent)] hover:underline">
                erendemir10022@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
