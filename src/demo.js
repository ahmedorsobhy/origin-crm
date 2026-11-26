// Demo mode for Guest accounts.
// A guest never reads company data: every database call from the app is answered here, in the browser,
// from the sample data below. Sign-in calls still go to Supabase. Changes live in memory and vanish on reload.
// (On the server a guest is treated like a pending account, so even without this file it would see nothing.)
export const DEMO_KEY = "origin_demo";

export function startDemo(meId, supabaseUrl) {
  if (window.__ORIGIN_DEMO) return;
  window.__ORIGIN_DEMO = true;
  const realFetch = window.fetch.bind(window);
  const ids = { me: meId, tl: "demo-tl", s1: "demo-s1", s2: "demo-s2", s3: "demo-s3" };
  let n = 0; const uid = () => "demo-" + (++n) + "-" + Math.random().toString(36).slice(2, 7);
  const now = new Date(); const cm = now.getMonth(); const y = now.getFullYear();
  const iso = (m, d, h = 12) => new Date(y, m, d, h).toISOString();
  const daysAgo = (k, h = 12) => { const d = new Date(); d.setDate(d.getDate() - k); d.setHours(h, 0, 0, 0); return d.toISOString(); };
  const day = (k) => daysAgo(k).slice(0, 10);
  const qStart = Math.floor(cm / 3) * 3;

  const unit = (id, p, type, extra) => ({ id, project_id: p, type, status: "active", photos: [], listing_type: "sale", created_by: ids.s1, created_at: daysAgo(20), updated_at: daysAgo(3), ...extra });
  const client = (id, name, phone, stage, who, extra) => ({ id, name, phone, stage, assigned_to: who, created_by: who, qualified: true, source: "Facebook", created_at: daysAgo(12), updated_at: daysAgo(1), ...extra });
  const lead = (id, sheet, name, phone, status, pos, extra) => ({ id, sheet_id: sheet, assigned_to: ids.s1, owner_name: name, phone, project_name: "Palm Gardens", status, attempts: status === "new" ? 0 : 1, position: pos, ...extra });

  const D = {
    profiles: [
      { id: ids.me, name: "Demo Manager", role: "ceo", manager_id: null },
      { id: ids.tl, name: "Youssef (Team leader)", role: "team_leader", manager_id: ids.me },
      { id: ids.s1, name: "Sara", role: "sales_agent", manager_id: ids.tl },
      { id: ids.s2, name: "Kareem", role: "sales_agent", manager_id: ids.tl },
      { id: ids.s3, name: "Nour", role: "sales_agent", manager_id: ids.me },
    ],
    developers: [{ id: "dev1", name: "Sample Developer A" }, { id: "dev2", name: "Sample Developer B" }],
    projects: [
      { id: "p1", name: "Palm Gardens", developer_id: "dev1", destination: "Sheikh Zayed" },
      { id: "p2", name: "Sunset Hills", developer_id: "dev2", destination: "6th of October" },
      { id: "p3", name: "Lake Residence", developer_id: "dev1", destination: "Sheikh Zayed" },
    ],
    units: [
      unit("u1", "p1", "Apartment", { bedrooms: 3, bathrooms: 2, bua: 165, floor: 2, finishing: "Fully Finished", total_price: 9500000, downpayment: 4000000, remaining: 5500000, delivery_date: "Ready To Move", unit_number: "A-12", owner_name: "Sample Owner 1", owner_number: "01000000001" }),
      unit("u2", "p1", "Villa", { bedrooms: 5, bathrooms: 4, bua: 320, land_area: 450, finishing: "Core & Shell", total_price: 28000000, downpayment: 12000000, remaining: 16000000, delivery_date: "1 Year", unit_number: "V-7", owner_name: "Sample Owner 2", owner_number: "01000000002" }),
      unit("u3", "p2", "Twin House", { bedrooms: 4, bathrooms: 3, bua: 260, finishing: "Semi Finished", total_price: 17500000, delivery_date: "2 Years", unit_number: "T-3", owner_name: "Sample Owner 3", owner_number: "01000000003" }),
      unit("u4", "p2", "Apartment", { bedrooms: 2, bathrooms: 2, bua: 120, floor: 1, finishing: "Fully Finished", listing_type: "rent", rent_price: 35000, furnished: "Furnished", delivery_date: "Ready To Move", unit_number: "R-9", owner_name: "Sample Owner 4", owner_number: "01000000004", description: "Furnished flat, garden view" }),
      unit("u5", "p3", "Duplex", { bedrooms: 4, bathrooms: 3, bua: 230, finishing: "Fully Finished", total_price: 14200000, delivery_date: "Ready To Move", unit_number: "D-21", owner_name: "Sample Owner 5", owner_number: "01000000005" }),
      unit("u6", "p3", "Apartment", { bedrooms: 3, bathrooms: 2, bua: 150, floor: 4, finishing: "Fully Finished", total_price: 8200000, delivery_date: "Ready To Move", unit_number: "B-44", owner_name: "Sample Owner 6", owner_number: "01000000006", status: "sold", sold_at: daysAgo(15), sold_via: "us" }),
    ],
    unit_owners: [],
    unit_sales: [{ unit_id: "u1", sales_id: ids.s1 }, { unit_id: "u2", sales_id: ids.s2 }, { unit_id: "u3", sales_id: ids.s1 }, { unit_id: "u4", sales_id: ids.s3 }, { unit_id: "u5", sales_id: ids.s2 }, { unit_id: "u6", sales_id: ids.s1 }],
    clients: [
      client("c1", "Sample Client — Mona", "01100000001", "negotiation", ids.s1, { budget: 10000000 }),
      client("c2", "Sample Client — Hany", "01100000002", "deal_done", ids.s1, { budget: 8500000 }),
      client("c3", "Sample Client — Laila", "01100000003", "meeting_generated", ids.s2, { budget: 18000000 }),
      client("c4", "Sample Client — Omar", "01100000004", "new_lead", ids.s2, { created_at: daysAgo(0, 10) }),
      client("c5", "Sample Client — Dina", "01100000005", "follow_up", ids.s3, { interest: "rent", budget: 40000 }),
      client("c6", "Sample Client — Tarek", "01100000006", "new_lead", ids.s3, { created_at: daysAgo(1, 15) }),
    ],
    client_activity: [
      { id: "ca1", client_id: "c1", action: "stage_change", old_value: "meeting_generated", new_value: "negotiation", changed_by: ids.s1, changed_at: daysAgo(2) },
      { id: "ca2", client_id: "c1", action: "note", note: "Liked A-12, asking for a small discount", changed_by: ids.s1, changed_at: daysAgo(1) },
      { id: "ca3", client_id: "c3", action: "call", changed_by: ids.s2, changed_at: daysAgo(0, 11) },
    ],
    client_projects: [], client_units: [{ client_id: "c1", unit_id: "u1" }, { client_id: "c2", unit_id: "u6" }],
    lead_duplicates: [], share_links: [], campaign_spend: [], contracts: [], unit_activity: [], notification_log: [],
    cold_sheets: [
      { id: "sh1", name: "Palm Gardens owners", assigned_to: ids.s1, due_date: day(0), status: "active", created_at: daysAgo(1) },
      { id: "sh2", name: "Sunset Hills owners", assigned_to: ids.s2, due_date: day(1), status: "active", created_at: daysAgo(3) },
    ],
    cold_leads: [
      lead("cl1", "sh1", "Sample Owner A", "01200000001", "new", 0),
      lead("cl2", "sh1", "Sample Owner B", "01200000002", "no_answer", 1),
      lead("cl3", "sh1", "Sample Owner C", "01200000003", "selling", 2, { unit_pending: true }),
      lead("cl4", "sh1", "Sample Owner D", "01200000004", "call_later", 3, { callback_at: daysAgo(-1, 13) }),
      lead("cl5", "sh1", "Sample Owner E", "01200000005", "new", 4),
      lead("cl6", "sh2", "Sample Owner F", "01200000006", "not_selling", 0, { assigned_to: ids.s2, project_name: "Sunset Hills" }),
      lead("cl7", "sh2", "Sample Owner G", "01200000007", "new", 1, { assigned_to: ids.s2, project_name: "Sunset Hills" }),
    ],
    cold_activity: [
      { id: "co1", lead_id: "cl2", user_id: ids.s1, action: "outcome", value: "no_answer", created_at: daysAgo(0, 10) },
      { id: "co2", lead_id: "cl3", user_id: ids.s1, action: "outcome", value: "selling", created_at: daysAgo(0, 11) },
      { id: "co3", lead_id: "cl6", user_id: ids.s2, action: "outcome", value: "not_selling", created_at: daysAgo(1, 12) },
    ],
    cold_dnc: [],
    attendance: [
      { id: "at1", user_id: ids.s1, checked_in_at: daysAgo(0, 9) }, { id: "at2", user_id: ids.s2, checked_in_at: daysAgo(0, 10) },
      { id: "at3", user_id: ids.tl, checked_in_at: daysAgo(0, 9) }, { id: "at4", user_id: ids.s1, checked_in_at: daysAgo(1, 9) },
    ],
    finance_settings: [{ id: 1, tier_thresholds: [0, 70, 100], charity_pct: 0, charity_account_id: null, default_sale_commission_pct: 2.5, default_rent_commission_months: 1, late_after: "11:00", work_days: [0, 1, 2, 3, 4] }],
    finance_accounts: [{ id: "acc-cash", name: "Cash", archived: false, created_at: iso(0, 1) }, { id: "acc-bank", name: "Bank", archived: false, created_at: iso(0, 2) }],
    expense_categories: [{ id: "cat-rent", name: "Office rent", archived: false }, { id: "cat-ads", name: "Ads", archived: false }],
    recurring_expenses: [{ id: "rec1", name: "Office rent", category_id: "cat-rent", default_amount: 25000, archived: false }],
    staff_targets: [{ user_id: ids.s1, quarterly_target: 1000000 }, { user_id: ids.s2, quarterly_target: 1000000 }, { user_id: ids.s3, quarterly_target: 800000 }, { user_id: ids.tl, quarterly_target: 2000000 }],
    staff_salaries: [{ user_id: ids.s1, monthly_salary: 10000 }, { user_id: ids.s2, monthly_salary: 10000 }, { user_id: ids.s3, monthly_salary: 9000 }],
    commission_rates: [
      { seller_id: ids.s1, beneficiary_id: ids.s1, rates: [40, 45, 50] }, { seller_id: ids.s1, beneficiary_id: ids.tl, rates: [7, 8, 8] }, { seller_id: ids.s1, beneficiary_id: ids.me, rates: [5, 5, 6] },
      { seller_id: ids.s2, beneficiary_id: ids.s2, rates: [40, 45, 50] }, { seller_id: ids.s2, beneficiary_id: ids.tl, rates: [7, 8, 8] },
      { seller_id: ids.s3, beneficiary_id: ids.s3, rates: [40, 45, 50] },
    ],
    deals: [
      { id: "deal1", unit_id: "u6", client_id: "c2", unit_label: "Apartment · B-44 · Lake Residence", client_label: "Sample Client — Hany", sale_price: 8200000, sides: "both", commission_buyer: 123000, commission_seller: 82000, commission_total: 205000, commission_collected: 205000, deal_date: iso(qStart, 5).slice(0, 10), done_at: iso(qStart, 5), status: "approved", transfer_date: iso(qStart, 5).slice(0, 10), created_by: ids.s1, created_at: iso(qStart, 5) },
      { id: "deal2", unit_id: "u1", client_id: "c1", unit_label: "Apartment · A-12 · Palm Gardens", client_label: "Sample Client — Mona", sale_price: 9500000, sides: "seller", commission_buyer: 0, commission_seller: 237500, commission_total: 237500, commission_collected: 0, deal_date: day(2), status: "pending", created_by: ids.s1, created_at: daysAgo(2) },
    ],
    deal_agents: [{ deal_id: "deal1", agent_id: ids.s1, split_pct: 100, side: "buyer" }, { deal_id: "deal1", agent_id: ids.s1, split_pct: 100, side: "seller" }, { deal_id: "deal2", agent_id: ids.s1, split_pct: 100, side: "seller" }],
    deal_rates: [{ deal_id: "deal1", agent_id: ids.s1, beneficiary_id: ids.s1, level: 0, rates: [40, 45, 50] }, { deal_id: "deal1", agent_id: ids.s1, beneficiary_id: ids.tl, level: 1, rates: [7, 8, 8] }],
    finance_transactions: [
      { id: "t0", kind: "adjustment", direction: "in", amount: 150000, account_id: "acc-cash", occurred_at: iso(0, 1), description: "Opening balance", created_at: iso(0, 1) },
      { id: "t1", kind: "commission_in", direction: "in", side: "buyer", amount: 123000, account_id: "acc-bank", occurred_at: iso(qStart, 5), deal_id: "deal1", created_at: iso(qStart, 5) },
      { id: "t2", kind: "commission_in", direction: "in", side: "seller", amount: 82000, account_id: "acc-bank", occurred_at: iso(qStart, 5), deal_id: "deal1", created_at: iso(qStart, 5) },
      { id: "t3", kind: "expense", direction: "out", amount: 25000, account_id: "acc-bank", category_id: "cat-rent", occurred_at: iso(cm, 1), description: "Office rent", created_at: iso(cm, 1) },
    ],
  };

  const ok = (data, status = 200) => new Response(status === 204 ? null : JSON.stringify(data === undefined ? null : data), { status, headers: { "Content-Type": "application/json", "Content-Range": `0-0/${Array.isArray(data) ? data.length : 0}` } });
  const filters = (qs) => { const f = []; qs.forEach((v, k) => { if (["select", "order", "limit", "offset", "on_conflict"].includes(k)) return; const m = String(v).match(/^eq\.(.*)$/); if (m) f.push([k, m[1]]); const mi = String(v).match(/^in\.\((.*)\)$/); if (mi) f.push([k, mi[1].split(","), "in"]); }); return f; };
  const match = (row, f) => f.every(([k, v, op]) => (op === "in" ? v.includes(String(row[k])) : String(row[k]) === v));
  const ranking = () => D.profiles.filter((p) => p.role === "sales_agent").map((p, i) => {
    const cold = D.cold_activity.filter((a) => a.user_id === p.id && a.action === "outcome").length;
    const cl = D.client_activity.filter((a) => a.changed_by === p.id).length;
    return { user_id: p.id, name: p.name, avatar_url: null, deals_rank: D.deal_agents.filter((a) => a.agent_id === p.id).length, money_rank: 0, reservations_rank: 0,
      calls: cold + cl, cold_calls: cold, client_calls: cl, seller_updates: 0, tries: cold + cl, whatsapp: i, meetings: i, units_added: D.unit_sales.filter((s) => s.sales_id === p.id).length, new_clients: D.clients.filter((c) => c.assigned_to === p.id).length, reply_minutes: 20 + i * 10 };
  });

  window.fetch = async (input, opts = {}) => {
    const url = typeof input === "string" ? input : input.url;
    if (!url.startsWith(supabaseUrl) || url.startsWith(supabaseUrl + "/auth/")) return realFetch(input, opts);
    const u = new URL(url); const method = (opts.method || "GET").toUpperCase();
    let body; try { body = opts.body && typeof opts.body === "string" ? JSON.parse(opts.body) : undefined; } catch (e) { body = undefined; }
    if (u.pathname.startsWith("/storage/") ) return method === "GET" ? new Response(new Blob([""]), { status: 200 }) : ok({ Key: "demo" });
    if (u.pathname.startsWith("/functions/")) return ok({});
    const m = u.pathname.match(/^\/rest\/v1\/(rpc\/)?([a-z_0-9]+)$/); if (!m) return ok({});
    if (m[1]) {
      if (m[2] === "sales_ranking" || m[2] === "leaderboard") return ok(ranking());
      if (m[2] === "known_phones" || m[2] === "phone_owners") return ok([]);
      return ok(null); // everything else (approve, move, delete…) just "works" in the demo
    }
    const t = m[2]; D[t] = D[t] || []; const f = filters(u.searchParams);
    if (method === "GET" || method === "HEAD") { if (Number(u.searchParams.get("offset") || 0) > 0) return ok([]); return ok(D[t].filter((r) => match(r, f))); }
    if (method === "POST") {
      const rows = (Array.isArray(body) ? body : [body]).filter(Boolean).map((r) => ({ id: r.id || uid(), created_at: new Date().toISOString(), ...(t === "client_activity" ? { changed_at: new Date().toISOString() } : {}), ...r }));
      const oc = u.searchParams.get("on_conflict");
      rows.forEach((r) => { if (oc) { const keys = oc.split(","); const ex = D[t].find((x) => keys.every((k) => x[k] === r[k])); if (ex) { Object.assign(ex, r); return; } } D[t].push(r); });
      return ok(rows, 201);
    }
    if (method === "PATCH") { const rows = D[t].filter((r) => match(r, f)); rows.forEach((r) => Object.assign(r, body)); return ok(rows); }
    if (method === "DELETE") { D[t] = D[t].filter((r) => !match(r, f)); return ok(null, 204); }
    return ok(null);
  };
}
