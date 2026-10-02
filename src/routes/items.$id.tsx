import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { PageShell, MatchCard, KindBadge, Thumb } from "@/components/site";
import { fetchCandidates, fetchItem, findMatches } from "@/lib/items";

export const Route = createFileRoute("/items/$id")({
  validateSearch: z.object({ new: z.boolean().optional().catch(undefined) }),
  head: () => ({
    meta: [
      { title: "Item Details — CampusFind" },
      { name: "description", content: "Details and possible matches for a lost or found campus item." },
      { property: "og:title", content: "Item Details — CampusFind" },
      { property: "og:description", content: "Details and possible matches for a lost or found campus item." },
    ],
  }),
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const { new: isNew } = Route.useSearch();
  const { data: item, isLoading, error } = useQuery({ queryKey: ["item", id], queryFn: () => fetchItem(id) });
  const { data: candidates = [], isLoading: loadingM } = useQuery({
    queryKey: ["candidates", item?.kind], queryFn: () => fetchCandidates(item!.kind), enabled: !!item,
  });

  if (isLoading) return <PageShell><p className="text-ink/50">Loading…</p></PageShell>;
  if (error || !item) return (
    <PageShell>
      <h1 className="text-3xl font-bold">Item not found</h1>
      <Link to="/browse" className="mt-4 inline-block font-semibold text-sky">← Back to browse</Link>
    </PageShell>
  );

  const matches = findMatches(item, candidates);
  const contactIsEmail = /\S+@\S+\.\S+/.test(item.contact);

  return (
    <PageShell>
      {isNew && (
        <div className="animate-rise mb-8 rounded-2xl bg-grass/15 ring-1 ring-grass/30 px-5 py-4 text-sm font-medium">
          ✓ Your report is live. {matches.length ? `We found ${matches.length} possible match${matches.length > 1 ? "es" : ""}.` : "We'll show matches here as new reports come in."}
        </div>
      )}
      <div className="grid lg:grid-cols-2 gap-10 items-start">
        <div className="animate-rise">
          <Thumb item={item} className="w-full aspect-[4/3] rounded-2xl ring-1 ring-black/5" />
          <div className="mt-6 flex items-center gap-3"><KindBadge kind={item.kind} /><span className="text-sm text-ink/50">{item.category}</span></div>
          <h1 className="mt-3 text-4xl font-bold text-balance">{item.name}</h1>
          <p className="mt-3 text-ink/70 whitespace-pre-line">{item.description}</p>
          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-card ring-1 ring-black/5 p-5 text-sm">
            <div><dt className="label-cap">Location</dt><dd className="mt-1 font-medium">{item.location}</dd></div>
            <div><dt className="label-cap">Date {item.kind}</dt><dd className="mt-1 font-medium">{new Date(item.item_date + "T12:00:00").toLocaleDateString(undefined, { dateStyle: "medium" })}</dd></div>
            <div className="col-span-2"><dt className="label-cap">Contact</dt><dd className="mt-1 font-medium break-all">{item.contact}</dd></div>
          </dl>
          {contactIsEmail && (
            <a href={`mailto:${encodeURIComponent(item.contact)}?subject=${encodeURIComponent(`CampusFind: ${item.name}`)}`}
              className="pill mt-4 bg-sky px-5 py-2.5 text-sm text-on-color hover:bg-sky/90">Email {item.kind === "found" ? "the finder" : "the owner"}</a>
          )}
        </div>

        <div>
          <span className="inline-flex rounded-full bg-violet px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-on-color">Possible matches</span>
          <h2 className="mt-4 text-3xl font-bold">
            {loadingM ? "Checking…" : matches.length ? `${matches.length} possible match${matches.length > 1 ? "es" : ""}` : "No matches yet"}
          </h2>
          <p className="mt-2 text-ink/60 text-sm">Compared against every {item.kind === "lost" ? "found" : "lost"} report by category, location, date and description.</p>
          <div className="mt-6 space-y-4">
            {matches.slice(0, 8).map((m, i) => <MatchCard key={m.item.id} m={m} i={i} />)}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
