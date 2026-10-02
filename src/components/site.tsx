import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight, Calendar, CheckCircle2, CircleDashed, IdCard, Wallet, Laptop, BookOpen, Backpack,
  KeyRound, GlassWater, Package, MapPin, Menu, X, Search, type LucideIcon,
} from "lucide-react";
import type { Item, Match } from "@/lib/items";
import { relativeDay } from "@/lib/items";

export const CATEGORY_ICON: Record<string, LucideIcon> = {
  "ID Card": IdCard, Wallet, Electronics: Laptop, Books: BookOpen, Bag: Backpack,
  Keys: KeyRound, "Water Bottle": GlassWater, Other: Package,
};

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 shrink-0">
      <div className="relative size-9 rounded-xl bg-navy-grad grid place-items-center shadow-lg shadow-brand/25">
        <Search className="size-4 text-on-color" strokeWidth={2.75} />
        <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-found ring-2 ring-paper" />
      </div>
      <span className="font-display text-[17px] font-bold tracking-tight">Campus<span className="text-brand">Find</span></span>
    </Link>
  );
}

const NAV = [
  { to: "/browse", label: "Browse" },
  { to: "/report-lost", label: "Report Lost" },
  { to: "/report-found", label: "Report Found" },
  { to: "/matches", label: "My Matches" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-paper/75 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-6">
        <Logo />
        <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-ink/60">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="rounded-full px-3.5 py-2 hover:text-ink hover:bg-cream transition-colors"
              activeProps={{ className: "text-ink bg-cream" }}>{n.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/report-lost" className="pill hidden sm:inline-flex bg-ink px-4 py-2 text-sm text-on-color hover:bg-violet shadow-lg shadow-ink/20">
            Report an Item <ArrowRight className="size-4" />
          </Link>
          <button aria-label="Menu" onClick={() => setOpen(!open)} className="md:hidden size-10 grid place-items-center rounded-full hover:bg-cream">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="md:hidden animate-rise border-t border-border px-5 py-3 flex flex-col gap-1 bg-paper">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 font-semibold hover:bg-cream"
              activeProps={{ className: "bg-cream" }}>{n.label}</Link>
          ))}
          <Link to="/report-lost" onClick={() => setOpen(false)} className="pill mt-2 justify-center bg-ink px-4 py-2.5 text-sm text-on-color">Report an Item</Link>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-on-color">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-brand grid place-items-center"><Search className="size-4" strokeWidth={2.75} /></div>
            <span className="font-display text-lg font-bold">CampusFind</span>
          </div>
          <p className="mt-4 max-w-[36ch] text-sm text-on-color/60">The campus lost &amp; found network. Report in seconds, get matched automatically, and get your things back.</p>
        </div>
        <div className="text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-color/40 mb-4">Report</p>
          <div className="flex flex-col gap-2.5 text-on-color/75">
            <Link to="/report-lost" className="hover:text-on-color">I lost something</Link>
            <Link to="/report-found" className="hover:text-on-color">I found something</Link>
          </div>
        </div>
        <div className="text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-color/40 mb-4">Explore</p>
          <div className="flex flex-col gap-2.5 text-on-color/75">
            <Link to="/browse" className="hover:text-on-color">Browse items</Link>
            <Link to="/matches" className="hover:text-on-color">My matches</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-on-color/10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-5 text-xs text-on-color/40">© {new Date().getFullYear()} CampusFind · Built for students</div>
      </div>
    </footer>
  );
}

export function KindBadge({ kind, className = "" }: { kind: string; className?: string }) {
  const found = kind === "found";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${found ? "bg-found/12 text-found" : "bg-lost/12 text-lost"} ${className}`}>
      <span className={`size-1.5 rounded-full ${found ? "bg-found" : "bg-lost"}`} />{found ? "Found" : "Lost"}
    </span>
  );
}

export function Thumb({ item, className, iconSize = "size-10" }: { item: Item; className: string; iconSize?: string }) {
  if (item.image_url) return <img src={item.image_url} alt={item.name} loading="lazy" className={`${className} object-cover`} />;
  const Icon = CATEGORY_ICON[item.category] ?? Package;
  const found = item.kind === "found";
  return (
    <div className={`${className} grid place-items-center ${found ? "bg-gradient-to-br from-found/15 to-brand/10" : "bg-gradient-to-br from-lost/15 to-brand/10"}`}>
      <Icon className={`${iconSize} ${found ? "text-found" : "text-lost"}`} strokeWidth={1.5} />
    </div>
  );
}

export function ItemCard({ item, i = 0, score }: { item: Item; i?: number; score?: number }) {
  return (
    <Link to="/items/$id" params={{ id: item.id }}
      className="animate-rise group soft-card rounded-2xl overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
      style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
      <div className="relative overflow-hidden">
        <Thumb item={item} className="w-full aspect-[4/3] group-hover:scale-[1.03] transition-transform duration-500" />
        <KindBadge kind={item.kind} className="absolute left-3 top-3 bg-card/90 backdrop-blur" />
        {score !== undefined && (
          <span className="absolute right-3 top-3 rounded-full bg-ink/85 backdrop-blur px-2.5 py-1 text-[11px] font-bold text-on-color">{score}% match</span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/40">{item.category}</p>
        <h3 className="mt-1 font-display font-semibold truncate">{item.name}</h3>
        <div className="mt-2.5 space-y-1 text-[13px] text-ink/55">
          <p className="flex items-center gap-1.5 truncate"><MapPin className="size-3.5 shrink-0" />{item.location}</p>
          <p className="flex items-center gap-1.5"><Calendar className="size-3.5 shrink-0" />{item.kind === "found" ? "Found" : "Lost"} {relativeDay(item.item_date)}</p>
        </div>
        <span className="mt-4 pt-3 border-t border-border flex items-center justify-between text-sm font-semibold text-brand">
          View details <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
}

export function scoreTone(score: number) {
  if (score >= 70) return { label: "High confidence", bar: "bg-found", text: "text-found", ring: "var(--grass)" };
  if (score >= 50) return { label: "Medium confidence", bar: "bg-sun", text: "text-ink", ring: "var(--sun)" };
  return { label: "Possible match", bar: "bg-brand", text: "text-brand", ring: "var(--sky)" };
}

export function ScoreRing({ score, size = 132 }: { score: number; size?: number }) {
  const r = 52, c = 2 * Math.PI * r;
  const tone = scoreTone(score);
  return (
    <div className="relative animate-pop" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--cream)" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={tone.ring} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} style={{ transition: "stroke-dashoffset 1s cubic-bezier(.32,.72,0,1)" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div><div className="font-display text-3xl font-extrabold leading-none">{score}%</div><div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-ink/45">match</div></div>
      </div>
    </div>
  );
}

export function Reasons({ m }: { m: Match }) {
  return (
    <ul className="space-y-2 text-sm">
      {m.reasons.map((r) => (
        <li key={r.label} className={`flex items-center gap-2.5 ${r.ok ? "font-medium" : "text-ink/40"}`}>
          {r.ok ? <CheckCircle2 className="size-4.5 text-found shrink-0" /> : <CircleDashed className="size-4.5 shrink-0" />}
          {r.label}
        </li>
      ))}
    </ul>
  );
}

export function MatchCard({ m, i = 0 }: { m: Match; i?: number }) {
  const tone = scoreTone(m.score);
  return (
    <Link to="/items/$id" params={{ id: m.item.id }}
      className="animate-rise group block soft-card rounded-2xl overflow-hidden hover:shadow-xl transition-shadow"
      style={{ animationDelay: `${i * 60}ms` }}>
      <div className="flex items-center gap-4 p-4">
        <Thumb item={m.item} className="size-16 rounded-xl shrink-0" iconSize="size-7" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <span className="font-display font-semibold truncate">{m.item.name}</span>
            <span className={`font-display text-lg font-extrabold ${tone.text}`}>{m.score}%</span>
          </div>
          <p className="text-xs text-ink/50 truncate">{m.item.kind === "found" ? "Found" : "Lost"} · {m.item.location} · {relativeDay(m.item.item_date)}</p>
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="h-1.5 rounded-full bg-cream overflow-hidden"><div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${m.score}%` }} /></div>
        <p className="mt-3 mb-2 label-cap">Why this matches</p>
        <Reasons m={m} />
        <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-brand">View details <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" /></span>
      </div>
    </Link>
  );
}

export function PageShell({ children, bare }: { children: React.ReactNode; bare?: boolean }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Header />
      {bare ? children : <main className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 sm:pt-14">{children}</main>}
      <Footer />
    </div>
  );
}
