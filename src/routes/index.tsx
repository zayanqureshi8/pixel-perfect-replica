import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import hero from "@/assets/hero.jpg";
import { PageShell, ItemCard } from "@/components/site";
import { fetchItems } from "@/lib/items";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CampusFind — Campus Lost & Found" },
      { name: "description", content: "Report lost or found items on campus and get instant match scores." },
      { property: "og:title", content: "CampusFind — Campus Lost & Found" },
      { property: "og:description", content: "Report lost or found items on campus and get instant match scores." },
    ],
  }),
  component: Home,
});

const CHIPS = ["All", "Electronics", "Bag", "Keys", "Books", "Wallet", "ID Card"];

function Home() {
  const { data = [], isLoading } = useQuery({ queryKey: ["items"], queryFn: fetchItems });
  const [chip, setChip] = useState("All");
  const found = data.filter((i) => i.kind === "found");
  const recent = found.filter((i) => chip === "All" || i.category === chip).slice(0, 6);
  const lost = data.length - found.length;

  return (
    <PageShell>
      <section className="grid lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7 animate-rise">
          <span className="inline-flex items-center gap-2 rounded-full bg-cream px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink/60 ring-1 ring-black/5">Lost &amp; found</span>
          <h1 className="mt-5 text-5xl sm:text-6xl leading-none font-extrabold text-balance max-w-[20ch]">Lost something on campus? Let's find it.</h1>
          <p className="mt-5 text-base sm:text-lg text-ink/60 text-pretty max-w-[46ch]">Report in seconds, then match against what people have already turned in — with a clear score and a checklist for every match.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/report-lost" className="pill bg-coral px-6 py-3 text-base text-on-color hover:bg-coral/90">I lost something</Link>
            <Link to="/report-found" className="pill bg-sky px-6 py-3 text-base text-on-color hover:bg-sky/90">I found something</Link>
          </div>
          <div className="mt-9 flex flex-wrap gap-6 text-sm text-ink/55">
            <span><b className="font-display text-2xl text-ink">{data.length}</b> reports</span>
            <span><b className="font-display text-2xl text-ink">{found.length}</b> found</span>
            <span><b className="font-display text-2xl text-ink">{lost}</b> lost</span>
          </div>
        </div>
        <div className="lg:col-span-5 animate-rise" style={{ animationDelay: "100ms" }}>
          <img src={hero} alt="Backpack left on a library stairwell" width={896} height={896} className="w-full aspect-square object-cover rounded-[18px] ring-1 ring-black/5" />
        </div>
      </section>

      <section className="pt-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl font-bold text-balance">Recently turned in</h2>
          <Link to="/browse" className="text-sm font-semibold text-sky hover:underline">See all →</Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {CHIPS.map((c) => (
            <button key={c} onClick={() => setChip(c)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${chip === c ? "bg-ink text-on-color" : "bg-cream text-ink/70 ring-1 ring-black/5 hover:text-ink"}`}>{c}</button>
          ))}
        </div>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading && [0, 1, 2].map((i) => <div key={i} className="rounded-2xl bg-cream aspect-[4/3] animate-pulse" />)}
          {recent.map((it, i) => <ItemCard key={it.id} item={it} i={i} />)}
        </div>
        {!isLoading && recent.length === 0 && (
          <div className="mt-6 rounded-2xl bg-card ring-1 ring-black/5 p-8 text-center text-ink/60">
            Nothing turned in here yet. <Link to="/report-found" className="font-semibold text-sky">Found something? Report it.</Link>
          </div>
        )}
      </section>
    </PageShell>
  );
}
