// Origin CRM — phone notifications.
// Runs every minute (pg_cron). Sends what's due, then stops. Safe to call any time:
// nothing is ever sent twice.
// Secrets needed (Supabase → Edge Functions → Secrets): VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase automatically.

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = "mailto:crm@origin-realestate.com";
const TZ = "Africa/Cairo";

// ---------- tiny database helper (service role, bypasses row security) ----------
async function sb(path: string, init: RequestInit & { prefer?: string } = {}) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json", ...(init.prefer ? { Prefer: init.prefer } : {}) },
  });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  const t = await res.text();
  return t ? JSON.parse(t) : null;
}

// ---------- Web Push (RFC 8291 + VAPID), WebCrypto only ----------
export const b64u = {
  enc: (b: Uint8Array) => btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""),
  dec: (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), (c) => c.charCodeAt(0)),
};
const te = new TextEncoder();
const cat = (...a: Uint8Array[]) => { const o = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let i = 0; for (const x of a) { o.set(x, i); i += x.length; } return o; };
async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, len: number) {
  const k = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, k, len * 8));
}
export async function vapidHeader(endpoint: string, publicKey: string, privateKey: string, subject: string) {
  const pub = b64u.dec(publicKey);
  const jwk = { kty: "EC", crv: "P-256", x: b64u.enc(pub.slice(1, 33)), y: b64u.enc(pub.slice(33, 65)), d: privateKey, ext: true };
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const head = b64u.enc(te.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const body = b64u.enc(te.encode(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: subject })));
  const sig = new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, te.encode(`${head}.${body}`)));
  return `vapid t=${head}.${body}.${b64u.enc(sig)}, k=${publicKey}`;
}
export async function encryptPayload(p256dh: string, authSecret: string, payload: string) {
  const ua = b64u.dec(p256dh), auth = b64u.dec(authSecret);
  const eph = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const asPub = new Uint8Array(await crypto.subtle.exportKey("raw", eph.publicKey));
  const uaKey = await crypto.subtle.importKey("raw", ua, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, eph.privateKey, 256));
  const ikm = await hkdf(auth, shared, cat(te.encode("WebPush: info\0"), ua, asPub), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, te.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, te.encode("Content-Encoding: nonce\0"), 12);
  const k = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, k, cat(te.encode(payload), new Uint8Array([2]))));
  const rs = new Uint8Array([0, 0, 16, 0]); // record size 4096
  return cat(salt, rs, new Uint8Array([asPub.length]), asPub, ct);
}
async function pushTo(sub: { endpoint: string; p256dh: string; auth: string }, msg: object) {
  const body = await encryptPayload(sub.p256dh, sub.auth, JSON.stringify(msg));
  return fetch(sub.endpoint, {
    method: "POST",
    headers: {
      Authorization: await vapidHeader(sub.endpoint, VAPID_PUBLIC, VAPID_PRIVATE, VAPID_SUBJECT),
      "Content-Encoding": "aes128gcm", "Content-Type": "application/octet-stream", TTL: "86400", Urgency: "high",
    },
    body,
  });
}
async function send(userId: string, title: string, body: string, url: string) {
  const subs = await sb(`push_subscriptions?user_id=eq.${userId}&select=id,endpoint,p256dh,auth`);
  let ok = 0;
  for (const s of subs || []) {
    try {
      const r = await pushTo(s, { title, body, url });
      if (r.status === 404 || r.status === 410) await sb(`push_subscriptions?id=eq.${s.id}`, { method: "DELETE" });
      else if (r.ok) ok++;
      else console.log("push failed", r.status, await r.text());
    } catch (e) { console.log("push error", String(e)); }
  }
  return ok;
}
// Send a scheduled reminder only once per key
async function once(userId: string, key: string, title: string, body: string, url: string) {
  const rows = await sb("notification_log?on_conflict=user_id,key", {
    method: "POST", body: JSON.stringify({ user_id: userId, key }), prefer: "resolution=ignore-duplicates,return=representation",
  });
  if (rows && rows.length) await send(userId, title, body, url);
}

// ---------- Cairo time ----------
function cairoNow() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short", hour12: false })
    .formatToParts(new Date()).map((p) => [p.type, p.value]));
  const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
  return { date: `${parts.year}-${parts.month}-${parts.day}`, dow, minutes: (Number(parts.hour) % 24) * 60 + Number(parts.minute) };
}
const cairoDate = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));
const cairoTime = (iso: string) => new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
const first = (name: string) => String(name || "").trim().split(/\s+/)[0] || "there";

async function run() {
  const now = cairoNow();
  const [settings] = (await sb("finance_settings?id=eq.1&select=late_after,work_days,late_lead_hours,auto_reassign")) || [{}];
  const workDays: number[] = settings?.work_days?.length ? settings.work_days : [0, 1, 2, 3, 4];
  const [lh, lm] = String(settings?.late_after || "11:00").split(":").map(Number);
  const cutoff = lh * 60 + lm;
  const isWorkDay = workDays.includes(now.dow);
  const people = await sb("profiles?select=id,name,role&role=neq.pending");
  const nowIso = new Date().toISOString();

  // 1) Check-in reminder, 5 minutes before the cutoff
  if (isWorkDay && now.minutes >= cutoff - 5 && now.minutes < cutoff) {
    const since = new Date(Date.now() - 20 * 3600 * 1000).toISOString();
    const att = await sb(`attendance?select=user_id,checked_in_at&checked_in_at=gte.${since}`);
    const inToday = new Set((att || []).filter((a: any) => cairoDate(a.checked_in_at) === now.date).map((a: any) => a.user_id));
    for (const p of people.filter((p: any) => !["admin", "ceo"].includes(p.role) && !inToday.has(p.id))) {
      await once(p.id, `att:${now.date}`, `${first(p.name)}, you haven't checked in yet ⏰`, `5 minutes left before ${settings?.late_after || "11:00"} — check in now`, "?open=attendance");
    }
  }

  // 2) Follow-ups that just became due
  const dueFrom = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const due = await sb(`clients?select=id,name,phone,assigned_to,next_action,next_action_at&next_action_done=eq.false&next_action_at=lte.${nowIso}&next_action_at=gt.${dueFrom}&stage=not.in.(closed,deal_done)`);
  for (const c of due || []) {
    if (!c.assigned_to) continue;
    await once(c.assigned_to, `fu:${c.id}:${c.next_action_at}`, `Time to follow up: ${c.name}`, `${c.next_action || "Follow up"}${c.phone ? ` · ${c.phone}` : ""}`, `?open=client:${c.id}`);
  }

  // 3) Meetings in about an hour
  const mFrom = new Date(Date.now() + 55 * 60 * 1000).toISOString(), mTo = new Date(Date.now() + 65 * 60 * 1000).toISOString();
  const meetings = await sb(`clients?select=id,name,assigned_to,meeting_at&stage=eq.meeting_generated&meeting_at=gte.${mFrom}&meeting_at=lt.${mTo}`);
  for (const c of meetings || []) {
    if (!c.assigned_to) continue;
    await once(c.assigned_to, `mt:${c.id}:${c.meeting_at}`, `Meeting in 1 hour: ${c.name}`, `At ${cairoTime(c.meeting_at)} — get ready`, `?open=client:${c.id}`);
  }

  // 4) Morning brief for admin / CEO at 10:00 on work days
  if (isWorkDay && now.minutes >= 600 && now.minutes < 605) {
    const dayAgo = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const [leads, acts, deals, pending, overdue] = await Promise.all([
      sb(`clients?select=id&created_at=gte.${dayAgo}`),
      sb(`client_activity?select=action,new_value&changed_at=gte.${dayAgo}`),
      sb(`deals?select=id&created_at=gte.${dayAgo}`),
      sb(`deals?select=id&status=in.(pending,returned)`),
      sb(`clients?select=id&next_action_done=eq.false&next_action_at=lt.${nowIso}&stage=not.in.(closed,deal_done)`),
    ]);
    const contacts = (acts || []).filter((a: any) => ["call", "whatsapp", "unit_sent"].includes(a.action)).length;
    const meetingsBooked = (acts || []).filter((a: any) => a.action === "stage_change" && a.new_value === "meeting_generated").length;
    const body = `Last 24h: ${leads.length} new leads · ${contacts} calls & chats · ${meetingsBooked} meetings · ${deals.length} deals. Now: ${pending.length} waiting for approval · ${overdue.length} overdue follow-ups`;
    for (const p of people.filter((p: any) => ["admin", "ceo"].includes(p.role))) {
      await once(p.id, `brief:${now.date}`, `Good morning ${first(p.name)} ☀️`, body, "?open=today");
    }
  }

  // 5) Late leads: a new lead nobody touched after N hours → tell the sales person and their manager,
  //    and (if the admin turned it on) move it to the least-busy colleague in the same team. Once per lead.
  if (now.minutes >= 9 * 60 && now.minutes < 22 * 60) {
    const hours = Number(settings?.late_lead_hours) || 2;
    const olderThan = new Date(Date.now() - hours * 3600 * 1000).toISOString();
    const notBefore = new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString();
    const leads = await sb(`clients?select=id,name,assigned_to,created_at&stage=eq.new_lead&created_at=lte.${olderThan}&created_at=gte.${notBefore}&limit=300`);
    if (leads && leads.length) {
      const ids = leads.map((c: any) => c.id).join(",");
      const acts = await sb(`client_activity?select=client_id,action&client_id=in.(${ids})&action=neq.created`);
      const touched = new Set((acts || []).map((a: any) => a.client_id));
      const byId = Object.fromEntries(people.map((p: any) => [p.id, p]));
      const all = await sb("profiles?select=id,name,role,manager_id&role=neq.pending");
      const mgrOf = (id: string) => all.find((p: any) => p.id === id)?.manager_id;
      const openLoad = settings?.auto_reassign ? await sb("clients?select=assigned_to&stage=not.in.(closed,deal_done)") : [];
      const load: Record<string, number> = {};
      (openLoad || []).forEach((c: any) => { load[c.assigned_to] = (load[c.assigned_to] || 0) + 1; });
      for (const c of leads.filter((c: any) => c.assigned_to && !touched.has(c.id))) {
        const key = `late:${c.id}`;
        const fresh = await sb("notification_log?on_conflict=user_id,key", { method: "POST", body: JSON.stringify({ user_id: c.assigned_to, key }), prefer: "resolution=ignore-duplicates,return=representation" });
        if (!fresh || !fresh.length) continue;
        const owner = byId[c.assigned_to];
        const mgr = mgrOf(c.assigned_to);
        const mates = settings?.auto_reassign && mgr ? all.filter((p: any) => p.role === "sales_agent" && p.manager_id === mgr && p.id !== c.assigned_to) : [];
        if (mates.length) {
          mates.sort((a: any, b: any) => (load[a.id] || 0) - (load[b.id] || 0));
          const to = mates[0];
          load[to.id] = (load[to.id] || 0) + 1;
          await sb(`clients?id=eq.${c.id}`, { method: "PATCH", body: JSON.stringify({ assigned_to: to.id }) });
          await sb("client_activity", { method: "POST", body: JSON.stringify({ client_id: c.id, action: "field_update", field_name: "assigned_to", old_value: owner?.name || "—", new_value: to.name, note: `Not contacted within ${hours}h — moved automatically from ${owner?.name || "—"} to ${to.name}` }) });
          await send(to.id, `New lead for you: ${c.name}`, `Moved to you — ${owner ? first(owner.name) : "the first sales person"} didn't reach them in ${hours}h. Call now 📞`, `?open=client:${c.id}`);
          await send(c.assigned_to, `Lead moved: ${c.name}`, `Not contacted within ${hours}h, so it went to ${to.name}`, `?open=client:${c.id}`);
          if (mgr) await send(mgr, `Lead moved: ${c.name}`, `${owner?.name || "Sales"} didn't contact it in ${hours}h → now with ${to.name}`, `?open=client:${c.id}`);
        } else {
          await send(c.assigned_to, `Lead waiting ${hours}h+: ${c.name}`, "Nobody called this lead yet — call now 📞", `?open=client:${c.id}`);
          if (mgr) await send(mgr, `Late lead: ${c.name}`, `${owner?.name || "Sales"} hasn't contacted it for ${hours}h+`, `?open=client:${c.id}`);
        }
      }
    }
  }

  // 6) Weekly backup — Sunday ~03:00 Cairo, kept in the private "backups" bucket (last 8)
  if (now.dow === 0 && now.minutes >= 180 && now.minutes < 185) {
    const fresh = await sb("notification_log?on_conflict=user_id,key", { method: "POST", body: JSON.stringify({ user_id: people[0]?.id, key: `backup:${now.date}` }), prefer: "resolution=ignore-duplicates,return=representation" });
    if (fresh && fresh.length) await backup(now.date);
  }

  // 7) Everything the database queued (new lead, deal sent, deal approved…)
  const queued = await sb("notification_queue?select=id,user_id,title,body,url&sent_at=is.null&order=created_at&limit=200");
  for (const q of queued || []) {
    await sb(`notification_queue?id=eq.${q.id}`, { method: "PATCH", body: JSON.stringify({ sent_at: new Date().toISOString() }) });
    await send(q.user_id, q.title, q.body || "", q.url || "");
  }
  return { queued: (queued || []).length };
}

export const BACKUP_TABLES = ["profiles", "developers", "projects", "units", "unit_owners", "unit_sales", "clients", "client_activity", "client_units", "client_projects", "lead_duplicates", "deals", "deal_agents", "deal_rates",
  "finance_transactions", "finance_accounts", "expense_categories", "recurring_expenses", "staff_targets", "staff_salaries", "commission_rates", "finance_settings",
  "attendance", "cold_sheets", "cold_leads", "cold_activity", "campaign_spend", "share_links", "finance_audit"];
async function dumpAll() {
  const out: Record<string, unknown[]> = {};
  for (const t of BACKUP_TABLES) {
    const rows: unknown[] = [];
    try {
      for (let from = 0; ; from += 1000) {
        const res = await fetch(`${SB_URL}/rest/v1/${t}?select=*`, { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, Range: `${from}-${from + 999}` } });
        if (!res.ok) break;
        const part = await res.json();
        rows.push(...part);
        if (part.length < 1000) break;
      }
    } catch (_) { /* table missing — skip */ }
    out[t] = rows;
  }
  return out;
}
async function backup(date: string) {
  const data = await dumpAll();
  const body = JSON.stringify({ made_at: new Date().toISOString(), tables: data });
  const st = (path: string, init: RequestInit) => fetch(`${SB_URL}/storage/v1/${path}`, { ...init, headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json", "x-upsert": "true", ...(init.headers || {}) } });
  const up = await st(`object/backups/backup-${date}.json`, { method: "POST", body });
  if (!up.ok) throw new Error(`backup upload: ${up.status} ${await up.text()}`);
  const list = await (await st("object/list/backups", { method: "POST", body: JSON.stringify({ prefix: "", limit: 100, sortBy: { column: "name", order: "desc" } }) })).json();
  const old = (list || []).map((f: any) => f.name).filter((n: string) => /^backup-/.test(n)).sort().reverse().slice(8);
  if (old.length) await st("object/backups", { method: "DELETE", body: JSON.stringify({ prefixes: old }) });
}

Deno.serve(async () => {
  try { return new Response(JSON.stringify(await run()), { headers: { "Content-Type": "application/json" } }); }
  catch (e) { console.log(String(e)); return new Response(JSON.stringify({ error: String(e) }), { status: 500 }); }
});
