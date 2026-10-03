import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Item = Database["public"]["Tables"]["items"]["Row"];
export type ItemKind = "lost" | "found";

export const CATEGORIES = [
  "ID Card", "Wallet", "Electronics", "Books", "Bag", "Keys", "Water Bottle", "Other",
] as const;

export async function fetchItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from("items").select("*").order("created_at", { ascending: false }).limit(500);
  if (error) throw error;
  return data ?? [];
}

export async function fetchItem(id: string): Promise<Item | null> {
  const { data, error } = await supabase.from("items").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchCandidates(kind: ItemKind): Promise<Item[]> {
  const { data, error } = await supabase
    .from("items").select("*").eq("kind", kind === "lost" ? "found" : "lost").limit(500);
  if (error) throw error;
  return data ?? [];
}

export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("item-images").upload(path, file, { contentType: file.type });
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage
    .from("item-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
  if (e2 || !data) throw e2 ?? new Error("Could not get image link");
  return data.signedUrl;
}

// --- "My reports" stored on this device (no accounts) ---
const KEY = "campusfind:my-reports";
export function getMyReportIds(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
const TOK = "campusfind:tokens";
export function getItemToken(id: string): string | null {
  if (typeof window === "undefined") return null;
  try { return (JSON.parse(localStorage.getItem(TOK) || "{}") as Record<string, string>)[id] ?? null; } catch { return null; }
}
export function saveItemToken(id: string, token: string) {
  let m: Record<string, string> = {};
  try { m = JSON.parse(localStorage.getItem(TOK) || "{}"); } catch { /* reset corrupt store */ }
  m[id] = token;
  localStorage.setItem(TOK, JSON.stringify(m));
}

/** Downscale large photos in the browser before upload (keeps aspect ratio). */
export async function resizeImage(file: File, max = 1600): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < 1.5 * 1024 * 1024) { bmp.close(); return file; }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale); canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    return blob ? new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }) : file;
  } catch (err) {
    console.warn("Image resize skipped:", err);
    return file;
  }
}

export function addMyReportId(id: string) {
  const ids = getMyReportIds().filter((x) => x !== id);
  localStorage.setItem(KEY, JSON.stringify([id, ...ids]));
}

// --- Matching ---
const STOP = new Set(["the","a","an","and","or","of","in","on","at","to","with","my","is","it","for","near","by","from","was","i","has","have","its","this","that"]);
function tokens(s: string): Set<string> {
  return new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((t) => t.length > 1 && !STOP.has(t)));
}
function overlap(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let n = 0;
  a.forEach((t) => { if (b.has(t)) n++; });
  return n / Math.min(a.size, b.size);
}

export type Match = {
  item: Item;
  score: number;
  reasons: { label: string; ok: boolean }[];
};

export function scoreMatch(a: Item, b: Item): Match {
  const sameCat = a.category === b.category;
  const la = a.location.trim().toLowerCase(), lb = b.location.trim().toLowerCase();
  const locSim = la === lb ? 1 : la.includes(lb) || lb.includes(la) ? 0.85 : overlap(tokens(la), tokens(lb));
  const days = Math.abs(new Date(a.item_date).getTime() - new Date(b.item_date).getTime()) / 86400000;
  const dateSim = days <= 2 ? 1 : days >= 14 ? 0 : 1 - (days - 2) / 12;
  const descSim = Math.min(1, overlap(tokens(`${a.name} ${a.description}`), tokens(`${b.name} ${b.description}`)) * 1.4);

  const score = Math.round((sameCat ? 40 : 0) + locSim * 25 + dateSim * 15 + descSim * 20);
  return {
    item: b,
    score,
    reasons: [
      { label: "Same category", ok: sameCat },
      { label: "Same location", ok: locSim >= 0.5 },
      { label: "Similar date", ok: dateSim >= 0.5 },
      { label: "Similar description", ok: descSim >= 0.35 },
    ],
  };
}

export function findMatches(item: Item, candidates: Item[], min = 35): Match[] {
  return candidates
    .filter((c) => c.kind !== item.kind && c.id !== item.id)
    .map((c) => scoreMatch(item, c))
    .filter((m) => m.score >= min)
    .sort((x, y) => y.score - x.score);
}

export function relativeDay(d: string) {
  const diff = Math.round((Date.now() - new Date(d + "T12:00:00").getTime()) / 86400000);
  if (diff <= 0) return "today";
  if (diff === 1) return "yesterday";
  if (diff < 7) return `${diff} days ago`;
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
