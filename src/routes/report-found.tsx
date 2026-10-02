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
    <PageShell>
      <div className="max-w-2xl mx-auto">
        <span className="inline-flex rounded-full bg-grass px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-on-color">Found</span>
        <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-balance">Report a found item</h1>
        <p className="mt-3 text-ink/60 mb-8">We'll check it against every lost report on campus.</p>
        <ReportForm kind="found" />
      </div>
    </PageShell>
  ),
});
