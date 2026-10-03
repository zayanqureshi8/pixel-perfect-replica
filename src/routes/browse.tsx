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
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Browse items</h1>
      <p className="mt-2 text-ink/55">Search every lost and found report on campus.</p>
      <div className="mt-6 search-shell rounded-2xl p-[1.5px]">
        <div className="flex items-center gap-2 rounded-[15px] bg-card pl-4 pr-2 py-2">
          <Search className="size-5 text-brand shrink-0" />
          <input aria-label="Search items" className="min-w-0 flex-1 bg-transparent py-2 text-[15px] outline-none placeholder:text-ink/40"
            placeholder="Search by name, description, place…" value={s.q ?? ""} onChange={(e) => update({ q: e.target.value || undefined })} />
          {s.q && <button aria-label="Clear search" onClick={() => update({ q: undefined })} className="size-8 grid place-items-center rounded-full hover:bg-cream"><X className="size-4" /></button>}
          <button onClick={() => setShowFilters((v) => !v)} aria-expanded={showFilters}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${showFilters ? "bg-ink text-on-color" : "bg-cream hover:bg-ink/10"}`}>
            <SlidersHorizontal className="size-4" /><span className="hidden sm:inline">Filters</span>
            {activeCount > 0 && <span className="rounded-full bg-brand px-1.5 text-[11px] text-on-color">{activeCount}</span>}
          </button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(["all", "lost", "found"] as const).map((k) => (
          <button key={k} onClick={() => update({ kind: k === "all" ? undefined : k })}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${(s.kind ?? "all") === k ? "bg-ink text-on-color" : "bg-cream text-ink/70 hover:text-ink"}`}>{k}</button>
        ))}
        {hasFilters && <button onClick={() => navigate({ search: {}, replace: true })} className="ml-auto text-sm font-semibold text-brand hover:underline">Clear all</button>}
      </div>
      {showFilters && (
        <div className="animate-rise mt-4 soft-card rounded-2xl p-4 sm:p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
      )}

      <p className="mt-6 text-sm text-ink/50">{isLoading ? "Loading…" : `${items.length} item${items.length === 1 ? "" : "s"}`}</p>
      {error && <p className="mt-4 text-destructive text-sm">Couldn't load items. Please refresh.</p>}
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading && [0, 1, 2].map((i) => <div key={i} className="rounded-3xl bg-cream aspect-[4/5] animate-pulse" />)}
        {items.map((it, i) => <ItemCard key={it.id} item={it} i={i} />)}
      </div>
      {!isLoading && items.length === 0 && (
        <div className="mt-4 rounded-2xl bg-card ring-1 ring-black/5 p-8 text-center text-ink/60">No items match these filters.</div>
      )}
    </PageShell>
  );
}
