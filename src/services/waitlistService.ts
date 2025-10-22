import { z } from "zod";

const emailSchema = z.string().email();

const API_BASE = import.meta.env.VITE_WAITLIST_API_BASE || "https://waitlist-6bl6.onrender.com";

export interface WaitlistPayload {
  email: string;
}

export interface WaitlistEntry {
  id: number;
  email: string;
  created_at: string;
  is_active: boolean;
}

export async function joinWaitlist(payload: WaitlistPayload): Promise<WaitlistEntry> {
  const email = (payload.email || "").trim().toLowerCase();
  emailSchema.parse(email);

  const res = await fetch(`${API_BASE}/waitlist/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(err || "Failed to join waitlist");
  }
  return res.json();
}

export async function getWaitlistCount(): Promise<number> {
  const res = await fetch(`${API_BASE}/waitlist/count`, { headers: { Accept: "application/json" } });
  if (!res.ok) return 0;
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    // Fallback: try text and parse number
    const txt = await res.text().catch(() => "0");
    const n = Number.parseInt(String(txt).replace(/[^0-9]/g, ""), 10);
    return Number.isFinite(n) ? n : 0;
  }
  // Normalize a variety of shapes
  const tryKeys = (obj: any): number | null => {
    if (obj == null) return null;
    if (typeof obj === "number") return obj;
    if (typeof obj === "string") {
      const n = Number.parseInt(obj, 10);
      return Number.isFinite(n) ? n : null;
    }
    if (typeof obj === "object") {
      const candidates = [obj.count, obj.total, obj.size, obj.length, obj?.data?.count, obj?.data?.total];
      for (const c of candidates) {
        const v = tryKeys(c);
        if (v != null) return v;
      }
    }
    return null;
  };
  const v = tryKeys(data);
  return v ?? 0;
}

export async function isEmailInWaitlist(email: string): Promise<boolean> {
  const safe = (email || "").trim().toLowerCase();
  emailSchema.parse(safe);
  const res = await fetch(`${API_BASE}/waitlist/check/${encodeURIComponent(safe)}`);
  if (!res.ok) return false;
  const data = await res.json().catch(() => ({}));
  return Boolean((data as any).exists ?? data === true);
}