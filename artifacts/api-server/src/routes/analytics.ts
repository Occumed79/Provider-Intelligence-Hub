import { Router, type IRouter } from "express";
import multer from "multer";
import * as XLSX from "xlsx";
import { db } from "@workspace/db";
import { providersTable, outreachRecordsTable, difficultyReportsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

function parseServices(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

router.get("/analytics/services", async (_req, res): Promise<void> => {
  const providers = await db
    .select({
      id: providersTable.id,
      servicesOffered: providersTable.servicesOffered,
      state: providersTable.state,
    })
    .from(providersTable)
    .where(sql`${providersTable.servicesOffered} IS NOT NULL`);

  const serviceCounts: Record<string, number> = {};
  for (const p of providers) {
    for (const s of parseServices(p.servicesOffered)) {
      const key = s.toUpperCase();
      serviceCounts[key] = (serviceCounts[key] || 0) + 1;
    }
  }

  const services = Object.entries(serviceCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  res.json(services);
});

router.get("/analytics/service-matrix", async (_req, res): Promise<void> => {
  const providers = await db
    .select({
      id: providersTable.id,
      clinicName: providersTable.clinicName,
      city: providersTable.city,
      state: providersTable.state,
      verificationStatus: providersTable.verificationStatus,
      servicesOffered: providersTable.servicesOffered,
      tpaFriendlyClues: providersTable.tpaFriendlyClues,
    })
    .from(providersTable)
    .orderBy(sql`${providersTable.clinicName} ASC`);

  const allServiceSet = new Set<string>();
  for (const p of providers) {
    for (const s of parseServices(p.servicesOffered)) {
      allServiceSet.add(s.toUpperCase());
    }
  }

  const allServices = Array.from(allServiceSet).sort();

  const matrix = providers.map((p) => {
    const providerServices = new Set(parseServices(p.servicesOffered).map((s) => s.toUpperCase()));
    return {
      id: p.id,
      clinicName: p.clinicName,
      city: p.city,
      state: p.state,
      verificationStatus: p.verificationStatus,
      tpaFriendly: !!(p.tpaFriendlyClues),
      services: allServices.reduce(
        (acc, svc) => {
          acc[svc] = providerServices.has(svc);
          return acc;
        },
        {} as Record<string, boolean>,
      ),
    };
  });

  res.json({ services: allServices, providers: matrix });
});

router.get("/analytics/coverage-gaps", async (_req, res): Promise<void> => {
  const providers = await db
    .select({
      state: providersTable.state,
      servicesOffered: providersTable.servicesOffered,
      verificationStatus: providersTable.verificationStatus,
    })
    .from(providersTable)
    .where(sql`${providersTable.state} IS NOT NULL`);

  const serviceSet = new Set<string>();
  const stateSet = new Set<string>();
  const stateServiceCount: Record<string, Record<string, number>> = {};

  for (const p of providers) {
    const state = p.state!;
    stateSet.add(state);
    if (!stateServiceCount[state]) stateServiceCount[state] = {};
    for (const s of parseServices(p.servicesOffered)) {
      const key = s.toUpperCase();
      serviceSet.add(key);
      stateServiceCount[state][key] = (stateServiceCount[state][key] || 0) + 1;
    }
  }

  const services = Array.from(serviceSet).sort();
  const states = Array.from(stateSet).sort();

  const gaps = states.map((state) => {
    const row: Record<string, number> = { totalProviders: Object.values(stateServiceCount[state] || {}).reduce((a, b) => a + b, 0) };
    for (const svc of services) {
      row[svc] = stateServiceCount[state]?.[svc] || 0;
    }
    return { state, ...row };
  });

  const serviceSummary = services.map((svc) => {
    const covered = states.filter((st) => (stateServiceCount[st]?.[svc] || 0) > 0).length;
    return { service: svc, statesCovered: covered, totalStates: states.length, gapStates: states.length - covered };
  }).sort((a, b) => b.gapStates - a.gapStates);

  res.json({ services, states, gaps, serviceSummary });
});

router.get("/analytics/export", async (req, res): Promise<void> => {
  const { state, service, verificationStatus } = req.query as Record<string, string>;

  const conditions = [];
  if (state) conditions.push(sql`${providersTable.state} ILIKE ${state}`);
  if (service) conditions.push(sql`${providersTable.servicesOffered} ILIKE ${"%" + service + "%"}`);
  if (verificationStatus) conditions.push(sql`${providersTable.verificationStatus} ILIKE ${verificationStatus}`);

  const providers = await db
    .select()
    .from(providersTable)
    .where(conditions.length > 0 ? sql`${conditions.reduce((a, b) => sql`${a} AND ${b}`)}` : undefined)
    .orderBy(sql`${providersTable.clinicName} ASC`);

  const headers = [
    "ID", "Clinic Name", "Type", "Address", "City", "State", "ZIP",
    "Phone", "Fax", "Email", "Website", "Contact", "Services",
    "Pricing Notes", "Employer Account Clues", "Corporate Billing",
    "Net Terms", "Accepts Outside Forms", "TPA Friendly", "Payment Requirements",
    "Verification Status", "Source Count", "Notes", "Latitude", "Longitude",
  ];

  const escape = (v: unknown) => {
    if (v == null) return "";
    const str = String(v).replace(/"/g, '""');
    return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str}"` : str;
  };

  const rows = providers.map((p) => [
    p.id, p.clinicName, p.clinicType, p.address, p.city, p.state, p.zip,
    p.phone, p.fax, p.email, p.website, p.contactPerson, p.servicesOffered,
    p.pricingNotes, p.employerAccountClues, p.corporateBillingClues,
    p.netTermsClues, p.acceptsOutsideForms, p.tpaFriendlyClues, p.paymentRequirements,
    p.verificationStatus, p.sourceCount, p.notes, p.latitude, p.longitude,
  ].map(escape).join(","));

  const csv = [headers.join(","), ...rows].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="occu-med-providers-${Date.now()}.csv"`);
  res.send(csv);
});

// ═══════════════════════════════════════════════════════════
// DIFFICULTY REPORT — helper + two routes
// ═══════════════════════════════════════════════════════════

async function computeDifficultyReport(
  state: string, city?: string, service?: string,
  requestedBy?: string, department?: string, notes?: string,
) {
  const allInState = await db.select().from(providersTable)
    .where(sql`UPPER(${providersTable.state}) = UPPER(${state})`);

  const areaProviders = city
    ? allInState.filter((p) => p.city?.toLowerCase().includes(city.toLowerCase()))
    : allInState;

  const serviceProviders = service
    ? areaProviders.filter((p) => (p.servicesOffered || "").toLowerCase().includes(service.toLowerCase()))
    : areaProviders;

  const allOutreach = await db.select().from(outreachRecordsTable)
    .where(sql`UPPER(${outreachRecordsTable.providerState}) = UPPER(${state})`);
  const areaOutreach = city
    ? allOutreach.filter((r) => r.providerCity?.toLowerCase().includes(city.toLowerCase()))
    : allOutreach;

  const pool = areaProviders;
  const total = pool.length;
  const verified = pool.filter((p) => p.verificationStatus === "Verified").length;
  const flagged  = pool.filter((p) => p.verificationStatus === "Flagged").length;
  const tpa = pool.filter((p) => !!(p.tpaFriendlyClues || p.employerAccountClues || p.corporateBillingClues)).length;
  const multiSource = pool.filter((p) => Number(p.sourceCount) > 1).length;
  const serviceAvail = service != null ? serviceProviders.length : null;

  const contactScore = total > 0
    ? pool.reduce((acc, p) => {
        const fields = [p.phone, p.email, p.contactPerson, p.address, p.city, p.zip];
        return acc + fields.filter(Boolean).length / fields.length;
      }, 0) / total
    : 0;

  const payBarriers = pool.filter((p) => p.paymentRequirements && p.paymentRequirements.length > 10).length;
  const uniqueCities = new Set(pool.map((p) => p.city).filter(Boolean)).size;

  const oTotal   = areaOutreach.length;
  const oFailed  = areaOutreach.filter((r) => ["failed","no_response","bounced"].includes(r.status)).length;
  const oAgreements = areaOutreach.filter((r) => r.status === "agreement").length;
  const oResponded  = areaOutreach.filter((r) => ["responded","interested"].includes(r.status)).length;

  // ── Factor scores ──
  const f1  = total === 0 ? 20 : total <= 2 ? 15 : total <= 5 ? 10 : total <= 10 ? 5 : 0;
  const f2  = service != null ? (serviceAvail === 0 ? 18 : serviceAvail! === 1 ? 14 : serviceAvail! <= 3 ? 8 : 0) : 0;
  const vr  = total > 0 ? verified / total : 0;
  const f3  = total === 0 ? 15 : vr >= 0.76 ? 0 : vr >= 0.51 ? 4 : vr >= 0.26 ? 8 : vr >= 0.01 ? 12 : 15;
  const fr  = total > 0 ? flagged  / total : 0;
  const f4  = fr > 0.5 ? 10 : fr > 0.25 ? 7 : fr > 0.1 ? 4 : 0;
  const f5  = total === 0 ? 10 : tpa === 0 ? 10 : tpa === 1 ? 7 : tpa <= 3 ? 3 : 0;
  const f6  = contactScore < 0.25 ? 8 : contactScore < 0.5 ? 5 : contactScore < 0.75 ? 2 : 0;
  let   f7  = 0;
  if (oTotal === 0) f7 = 4;
  else { const rate = oFailed / oTotal; f7 = rate > 0.6 ? 8 : rate > 0.3 ? 5 : oAgreements > 0 ? 0 : 2; }
  const mr  = total > 0 ? multiSource / total : 0;
  const f8  = mr < 0.01 ? 7 : mr < 0.3 ? 5 : mr < 0.6 ? 2 : 0;
  const f9  = total === 0 ? 7 : uniqueCities <= 1 ? 7 : uniqueCities <= 2 ? 5 : uniqueCities <= 5 ? 3 : 0;
  const pr  = total > 0 ? payBarriers / total : 0;
  const f10 = pr > 0.5 ? 7 : pr > 0.25 ? 4 : 0;

  const maxPossible = 20 + (service != null ? 18 : 0) + 15 + 10 + 10 + 8 + 8 + 7 + 7 + 7;
  const rawScore    = f1+f2+f3+f4+f5+f6+f7+f8+f9+f10;
  const score = Math.min(100, Math.round((rawScore / maxPossible) * 100));
  const tier  = score >= 76 ? "Critical" : score >= 51 ? "Hard" : score >= 26 ? "Moderate" : "Easy";

  const factors = [
    { name:"Provider Pool Size",       category:"Availability",  points:f1,            maxPoints:20, detail: total===0?"No providers found in area":`${total} provider${total!==1?"s":""} found`,                                                description:"Total number of providers available to contact in the requested region." },
    ...(service!=null ? [{ name:"Service Availability",  category:"Availability",  points:f2,  maxPoints:18, detail: serviceAvail===0?`No providers offer "${service}"`:`${serviceAvail} provider${serviceAvail!==1?"s":""} offer "${service}"`, description:`Providers in the area offering the requested service: ${service}.` }] : []),
    { name:"Verification Quality",     category:"Reliability",   points:f3,            maxPoints:15, detail: total===0?"No providers to assess":`${verified}/${total} verified (${Math.round(vr*100)}%)`,                                        description:"Percentage of area providers with confirmed, verified records." },
    { name:"Flagged Provider Ratio",   category:"Reliability",   points:f4,            maxPoints:10, detail:`${flagged} of ${total} flagged for issues`,                                                                                          description:"Proportion of providers flagged for issues, reducing the usable pool." },
    { name:"TPA / Corporate Billing",  category:"Billing",       points:f5,            maxPoints:10, detail: total===0?"No providers to assess": tpa===0?"No TPA-friendly providers":`${tpa} TPA-capable provider${tpa!==1?"s":""}`,             description:"Availability of providers accepting TPA or corporate billing arrangements." },
    { name:"Contact Info Completeness",category:"Accessibility", points:f6,            maxPoints:8,  detail:`${Math.round(contactScore*100)}% avg. completeness across area`,                                                                      description:"Average completeness of contact data (phone, email, address, contact person, ZIP)." },
    { name:"Outreach History",         category:"Relationship",  points:Math.max(0,f7),maxPoints:8,  detail: oTotal===0?"No prior outreach on record":`${oTotal} attempts — ${oFailed} failed, ${oAgreements} agreement${oAgreements!==1?"s":""}`, description:"Prior outreach attempts and outcomes — indicates expected engagement difficulty." },
    { name:"Multi-Source Confirmation",category:"Reliability",   points:f8,            maxPoints:7,  detail:`${multiSource}/${total} providers confirmed by multiple sources`,                                                                     description:"Providers confirmed by multiple independent sources are far more reliable." },
    { name:"Geographic Concentration", category:"Availability",  points:f9,            maxPoints:7,  detail: total===0?"No geographic data":`${uniqueCities} unique ${uniqueCities===1?"city":"cities"} covered`,                                 description:"Geographic spread — highly concentrated areas have fewer backup options." },
    { name:"Payment & Billing Barriers",category:"Billing",      points:f10,           maxPoints:7,  detail:`${payBarriers} provider${payBarriers!==1?"s":""} with noted payment restrictions`,                                                  description:"Providers with documented upfront-pay, COD, or restricted billing requirements." },
  ];

  const recs: string[] = [];
  if (total === 0) recs.push(`No providers are on record for ${city?city+", ":""}${state}. Initiate an immediate sourcing campaign for this region.`);
  if (service!=null && serviceAvail===0) recs.push(`No local providers offer "${service}". Contact a national occupational health network or explore telemedicine-eligible alternatives.`);
  if (vr < 0.5 && total > 0) recs.push(`Fewer than 50% of area providers are verified. Run a verification sprint before scheduling to reduce risk.`);
  if (tpa===0 && total>0) recs.push(`No TPA or corporate billing-friendly providers identified. Finance should plan for direct-pay billing or reimbursement.`);
  if (oFailed > 2) recs.push(`${oFailed} prior outreach attempts have already failed. Escalate to phone/fax contact, or engage a third-party locator service.`);
  if (f9>=5 && total>0) recs.push(`Geographic coverage is highly concentrated. If the primary provider is unavailable, backup options in this region are extremely limited.`);
  if (contactScore<0.5 && total>0) recs.push(`Contact data is incomplete for many providers. A manual enrichment pass before outreach will significantly improve response rates.`);
  if (score>=76) recs.push(`⚠ CRITICAL: This request should be escalated to management and given a 2–3× longer turnaround window than standard.`);
  else if (score>=51) recs.push(`Difficulty is HIGH. Budget additional lead time and consider activating alternate fulfillment strategies in parallel.`);
  if (recs.length===0) recs.push(`Provider availability looks manageable for this area. Standard outreach protocols should be sufficient.`);

  return {
    request: { state, city: city||null, service: service||null, requestedBy: requestedBy||null, department: department||null, notes: notes||null },
    score, tier,
    totalProviders: total, verifiedProviders: verified, flaggedProviders: flagged, tpaProviders: tpa, usableProviders: total-flagged,
    serviceMatch: service!=null ? serviceAvail : null,
    factors,
    providers: pool.slice(0,25).map((p) => ({
      id: p.id, clinicName: p.clinicName, clinicType: p.clinicType,
      city: p.city, state: p.state, phone: p.phone, email: p.email,
      verificationStatus: p.verificationStatus,
      tpaFriendly: !!(p.tpaFriendlyClues||p.employerAccountClues||p.corporateBillingClues),
      servicesOffered: p.servicesOffered, sourceCount: p.sourceCount,
    })),
    outreachSummary: { total: oTotal, failed: oFailed, agreements: oAgreements, responded: oResponded },
    recommendations: recs,
    generatedAt: new Date().toISOString(),
  };
}

router.get("/analytics/difficulty-report", async (req, res): Promise<void> => {
  const { state, city, service, requestedBy, department, notes } = req.query as Record<string,string>;
  if (!state) { res.status(400).json({ error: "state is required" }); return; }
  const report = await computeDifficultyReport(state, city, service, requestedBy, department, notes);

  db.insert(difficultyReportsTable).values({
    state: report.request.state,
    city: report.request.city,
    service: report.request.service,
    requestedBy: report.request.requestedBy,
    department: report.request.department,
    notes: report.request.notes,
    score: report.score,
    tier: report.tier,
    totalProviders: report.totalProviders,
    verifiedProviders: report.verifiedProviders,
    flaggedProviders: report.flaggedProviders,
    tpaProviders: report.tpaProviders,
    usableProviders: report.usableProviders,
    serviceMatch: report.serviceMatch,
    factorsJson: report.factors,
    outreachJson: report.outreachSummary,
    recommendationsJson: report.recommendations,
  }).catch(() => {});

  res.json(report);
});

router.get("/analytics/difficulty-report/print", async (req, res): Promise<void> => {
  const { state, city, service, requestedBy, department, notes } = req.query as Record<string,string>;
  if (!state) { res.status(400).send("<p>state is required</p>"); return; }
  const r = await computeDifficultyReport(state, city, service, requestedBy, department, notes);

  const esc = (s: string|null|undefined) => (s??"—").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const tierColor = r.tier==="Critical"?"#ef4444":r.tier==="Hard"?"#f97316":r.tier==="Moderate"?"#eab308":"#22c55e";
  const tierBg    = r.tier==="Critical"?"#fef2f2":r.tier==="Hard"?"#fff7ed":r.tier==="Moderate"?"#fefce8":"#f0fdf4";
  const arcLen    = Math.PI*80;
  const filled    = (r.score/100)*arcLen;
  const reportDate= new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
  const reportTime= new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
  const catColor: Record<string,string> = { Availability:"#3b82f6",Reliability:"#8b5cf6",Billing:"#22c55e",Accessibility:"#06b6d4",Relationship:"#f97316" };

  const factorRows = r.factors.map((f) => {
    const pct = f.maxPoints>0?(f.points/f.maxPoints)*100:0;
    const bc  = pct>=70?"#ef4444":pct>=40?"#f97316":pct>0?"#eab308":"#22c55e";
    return `<tr>
      <td class="factor-name"><span class="cat-dot" style="background:${catColor[f.category]||"#888"}"></span>${esc(f.name)}</td>
      <td><span class="cat-pill" style="color:${catColor[f.category]||"#888"};border-color:${catColor[f.category]||"#888"}40">${esc(f.category)}</span></td>
      <td class="factor-detail">${esc(f.detail)}</td>
      <td class="factor-score"><span style="color:${bc};font-weight:800">${f.points}</span><span style="color:#999">/${f.maxPoints}</span></td>
      <td><div class="mini-bar-bg"><div class="mini-bar-fill" style="width:${Math.round(pct)}%;background:${bc}"></div></div></td>
    </tr>`;
  }).join("");

  const provRows = r.providers.map((p) => {
    const sc = p.verificationStatus==="Verified"?"#22c55e":p.verificationStatus==="Flagged"?"#ef4444":"#eab308";
    return `<tr>
      <td><strong>${esc(p.clinicName)}</strong>${p.clinicType?`<br><small>${esc(p.clinicType)}</small>`:""}</td>
      <td>${[p.city,p.state].filter(Boolean).join(", ")||"—"}</td>
      <td>${esc(p.phone)}</td><td>${esc(p.email)}</td>
      <td><span style="font-size:9px;font-weight:800;text-transform:uppercase;border:1px solid ${sc}30;background:${sc}10;color:${sc};border-radius:20px;padding:2px 7px">${esc(p.verificationStatus)}</span></td>
      <td>${p.tpaFriendly?'<span style="color:#166534;font-size:10px;font-weight:700">✓ TPA</span>':"—"}</td>
    </tr>`;
  }).join("");

  const recItems = r.recommendations.map((rec,i)=>`
    <div style="display:flex;gap:12px;padding:12px 14px;background:#fff;border:1px solid #d6c9a8;border-left:4px solid #d4941a;border-radius:0 8px 8px 0;margin-bottom:10px;page-break-inside:avoid">
      <div style="font-size:11px;font-weight:900;color:#d4941a;flex-shrink:0;width:20px">${i+1}</div>
      <div style="font-size:12px;color:#1a1611">${esc(rec)}</div>
    </div>`).join("");

  const html=`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>Provider Finder Difficulty — ${esc(r.request.state)}${r.request.city?", "+esc(r.request.city):""}</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--amber:#d4941a;--dark:#1a1611;--text:#1a1611;--muted:#6b6050;--border:#d6c9a8;--bg:#faf8f4}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--bg);color:var(--text);font-size:13px;line-height:1.5}
.print-bar{position:sticky;top:0;z-index:100;background:#fff;border-bottom:1px solid var(--border);padding:10px 24px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 2px 8px rgba(0,0,0,.08)}
.print-bar-left{font-size:12px;color:var(--muted)}
.print-btn{background:var(--amber);color:#fff;border:none;border-radius:7px;padding:8px 20px;font-size:13px;font-weight:700;cursor:pointer}
@media print{.print-bar{display:none!important}body{background:#fff}}
.cover{background:var(--dark);color:#fff;padding:40px 48px 36px}
.cover-top{display:flex;align-items:center;gap:12px;margin-bottom:28px}
.logo-box{width:38px;height:38px;border-radius:9px;background:rgba(212,148,26,.2);border:1px solid rgba(212,148,26,.4);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;color:#f5c842}
.brand-name{font-size:17px;font-weight:700}
.brand-sub{font-size:10px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.08em}
.cover h1{font-size:28px;font-weight:800;letter-spacing:-.02em;margin-bottom:6px}
.cover h1 span{color:#f5c842}
.cover-sub{color:rgba(255,255,255,.5);font-size:13px;margin-bottom:24px}
.cover-meta{display:flex;gap:28px;flex-wrap:wrap}
.cmi{font-size:10px;color:rgba(255,255,255,.45);text-transform:uppercase;letter-spacing:.07em}
.cmi strong{display:block;font-size:12px;color:rgba(255,255,255,.85);text-transform:none;letter-spacing:0;margin-top:2px}
.conf{margin-top:20px;display:inline-flex;align-items:center;gap:8px;background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3);border-radius:5px;padding:5px 12px;font-size:10px;font-weight:800;color:#fca5a5;text-transform:uppercase;letter-spacing:.07em}
.score-section{background:#fff;border-bottom:1px solid var(--border);padding:32px 48px;display:flex;align-items:center;gap:48px}
.gauge-wrap{flex-shrink:0;width:210px}
.gauge-wrap svg{width:100%;display:block}
.score-meta{flex:1}
.score-tier{display:inline-flex;align-items:center;gap:8px;border-radius:8px;padding:8px 18px;font-size:18px;font-weight:900;margin-bottom:16px;border:2px solid}
.score-chips{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.sc{text-align:center;background:#faf7f0;border:1px solid #e8dfc8;border-radius:8px;padding:10px}
.sc-num{font-size:24px;font-weight:800;color:var(--amber)}
.sc-lbl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-top:2px}
.content{max-width:960px;margin:0 auto;padding:32px 24px 60px}
.section-hdr{display:flex;align-items:center;gap:10px;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid var(--border)}
.section-title{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--muted)}
.section-num{font-size:10px;font-weight:700;color:var(--amber);background:rgba(212,148,26,.08);border:1px solid rgba(212,148,26,.2);border-radius:20px;padding:2px 10px}
table{width:100%;border-collapse:collapse;margin-bottom:28px}
th{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);padding:8px 10px;text-align:left;border-bottom:1px solid var(--border)}
td{padding:9px 10px;border-bottom:1px solid #f0ece2;font-size:12px;vertical-align:middle}
tr:last-child td{border-bottom:none}
.factor-name{font-weight:600;display:flex;align-items:center;gap:7px}
.cat-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;display:inline-block}
.cat-pill{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;border:1px solid;border-radius:3px;padding:2px 6px}
.factor-detail{color:var(--muted);font-size:11px}
.factor-score{white-space:nowrap;font-size:12px}
.mini-bar-bg{width:80px;height:6px;background:#e8dfc8;border-radius:3px;overflow:hidden}
.mini-bar-fill{height:100%;border-radius:3px}
.out-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px}
.out-chip{text-align:center;padding:14px;background:#fff;border:1px solid var(--border);border-radius:8px}
.out-num{font-size:22px;font-weight:800;color:var(--amber)}
.out-lbl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-top:3px}
.signoff{margin-top:40px;padding:24px;border:1px solid var(--border);border-radius:10px;background:#fff;page-break-inside:avoid}
.so-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:20px}
.so-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.so-field{border-bottom:1px solid #d6c9a8;padding-bottom:4px;min-height:24px}
.so-lbl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-top:16px;margin-bottom:4px}
.footer{text-align:center;padding:24px;border-top:1px solid var(--border);font-size:10px;color:var(--muted);margin-top:24px}
</style></head><body>
<div class="print-bar">
  <div class="print-bar-left"><strong>Provider Finder Difficulty Assessment</strong> — ${esc(r.request.state)}${r.request.city?", "+esc(r.request.city):""} &nbsp;·&nbsp; Score: ${r.score}/100 (${esc(r.tier)})</div>
  <button class="print-btn" onclick="window.print()">🖨&nbsp; Print / Save as PDF</button>
</div>
<div class="cover">
  <div class="cover-top">
    <div class="logo-box">OM</div>
    <div><div class="brand-name">Occu-Med</div><div class="brand-sub">Provider Intelligence Hub</div></div>
  </div>
  <h1>Provider Finder <span>Difficulty</span> Assessment</h1>
  <div class="cover-sub">Prepared for: ${r.request.department?esc(r.request.department)+" Department":"Scheduling / Finance"}</div>
  <div class="cover-meta">
    <div class="cmi">Region Requested<strong>${esc(r.request.state)}${r.request.city?", "+esc(r.request.city):""}</strong></div>
    ${r.request.service?`<div class="cmi">Service Required<strong>${esc(r.request.service)}</strong></div>`:""}
    ${r.request.requestedBy?`<div class="cmi">Requested By<strong>${esc(r.request.requestedBy)}</strong></div>`:""}
    <div class="cmi">Generated<strong>${reportDate}, ${reportTime}</strong></div>
  </div>
  <div class="conf">⚠ Internal Use Only — Confidential</div>
</div>
<div class="score-section">
  <div class="gauge-wrap">
    <svg viewBox="0 0 200 115" xmlns="http://www.w3.org/2000/svg">
      <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e8dfc8" stroke-width="18" stroke-linecap="round"/>
      <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="${tierColor}" stroke-width="18" stroke-linecap="round" stroke-dasharray="${filled.toFixed(1)} ${arcLen.toFixed(1)}"/>
      <text x="100" y="83" text-anchor="middle" fill="${tierColor}" font-size="44" font-weight="900" font-family="sans-serif">${r.score}</text>
      <text x="100" y="102" text-anchor="middle" fill="#6b6050" font-size="10" font-weight="700" font-family="sans-serif">OUT OF 100</text>
    </svg>
  </div>
  <div class="score-meta">
    <div class="score-tier" style="color:${tierColor};background:${tierBg};border-color:${tierColor}60">
      ${r.tier==="Critical"?"🔴":r.tier==="Hard"?"🟠":r.tier==="Moderate"?"🟡":"🟢"} ${esc(r.tier)} Difficulty
    </div>
    <div class="score-chips">
      <div class="sc"><div class="sc-num">${r.totalProviders}</div><div class="sc-lbl">Total Providers</div></div>
      <div class="sc"><div class="sc-num">${r.usableProviders}</div><div class="sc-lbl">Usable Providers</div></div>
      <div class="sc"><div class="sc-num">${r.verifiedProviders}</div><div class="sc-lbl">Verified</div></div>
      <div class="sc"><div class="sc-num">${r.tpaProviders}</div><div class="sc-lbl">TPA / Corp Ready</div></div>
    </div>
  </div>
</div>
<div class="content">
${r.request.notes?`<div style="background:#fff;border:1px solid #e8dfc8;border-left:4px solid #d4941a;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:24px;font-size:12px"><span style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.09em;color:#6b6050;display:block;margin-bottom:4px">Case Notes</span>${esc(r.request.notes)}</div>`:""}
<div class="section-hdr"><div class="section-title">Difficulty Factor Analysis</div><div class="section-num">${r.factors.length} factors assessed</div></div>
<table><thead><tr><th>Factor</th><th>Category</th><th>Detail</th><th>Score</th><th>Severity</th></tr></thead><tbody>${factorRows}</tbody></table>
<div class="section-hdr"><div class="section-title">Outreach History</div></div>
<div class="out-grid">
  <div class="out-chip"><div class="out-num">${r.outreachSummary.total}</div><div class="out-lbl">Total Attempts</div></div>
  <div class="out-chip"><div class="out-num">${r.outreachSummary.responded}</div><div class="out-lbl">Responded</div></div>
  <div class="out-chip"><div class="out-num">${r.outreachSummary.failed}</div><div class="out-lbl">Failed / No Response</div></div>
  <div class="out-chip"><div class="out-num">${r.outreachSummary.agreements}</div><div class="out-lbl">Agreements</div></div>
</div>
${r.providers.length>0?`<div class="section-hdr"><div class="section-title">Available Provider Pool</div><div class="section-num">${r.providers.length} record${r.providers.length!==1?"s":""}</div></div>
<table><thead><tr><th>Clinic</th><th>Location</th><th>Phone</th><th>Email</th><th>Status</th><th>TPA</th></tr></thead><tbody>${provRows}</tbody></table>`
:`<div style="padding:24px;text-align:center;color:#888;font-style:italic">No providers on record for this region.</div>`}
<div class="section-hdr"><div class="section-title">Recommendations &amp; Action Items</div></div>
${recItems}
<div class="signoff">
  <div class="so-title">Authorization &amp; Routing</div>
  <div class="so-grid">
    <div>
      <div class="so-lbl">Prepared By</div><div class="so-field">&nbsp;</div>
      <div class="so-lbl">Date</div><div class="so-field">${reportDate}</div>
    </div>
    <div>
      <div class="so-lbl">Reviewed By (${esc(r.request.department||"Department Head")})</div><div class="so-field">&nbsp;</div>
      <div class="so-lbl">Authorized / Escalated</div><div class="so-field">&nbsp;</div>
    </div>
  </div>
</div>
<div class="footer">Occu-Med Provider Intelligence Hub &nbsp;·&nbsp; ${reportDate} &nbsp;·&nbsp; Confidential — Internal Use Only</div>
</div></body></html>`;
  res.setHeader("Content-Type","text/html; charset=utf-8");
  res.send(html);
});

// ── Provider Directory HTML Report ──
router.get("/analytics/report", async (req, res): Promise<void> => {
  const { state, service, verificationStatus } = req.query as Record<string, string>;

  const all = await db
    .select()
    .from(providersTable)
    .orderBy(sql`${providersTable.state} ASC NULLS LAST, ${providersTable.clinicName} ASC`);

  const filtered = all.filter((p) => {
    if (state && p.state?.toUpperCase() !== state.toUpperCase()) return false;
    if (verificationStatus && p.verificationStatus !== verificationStatus) return false;
    if (service) {
      const svcs = (p.servicesOffered || "").toLowerCase();
      if (!svcs.includes(service.toLowerCase())) return false;
    }
    return true;
  });

  const reportDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const reportTime = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const verified = filtered.filter((p) => p.verificationStatus === "Verified").length;
  const tpa = filtered.filter((p) => p.tpaFriendlyClues || p.employerAccountClues || p.corporateBillingClues).length;
  const statesSet = new Set(filtered.map((p) => p.state).filter(Boolean));
  const stateCount = statesSet.size;
  const filterDesc = [
    state ? `State: ${state}` : null,
    service ? `Service: ${service}` : null,
    verificationStatus ? `Status: ${verificationStatus}` : null,
  ].filter(Boolean).join("  ·  ") || "All Providers";

  const esc = (s: string | null | undefined) =>
    (s ?? "—").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      Verified: "badge-verified",
      "Needs Review": "badge-review",
      Flagged: "badge-flagged",
    };
    return `<span class="badge ${map[status] || "badge-review"}">${esc(status)}</span>`;
  };

  const providerCards = filtered.map((p, idx) => {
    const hasTpa = !!(p.tpaFriendlyClues || p.employerAccountClues || p.corporateBillingClues);
    const services = (p.servicesOffered || "").split(",").map((s) => s.trim()).filter(Boolean);
    return `
    <div class="provider-card">
      <div class="provider-header">
        <div class="provider-num">${String(idx + 1).padStart(2, "0")}</div>
        <div class="provider-title">
          <h3>${esc(p.clinicName)}</h3>
          <div class="provider-meta">
            ${p.clinicType ? `<span class="type-tag">${esc(p.clinicType)}</span>` : ""}
            ${hasTpa ? `<span class="tpa-tag">TPA / Corp Billing</span>` : ""}
          </div>
        </div>
        <div class="provider-status">${statusBadge(p.verificationStatus)}</div>
      </div>

      <div class="provider-grid">
        <div class="info-group">
          <div class="info-label">Address</div>
          <div class="info-val">${[p.address, p.city, p.state, p.zip].filter(Boolean).join(", ") || "—"}</div>
        </div>
        ${p.phone ? `<div class="info-group"><div class="info-label">Phone</div><div class="info-val">${esc(p.phone)}</div></div>` : ""}
        ${p.fax ? `<div class="info-group"><div class="info-label">Fax</div><div class="info-val">${esc(p.fax)}</div></div>` : ""}
        ${p.email ? `<div class="info-group"><div class="info-label">Email</div><div class="info-val">${esc(p.email)}</div></div>` : ""}
        ${p.website ? `<div class="info-group"><div class="info-label">Website</div><div class="info-val">${esc(p.website)}</div></div>` : ""}
        ${p.contactPerson ? `<div class="info-group"><div class="info-label">Contact</div><div class="info-val">${esc(p.contactPerson)}</div></div>` : ""}
        ${p.pricingNotes ? `<div class="info-group"><div class="info-label">Pricing Notes</div><div class="info-val">${esc(p.pricingNotes)}</div></div>` : ""}
        ${p.paymentRequirements ? `<div class="info-group"><div class="info-label">Payment</div><div class="info-val">${esc(p.paymentRequirements)}</div></div>` : ""}
      </div>

      ${services.length > 0 ? `
      <div class="services-row">
        <div class="info-label" style="margin-bottom:6px">Services Offered</div>
        <div class="services-list">
          ${services.map((s) => `<span class="service-chip">${esc(s)}</span>`).join("")}
        </div>
      </div>` : ""}

      ${p.notes ? `<div class="notes-row"><span class="info-label">Notes: </span>${esc(p.notes)}</div>` : ""}
    </div>`;
  }).join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Occu-Med Provider Directory — ${reportDate}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --amber: #d4941a;
      --amber-light: #f5c842;
      --dark: #1a1611;
      --mid: #2e2518;
      --text: #1a1611;
      --muted: #6b6050;
      --border: #d6c9a8;
      --bg: #faf8f4;
      --card: #ffffff;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      font-size: 13px;
      line-height: 1.5;
      padding: 0;
      margin: 0;
    }

    /* ── COVER ── */
    .cover {
      background: var(--dark);
      color: #fff;
      padding: 48px 56px 40px;
      position: relative;
      overflow: hidden;
    }
    .cover::after {
      content: "";
      position: absolute;
      top: 0; right: 0; bottom: 0;
      width: 260px;
      background: linear-gradient(135deg, transparent 40%, rgba(212,148,26,0.12) 100%);
    }
    .cover-top {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 32px;
    }
    .logo-box {
      width: 40px; height: 40px;
      border-radius: 10px;
      background: rgba(212,148,26,0.2);
      border: 1px solid rgba(212,148,26,0.4);
      display: flex; align-items: center; justify-content: center;
      font-weight: 900; font-size: 18px; color: var(--amber-light);
    }
    .brand-name {
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 0.04em;
    }
    .brand-sub {
      font-size: 11px;
      color: rgba(255,255,255,0.45);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .cover h1 {
      font-size: 32px;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.02em;
      line-height: 1.15;
      margin-bottom: 8px;
    }
    .cover-accent {
      color: var(--amber-light);
    }
    .cover-meta {
      display: flex;
      gap: 24px;
      margin-top: 20px;
      flex-wrap: wrap;
    }
    .cover-meta-item {
      font-size: 11px;
      color: rgba(255,255,255,0.5);
      text-transform: uppercase;
      letter-spacing: 0.07em;
    }
    .cover-meta-item strong {
      color: rgba(255,255,255,0.85);
      font-weight: 600;
      display: block;
      font-size: 12px;
      text-transform: none;
      letter-spacing: 0;
      margin-top: 2px;
    }
    .cover-filter {
      margin-top: 16px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 11px;
      color: rgba(255,255,255,0.6);
    }
    .cover-filter-label {
      color: var(--amber-light);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-size: 10px;
    }

    /* ── SUMMARY ── */
    .summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0;
      border-bottom: 1px solid var(--border);
      background: #fff;
    }
    .summary-item {
      padding: 20px 28px;
      border-right: 1px solid var(--border);
      text-align: center;
    }
    .summary-item:last-child { border-right: none; }
    .summary-num {
      font-size: 30px;
      font-weight: 800;
      color: var(--amber);
      line-height: 1;
      margin-bottom: 4px;
    }
    .summary-label {
      font-size: 10px;
      font-weight: 700;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    /* ── CONTENT AREA ── */
    .content {
      max-width: 960px;
      margin: 0 auto;
      padding: 32px 24px 64px;
    }
    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid var(--border);
    }
    .section-title {
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--muted);
    }
    .section-count {
      font-size: 12px;
      font-weight: 700;
      color: var(--amber);
      background: rgba(212,148,26,0.08);
      border: 1px solid rgba(212,148,26,0.2);
      border-radius: 20px;
      padding: 2px 10px;
    }

    /* ── PROVIDER CARDS ── */
    .provider-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 20px 22px;
      margin-bottom: 14px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .provider-header {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      margin-bottom: 14px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f0ece2;
    }
    .provider-num {
      font-size: 11px;
      font-weight: 900;
      color: var(--amber);
      background: rgba(212,148,26,0.08);
      border-radius: 6px;
      padding: 4px 8px;
      letter-spacing: 0.05em;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .provider-title { flex: 1; min-width: 0; }
    .provider-title h3 {
      font-size: 15px;
      font-weight: 700;
      color: var(--dark);
      line-height: 1.2;
    }
    .provider-meta {
      display: flex;
      gap: 6px;
      margin-top: 5px;
      flex-wrap: wrap;
    }
    .type-tag {
      font-size: 10px;
      font-weight: 600;
      color: var(--muted);
      background: #f4f0e6;
      border-radius: 4px;
      padding: 2px 7px;
    }
    .tpa-tag {
      font-size: 10px;
      font-weight: 700;
      color: #92600a;
      background: rgba(212,148,26,0.1);
      border: 1px solid rgba(212,148,26,0.25);
      border-radius: 4px;
      padding: 2px 7px;
    }
    .provider-status { flex-shrink: 0; margin-top: 2px; }

    /* Badges */
    .badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 800;
      padding: 3px 9px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .badge-verified { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
    .badge-review   { background: #fefce8; color: #854d0e; border: 1px solid #fde68a; }
    .badge-flagged  { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

    /* Info grid */
    .provider-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
      gap: 10px 20px;
      margin-bottom: 12px;
    }
    .info-group {}
    .info-label {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.09em;
      color: var(--muted);
      margin-bottom: 2px;
    }
    .info-val {
      font-size: 12px;
      color: var(--text);
      font-weight: 500;
      word-break: break-word;
    }

    /* Services */
    .services-row { margin-bottom: 10px; }
    .services-list { display: flex; flex-wrap: wrap; gap: 5px; }
    .service-chip {
      font-size: 10px;
      font-weight: 600;
      background: #f4f0e6;
      border: 1px solid #e0d8c4;
      border-radius: 4px;
      padding: 2px 8px;
      color: #5a4a2a;
    }

    /* Notes */
    .notes-row {
      font-size: 11px;
      color: var(--muted);
      background: #faf7f0;
      border-left: 3px solid var(--amber);
      padding: 6px 10px;
      border-radius: 0 4px 4px 0;
      margin-top: 8px;
    }

    /* Footer */
    .report-footer {
      text-align: center;
      padding: 24px;
      border-top: 1px solid var(--border);
      font-size: 10px;
      color: var(--muted);
      margin-top: 24px;
    }

    /* Print styles */
    @media print {
      body { background: #fff; }
      .cover { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .summary { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .print-btn { display: none !important; }
      .provider-card { page-break-inside: avoid; break-inside: avoid; }
    }

    /* Print button (screen only) */
    .print-bar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #fff;
      border-bottom: 1px solid var(--border);
      padding: 10px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .print-bar-left { font-size: 12px; color: var(--muted); }
    .print-bar-left strong { color: var(--text); }
    .print-btn {
      background: var(--amber);
      color: #fff;
      border: none;
      border-radius: 7px;
      padding: 8px 20px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background 0.15s;
    }
    .print-btn:hover { background: #b8800e; }
    @media screen {
      .content { max-width: 860px; }
    }
  </style>
</head>
<body>

<div class="print-bar print-btn-wrapper">
  <div class="print-bar-left">
    <strong>Occu-Med Provider Directory</strong> &nbsp;·&nbsp; ${reportDate}
    &nbsp;·&nbsp; ${filtered.length} provider${filtered.length !== 1 ? "s" : ""}
  </div>
  <button class="print-btn" onclick="window.print()">
    &#x1F5A8;&nbsp; Print / Save as PDF
  </button>
</div>

<div class="cover">
  <div class="cover-top">
    <div class="logo-box">OM</div>
    <div>
      <div class="brand-name">Occu-Med</div>
      <div class="brand-sub">Provider Intelligence Hub</div>
    </div>
  </div>
  <h1>Provider <span class="cover-accent">Directory</span><br>Report</h1>
  <div class="cover-meta">
    <div class="cover-meta-item">Generated<strong>${reportDate}, ${reportTime}</strong></div>
    <div class="cover-meta-item">Total Providers<strong>${filtered.length}</strong></div>
    <div class="cover-meta-item">States Covered<strong>${stateCount}</strong></div>
    <div class="cover-meta-item">Verified<strong>${verified}</strong></div>
    <div class="cover-meta-item">TPA / Corp Ready<strong>${tpa}</strong></div>
  </div>
  <div class="cover-filter">
    <span class="cover-filter-label">Filters</span>
    ${esc(filterDesc)}
  </div>
</div>

<div class="summary">
  <div class="summary-item"><div class="summary-num">${filtered.length}</div><div class="summary-label">Total Providers</div></div>
  <div class="summary-item"><div class="summary-num">${verified}</div><div class="summary-label">Verified</div></div>
  <div class="summary-item"><div class="summary-num">${tpa}</div><div class="summary-label">TPA / Corp Ready</div></div>
  <div class="summary-item"><div class="summary-num">${stateCount}</div><div class="summary-label">States</div></div>
</div>

<div class="content">
  <div class="section-header">
    <div class="section-title">Provider Directory</div>
    <div class="section-count">${filtered.length} record${filtered.length !== 1 ? "s" : ""}</div>
  </div>

  ${filtered.length === 0 ? `<p style="color:#888;padding:24px;text-align:center">No providers matched the selected filters.</p>` : providerCards}

  <div class="report-footer">
    Occu-Med Provider Intelligence Hub &nbsp;·&nbsp; Generated ${reportDate} &nbsp;·&nbsp; Confidential — Internal Use Only
  </div>
</div>

</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

// ── Difficulty Report History ──
router.get("/analytics/difficulty-history", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(difficultyReportsTable)
    .orderBy(sql`${difficultyReportsTable.generatedAt} DESC`)
    .limit(25);
  res.json(rows);
});

// ── Search Map: Parse uploaded CSV/Excel ──
const csvUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

router.post("/analytics/search-map/parse", csvUpload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }

  const wb = XLSX.read(req.file.buffer, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as unknown[][];

  if (rawRows.length < 2) { res.status(400).json({ error: "File is empty or has no data rows" }); return; }

  const headers = rawRows[0].map((h) => String(h ?? "").trim());
  const dataRows = rawRows.slice(1).filter((r) => (r as unknown[]).some((c) => String(c ?? "").trim() !== ""));

  const detect = (patterns: RegExp[]) => {
    const idx = headers.findIndex((h) => patterns.some((p) => p.test(h.toLowerCase())));
    return idx >= 0 ? idx : null;
  };

  const detected = {
    state:   detect([/^state$/, /^st$/, /\bstate\b/, /\bprovince\b/]),
    city:    detect([/^city$/, /^town$/, /\bcity\b/, /\blocation\b/, /\btown\b/, /\bmunicipality\b/]),
    date:    detect([/^date$/, /\bdate\b/, /\bwhen\b/, /\btime\b/, /requested/, /\bperiod\b/]),
    notes:   detect([/^notes$/, /\bnotes\b/, /\bcomments?\b/, /\bdesc/, /\bremarks?\b/]),
    name:    detect([/^name$/, /\bpatient\b/, /\bemployee\b/, /\bclaimant\b/, /\bworker\b/, /\bcandidate\b/]),
  };

  const preview = dataRows.slice(0, 6).map((r) =>
    headers.reduce((acc, h, i) => ({ ...acc, [h]: String((r as unknown[])[i] ?? "") }), {} as Record<string, string>)
  );

  const rows = dataRows.map((r) => ({
    state: detected.state != null ? String((r as unknown[])[detected.state] ?? "").trim().toUpperCase() : "",
    city:  detected.city  != null ? String((r as unknown[])[detected.city!] ?? "").trim() || null : null,
    date:  detected.date  != null ? String((r as unknown[])[detected.date!] ?? "").trim() || null : null,
    notes: detected.notes != null ? String((r as unknown[])[detected.notes!] ?? "").trim() || null : null,
    name:  detected.name  != null ? String((r as unknown[])[detected.name!] ?? "").trim() || null : null,
  }));

  res.json({ headers, totalRows: dataRows.length, detected, preview, rows });
});

// ── Search Map: Analyze location frequencies ──
router.post("/analytics/search-map/analyze", async (req, res): Promise<void> => {
  const { rows } = req.body as { rows: Array<{ state: string; city: string | null }> };
  if (!Array.isArray(rows) || rows.length === 0) { res.status(400).json({ error: "rows required" }); return; }

  const locMap: Record<string, { state: string; city: string | null; attempts: number }> = {};
  for (const r of rows) {
    if (!r.state) continue;
    const key = `${r.state.toUpperCase()}::${(r.city || "").toLowerCase().trim()}`;
    if (!locMap[key]) locMap[key] = { state: r.state.toUpperCase(), city: r.city || null, attempts: 0 };
    locMap[key].attempts++;
  }

  const locations = Object.values(locMap).sort((a, b) => b.attempts - a.attempts);

  const allProviders = await db.select({
    state: providersTable.state,
    verificationStatus: providersTable.verificationStatus,
  }).from(providersTable).where(sql`${providersTable.state} IS NOT NULL`);

  const provByState: Record<string, { total: number; verified: number }> = {};
  for (const p of allProviders) {
    const st = p.state!.toUpperCase();
    if (!provByState[st]) provByState[st] = { total: 0, verified: 0 };
    provByState[st].total++;
    if (p.verificationStatus === "Verified") provByState[st].verified++;
  }

  const allOutreach = await db.select({ providerState: outreachRecordsTable.providerState }).from(outreachRecordsTable);
  const outreachByState: Record<string, number> = {};
  for (const o of allOutreach) {
    if (!o.providerState) continue;
    const st = o.providerState.toUpperCase();
    outreachByState[st] = (outreachByState[st] || 0) + 1;
  }

  const enriched = locations.map((loc) => {
    const p = provByState[loc.state] ?? { total: 0, verified: 0 };
    const gap = loc.attempts >= 3 && p.total === 0 ? "Critical"
      : loc.attempts >= 2 && p.total < 2 ? "High"
      : loc.attempts >= 1 && p.total < 3 ? "Medium"
      : "Low";
    return { ...loc, providers: p.total, verifiedProviders: p.verified, outreachAttempts: outreachByState[loc.state] ?? 0, gapScore: gap };
  });

  const stateSummary: Record<string, { state: string; totalAttempts: number; providers: number; verifiedProviders: number; outreachAttempts: number }> = {};
  for (const loc of enriched) {
    if (!stateSummary[loc.state]) {
      const p = provByState[loc.state] ?? { total: 0, verified: 0 };
      stateSummary[loc.state] = { state: loc.state, totalAttempts: 0, providers: p.total, verifiedProviders: p.verified, outreachAttempts: outreachByState[loc.state] ?? 0 };
    }
    stateSummary[loc.state].totalAttempts += loc.attempts;
  }

  res.json({
    locations: enriched,
    stateSummary: Object.values(stateSummary).sort((a, b) => b.totalAttempts - a.totalAttempts),
    totalRows: rows.length,
    uniqueStates: Object.keys(stateSummary).length,
    uniqueLocations: locations.length,
  });
});

// ── Director Monthly Report helper ──
async function computeDirectorReport(year: number, mon: number) {
  const start = new Date(year, mon - 1, 1);
  const end   = new Date(year, mon, 1);
  const period = new Date(year, mon - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const [diffReports, outreachThisMonth, providersAdded, allProviders, allOutreach, prevReports, prevOutreach] = await Promise.all([
    db.select().from(difficultyReportsTable).where(sql`${difficultyReportsTable.generatedAt} >= ${start} AND ${difficultyReportsTable.generatedAt} < ${end}`),
    db.select().from(outreachRecordsTable).where(sql`${outreachRecordsTable.sentAt} >= ${start} AND ${outreachRecordsTable.sentAt} < ${end}`),
    db.select({ id: providersTable.id }).from(providersTable).where(sql`${providersTable.createdAt} >= ${start} AND ${providersTable.createdAt} < ${end}`),
    db.select({ state: providersTable.state, verificationStatus: providersTable.verificationStatus }).from(providersTable),
    db.select({ providerState: outreachRecordsTable.providerState, status: outreachRecordsTable.status }).from(outreachRecordsTable),
    db.select().from(difficultyReportsTable).where(sql`${difficultyReportsTable.generatedAt} < ${start}`).orderBy(sql`${difficultyReportsTable.generatedAt} DESC`).limit(1),
    db.select().from(outreachRecordsTable).where(sql`${outreachRecordsTable.sentAt} < ${start}`).orderBy(sql`${outreachRecordsTable.sentAt} DESC`).limit(1),
  ]);

  const totalProviders = allProviders.length;
  const totalVerified  = allProviders.filter((p) => p.verificationStatus === "Verified").length;
  const provByState: Record<string, number> = {};
  for (const p of allProviders) { if (p.state) provByState[p.state] = (provByState[p.state] || 0) + 1; }

  const tierCounts: Record<string, number> = { Critical: 0, Hard: 0, Moderate: 0, Easy: 0 };
  const deptCounts: Record<string, number> = {};
  const stateSearchCounts: Record<string, number> = {};
  let totalScore = 0;
  for (const r of diffReports) {
    tierCounts[r.tier] = (tierCounts[r.tier] || 0) + 1;
    if (r.department) deptCounts[r.department] = (deptCounts[r.department] || 0) + 1;
    stateSearchCounts[r.state] = (stateSearchCounts[r.state] || 0) + 1;
    totalScore += r.score;
  }

  const outreachByState: Record<string, number> = {};
  let oSent = 0, oResponded = 0, oFailed = 0, oAgreements = 0;
  for (const o of outreachThisMonth) {
    if (o.providerState) outreachByState[o.providerState] = (outreachByState[o.providerState] || 0) + 1;
    if (["sent","delivered"].includes(o.status)) oSent++;
    else if (["responded","interested"].includes(o.status)) oResponded++;
    else if (["failed","no_response","bounced"].includes(o.status)) oFailed++;
    else if (o.status === "agreement") oAgreements++;
  }

  const totalAllOutreach = allOutreach.length;
  const allAgreements = allOutreach.filter((o) => o.status === "agreement").length;

  const criticalRegions = diffReports
    .filter((r) => r.tier === "Critical" || r.tier === "Hard")
    .map((r) => ({ id: r.id, state: r.state, city: r.city, score: r.score, tier: r.tier, service: r.service, department: r.department, generatedAt: r.generatedAt }))
    .sort((a, b) => b.score - a.score).slice(0, 10);

  const recs: string[] = [];
  if (tierCounts.Critical > 0) recs.push(`${tierCounts.Critical} Critical difficulty region${tierCounts.Critical !== 1 ? "s" : ""} identified this month. Immediate escalation and expanded sourcing budget is strongly recommended.`);
  if (outreachThisMonth.length > 0 && oFailed / outreachThisMonth.length > 0.5) recs.push(`Over 50% of outreach attempts this month went unanswered. Consider switching to phone/fax campaigns for high-priority states.`);
  if (providersAdded.length < 5) recs.push(`Provider network growth is low this month (${providersAdded.length} new additions). Prioritize sourcing campaigns in under-served states.`);
  if (totalVerified / Math.max(1, totalProviders) < 0.7) recs.push(`Only ${Math.round((totalVerified / Math.max(1, totalProviders)) * 100)}% of the total provider database is verified. A verification sprint would meaningfully improve scheduling confidence.`);
  if (diffReports.length === 0) recs.push(`No difficulty assessments were generated this month. Encourage the Scheduling and Finance teams to run assessments before initiating searches in new regions.`);
  if (recs.length === 0) recs.push(`Network activity looks healthy this month. Continue monitoring high-difficulty states and maintain regular verification cadence.`);

  return {
    month: `${year}-${String(mon).padStart(2, "0")}`,
    period,
    generatedAt: new Date().toISOString(),
    compareToPrevious: prevReports.length > 0 ? {
      month: new Date(prevReports[0].generatedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      difficultyReports: prevReports.length,
      outreach: prevOutreach.length,
      avgScore: prevReports[0].score,
      responseRate: prevOutreach.length > 0 ? Math.round(((prevOutreach.filter((o) => ["responded", "interested", "agreement"].includes(o.status)).length) / prevOutreach.length) * 100) : 0,
    } : null,
    difficultyReports: {
      total: diffReports.length,
      byTier: tierCounts,
      avgScore: diffReports.length > 0 ? Math.round(totalScore / diffReports.length) : null,
      topStates: Object.entries(stateSearchCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([state, count]) => ({ state, count })),
      byDepartment: Object.entries(deptCounts).sort((a, b) => b[1] - a[1]).map(([dept, count]) => ({ dept, count })),
    },
    outreach: {
      total: outreachThisMonth.length,
      sent: oSent,
      responded: oResponded,
      failed: oFailed,
      agreements: oAgreements,
      allTimeTotal: totalAllOutreach,
      allTimeAgreements: allAgreements,
      topStates: Object.entries(outreachByState).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([state, count]) => ({ state, count })),
    },
    providers: {
      total: totalProviders,
      verified: totalVerified,
      addedThisMonth: providersAdded.length,
      topStates: Object.entries(provByState).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([state, count]) => ({ state, count })),
    },
    criticalRegions,
    recommendations: recs,
  };
}

router.get("/analytics/director-report", async (req, res): Promise<void> => {
  const { month } = req.query as Record<string, string>;
  const now = new Date();
  const year = month ? parseInt(month.split("-")[0]) : now.getFullYear();
  const mon  = month ? parseInt(month.split("-")[1]) : now.getMonth() + 1;
  const data = await computeDirectorReport(year, mon);
  res.json(data);
});

router.get("/analytics/director-report/print", async (req, res): Promise<void> => {
  const { month } = req.query as Record<string, string>;
  const now = new Date();
  const year = month ? parseInt(month.split("-")[0]) : now.getFullYear();
  const mon  = month ? parseInt(month.split("-")[1]) : now.getMonth() + 1;
  const r = await computeDirectorReport(year, mon);
  const reportDate = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const reportTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const esc = (s: string | null | undefined) => (s ?? "—").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const tierColor = (t: string) => t === "Critical" ? "#ef4444" : t === "Hard" ? "#f97316" : t === "Moderate" ? "#eab308" : "#22c55e";
  const tierBg    = (t: string) => t === "Critical" ? "#fef2f2" : t === "Hard" ? "#fff7ed" : t === "Moderate" ? "#fefce8" : "#f0fdf4";

  const kpis = [
    { label: "Difficulty Searches", val: r.difficultyReports.total, sub: "this month", color: "#d4941a" },
    { label: "Critical / Hard Regions", val: (r.difficultyReports.byTier.Critical || 0) + (r.difficultyReports.byTier.Hard || 0), sub: "needing escalation", color: "#ef4444" },
    { label: "Avg Difficulty Score", val: r.difficultyReports.avgScore != null ? `${r.difficultyReports.avgScore}/100` : "N/A", sub: "across all searches", color: "#f97316" },
    { label: "Outreach Attempts", val: r.outreach.total, sub: "this month", color: "#3b82f6" },
    { label: "Agreements Reached", val: r.outreach.agreements, sub: "provider agreements", color: "#22c55e" },
    { label: "New Providers Added", val: r.providers.addedThisMonth, sub: "to network database", color: "#8b5cf6" },
  ];

  const kpiHtml = kpis.map((k) => `
    <div class="kpi-card">
      <div class="kpi-num" style="color:${k.color}">${k.val}</div>
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-sub">${k.sub}</div>
    </div>`).join("");

  const tierRows = Object.entries(r.difficultyReports.byTier).map(([tier, count]) => `
    <tr>
      <td><span style="display:inline-flex;align-items:center;gap:6px;font-weight:700;color:${tierColor(tier)};background:${tierBg(tier)};border:1px solid ${tierColor(tier)}30;border-radius:5px;padding:3px 10px;font-size:11px">${tier}</span></td>
      <td style="font-weight:800;font-size:16px;color:#1a1611">${count}</td>
      <td style="color:#6b6050">${r.difficultyReports.total > 0 ? Math.round((count / r.difficultyReports.total) * 100) : 0}%</td>
    </tr>`).join("");

  const topSearchStates = r.difficultyReports.topStates.map((s) => `
    <tr><td style="font-weight:700">${esc(s.state)}</td><td style="font-weight:800;color:#d4941a">${s.count}</td></tr>`).join("") || `<tr><td colspan="2" style="color:#999;text-align:center">No searches this period</td></tr>`;

  const deptRows = r.difficultyReports.byDepartment.map((d) => `
    <tr><td style="font-weight:600">${esc(d.dept)}</td><td style="font-weight:800;color:#d4941a">${d.count}</td></tr>`).join("") || `<tr><td colspan="2" style="color:#999;text-align:center">No data</td></tr>`;

  const criticalRows = r.criticalRegions.length > 0
    ? r.criticalRegions.map((cr) => `
    <tr>
      <td style="font-weight:700">${esc(cr.state)}${cr.city ? `, ${esc(cr.city)}` : ""}</td>
      <td><span style="font-weight:800;color:${tierColor(cr.tier)};background:${tierBg(cr.tier)};border:1px solid ${tierColor(cr.tier)}30;border-radius:4px;padding:2px 8px;font-size:10px">${esc(cr.tier)}</span></td>
      <td style="font-weight:900;font-size:15px;color:${tierColor(cr.tier)}">${cr.score}</td>
      <td style="color:#6b6050;font-size:11px">${esc(cr.service)}</td>
      <td style="color:#6b6050;font-size:11px">${esc(cr.department)}</td>
    </tr>`).join("")
    : `<tr><td colspan="5" style="color:#999;text-align:center;padding:20px">No critical or high-difficulty regions identified this period — excellent network health.</td></tr>`;

  const outreachStateRows = r.outreach.topStates.map((s) => `
    <tr><td style="font-weight:700">${esc(s.state)}</td><td style="font-weight:800;color:#3b82f6">${s.count}</td></tr>`).join("") || `<tr><td colspan="2" style="color:#999;text-align:center">No outreach this period</td></tr>`;

  const provStateRows = r.providers.topStates.map((s) => `
    <tr><td style="font-weight:700">${esc(s.state)}</td><td style="font-weight:800;color:#22c55e">${s.count}</td></tr>`).join("") || `<tr><td colspan="2" style="color:#999;text-align:center">No data</td></tr>`;

  const recItems = r.recommendations.map((rec, i) => `
    <div style="display:flex;gap:12px;padding:12px 14px;background:#fff;border:1px solid #d6c9a8;border-left:4px solid #d4941a;border-radius:0 8px 8px 0;margin-bottom:10px;page-break-inside:avoid">
      <div style="font-size:11px;font-weight:900;color:#d4941a;flex-shrink:0;width:20px">${i + 1}</div>
      <div style="font-size:12px;color:#1a1611">${esc(rec)}</div>
    </div>`).join("");

  const responseRate = r.outreach.total > 0 ? Math.round(((r.outreach.responded + r.outreach.agreements) / r.outreach.total) * 100) : 0;

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>Monthly Network Development Report — ${esc(r.period)}</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--amber:#d4941a;--amber-light:#f5c842;--dark:#1a1611;--mid:#2e2518;--text:#1a1611;--muted:#6b6050;--border:#d6c9a8;--bg:#faf8f4;--card:#fff}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;background:var(--bg);color:var(--text);font-size:13px;line-height:1.5}
.print-bar{position:sticky;top:0;z-index:100;background:#fff;border-bottom:1px solid var(--border);padding:10px 24px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 2px 8px rgba(0,0,0,.08)}
.print-bar-left{font-size:12px;color:var(--muted)}
.print-btn{background:var(--amber);color:#fff;border:none;border-radius:7px;padding:8px 20px;font-size:13px;font-weight:700;cursor:pointer}
@media print{.print-bar{display:none!important}body{background:#fff}}
.cover{background:var(--dark);color:#fff;padding:44px 52px 40px}
.cover-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:32px}
.cover-brand{display:flex;align-items:center;gap:12px}
.logo-box{width:42px;height:42px;border-radius:10px;background:rgba(212,148,26,.2);border:1px solid rgba(212,148,26,.4);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:17px;color:#f5c842}
.brand-name{font-size:18px;font-weight:700}
.brand-sub{font-size:10px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.08em}
.conf-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3);border-radius:5px;padding:5px 12px;font-size:10px;font-weight:800;color:#fca5a5;text-transform:uppercase;letter-spacing:.07em}
.cover h1{font-size:30px;font-weight:800;letter-spacing:-.02em;margin-bottom:8px;line-height:1.15}
.cover h1 span{color:#f5c842}
.cover-sub{color:rgba(255,255,255,.5);font-size:14px;margin-bottom:28px}
.cover-meta{display:flex;gap:36px;flex-wrap:wrap}
.cmi{font-size:10px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.07em}
.cmi strong{display:block;font-size:13px;color:rgba(255,255,255,.85);text-transform:none;letter-spacing:0;margin-top:2px}
.kpi-bar{background:#fff;border-bottom:1px solid var(--border);padding:28px 52px}
.kpi-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:16px}
.kpi-card{text-align:center;background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:16px 10px}
.kpi-num{font-size:26px;font-weight:900;line-height:1;margin-bottom:4px}
.kpi-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--muted)}
.kpi-sub{font-size:9px;color:#aaa;margin-top:2px}
.content{max-width:1040px;margin:0 auto;padding:36px 24px 60px}
.section-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid var(--border)}
.section-title{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--muted)}
.section-badge{font-size:10px;font-weight:700;color:var(--amber);background:rgba(212,148,26,.08);border:1px solid rgba(212,148,26,.2);border-radius:20px;padding:2px 10px}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px}
.panel{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:18px}
.panel-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.09em;color:var(--muted);margin-bottom:12px}
table{width:100%;border-collapse:collapse}
th{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);padding:8px 10px;text-align:left;border-bottom:1px solid var(--border)}
td{padding:8px 10px;border-bottom:1px solid #f0ece2;font-size:12px;vertical-align:middle}
tr:last-child td{border-bottom:none}
.out-stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px}
.out-stat{text-align:center;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:14px}
.out-num{font-size:24px;font-weight:900;color:var(--amber)}
.out-lbl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);margin-top:3px}
.signoff{margin-top:36px;padding:24px;border:1px solid var(--border);border-radius:10px;background:var(--card);page-break-inside:avoid}
.so-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:20px}
.so-grid{display:grid;grid-template-columns:1fr 1fr;gap:32px}
.so-field{border-bottom:1px solid #d6c9a8;padding-bottom:4px;min-height:26px;margin-bottom:4px}
.so-lbl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);margin-top:14px;margin-bottom:4px}
.footer{text-align:center;padding:20px;border-top:1px solid var(--border);font-size:10px;color:var(--muted);margin-top:20px}
</style></head><body>
<div class="print-bar">
  <div class="print-bar-left"><strong>Monthly Network Development Report</strong> — ${esc(r.period)} &nbsp;·&nbsp; Prepared for Director of Network Management</div>
  <button class="print-btn" onclick="window.print()">🖨&nbsp; Print / Save as PDF</button>
</div>
<div class="cover">
  <div class="cover-top">
    <div class="cover-brand">
      <div class="logo-box">OM</div>
      <div><div class="brand-name">Occu-Med</div><div class="brand-sub">Provider Intelligence Hub</div></div>
    </div>
    <div class="conf-badge">⚠ Internal Use Only — Confidential</div>
  </div>
  <h1>Monthly Network <span>Development</span> Report</h1>
  <div class="cover-sub">Prepared for: Director of Network Management</div>
  <div class="cover-meta">
    <div class="cmi">Reporting Period<strong>${esc(r.period)}</strong></div>
    <div class="cmi">Generated<strong>${reportDate}, ${reportTime}</strong></div>
    <div class="cmi">Provider Searches<strong>${r.difficultyReports.total} assessment${r.difficultyReports.total !== 1 ? "s" : ""}</strong></div>
    <div class="cmi">Outreach Attempts<strong>${r.outreach.total} this month</strong></div>
    <div class="cmi">Total Network<strong>${r.providers.total} providers</strong></div>
  </div>
</div>
<div class="kpi-bar">
  <div class="kpi-grid">${kpiHtml}</div>
</div>
<div class="content">
  <div class="section-hdr" style="margin-bottom:20px"><div class="section-title">Provider Search Activity</div><div class="section-badge">${r.difficultyReports.total} searches this period</div></div>
  <div class="two-col">
    <div class="panel">
      <div class="panel-title">Searches by Difficulty Tier</div>
      <table><thead><tr><th>Tier</th><th>Count</th><th>Share</th></tr></thead><tbody>${tierRows}</tbody></table>
      ${r.difficultyReports.avgScore != null ? `<div style="margin-top:14px;padding:10px 14px;background:#faf7f0;border:1px solid #e8dfc8;border-radius:6px;font-size:12px"><span style="color:var(--muted);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;display:block;margin-bottom:2px">Average Score</span><span style="font-size:22px;font-weight:900;color:var(--amber)">${r.difficultyReports.avgScore}</span><span style="color:var(--muted)">/100 across all searches</span></div>` : ""}
    </div>
    <div class="panel">
      <div class="panel-title">Top States Searched</div>
      <table><thead><tr><th>State</th><th>Searches</th></tr></thead><tbody>${topSearchStates}</tbody></table>
    </div>
  </div>
  ${r.difficultyReports.byDepartment.length > 0 ? `
  <div style="margin-bottom:28px">
    <div class="panel">
      <div class="panel-title">Searches by Department</div>
      <table><thead><tr><th>Department</th><th>Searches</th></tr></thead><tbody>${deptRows}</tbody></table>
    </div>
  </div>` : ""}

  <div class="section-hdr"><div class="section-title">Outreach Campaign Results</div><div class="section-badge">${r.outreach.total} attempts this period</div></div>
  <div class="out-stat-grid">
    <div class="out-stat"><div class="out-num" style="color:#3b82f6">${r.outreach.total}</div><div class="out-lbl">Total Attempts</div></div>
    <div class="out-stat"><div class="out-num" style="color:#22c55e">${r.outreach.responded + r.outreach.agreements}</div><div class="out-lbl">Responded</div></div>
    <div class="out-stat"><div class="out-num" style="color:#ef4444">${r.outreach.failed}</div><div class="out-lbl">Failed / No Reply</div></div>
    <div class="out-stat"><div class="out-num" style="color:var(--amber)">${r.outreach.agreements}</div><div class="out-lbl">Agreements</div></div>
  </div>
  <div style="display:flex;gap:16px;margin-bottom:28px">
    <div style="flex:1;background:var(--card);border:1px solid var(--border);border-radius:10px;padding:14px 18px">
      <div class="panel-title">Response Rate (this month)</div>
      <div style="font-size:32px;font-weight:900;color:${responseRate >= 40 ? "#22c55e" : responseRate >= 20 ? "#eab308" : "#ef4444"}">${responseRate}%</div>
      <div style="font-size:11px;color:var(--muted);margin-top:2px">of outreach received a response</div>
    </div>
    <div style="flex:2;background:var(--card);border:1px solid var(--border);border-radius:10px;padding:14px 18px">
      <div class="panel-title">Top Outreach States (this month)</div>
      <table><thead><tr><th>State</th><th>Attempts</th></tr></thead><tbody>${outreachStateRows}</tbody></table>
    </div>
  </div>
  <div style="padding:12px 16px;background:#e8f4fd;border:1px solid #bfdbfe;border-radius:8px;margin-bottom:28px;font-size:12px">
    <strong style="color:#1e40af">All-Time Outreach:</strong> ${r.outreach.allTimeTotal} total attempts with ${r.outreach.allTimeAgreements} agreements reached (${r.outreach.allTimeTotal > 0 ? Math.round((r.outreach.allTimeAgreements / r.outreach.allTimeTotal) * 100) : 0}% agreement rate).
  </div>

  <div class="section-hdr"><div class="section-title">Network Provider Summary</div><div class="section-badge">${r.providers.total} total providers</div></div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px">
    <div class="out-stat"><div class="out-num" style="color:var(--amber)">${r.providers.total}</div><div class="out-lbl">Total Providers</div></div>
    <div class="out-stat"><div class="out-num" style="color:#22c55e">${r.providers.verified}</div><div class="out-lbl">Verified Providers</div></div>
    <div class="out-stat"><div class="out-num" style="color:#8b5cf6">${r.providers.addedThisMonth}</div><div class="out-lbl">Added This Month</div></div>
  </div>
  <div style="margin-bottom:28px">
    <div class="panel">
      <div class="panel-title">Provider Distribution by State (Top 8)</div>
      <table><thead><tr><th>State</th><th>Providers</th></tr></thead><tbody>${provStateRows}</tbody></table>
    </div>
  </div>

  <div class="section-hdr"><div class="section-title">Critical &amp; High Difficulty Regions</div><div class="section-badge">${r.criticalRegions.length} region${r.criticalRegions.length !== 1 ? "s" : ""} flagged</div></div>
  <table style="margin-bottom:28px"><thead><tr><th>Region</th><th>Tier</th><th>Score</th><th>Service</th><th>Department</th></tr></thead><tbody>${criticalRows}</tbody></table>

  <div class="section-hdr"><div class="section-title">Director Recommendations &amp; Action Items</div></div>
  ${recItems}

  <div class="signoff">
    <div class="so-title">Review &amp; Authorization</div>
    <div class="so-grid">
      <div>
        <div class="so-lbl">Prepared By (Network Team)</div><div class="so-field">&nbsp;</div>
        <div class="so-lbl">Date Submitted</div><div class="so-field">${reportDate}</div>
      </div>
      <div>
        <div class="so-lbl">Reviewed By — Director of Network Management</div><div class="so-field">&nbsp;</div>
        <div class="so-lbl">Director Signature / Acknowledgment</div><div class="so-field">&nbsp;</div>
      </div>
    </div>
  </div>
  <div class="footer">Occu-Med Provider Intelligence Hub &nbsp;·&nbsp; ${esc(r.period)} Monthly Report &nbsp;·&nbsp; Generated ${reportDate} &nbsp;·&nbsp; Confidential — Internal Use Only</div>
</div></body></html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

export default router;
