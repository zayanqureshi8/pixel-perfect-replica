import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Reviews } from "@/components/Reviews";
import { ArrowRight, ClipboardList, Sparkles, Handshake, Inbox, Link2, PackageCheck, MapPin, ShieldCheck } from "lucide-react";
import hero from "@/assets/hero-campus.png";
import { PageShell, ItemCard } from "@/components/site";
import { fetchItems, findMatches } from "@/lib/items";

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

const CHIPS = ["All", "Lost", "Found"] as const;

function Home() {
  const { data = [], isLoading } = useQuery({ queryKey: ["items"], queryFn: fetchItems });
  const [chip, setChip] = useState<(typeof CHIPS)[number]>("All");
  const found = data.filter((i) => i.kind === "found");
  const lost = data.filter((i) => i.kind === "lost");
  const matchedLost = lost.filter((l) => findMatches(l, found, 50).length > 0).length;
  const recent = data.filter((i) => chip === "All" || i.kind === chip.toLowerCase()).slice(0, 6);
  const latest = data.slice(0, 2);

  const stats = [
    { icon: Inbox, label: "Items Reported", value: data.length, tone: "text-brand bg-brand/10" },
    { icon: Link2, label: "Possible Matches", value: matchedLost, tone: "text-found bg-found/10" },
    { icon: PackageCheck, label: "Found Items Waiting", value: found.length, tone: "text-lost bg-lost/10" },
  ];

  return (
    <PageShell bare>
      {/* HERO */}
      <section className="bg-hero relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-16 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 animate-rise">
            <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold text-ink/70">
              <Sparkles className="size-3.5 text-brand" /> Smart matching for your campus
            </span>
            <h1 className="mt-6 text-[2.75rem] sm:text-6xl leading-[1.02] font-extrabold tracking-tight text-balance">
              Lost something? <span className="text-grad">Your campus</span> can help you find it.
            </h1>
            <p className="mt-6 text-lg text-ink/60 text-pretty max-w-[48ch]">
              CampusFind connects people who lose things with people who find them. Post a report in under a minute — we compare it against every report on campus and show you the best matches.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/report-lost" className="pill bg-lost px-6 py-3.5 text-base text-on-color shadow-xl shadow-lost/30 hover:brightness-105">I Lost Something <ArrowRight className="size-4" /></Link>
              <Link to="/report-found" className="pill bg-found px-6 py-3.5 text-base text-on-color shadow-xl shadow-found/30 hover:brightness-105">I Found Something <ArrowRight className="size-4" /></Link>
            </div>
            <div className="mt-8 flex items-center gap-2 text-sm text-ink/50"><ShieldCheck className="size-4 text-found" /> Free for all students · No sign-up needed</div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="absolute inset-10 rounded-full bg-brand/20 blur-3xl" />
            <img src={hero} alt="Illustration of a campus lost and found kiosk surrounded by items" width={1024} height={1024} fetchPriority="high" className="relative w-full max-w-[540px] mx-auto aspect-square" />
            {latest[0] && <FloatCard item={latest[0]} className="left-0 top-[12%]" delay="200ms" />}
            {latest[1] && <FloatCard item={latest[1]} className="right-0 bottom-[14%]" delay="350ms" />}
            {!latest.length && (
              <div className="glass absolute right-2 bottom-[12%] rounded-2xl px-4 py-3">
                <p className="text-xs font-semibold text-ink/50">How matches are scored</p>
                <p className="font-display font-bold text-found">Same location · Similar date</p>
              </div>
            )}
          </div>
        </div>

        {/* STATS */}
        <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-16 grid sm:grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <div key={s.label} className="glass animate-rise rounded-2xl p-5 flex items-center gap-4" style={{ animationDelay: `${150 + i * 80}ms` }}>
              <div className={`size-12 rounded-xl grid place-items-center ${s.tone}`}><s.icon className="size-5.5" /></div>
              <div>
                <div className="font-display text-3xl font-extrabold leading-none">{isLoading ? "—" : s.value}</div>
                <div className="mt-1 text-sm text-ink/55">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-20">
        <p className="label-cap text-brand">How CampusFind works</p>
        <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight max-w-[22ch]">Three steps from "where is it?" to "got it back."</h2>
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {[
            { icon: ClipboardList, t: "Report it", d: "Describe the item, where and when — add a photo if you have one." },
            { icon: Sparkles, t: "Get matched", d: "We score every opposite report on category, location, date and description." },
            { icon: Handshake, t: "Verified handover", d: "The finder confirms the owner with a one-time code before handing the item back." },
          ].map((s, i) => (
            <div key={s.t} className="soft-card relative rounded-2xl p-6 overflow-hidden">
              <span className="absolute right-5 top-3 font-display text-7xl font-extrabold text-cream">{i + 1}</span>
              <div className="relative size-12 rounded-xl bg-navy-grad grid place-items-center text-on-color shadow-lg shadow-brand/25"><s.icon className="size-5" /></div>
              <h3 className="relative mt-5 text-xl font-bold">{s.t}</h3>
              <p className="relative mt-2 text-sm text-ink/60">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* RECENT */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-cap text-brand">Live feed</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Recent Lost &amp; Found</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-full bg-cream p-1">
              {CHIPS.map((c) => (
                <button key={c} onClick={() => setChip(c)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${chip === c ? "bg-card shadow text-ink" : "text-ink/55 hover:text-ink"}`}>{c}</button>
              ))}
            </div>
            <Link to="/browse" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand hover:gap-2 transition-all">Browse all <ArrowRight className="size-4" /></Link>
          </div>
        </div>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading && [0, 1, 2].map((i) => <div key={i} className="rounded-2xl bg-cream aspect-[4/5] animate-pulse" />)}
          {recent.map((it, i) => <ItemCard key={it.id} item={it} i={i} />)}
        </div>
        {!isLoading && recent.length === 0 && (
          <div className="mt-8 soft-card rounded-2xl p-10 text-center text-ink/60">
            No reports here yet. <Link to="/report-found" className="font-semibold text-brand">Be the first to post one.</Link>
          </div>
        )}
      </section>

      <Reviews />

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-20">
        <div className="bg-navy-grad relative overflow-hidden rounded-3xl px-7 py-12 sm:px-12 sm:py-16 text-on-color">
          <div className="absolute -right-16 -bottom-24 size-72 rounded-full bg-found/30 blur-3xl" />
          <div className="relative grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">Found something that isn't yours?</h2>
              <p className="mt-3 text-on-color/70 max-w-[46ch]">Thirty seconds of your time could save someone's whole week. Post it and we'll find the owner.</p>
            </div>
            <div className="flex flex-wrap md:justify-end gap-3">
              <Link to="/report-found" className="pill bg-card px-6 py-3.5 text-ink hover:bg-cream">Report a found item <ArrowRight className="size-4" /></Link>
              <Link to="/browse" className="pill bg-on-color/10 px-6 py-3.5 text-on-color ring-on-color/20 hover:bg-on-color/20">Browse items</Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function FloatCard({ item, className, delay }: { item: { name: string; kind: string; location: string }; className: string; delay: string }) {
  const found = item.kind === "found";
  return (
    <div className={`glass absolute hidden sm:flex items-center gap-3 rounded-2xl px-4 py-3 max-w-[230px] animate-rise ${className}`} style={{ animationDelay: delay }}>
      <span className={`size-9 shrink-0 rounded-xl grid place-items-center ${found ? "bg-found/15 text-found" : "bg-lost/15 text-lost"}`}><MapPin className="size-4" /></span>
      <div className="min-w-0">
        <p className={`text-[10px] font-bold uppercase tracking-wider ${found ? "text-found" : "text-lost"}`}>{found ? "Just found" : "Just lost"}</p>
        <p className="text-sm font-semibold truncate">{item.name}</p>
        <p className="text-xs text-ink/50 truncate">{item.location}</p>
      </div>
    </div>
  );
}
