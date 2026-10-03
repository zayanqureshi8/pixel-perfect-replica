import { createHmac, createCipheriv, createDecipheriv, createHash, randomBytes, randomInt, timingSafeEqual } from "crypto";

function secret() {
  const s = process.env["OTP_SECRET"];
  if (!s) throw new Error("Server is missing OTP_SECRET");
  return s;
}

export function hmac(purpose: string, value: string) {
  return createHmac("sha256", secret()).update(`${purpose}:${value}`).digest("hex");
}

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function newToken() {
  return randomBytes(24).toString("base64url");
}

export function newOtp() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

function key() {
  return createHash("sha256").update(`enc:${secret()}`).digest();
}

// Encrypted copy only so the DEMO delivery channel can show it to the owner's device.
export function encrypt(text: string) {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([c.update(text, "utf8"), c.final()]);
  return [iv, c.getAuthTag(), data].map((b) => b.toString("base64url")).join(".");
}

export function decrypt(payload: string) {
  const [iv, tag, data] = payload.split(".").map((p) => Buffer.from(p, "base64url"));
  const d = createDecipheriv("aes-256-gcm", key(), iv!);
  d.setAuthTag(tag!);
  return Buffer.concat([d.update(data!), d.final()]).toString("utf8");
}
