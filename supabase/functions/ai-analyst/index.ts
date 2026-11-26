// Origin CRM — AI analyst.
// Builds a snapshot of the company's numbers (no client names, phones or owner data),
// asks Claude for an Arabic report + 3-month forecast, and saves it in ai_reports.
// Called by: the CEO/admin from Planning ("Analyze now"), and every Sunday by pg_cron.
// Secrets (Supabase → Edge Functions → Secrets): ANTHROPIC_API_KEY.
// SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase.

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const AI_KEY = Deno.env.get("ANTHROPIC_API_KEY") || "";
const MODEL = "claude-opus-5-5";
const DAILY_CAP = 5;
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-token", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

async function sb(path: string, init: RequestInit & { prefer?: string } = {}) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, { ...init, headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json", Range: "0-49999", ...(init.prefer ? { Prefer: init.prefer } : {}) } });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  const t = await res.text();
  return t ? JSON.parse(t) : null;
}
const num = (x: unknown) => Number(x) || 0;
const r2 = (x: number) => Math.round(x * 100) / 100;
const monthOf = (iso: string) => new Date(new Date(iso).getTime() + 2 * 3600e3).toISOString().slice(0, 7); // Cairo
const daysAgo = (n: number) => new Date(Date.now() - n * 86400e3).toISOString();
const median = (a: number[]) => { const s = [...a].sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

async function whoCalls(req: Request): Promise<{ ok: boolean; trigger: "manual" | "weekly"; userId?: string; why?: string }> {
  const cronTok = req.headers.get("x-cron-token");
  if (cronTok) {
    const rows = await sb("ai_cron_token?id=eq.1&select=token");
    return rows?.[0]?.token && rows[0].token === cronTok ? { ok: true, trigger: "weekly" } : { ok: false, trigger: "weekly", why: "bad cron token" };
  }
  const auth = req.headers.get("authorization") || "";
  const u = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: ANON, Authorization: auth } });
  if (!u.ok) return { ok: false, trigger: "manual", why: "not signed in" };
  const user = await u.json();
  const p = await sb(`profiles?id=eq.${user.id}&select=role`);
  if (!["admin", "ceo"].includes(p?.[0]?.role)) return { ok: false, trigger: "manual", why: "only admin / CEO" };
  return { ok: true, trigger: "manual", userId: user.id };
}

async function snapshot() {
  const [profiles, salaries, recurring, txns, accounts, deals, agents, clients, acts, cold, units, projects, targets, prev] = await Promise.all([
    sb("profiles?select=id,name,role,job_title,manager_id,created_at"),
    sb("staff_salaries?select=user_id,monthly_salary"),
    sb("recurring_expenses?select=name,default_amount,archived"),
    sb(`finance_transactions?select=kind,direction,amount,occurred_at,account_id,deal_id&occurred_at=gte.${daysAgo(400)}`),
    sb("finance_accounts?select=id,name,archived"),
    sb("deals?select=id,status,unit_label,deal_type,sale_price,commission_total,commission_buyer,commission_seller,commission_collected,done_at,reviewed_at,created_at,expected_transfer_date,created_by"),
    sb("deal_agents?select=deal_id,agent_id,split_pct,side"),
    sb(`clients?select=id,source,campaign,stage,stage_since,assigned_to,created_at,closed_reason,interest&created_at=gte.${daysAgo(400)}`),
    sb(`client_activity?select=client_id,action,field_name,changed_by,changed_at&changed_at=gte.${daysAgo(90)}`),
    sb(`cold_activity?select=user_id,action,value,phone,lead_id,created_at&created_at=gte.${daysAgo(30)}`),
    sb("units?select=id,project_id,type,status,total_price,bua,land_area,listing_type,created_at,sold_at,sold_via"),
    sb("projects?select=id,name,destination"),
    sb("staff_targets?select=user_id,quarterly_target"),
    sb("ai_reports?select=created_at,forecast&status=eq.done&order=created_at.desc&limit=1"),
  ]);
  const name = (id: string) => profiles.find((p: any) => p.id === id)?.name || "—";
  const staff = profiles.filter((p: any) => !["pending", "guest", "admin", "ceo"].includes(p.role));
  // money
  const allTx = await sb("finance_transactions?select=direction,amount,account_id");
  const balances = accounts.filter((a: any) => !a.archived).map((a: any) => ({ name: a.name, balance: r2(allTx.filter((t: any) => t.account_id === a.id).reduce((s: number, t: any) => s + (t.direction === "in" ? 1 : -1) * num(t.amount), 0)) }));
  const cash = r2(balances.reduce((s: number, b: any) => s + b.balance, 0));
  const fixedSalaries = r2(salaries.filter((s: any) => profiles.some((p: any) => p.id === s.user_id && p.role !== "pending")).reduce((s: number, x: any) => s + num(x.monthly_salary), 0));
  const fixedRecurring = r2(recurring.filter((r: any) => !r.archived).reduce((s: number, x: any) => s + num(x.default_amount), 0));
  const fixed = r2(fixedSalaries + fixedRecurring);
  const sum = (f: (t: any) => boolean) => r2(txns.filter(f).reduce((s: number, t: any) => s + num(t.amount), 0));
  const comm12 = sum((t) => t.kind === "commission_in" && t.occurred_at >= daysAgo(365));
  const paid12 = sum((t) => t.kind === "payout" && t.occurred_at >= daysAgo(365));
  const payoutRatio = comm12 > 0 ? r2(paid12 / comm12) : 0.5;
  // deals
  const agentsOf = (id: string) => agents.filter((a: any) => a.deal_id === id).map((a: any) => `${name(a.agent_id)} ${num(a.split_pct)}%${a.side ? ` (${a.side})` : ""}`);
  const open = deals.filter((d: any) => ["pending", "reserved"].includes(d.status)).map((d: any) => {
    const due = r2(num(d.commission_total) - num(d.commission_collected));
    return { unit: d.unit_label, status: d.status, commission_due: due, net_to_company_est: r2(due * (1 - payoutRatio)), expected_transfer_date: d.expected_transfer_date || null, overdue: !!(d.expected_transfer_date && d.expected_transfer_date < new Date().toISOString().slice(0, 10)), agents: agentsOf(d.id) };
  });
  const doneDeals = deals.filter((d: any) => d.status === "approved").map((d: any) => ({ month: monthOf(d.done_at || d.reviewed_at || d.created_at), commission: num(d.commission_total), type: d.deal_type || "sale",
    agents: agents.filter((a: any) => a.deal_id === d.id).map((a: any) => ({ id: a.agent_id, pct: num(a.split_pct), side: a.side, amount: (a.side === "buyer" ? num(d.commission_buyer) : a.side === "seller" ? num(d.commission_seller) : num(d.commission_total)) * num(a.split_pct) / 100 })) }));
  const months = [...Array(12)].map((_, k) => { const d = new Date(); d.setMonth(d.getMonth() - k); return d.toISOString().slice(0, 7); }).reverse();
  const byMonth = months.map((m) => {
    const cs = clients.filter((c: any) => monthOf(c.created_at) === m);
    const src: Record<string, number> = {}; cs.forEach((c: any) => { const k = c.source + (c.campaign ? ` / ${c.campaign}` : ""); src[k] = (src[k] || 0) + 1; });
    const dd = doneDeals.filter((d: any) => d.month === m);
    return { month: m, new_clients: cs.length, by_source: src, deals_done: dd.length, deal_commission: r2(dd.reduce((s: number, d: any) => s + d.commission, 0)),
      commission_collected: sum((t) => t.kind === "commission_in" && monthOf(t.occurred_at) === m), expenses_out: sum((t) => t.direction === "out" && monthOf(t.occurred_at) === m) };
  });
  // people (last 90 days)
  const quick = (uid: string, id: string) => acts.filter((a: any) => a.changed_by === uid && a.action === "quick_reply" && a.field_name === id).length;
  const people = staff.map((p: any) => {
    const mine = clients.filter((c: any) => c.assigned_to === p.id);
    const deals90 = doneDeals.filter((d: any) => d.month >= monthOf(daysAgo(90)) && d.agents.some((a: any) => a.id === p.id));
    const brought12 = r2(doneDeals.filter((d: any) => d.month >= monthOf(daysAgo(365))).reduce((s: number, d: any) => s + d.agents.filter((a: any) => a.id === p.id).reduce((x: number, a: any) => x + a.amount, 0), 0));
    const lastAct = acts.filter((a: any) => a.changed_by === p.id).map((a: any) => a.changed_at).sort().pop();
    const coldMine = cold.filter((c: any) => c.user_id === p.id && c.action === "outcome");
    const coldNumbers = new Set(coldMine.map((c: any) => `${c.phone || c.lead_id}:${c.created_at.slice(0, 10)}`)).size;
    const mb = quick(p.id, "meeting_set"), md = quick(p.id, "meeting_done");
    return { name: p.name, role: p.role, job_title: p.job_title, quarterly_target: num(targets.find((t: any) => t.user_id === p.id)?.quarterly_target),
      active_clients: mine.filter((c: any) => !["deal_done", "closed"].includes(c.stage)).length,
      clients_by_stage: mine.reduce((o: any, c: any) => { o[c.stage] = (o[c.stage] || 0) + 1; return o; }, {}),
      no_answer_14d_plus: mine.filter((c: any) => c.stage === "not_responding" && c.stage_since && c.stage_since < daysAgo(14)).length,
      last_90_days: { client_updates: acts.filter((a: any) => a.changed_by === p.id).length, meetings_booked: mb, meetings_done: md, deals_done: deals90.length },
      cold_last_30_days: { numbers_given_feedback: coldNumbers, selling_found: coldMine.filter((c: any) => c.value === "selling").length },
      commission_brought_12m_approx: brought12, last_client_activity: lastAct || null };
  });
  const lost: Record<string, number> = {}; clients.filter((c: any) => c.stage === "closed" && c.closed_reason).forEach((c: any) => { lost[c.closed_reason] = (lost[c.closed_reason] || 0) + 1; });
  const coldOut: Record<string, number> = {}; cold.filter((c: any) => c.action === "outcome").forEach((c: any) => { coldOut[c.value] = (coldOut[c.value] || 0) + 1; });
  // inventory: price per m² vs median of same project + type
  const pname = (id: string) => projects.find((p: any) => p.id === id)?.name || "—";
  const active = units.filter((u: any) => u.status === "active" && u.listing_type !== "rent" && num(u.total_price) > 0 && num(u.bua || u.land_area) > 0).map((u: any) => ({ ...u, ppm: num(u.total_price) / num(u.bua || u.land_area) }));
  const good: any[] = [];
  active.forEach((u: any) => { const peers = active.filter((x: any) => x.id !== u.id && x.project_id === u.project_id && x.type === u.type).map((x: any) => x.ppm); if (peers.length >= 2) { const med = median(peers); const off = (med - u.ppm) / med; if (off >= 0.1) good.push({ project: pname(u.project_id), type: u.type, price: num(u.total_price), price_per_m2: Math.round(u.ppm), median_per_m2: Math.round(med), below_pct: Math.round(off * 100) }); } });
  const invByProject: Record<string, number> = {}; active.forEach((u: any) => { const k = pname(u.project_id); invByProject[k] = (invByProject[k] || 0) + 1; });
  return {
    generated_at: new Date().toISOString(), currency: "EGP",
    money: { cash_now: cash, accounts: balances, fixed_monthly_costs: { salaries: fixedSalaries, recurring: fixedRecurring, total: fixed }, runway_months_no_sales: fixed ? r2(cash / fixed) : null,
      commission_collected_12m: comm12, sales_payouts_paid_12m: paid12, payout_ratio_12m: payoutRatio,
      note: "net_to_company_est uses the last 12 months' payout ratio (paid to sales ÷ commission collected)" },
    reserved_and_pending_deals: open, months: byMonth, people, lost_reasons_clients_added_last_400_days: lost, cold_outcomes_last_30_days: coldOut,
    inventory: { active_for_sale: active.length, by_project: invByProject, good_price_units: good.sort((a, b) => b.below_pct - a.below_pct).slice(0, 15) },
    previous_forecast: prev?.[0] ? { made_at: prev[0].created_at, forecast: prev[0].forecast } : null,
  };
}

const SYSTEM = `أنت المحلل المالي والتشغيلي لشركة "أور للتسويق والسمسرة العقارية" (Origin Real Estate)، شركة ريسيل في الشيخ زايد و6 أكتوبر. هتاخد JSON فيه أرقام الشركة الفعلية.
اكتب تقرير بالعربي المصري، واضح ومباشر، للمدير العام. القواعد:
- كل رقم تكتبه لازم يكون من الـJSON أو محسوب منه بحسبة بسيطة تقولها. ممنوع تخترع أرقام. لو معلومة ناقصة قول إنها ناقصة.
- استخدم الأقسام دي بالترتيب كعناوين ##:
  ## الوضع (سطرين)
  ## مخاطر التركيز (مثلاً سيلز واحد جايب نسبة كبيرة من الدخل)
  ## ملاحظات لكل سيلز (اللي يستاهل ملاحظة بس: أكتيف/واقف، ميتنجات كتير وتحويل قليل، إلخ + اقتراح عملي)
  ## الوحدات اللي سعرها كويس
  ## توقع 3 شهور (جدول Markdown: الشهر | ديلات | دخل متوقع | صافي للشركة | كاش آخر الشهر | الثقة ولماذا). ابنِ التوقع على الديلات المحجوزة ومعاد التنازل المتوقع، وعلى معدل الأداء الفعلي (ميتنجات × نسبة التحويل × متوسط العمولة)، والمصاريف الثابتة. لو فيه توقع سابق قارنه باللي حصل.
  ## المخاطر
  ## تعمل إيه الأسبوع ده (3-4 نقاط)
- في الآخر خالص، بعد التقرير، حط بلوك \`\`\`json فيه {"forecast":[{"month":"YYYY-MM","deals":0,"gross":0,"net":0,"cash_end":0,"confidence":"high|medium|low"}]} للـ3 شهور.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const who = await whoCalls(req);
    if (!who.ok) return json({ error: who.why }, 403);
    if (!AI_KEY) return json({ error: "ANTHROPIC_API_KEY is not set in Supabase secrets" }, 500);
    const today = new Date(); today.setUTCHours(0, 0, 0, 0);
    const runs = await sb(`ai_reports?select=id&created_at=gte.${today.toISOString()}`);
    if ((runs || []).length >= DAILY_CAP) return json({ error: `Daily limit reached (${DAILY_CAP} reports a day)` }, 429);
    const snap = await snapshot();
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": AI_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, max_tokens: 16000, output_config: { effort: "low" }, system: SYSTEM, messages: [{ role: "user", content: "أرقام الشركة:\n```json\n" + JSON.stringify(snap) + "\n```" }] }),
    });
    const out = await res.json();
    if (!res.ok) {
      await sb("ai_reports", { method: "POST", body: JSON.stringify({ trigger: who.trigger, requested_by: who.userId || null, status: "failed", error: JSON.stringify(out).slice(0, 2000), model: MODEL }) });
      return json({ error: out?.error?.message || "AI request failed" }, 502);
    }
    const text = (out.content || []).filter((c: any) => c.type === "text").map((c: any) => c.text).join("\n");
    // Opus 5.5 always thinks first, and thinking shares max_tokens. If no answer text came back, save it as failed (not an empty "Ready").
    if (!text.trim()) {
      await sb("ai_reports", { method: "POST", body: JSON.stringify({ trigger: who.trigger, requested_by: who.userId || null, status: "failed", error: `No report text (stop_reason: ${out.stop_reason}, output tokens: ${out.usage?.output_tokens})`, model: MODEL, input_tokens: out.usage?.input_tokens, output_tokens: out.usage?.output_tokens }) });
      return json({ error: "The AI returned no report text — try again" }, 502);
    }
    let forecast = null; let report = text;
    const m = text.match(/```json\s*([\s\S]*?)```\s*$/);
    if (m) { try { forecast = JSON.parse(m[1]).forecast || null; } catch (_) { /* keep the text */ } report = text.slice(0, m.index).trim() || text; }
    const [row] = await sb("ai_reports", { method: "POST", prefer: "return=representation", body: JSON.stringify({ trigger: who.trigger, requested_by: who.userId || null, snapshot: snap, report_md: report, forecast, model: MODEL, input_tokens: out.usage?.input_tokens, output_tokens: out.usage?.output_tokens }) });
    if (who.trigger === "weekly") {
      const ceo = await sb("profiles?select=id&role=in.(ceo,admin)");
      if (ceo?.length) await sb("notification_queue", { method: "POST", body: JSON.stringify(ceo.map((p: any) => ({ user_id: p.id, title: "Weekly company report 📊", body: "Your AI analysis is ready", url: "?open=planning" }))) });
    }
    return json({ id: row?.id, report_md: report, forecast });
  } catch (e) {
    return json({ error: String((e as Error).message || e) }, 500);
  }
});
