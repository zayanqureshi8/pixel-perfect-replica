import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { PageShell, MatchCard, KindBadge } from "@/components/site";
import { fetchItems, findMatches, getMyReportIds } from "@/lib/items";

export const Route = createFileRoute("/matches")({
  head: () => ({
    meta: [
      { title: "My Matches — CampusFind" },
      { name: "description", content: "See possible matches for the items you've reported." },
      { property: "og:title", content: "My Matches — CampusFind" },
      { property: "og:description", content: "See possible matches for the items you've reported." },
    ],
  }),
  component: Matches,
});

function Matches() {
  const [ids, setIds] = useState<string[] | null>(null);
  useEffect(() => setIds(getMyReportIds()), []);
  const { data = [], isLoading } = useQuery({ queryKey: ["items"], queryFn: fetchItems });
  const mine = (ids ?? []).map((id) => data.find((d) => d.id === id)).filter((x): x is NonNullable<typeof x> => !!x);

  return (
    <PageShell>
      <h1 className="text-4xl sm:text-5xl font-extrabold">My matches</h1>
      <p className="mt-3 text-ink/60 max-w-[52ch]">Reports you've posted from this device, with the best possible matches for each.</p>

      {(ids === null || isLoading) && <p className="mt-8 text-ink/50">Loading…</p>}
      {ids !== null && !isLoading && mine.length === 0 && (
        <div className="mt-8 rounded-2xl bg-card ring-1 ring-black/5 p-8 text-center">
          <p className="text-ink/60">You haven't reported anything yet.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link to="/report-lost" className="pill bg-coral px-5 py-2.5 text-sm text-on-color">I lost something</Link>
            <Link to="/report-found" className="pill bg-sky px-5 py-2.5 text-sm text-on-color">I found something</Link>
          </div>
        </div>
      )}

      <div className="mt-10 space-y-12">
        {mine.map((item) => {
          const matches = findMatches(item, data).slice(0, 3);
          return (
            <section key={item.id}>
              <div className="flex flex-wrap items-center gap-3">
                <KindBadge kind={item.kind} />
                <Link to="/items/$id" params={{ id: item.id }} className="font-display text-2xl font-bold hover:underline">{item.name}</Link>
                <span className="text-sm text-ink/50">{item.location}</span>
              </div>
              {matches.length === 0
                ? <p className="mt-3 text-sm text-ink/50">No likely matches yet — check back soon.</p>
                : <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-5">{matches.map((m, i) => <MatchCard key={m.item.id} m={m} i={i} />)}</div>}
            </section>
          );
        })}
      </div>
    </PageShell>
  );
}
