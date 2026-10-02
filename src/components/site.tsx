import { Link } from "@tanstack/react-router";
import type { Item, Match } from "@/lib/items";
import { relativeDay } from "@/lib/items";

export function Header() {
  const nav = [
    { to: "/browse", label: "Browse" },
    { to: "/report-lost", label: "Report lost" },
    { to: "/report-found", label: "Report found" },
    { to: "/matches", label: "My matches" },
  ] as const;
  return (
    <header className="max-w-6xl mx-auto px-5 sm:px-8 pt-6 flex flex-wrap items-center justify-between gap-4">
      <Link to="/" className="flex items-center gap-2.5">
        <div className="size-9 rounded-[11px] bg-coral ring-1 ring-black/5 grid place-items-center font-display font-bold text-lg text-on-color">C</div>
        <span className="font-display text-lg font-bold tracking-tight">CampusFind</span>
      </Link>
      <nav className="order-3 sm:order-none w-full sm:w-auto flex items-center gap-5 sm:gap-7 text-sm font-medium text-ink/60 overflow-x-auto">
        {nav.map((n) => (
          <Link key={n.to} to={n.to} className="hover:text-ink transition-colors whitespace-nowrap" activeProps={{ className: "text-ink" }}>
            {n.label}
          </Link>
        ))}
      </nav>
      <Link to="/report-lost" className="pill bg-sky px-4 py-2 text-sm text-on-color hover:bg-sky/90">Report an item</Link>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="max-w-6xl mx-auto px-5 sm:px-8 py-10 mt-16 flex flex-wrap items-center justify-between gap-4 text-sm text-ink/50">
      <span>© {new Date().getFullYear()} CampusFind · Campus Lost &amp; Found</span>
      <div className="flex gap-5">
        <Link to="/browse" className="hover:text-ink transition-colors">Browse</Link>
        <Link to="/matches" className="hover:text-ink transition-colors">My matches</Link>
      </div>
    </footer>
  );
}

export function KindBadge({ kind }: { kind: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-black/5 ${kind === "found" ? "bg-grass text-on-color" : "bg-coral text-on-color"}`}>
      {kind === "found" ? "Found" : "Lost"}
    </span>
  );
}

export function Thumb({ item, className }: { item: Item; className: string }) {
  if (item.image_url) return <img src={item.image_url} alt={item.name} loading="lazy" className={`${className} object-cover`} />;
  return (
    <div className={`${className} bg-cream grid place-items-center`}>
      <span className="font-display text-ink/30 font-bold text-sm uppercase tracking-[0.12em]">{item.category}</span>
    </div>
  );
}

export function ItemCard({ item, i = 0 }: { item: Item; i?: number }) {
  return (
    <Link
      to="/items/$id" params={{ id: item.id }}
      className="animate-rise group rounded-2xl bg-card ring-1 ring-black/5 overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all"
      style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
    >
      <Thumb item={item} className="w-full aspect-[3/2]" />
      <div className="p-4">
        <div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold truncate">{item.name}</span><KindBadge kind={item.kind} /></div>
        <p className="mt-1 text-sm text-ink/55 truncate">{item.category} · {item.location}</p>
        <p className="mt-1 text-xs text-ink/40">{item.kind === "found" ? "Found" : "Lost"} {relativeDay(item.item_date)}</p>
      </div>
    </Link>
  );
}

export function MatchCard({ m, i = 0 }: { m: Match; i?: number }) {
  const color = m.score >= 70 ? "bg-grass" : m.score >= 50 ? "bg-sun" : "bg-sky";
  const text = m.score >= 70 ? "text-grass" : m.score >= 50 ? "text-ink" : "text-sky";
  return (
    <Link to="/items/$id" params={{ id: m.item.id }}
      className="animate-rise block rounded-2xl bg-card ring-1 ring-black/5 overflow-hidden hover:shadow-lg transition-shadow"
      style={{ animationDelay: `${i * 60}ms` }}>
      <div className="flex items-center gap-4 p-4">
        <Thumb item={m.item} className="size-16 rounded-xl shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold truncate">{m.item.name}</span>
            <span className={`text-sm font-bold ${text}`}>{m.score}%</span>
          </div>
          <p className="text-xs text-ink/50 truncate">{m.item.kind === "found" ? "Found" : "Lost"} · {m.item.location} · {relativeDay(m.item.item_date)}</p>
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="h-1.5 rounded-full bg-cream overflow-hidden"><div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${m.score}%` }} /></div>
        <p className="mt-3 label-cap">Why this matches</p>
        <ul className="mt-2 space-y-1.5 text-sm">
          {m.reasons.map((r) => (
            <li key={r.label} className={`flex items-center gap-2 ${r.ok ? "" : "text-ink/45"}`}>
              <span className={`size-4 shrink-0 rounded-full grid place-items-center text-[10px] font-bold ${r.ok ? "bg-grass/15 text-grass" : "bg-ink/10 text-ink/45"}`}>{r.ok ? "✓" : "–"}</span>
              {r.label}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Header />
      <main className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 sm:pt-14">{children}</main>
      <Footer />
    </div>
  );
}
