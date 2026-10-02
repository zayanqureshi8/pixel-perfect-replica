import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { PageShell, ItemCard } from "@/components/site";
import { CATEGORIES, fetchItems } from "@/lib/items";

const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  kind: z.enum(["all", "lost", "found"]).optional().catch(undefined),
  category: z.string().optional().catch(undefined),
  location: z.string().optional().catch(undefined),
  from: z.string().optional().catch(undefined),
  to: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/browse")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Browse Lost & Found Items — CampusFind" },
      { name: "description", content: "Search every lost and found report on campus by category, location and date." },
      { property: "og:title", content: "Browse Lost & Found Items — CampusFind" },
      { property: "og:description", content: "Search every lost and found report on campus by category, location and date." },
    ],
  }),
  component: Browse,
});

function Browse() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/browse" });
  const { data = [], isLoading, error } = useQuery({ queryKey: ["items"], queryFn: fetchItems });
  const update = (patch: Partial<z.infer<typeof searchSchema>>) =>
    navigate({ search: (p) => ({ ...p, ...patch }), replace: true });

  const q = (s.q ?? "").toLowerCase();
  const loc = (s.location ?? "").toLowerCase();
  const items = data.filter((i) =>
    (!s.kind || s.kind === "all" || i.kind === s.kind) &&
    (!s.category || i.category === s.category) &&
    (!loc || i.location.toLowerCase().includes(loc)) &&
    (!s.from || i.item_date >= s.from) &&
    (!s.to || i.item_date <= s.to) &&
    (!q || `${i.name} ${i.description} ${i.location} ${i.category}`.toLowerCase().includes(q)));

  const hasFilters = !!(s.q || (s.kind && s.kind !== "all") || s.category || s.location || s.from || s.to);

  return (
    <PageShell>
      <h1 className="text-4xl sm:text-5xl font-extrabold">Browse items</h1>
      <div className="mt-6 rounded-2xl bg-card ring-1 ring-black/5 p-4 sm:p-5 space-y-4">
        <input className="field !mt-0" placeholder="Search by name, description, place…" value={s.q ?? ""} onChange={(e) => update({ q: e.target.value || undefined })} />
        <div className="flex flex-wrap gap-2">
          {(["all", "lost", "found"] as const).map((k) => (
            <button key={k} onClick={() => update({ kind: k === "all" ? undefined : k })}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${(s.kind ?? "all") === k ? "bg-ink text-on-color" : "bg-cream text-ink/70 ring-1 ring-black/5 hover:text-ink"}`}>{k}</button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label><span className="label-cap">Category</span>
            <select className="field" value={s.category ?? ""} onChange={(e) => update({ category: e.target.value || undefined })}>
              <option value="">All categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select></label>
          <label><span className="label-cap">Location</span>
            <input className="field" placeholder="e.g. Library" value={s.location ?? ""} onChange={(e) => update({ location: e.target.value || undefined })} /></label>
          <label><span className="label-cap">From</span>
            <input type="date" className="field" value={s.from ?? ""} onChange={(e) => update({ from: e.target.value || undefined })} /></label>
          <label><span className="label-cap">To</span>
            <input type="date" className="field" value={s.to ?? ""} onChange={(e) => update({ to: e.target.value || undefined })} /></label>
        </div>
        {hasFilters && <button onClick={() => navigate({ search: {}, replace: true })} className="text-sm font-semibold text-sky hover:underline">Clear filters</button>}
      </div>

      <p className="mt-6 text-sm text-ink/50">{isLoading ? "Loading…" : `${items.length} item${items.length === 1 ? "" : "s"}`}</p>
      {error && <p className="mt-4 text-destructive text-sm">Couldn't load items. Please refresh.</p>}
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((it, i) => <ItemCard key={it.id} item={it} i={i} />)}
      </div>
      {!isLoading && items.length === 0 && (
        <div className="mt-4 rounded-2xl bg-card ring-1 ring-black/5 p-8 text-center text-ink/60">No items match these filters.</div>
      )}
    </PageShell>
  );
}
