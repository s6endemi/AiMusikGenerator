import Link from "next/link";

export const metadata = {
  title: "Terms of Service – VibeSync Pro",
};

export default function Terms() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-2xl mx-auto px-6 py-20">
        <Link href="/" className="text-[12px] text-white/30 hover:text-white/60 transition-colors mb-8 inline-block">
          &larr; Back to VibeSync Pro
        </Link>

        <h1 className="text-[22px] font-semibold tracking-[-0.03em] mb-2">Terms of Service</h1>
        <p className="text-[12px] text-white/30 mb-10">Last updated: March 8, 2026</p>

        <div className="space-y-8 text-[13px] text-white/60 leading-[1.8]">
          <section>
            <h2 className="text-[14px] font-medium text-white/90 mb-2">1. Service</h2>
            <p>
              VibeSync Pro (&ldquo;Service&rdquo;) is operated by Eren (&ldquo;we&rdquo;, &ldquo;us&rdquo;).
              The Service allows users to upload short video clips and generate AI-composed music soundtracks
              using Google Lyria. By using the Service, you agree to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/90 mb-2">2. Accounts &amp; Credits</h2>
            <p>
              You may create an account using email or OAuth (Google, GitHub, Discord).
              New accounts receive 2 free credits. Additional credits can be purchased
              via Stripe. Credits are non-refundable, non-transferable, and do not expire.
              1 credit = 1 generation (3 AI music variations).
            </p>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/90 mb-2">3. Content &amp; Ownership</h2>
            <p>
              You retain all rights to videos you upload. AI-generated music is provided under a
              royalty-free license for personal and commercial use (social media, content creation).
              You may not resell generated tracks as standalone music products.
              We do not claim ownership of your content.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/90 mb-2">4. Acceptable Use</h2>
            <p>
              You agree not to upload content that is illegal, harmful, or infringes on third-party rights.
              We reserve the right to suspend accounts that violate these terms.
              Automated or bulk usage beyond normal individual use is not permitted.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/90 mb-2">5. Payments &amp; Refunds</h2>
            <p>
              All payments are processed securely via Stripe. Prices are in USD.
              Since credits are digital goods delivered instantly upon purchase,
              the right of withdrawal (Widerrufsrecht) does not apply once credits are delivered,
              in accordance with &sect;356(5) BGB. If you experience a technical issue
              that prevents generation, contact us for resolution.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/90 mb-2">6. Limitation of Liability</h2>
            <p>
              The Service is provided &ldquo;as is&rdquo; without warranty.
              We are not liable for generated music quality, temporary unavailability,
              or any indirect damages. Our total liability is limited to the amount
              you paid in the preceding 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/90 mb-2">7. Changes</h2>
            <p>
              We may update these terms at any time. Continued use of the Service
              after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] font-medium text-white/90 mb-2">8. Contact</h2>
            <p>
              Questions? Reach us at{" "}
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
