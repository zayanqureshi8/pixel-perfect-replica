import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site";
import { ReportForm } from "@/components/ReportForm";

export const Route = createFileRoute("/report-found")({
  head: () => ({
    meta: [
      { title: "Report a Found Item — CampusFind" },
      { name: "description", content: "Found something on campus? Report it and we'll find its owner." },
      { property: "og:title", content: "Report a Found Item — CampusFind" },
      { property: "og:description", content: "Found something on campus? Report it and we'll find its owner." },
    ],
  }),
  component: () => (
    <PageShell bare>
      <div className="bg-hero">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-12 pb-6 animate-rise">
          <span className="inline-flex rounded-full bg-found/12 text-found px-3 py-1 text-xs font-bold uppercase tracking-[0.12em]">Found item</span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-balance">Report a found item</h1>
          <p className="mt-3 text-ink/60">Thanks for helping out. We'll check it against every lost report so the owner can reach you.</p>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-4"><ReportForm kind="found" /></div>
    </PageShell>
  ),
});
