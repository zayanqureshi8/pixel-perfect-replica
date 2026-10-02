import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Tag, MapPin, Calendar, AlignLeft, ImagePlus, Mail, Loader2, ArrowRight, X, AlertCircle, type LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, addMyReportId, uploadImage, type ItemKind } from "@/lib/items";
import { CATEGORY_ICON } from "@/components/site";

const schema = z.object({
  name: z.string().trim().min(1, "Add an item name").max(120),
  category: z.enum(CATEGORIES),
  description: z.string().trim().min(5, "Describe it in a few words").max(1000),
  location: z.string().trim().min(2, "Where was it?").max(120),
  item_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  contact: z.string().trim().min(3, "Add a way to reach you").max(160),
});

function Section({ n, title, sub, done, children }: { n: number; title: string; sub: string; done: boolean; children: React.ReactNode }) {
  return (
    <section className="soft-card rounded-2xl p-5 sm:p-7 animate-rise" style={{ animationDelay: `${n * 70}ms` }}>
      <div className="flex items-start gap-3 mb-5">
        <span className={`size-8 shrink-0 rounded-full grid place-items-center text-sm font-bold transition-colors ${done ? "bg-found text-on-color" : "bg-cream text-ink/60"}`}>{done ? "✓" : n}</span>
        <div><h2 className="text-lg font-bold">{title}</h2><p className="text-sm text-ink/50">{sub}</p></div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ icon: Icon, label, error, children }: { icon: LucideIcon; label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label-cap">{label}</span>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 size-4 text-ink/35" />
        {children}
      </div>
      {error && <span className="mt-1.5 flex items-center gap-1 text-xs font-medium text-destructive"><AlertCircle className="size-3.5" />{error}</span>}
    </label>
  );
}

export function ReportForm({ kind }: { kind: ItemKind }) {
  const lost = kind === "lost";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ name: "", category: "Other", description: "", location: "", item_date: today, contact: "" });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: "" }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFail("");
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[String(i.path[0])] = i.message; });
      setErrors(errs);
      return;
    }
    if (parsed.data.item_date > today) { setErrors({ item_date: "Date can't be in the future" }); return; }
    setErrors({});
    setBusy(true);
    try {
      const image_url = file ? await uploadImage(file) : null;
      const { data, error } = await supabase.from("items").insert({ ...parsed.data, kind, image_url }).select("id").single();
      if (error) throw error;
      addMyReportId(data.id);
      qc.invalidateQueries({ queryKey: ["items"] });
      navigate({ to: "/items/$id", params: { id: data.id }, search: { new: true } });
    } catch (err) {
      setFail(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  const step1 = form.name.trim().length > 0 && form.description.trim().length >= 5;
  const step2 = form.location.trim().length >= 2 && !!form.item_date;
  const step3 = form.contact.trim().length >= 3;
  const progress = [step1, step2, step3].filter(Boolean).length;
  const ic = "field !pl-9";

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-cream overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${lost ? "bg-lost" : "bg-found"}`} style={{ width: `${(progress / 3) * 100}%` }} />
        </div>
        <span className="text-xs font-semibold text-ink/50">{progress}/3 complete</span>
      </div>

      <Section n={1} title="The item" sub="What it is and what makes it recognisable." done={step1}>
        <Field icon={Tag} label={lost ? "What did you lose?" : "What did you find?"} error={errors.name}>
          <input className={ic} maxLength={120} placeholder="e.g. Blue Hydro Flask bottle" value={form.name} onChange={set("name")} />
        </Field>
        <div>
          <span className="label-cap">Category</span>
          <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICON[c];
              const on = form.category === c;
              return (
                <button type="button" key={c} onClick={() => setForm((f) => ({ ...f, category: c }))}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${on ? "bg-ink text-on-color shadow-lg shadow-ink/20" : "bg-cream text-ink/70 hover:text-ink"}`}>
                  <Icon className="size-4 shrink-0" /><span className="truncate">{c}</span>
                </button>
              );
            })}
          </div>
        </div>
        <Field icon={AlignLeft} label="Description" error={errors.description}>
          <textarea className={`${ic} min-h-28 !pt-2.5`} maxLength={1000} placeholder="Colour, brand, stickers, scratches, anything distinctive…" value={form.description} onChange={set("description")} />
        </Field>
      </Section>

      <Section n={2} title="Where & when" sub="Location and date help us score matches." done={step2}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field icon={MapPin} label="Location" error={errors.location}>
            <input className={ic} maxLength={120} placeholder="e.g. Main Library, 2nd floor" value={form.location} onChange={set("location")} />
          </Field>
          <Field icon={Calendar} label={lost ? "Date lost" : "Date found"} error={errors.item_date}>
            <input type="date" max={today} className={ic} value={form.item_date} onChange={set("item_date")} />
          </Field>
        </div>
      </Section>

      <Section n={3} title="Photo & contact" sub="A photo is optional but makes matching much easier." done={step3}>
        <div>
          <span className="label-cap">Photo (optional)</span>
          {preview ? (
            <div className="relative mt-1.5 overflow-hidden rounded-xl">
              <img src={preview} alt="Preview" className="w-full max-h-64 object-cover animate-pop" />
              <button type="button" aria-label="Remove photo" onClick={() => { setFile(null); setPreview(null); }}
                className="absolute right-3 top-3 size-8 rounded-full glass grid place-items-center hover:scale-105 transition"><X className="size-4" /></button>
            </div>
          ) : (
            <label className="mt-1.5 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/15 bg-cream/60 py-8 cursor-pointer hover:border-brand/50 hover:bg-brand/5 transition">
              <ImagePlus className="size-7 text-brand" />
              <span className="text-sm font-semibold">Click to upload a photo</span>
              <span className="text-xs text-ink/45">JPG or PNG, up to 5MB</span>
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                if (f && f.size > 5 * 1024 * 1024) { setErrors({ image: "Photo must be under 5MB" }); return; }
                setErrors((x) => ({ ...x, image: "" }));
                setFile(f); setPreview(f ? URL.createObjectURL(f) : null);
              }} />
            </label>
          )}
          {errors.image && <span className="mt-1.5 flex items-center gap-1 text-xs font-medium text-destructive"><AlertCircle className="size-3.5" />{errors.image}</span>}
        </div>
        <Field icon={Mail} label="Contact" error={errors.contact}>
          <input className={ic} maxLength={160} placeholder="you@campus.edu or phone" value={form.contact} onChange={set("contact")} />
        </Field>
        <p className="text-xs text-ink/45">Your contact details are shown on the report so the other person can reach you.</p>
      </Section>

      {fail && <p className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"><AlertCircle className="size-4" />{fail}</p>}
      <button disabled={busy} className={`pill w-full justify-center py-4 text-base text-on-color disabled:opacity-60 shadow-xl ${lost ? "bg-lost shadow-lost/25" : "bg-found shadow-found/25"} hover:brightness-105`}>
        {busy ? <><Loader2 className="size-5 animate-spin" /> Posting your report…</> : <>Post report &amp; find matches <ArrowRight className="size-5" /></>}
      </button>
    </form>
  );
}
