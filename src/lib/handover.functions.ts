import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CATEGORIES, scoreMatch, type Item } from "./items";

const OTP_TTL_MIN = 15;
const MIN_SCORE = 35;

const uuid = z.string().uuid();
const token = z.string().min(20).max(100);

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function checkToken(itemId: string, tok: string) {
  const { hmac, safeEqual } = await import("./handover.server");
  const db = await admin();
  const { data } = await db.from("item_secrets").select("token_hash").eq("item_id", itemId).maybeSingle();
  return !!data && safeEqual(data.token_hash, hmac("item-token", tok));
}

type HandoverRow = {
  id: string; status: string; otp_expires_at: string | null; attempts: number; max_attempts: number;
  lost_item_id: string; found_item_id: string; match_score: number;
};
function toPublic(h: HandoverRow) {
  return {
    id: h.id, status: h.status, expiresAt: h.otp_expires_at, attemptsLeft: Math.max(0, h.max_attempts - h.attempts),
    lostItemId: h.lost_item_id, foundItemId: h.found_item_id, matchScore: h.match_score,
  };
}
export type PublicHandover = ReturnType<typeof toPublic>;
const PUB_COLS = "id,status,otp_expires_at,attempts,max_attempts,lost_item_id,found_item_id,match_score";

export const createItem = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({
    kind: z.enum(["lost", "found"]),
    name: z.string().trim().min(1).max(120),
    category: z.enum(CATEGORIES),
    description: z.string().trim().min(5).max(1000),
    location: z.string().trim().min(2).max(120),
    item_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    contact: z.string().trim().min(3).max(160),
    image_url: z.string().url().max(2000).nullable(),
  }).parse(d))
  .handler(async ({ data }) => {
    const { hmac, newToken } = await import("./handover.server");
    const db = await admin();
    const { data: row, error } = await db.from("items").insert(data).select("id").single();
    if (error) throw new Error(error.message);
    const tok = newToken();
    const { error: e2 } = await db.from("item_secrets").insert({ item_id: row.id, token_hash: hmac("item-token", tok) });
    if (e2) throw new Error(e2.message);
    return { id: row.id, token: tok };
  });

export const getHandover = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ itemId: uuid }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: rows } = await db.from("handovers").select(PUB_COLS)
      .or(`lost_item_id.eq.${data.itemId},found_item_id.eq.${data.itemId}`)
      .neq("status", "cancelled").order("updated_at", { ascending: false }).limit(1);
    return rows?.[0] ? toPublic(rows[0]) : null;
  });

export const startHandover = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ foundItemId: uuid, lostItemId: uuid, token }).parse(d))
  .handler(async ({ data }) => {
    if (!(await checkToken(data.foundItemId, data.token))) throw new Error("Only the person who reported this found item can start a handover.");
    const db = await admin();
    const { data: items } = await db.from("items").select("*").in("id", [data.foundItemId, data.lostItemId]);
    const found = items?.find((i) => i.id === data.foundItemId) as Item | undefined;
    const lost = items?.find((i) => i.id === data.lostItemId) as Item | undefined;
    if (!found || !lost || found.kind !== "found" || lost.kind !== "lost") throw new Error("These items can't be paired.");
    if (found.status === "returned" || lost.status === "returned") throw new Error("This item has already been returned.");
    const { data: other } = await db.from("handovers").select("id,lost_item_id").eq("found_item_id", found.id)
      .in("status", ["awaiting_verification", "handover_requested"]).neq("lost_item_id", lost.id);
    if (other?.length) throw new Error("A handover with another owner is already in progress for this item.");
    const score = scoreMatch(found, lost).score;
    if (score < MIN_SCORE) throw new Error("This match is too weak to start a handover.");

    const { hmac, newOtp, encrypt } = await import("./handover.server");
    const otp = newOtp();
    const expires = new Date(Date.now() + OTP_TTL_MIN * 60_000).toISOString();
    const { data: existing } = await db.from("handovers").select("id")
      .eq("lost_item_id", lost.id).eq("found_item_id", found.id).maybeSingle();
    const id = existing?.id ?? crypto.randomUUID();
    const { data: h, error } = await db.from("handovers").upsert({
      id, lost_item_id: lost.id, found_item_id: found.id, match_score: score,
      status: "awaiting_verification", otp_hash: hmac(`otp:${id}`, otp), otp_cipher: encrypt(otp),
      otp_expires_at: expires, attempts: 0, used_at: null, updated_at: new Date().toISOString(),
    }).select(PUB_COLS).single();
    if (error) throw new Error(error.message);
    await db.from("items").update({ status: "awaiting_verification" }).in("id", [lost.id, found.id]);
    return toPublic(h);
  });

// DEMO delivery channel: only the device holding the LOST item's private token can read the code.
export const getOwnerCode = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ handoverId: uuid, token }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: h } = await db.from("handovers").select("lost_item_id,status,otp_cipher,otp_expires_at").eq("id", data.handoverId).maybeSingle();
    if (!h) throw new Error("Handover not found.");
    if (!(await checkToken(h.lost_item_id, data.token))) throw new Error("Only the owner can view this code.");
    if (h.status !== "awaiting_verification" || !h.otp_cipher) return { code: null, status: h.status, expiresAt: h.otp_expires_at };
    if (h.otp_expires_at && new Date(h.otp_expires_at) < new Date()) return { code: null, status: "expired", expiresAt: h.otp_expires_at };
    const { decrypt } = await import("./handover.server");
    return { code: decrypt(h.otp_cipher), status: h.status, expiresAt: h.otp_expires_at };
  });

export const verifyOtp = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ handoverId: uuid, token, code: z.string().regex(/^\d{6}$/) }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: h } = await db.from("handovers").select("*").eq("id", data.handoverId).maybeSingle();
    if (!h) throw new Error("Handover not found.");
    if (!(await checkToken(h.found_item_id, data.token))) throw new Error("Only the finder's device can confirm this handover.");
    const left = () => Math.max(0, h.max_attempts - h.attempts);
    if (h.status === "returned" || h.used_at) return { result: "used" as const, attemptsLeft: 0 };
    if (!h.otp_hash || !h.otp_expires_at || new Date(h.otp_expires_at) < new Date()) return { result: "expired" as const, attemptsLeft: left() };
    if (h.attempts >= h.max_attempts) return { result: "locked" as const, attemptsLeft: 0 };

    const { hmac, safeEqual } = await import("./handover.server");
    if (!safeEqual(h.otp_hash, hmac(`otp:${h.id}`, data.code))) {
      const attempts = h.attempts + 1;
      await db.from("handovers").update({ attempts, updated_at: new Date().toISOString() }).eq("id", h.id);
      return { result: attempts >= h.max_attempts ? "locked" as const : "wrong" as const, attemptsLeft: Math.max(0, h.max_attempts - attempts) };
    }
    const now = new Date().toISOString();
    await db.from("handovers").update({ status: "returned", used_at: now, otp_hash: null, otp_cipher: null, updated_at: now }).eq("id", h.id);
    await db.from("items").update({ status: "returned" }).in("id", [h.lost_item_id, h.found_item_id]);
    return { result: "ok" as const, attemptsLeft: left() };
  });
