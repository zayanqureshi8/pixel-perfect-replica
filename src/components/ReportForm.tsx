import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, addMyReportId, uploadImage, type ItemKind } from "@/lib/items";

const schema = z.object({
  name: z.string().trim().min(1, "Add an item name").max(120),
  category: z.enum(CATEGORIES),
  description: z.string().trim().min(5, "Describe it in a few words").max(1000),
  location: z.string().trim().min(2, "Where was it?").max(120),
  item_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  contact: z.string().trim().min(3, "Add a way to reach you").max(160),
});

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

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

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

  const Err = ({ k }: { k: string }) => errors[k] ? <span className="mt-1 block text-xs text-destructive">{errors[k]}</span> : null;

  return (
    <form onSubmit={submit} className="animate-rise rounded-2xl bg-card ring-1 ring-black/5 p-5 sm:p-7" noValidate>
      <div className="space-y-4">
        <label className="block"><span className="label-cap">{lost ? "What did you lose?" : "What did you find?"}</span>
          <input className="field" maxLength={120} placeholder="e.g. Blue water bottle" value={form.name} onChange={set("name")} /><Err k="name" /></label>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block"><span className="label-cap">Category</span>
            <select className="field" value={form.category} onChange={set("category")}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select></label>
          <label className="block"><span className="label-cap">{lost ? "Date lost" : "Date found"}</span>
            <input type="date" max={today} className="field" value={form.item_date} onChange={set("item_date")} /><Err k="item_date" /></label>
        </div>
        <label className="block"><span className="label-cap">Where?</span>
          <input className="field" maxLength={120} placeholder="e.g. Main Library, 2nd floor" value={form.location} onChange={set("location")} /><Err k="location" /></label>
        <label className="block"><span className="label-cap">Description</span>
          <textarea className="field min-h-28" maxLength={1000} placeholder="Colour, brand, stickers, anything distinctive…" value={form.description} onChange={set("description")} /><Err k="description" /></label>
        <div>
          <span className="label-cap">Photo (optional)</span>
          <label className="mt-1 flex items-center gap-4 rounded-lg bg-cream ring-1 ring-black/5 p-3 cursor-pointer hover:ring-sky/40 transition">
            {preview ? <img src={preview} alt="Preview" className="size-16 rounded-lg object-cover" /> : <div className="size-16 rounded-lg bg-paper grid place-items-center text-ink/30 text-2xl">+</div>}
            <span className="text-sm text-ink/60">{file ? file.name : "Tap to add a photo (max 5MB)"}</span>
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              if (f && f.size > 5 * 1024 * 1024) { setErrors({ image: "Photo must be under 5MB" }); return; }
              setErrors((x) => ({ ...x, image: "" }));
              setFile(f); setPreview(f ? URL.createObjectURL(f) : null);
            }} />
          </label>
          <Err k="image" />
        </div>
        <label className="block"><span className="label-cap">Contact</span>
          <input className="field" maxLength={160} placeholder="you@campus.edu or phone" value={form.contact} onChange={set("contact")} /><Err k="contact" /></label>
      </div>
      {fail && <p className="mt-4 text-sm text-destructive">{fail}</p>}
      <button disabled={busy} className={`pill mt-6 w-full justify-center py-3 text-sm text-on-color disabled:opacity-60 ${lost ? "bg-coral hover:bg-coral/90" : "bg-sky hover:bg-sky/90"}`}>
        {busy ? "Posting…" : "Post report & find matches"}
      </button>
    </form>
  );
}
