import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site";
import { ReportForm } from "@/components/ReportForm";

export const Route = createFileRoute("/report-lost")({
  head: () => ({
    meta: [
      { title: "Report a Lost Item — CampusFind" },
      { name: "description", content: "Tell us what you lost and we'll match it against found items on campus." },
      { property: "og:title", content: "Report a Lost Item — CampusFind" },
      { property: "og:description", content: "Tell us what you lost and we'll match it against found items on campus." },
    ],
  }),
  component: () => (
    <PageShell>
      <div className="max-w-2xl mx-auto">
        <span className="inline-flex rounded-full bg-coral px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-on-color">Lost</span>
        <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-balance">Report a lost item</h1>
        <p className="mt-3 text-ink/60 mb-8">We'll match it against everything already turned in.</p>
        <ReportForm kind="lost" />
      </div>
    </PageShell>
  ),
});
