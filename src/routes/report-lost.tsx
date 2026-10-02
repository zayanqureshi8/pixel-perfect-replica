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
    <PageShell bare>
      <div className="bg-hero">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-12 pb-6 animate-rise">
          <span className="inline-flex rounded-full bg-lost/12 text-lost px-3 py-1 text-xs font-bold uppercase tracking-[0.12em]">Lost item</span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-balance">Report a lost item</h1>
          <p className="mt-3 text-ink/60">Tell us what's missing. We'll instantly compare it with everything turned in on campus.</p>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-4"><ReportForm kind="lost" /></div>
    </PageShell>
  ),
});
