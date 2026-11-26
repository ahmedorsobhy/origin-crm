// Origin CRM — Facebook Lead Ads → clients.
// Facebook calls this webhook when someone fills a lead form on a campaign.
// Deploy with JWT verification OFF (Facebook does not send a Supabase token):
//   supabase functions deploy fb-leads --no-verify-jwt
// Secrets: FB_VERIFY_TOKEN (any text you choose, typed again in Facebook),
//          FB_APP_SECRET (Meta app → Settings → Basic), FB_PAGE_TOKEN (long-lived page token with leads_retrieval).
// Test from the CRM: Settings → Facebook leads → "Send test lead" (admin only, uses the signed-in token).

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const VERIFY = Deno.env.get("FB_VERIFY_TOKEN") || "";
const APP_SECRET = Deno.env.get("FB_APP_SECRET") || "";
const PAGE_TOKEN = Deno.env.get("FB_PAGE_TOKEN") || "";
const GRAPH = "https://graph.facebook.com/v21.0";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" };
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

async function sb(path: string, init: RequestInit & { prefer?: string } = {}) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, { ...init, headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json", ...(init.prefer ? { Prefer: init.prefer } : {}) } });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  const t = await res.text();
  return t ? JSON.parse(t) : null;
}

// Egyptian mobile → 01XXXXXXXXX (11 digits). Anything else international keeps a leading +.
export function cleanPhone(raw: string): string | null {
  let d = String(raw || "").replace(/[^\d+]/g, "");
  if (!d) return null;
  if (d.startsWith("00")) d = "+" + d.slice(2);
  const digits = d.replace(/\D/g, "");
  if (/^(\+?20)?0?1[0125]\d{8}$/.test(d) || /^201[0125]\d{8}$/.test(digits)) return "0" + digits.slice(-10);
  if (/^01[0125]\d{8}$/.test(digits)) return digits;
  if (digits.length >= 8 && digits.length <= 15) return "+" + digits.replace(/^0+/, "");
  return null;
}
const key10 = (p: string) => p.replace(/\D/g, "").slice(-10);

async function hmacOk(body: string, sig: string | null) {
  if (!APP_SECRET || !sig?.startsWith("sha256=")) return false;
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(APP_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(body)));
  const hex = [...mac].map((b) => b.toString(16).padStart(2, "0")).join("");
  const want = sig.slice(7);
  if (hex.length !== want.length) return false;
  let diff = 0; for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ want.charCodeAt(i);
  return diff === 0;
}

async function isAdmin(auth: string) {
  const u = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: ANON, Authorization: auth } });
  if (!u.ok) return false;
  const user = await u.json();
  const p = await sb(`profiles?id=eq.${user.id}&select=role`);
  return ["admin", "ceo"].includes(p?.[0]?.role);
}

type Lead = { leadgen_id: string; name: string; phone: string | null; email?: string; campaign?: string; ad?: string; form?: string; answers: string[] };

async function fetchLead(leadgenId: string): Promise<Lead> {
  const r = await fetch(`${GRAPH}/${leadgenId}?fields=field_data,campaign_name,ad_name,form_id,created_time&access_token=${encodeURIComponent(PAGE_TOKEN)}`);
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error?.message || "Graph API error");
  const f: Record<string, string> = {};
  const answers: string[] = [];
  for (const x of j.field_data || []) {
    const v = (x.values || []).join(", ");
    f[String(x.name).toLowerCase()] = v;
    if (!["full_name", "first_name", "last_name", "phone_number", "email"].includes(String(x.name).toLowerCase())) answers.push(`${x.name}: ${v}`);
  }
  const name = f.full_name || [f.first_name, f.last_name].filter(Boolean).join(" ") || "Facebook lead";
  return { leadgen_id: leadgenId, name, phone: cleanPhone(f.phone_number || f.phone || ""), email: f.email, campaign: j.campaign_name, ad: j.ad_name, form: j.form_id, answers };
}

async function nextAssignee(): Promise<string | null> {
  const [s] = await sb("finance_settings?id=eq.1&select=lead_assignees,lead_rr_index");
  const list: string[] = s?.lead_assignees || [];
  if (!list.length) return null;
  const i = (Number(s.lead_rr_index) || 0) % list.length;
  await sb("finance_settings?id=eq.1", { method: "PATCH", body: JSON.stringify({ lead_rr_index: (i + 1) % list.length }) });
  return list[i];
}

async function saveLead(lead: Lead) {
  const seen = await sb(`fb_leads?leadgen_id=eq.${encodeURIComponent(lead.leadgen_id)}&select=leadgen_id`);
  if (seen?.length) return { status: "already" };
  if (!lead.phone) {
    await sb("fb_leads", { method: "POST", body: JSON.stringify({ leadgen_id: lead.leadgen_id, campaign: lead.campaign, ad: lead.ad, form: lead.form, status: "no_phone" }) });
    return { status: "no_phone" };
  }
  const k = key10(lead.phone);
  const owners = await sb(`clients?select=id,assigned_to,phone&phone=ilike.*${k}`);
  const owner = (owners || []).find((c: any) => key10(c.phone) === k);
  const notes = [lead.campaign && `Campaign: ${lead.campaign}`, lead.ad && `Ad: ${lead.ad}`, ...lead.answers].filter(Boolean).join("\n");
  if (owner) {
    await sb("lead_duplicates", { method: "POST", body: JSON.stringify({ existing_client_id: owner.id, phone: lead.phone, payload: { name: lead.name, source: "facebook_campaign", campaign: lead.campaign, notes }, requested_by: null, requested_for: owner.assigned_to }) });
    await sb("fb_leads", { method: "POST", body: JSON.stringify({ leadgen_id: lead.leadgen_id, client_id: owner.id, campaign: lead.campaign, ad: lead.ad, form: lead.form, status: "duplicate" }) });
    if (owner.assigned_to) await sb("notification_queue", { method: "POST", body: JSON.stringify({ user_id: owner.assigned_to, title: "Your client came again from Facebook 🔁", body: `${lead.name}${lead.campaign ? ` · ${lead.campaign}` : ""}`, url: `?open=client:${owner.id}` }) });
    return { status: "duplicate", client_id: owner.id };
  }
  const who = await nextAssignee();
  const [c] = await sb("clients", { method: "POST", prefer: "return=representation", body: JSON.stringify({ name: lead.name, phone: lead.phone, email: lead.email || null, source: "facebook_campaign", campaign: lead.campaign || null, notes: notes || null, stage: "new_lead", assigned_to: who, original_assignee: who }) });
  await sb("client_activity", { method: "POST", body: JSON.stringify({ client_id: c.id, action: "created", new_value: "new_lead", note: `Facebook lead${lead.campaign ? ` · ${lead.campaign}` : ""}`, changed_by: null }) });
  await sb("fb_leads", { method: "POST", body: JSON.stringify({ leadgen_id: lead.leadgen_id, client_id: c.id, campaign: lead.campaign, ad: lead.ad, form: lead.form, status: "added" }) });
  if (who) await sb("notification_queue", { method: "POST", body: JSON.stringify({ user_id: who, title: "New Facebook lead 🔥", body: `${lead.name}${lead.campaign ? ` · ${lead.campaign}` : ""} — call within 15 minutes`, url: `?open=client:${c.id}` }) });
  return { status: "added", client_id: c.id, assigned_to: who };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const url = new URL(req.url);
  // 1) Facebook's one-time webhook check
  if (req.method === "GET") {
    if (url.searchParams.get("hub.mode") === "subscribe" && VERIFY && url.searchParams.get("hub.verify_token") === VERIFY) return new Response(url.searchParams.get("hub.challenge") || "", { status: 200 });
    return new Response("forbidden", { status: 403 });
  }
  if (req.method !== "POST") return json({ error: "method" }, 405);
  const raw = await req.text();
  try {
    // 2) Test lead from the CRM (admin only)
    if (url.searchParams.get("test") === "1") {
      if (!(await isAdmin(req.headers.get("authorization") || ""))) return json({ error: "only admin / CEO" }, 403);
      const b = raw ? JSON.parse(raw) : {};
      const r = await saveLead({ leadgen_id: `test-${Date.now()}`, name: b.name || "Test lead (Facebook)", phone: cleanPhone(b.phone || "01000000000"), campaign: b.campaign || "Test campaign", ad: "Test ad", form: "test", answers: ["This is a test lead sent from Settings"] });
      return json(r);
    }
    // 3) Real webhook from Facebook
    if (!(await hmacOk(raw, req.headers.get("x-hub-signature-256")))) return json({ error: "bad signature" }, 401);
    const body = JSON.parse(raw);
    const results: unknown[] = [];
    for (const entry of body.entry || []) for (const ch of entry.changes || []) {
      if (ch.field !== "leadgen" || !ch.value?.leadgen_id) continue;
      const id = String(ch.value.leadgen_id);
      try { results.push(await saveLead(await fetchLead(id))); }
      catch (e) {
        try { await sb("fb_leads", { method: "POST", prefer: "resolution=ignore-duplicates", body: JSON.stringify({ leadgen_id: id, status: "error", error: String((e as Error).message).slice(0, 500) }) }); } catch (_) { /* ignore */ }
        results.push({ status: "error", id });
      }
    }
    return json({ ok: true, results }); // always 200 so Facebook doesn't retry forever
  } catch (e) {
    return json({ error: String((e as Error).message || e) }, 500);
  }
});
