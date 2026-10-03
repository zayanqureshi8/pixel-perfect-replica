import { Star } from "lucide-react";

// There is no review system yet, so these are clearly labelled demo testimonials.
const DEMO = [
  { name: "Aarav S.", role: "2nd year, CSE", text: "Lost my ID card before an exam. The match checklist made it obvious which found report was mine.", date: "Demo", rating: 5 },
  { name: "Meera K.", role: "Final year, Design", text: "Posting a found wallet took less than a minute, and the code check meant I knew I was giving it to the right person.", date: "Demo", rating: 5 },
  { name: "Rohan P.", role: "1st year, MBA", text: "Way better than the notice board outside the library. Seeing the match percentage is really reassuring.", date: "Demo", rating: 4 },
];

export function Reviews() {
  return (
    <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-20">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-cap text-brand">Testimonials</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">What Students Say</h2>
        </div>
        <span className="rounded-full bg-sun/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-ink/70">Demo testimonials</span>
      </div>
      <div className="mt-8 grid md:grid-cols-3 gap-5">
        {DEMO.map((r) => (
          <figure key={r.name} className="soft-card rounded-3xl p-6 flex flex-col">
            <div className="flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`size-4 ${i < r.rating ? "fill-sun text-sun" : "text-ink/15"}`} />
              ))}
            </div>
            <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink/75">"{r.text}"</blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="size-10 rounded-full bg-navy-grad grid place-items-center text-sm font-bold text-on-color">{r.name[0]}</span>
              <div className="min-w-0">
                <p className="font-semibold text-sm">{r.name}</p>
                <p className="text-xs text-ink/50">{r.role} · {r.date}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
