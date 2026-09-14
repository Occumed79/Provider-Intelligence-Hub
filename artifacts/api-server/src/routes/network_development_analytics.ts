import { Router, type IRouter } from "express";
import {
  db,
  PROCUREMENT_STAGES,
  auditEventsTable,
  outreachRecordsTable,
  procurementRecordsTable,
  providersTable,
} from "@workspace/db";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

type RangeKey = "week" | "month" | "quarter" | "year" | "all";
type Period = {
  range: RangeKey;
  start: Date | null;
  end: Date;
  previousStart: Date | null;
  previousEnd: Date | null;
};

type ProcurementRecord = typeof procurementRecordsTable.$inferSelect;
type Provider = typeof providersTable.$inferSelect;
type OutreachRecord = typeof outreachRecordsTable.$inferSelect;
type AuditEvent = typeof auditEventsTable.$inferSelect;

const STAGE_ORDER = new Map(PROCUREMENT_STAGES.map((stage, index) => [stage, index]));
const CLOSED_STAGES = new Set(["Activated / Live", "Lost / Not Viable"]);

function validDate(value: unknown): Date | null {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function rangeDays(range: RangeKey) {
  if (range === "week") return 7;
  if (range === "month") return 30;
  if (range === "quarter") return 90;
  if (range === "year") return 365;
  return null;
}

function resolvePeriod(query: Record<string, unknown>): Period {
  const requested = String(query.range || "month").toLowerCase();
  const range: RangeKey = ["week", "month", "quarter", "year", "all"].includes(requested)
    ? requested as RangeKey
    : "month";
  const end = validDate(query.to) || new Date();
  const explicitStart = validDate(query.from);
  let start = explicitStart;
  if (!start && range !== "all") {
    const days = rangeDays(range) || 30;
    start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  }

  let previousStart: Date | null = null;
  let previousEnd: Date | null = null;
  if (start) {
    const duration = Math.max(end.getTime() - start.getTime(), 1);
    previousEnd = new Date(start.getTime() - 1);
    previousStart = new Date(previousEnd.getTime() - duration);
  }

  return { range, start, end, previousStart, previousEnd };
}

function inPeriod(value: Date | string | null | undefined, start: Date | null, end: Date) {
  if (!value) return false;
  const stamp = new Date(value).getTime();
  if (!Number.isFinite(stamp)) return false;
  if (stamp > end.getTime()) return false;
  return start ? stamp >= start.getTime() : true;
}

function safeJson(value: string | null) {
  if (!value) return null;
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function splitServices(value: string | null | undefined) {
  return String(value || "")
    .split(/[;,|\n]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 1);
}

function locationParts(record: Pick<ProcurementRecord, "city" | "state" | "country">) {
  return [record.city, record.state, record.country].map((value) => String(value || "").trim()).filter(Boolean);
}

function marketKey(record: Pick<ProcurementRecord, "city" | "state" | "country">) {
  const parts = locationParts(record);
  return parts.length ? parts.join(" | ").toLowerCase() : "unlocated";
}

function marketLabel(record: Pick<ProcurementRecord, "city" | "state" | "country">) {
  const parts = locationParts(record);
  return parts.length ? parts.join(", ") : "Location not set";
}

function bucketKey(date: Date, range: RangeKey) {
  const iso = date.toISOString();
  if (range === "week" || range === "month") return iso.slice(0, 10);
  if (range === "quarter") {
    const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const weekday = (day.getUTCDay() + 6) % 7;
    day.setUTCDate(day.getUTCDate() - weekday);
    return day.toISOString().slice(0, 10);
  }
  return iso.slice(0, 7);
}

function mostAdvancedStage(records: ProcurementRecord[]) {
  if (!records.length) return "Need Identified";
  const active = records.filter((record) => record.stage !== "Lost / Not Viable");
  const pool = active.length ? active : records;
  return [...pool].sort((a, b) => (STAGE_ORDER.get(b.stage as typeof PROCUREMENT_STAGES[number]) ?? -1) - (STAGE_ORDER.get(a.stage as typeof PROCUREMENT_STAGES[number]) ?? -1))[0]?.stage || "Need Identified";
}

function stageCounts(records: ProcurementRecord[]) {
  const counts = Object.fromEntries(PROCUREMENT_STAGES.map((stage) => [stage, 0])) as Record<string, number>;
  records.forEach((record) => {
    if (record.stage in counts) counts[record.stage] += 1;
  });
  return counts;
}

function buildExpansionData(
  procurement: ProcurementRecord[],
  providers: Provider[],
  outreach: OutreachRecord[],
  audits: AuditEvent[],
  period: Period,
) {
  const targetsAdded = procurement.filter((record) => inPeriod(record.createdAt, period.start, period.end));
  const activations = procurement
    .filter((record) => inPeriod(record.activatedAt, period.start, period.end))
    .sort((a, b) => new Date(b.activatedAt || 0).getTime() - new Date(a.activatedAt || 0).getTime());
  const losses = procurement.filter((record) => inPeriod(record.lostAt, period.start, period.end));
  const newProviders = providers.filter((provider) => inPeriod(provider.createdAt, period.start, period.end));
  const outreachTouches = outreach.filter((record) => inPeriod(record.createdAt || record.sentAt, period.start, period.end));

  const transitions = audits
    .filter((event) => event.entityType === "procurement_record" && event.action === "stage_changed" && inPeriod(event.createdAt, period.start, period.end))
    .map((event) => {
      const before = safeJson(event.beforeJson);
      const after = safeJson(event.afterJson);
      return {
        id: event.id,
        procurementId: event.entityId,
        providerName: String(after?.providerName || before?.providerName || event.summary || "Procurement record"),
        fromStage: String(before?.stage || ""),
        toStage: String(after?.stage || ""),
        city: String(after?.city || before?.city || "") || null,
        state: String(after?.state || before?.state || "") || null,
        country: String(after?.country || before?.country || "") || null,
        serviceCategory: String(after?.serviceCategory || before?.serviceCategory || "") || null,
        occurredAt: event.createdAt,
      };
    })
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

  const activationMarkets = new Map<string, { label: string; city: string | null; state: string | null; country: string | null; count: number }>();
  activations.forEach((record) => {
    const key = marketKey(record);
    const current = activationMarkets.get(key) || {
      label: marketLabel(record),
      city: record.city,
      state: record.state,
      country: record.country,
      count: 0,
    };
    current.count += 1;
    activationMarkets.set(key, current);
  });

  const activatedServices = new Map<string, number>();
  activations.forEach((record) => {
    splitServices(record.serviceCategory).forEach((service) => {
      activatedServices.set(service, (activatedServices.get(service) || 0) + 1);
    });
  });

  const currentMarkets = new Map<string, ProcurementRecord[]>();
  procurement.forEach((record) => {
    const key = marketKey(record);
    currentMarkets.set(key, [...(currentMarkets.get(key) || []), record]);
  });

  const markets = [...currentMarkets.entries()].map(([key, records]) => ({
    key,
    label: marketLabel(records[0]),
    city: records[0]?.city || null,
    state: records[0]?.state || null,
    country: records[0]?.country || null,
    stage: mostAdvancedStage(records),
    countsByStage: stageCounts(records),
    totalEfforts: records.length,
    liveCount: records.filter((record) => record.stage === "Activated / Live").length,
    activeDevelopmentCount: records.filter((record) => !CLOSED_STAGES.has(record.stage)).length,
  })).sort((a, b) => b.liveCount - a.liveCount || b.activeDevelopmentCount - a.activeDevelopmentCount || a.label.localeCompare(b.label));

  const timelineBuckets = new Map<string, { bucket: string; targets: number; transitions: number; activations: number; losses: number; providersAdded: number }>();
  const bump = (value: Date | string | null | undefined, field: "targets" | "transitions" | "activations" | "losses" | "providersAdded") => {
    if (!value || !inPeriod(value, period.start, period.end)) return;
    const date = new Date(value);
    const key = bucketKey(date, period.range);
    const row = timelineBuckets.get(key) || { bucket: key, targets: 0, transitions: 0, activations: 0, losses: 0, providersAdded: 0 };
    row[field] += 1;
    timelineBuckets.set(key, row);
  };
  targetsAdded.forEach((record) => bump(record.createdAt, "targets"));
  transitions.forEach((event) => bump(event.occurredAt, "transitions"));
  activations.forEach((record) => bump(record.activatedAt, "activations"));
  losses.forEach((record) => bump(record.lostAt, "losses"));
  newProviders.forEach((provider) => bump(provider.createdAt, "providersAdded"));

  const timeline = [...timelineBuckets.values()].sort((a, b) => a.bucket.localeCompare(b.bucket));
  const currentPipeline = stageCounts(procurement);

  const pricingSecuredTransitions = transitions.filter((event) => event.toStage === "Pricing Secured").length;
  const agreementTransitions = transitions.filter((event) => event.toStage === "Agreement Pending" || event.toStage === "Final Review").length;
  const contactTransitions = transitions.filter((event) => event.toStage === "In Contact" || event.toStage === "Evaluating").length;

  return {
    period: {
      range: period.range,
      start: period.start?.toISOString() || null,
      end: period.end.toISOString(),
    },
    kpis: {
      targetsAdded: targetsAdded.length,
      contactMoves: contactTransitions,
      pricingSecured: pricingSecuredTransitions,
      agreementMoves: agreementTransitions,
      activated: activations.length,
      lost: losses.length,
      newProviders: newProviders.length,
      newMarkets: activationMarkets.size,
      servicesAdded: activatedServices.size,
      activeDevelopment: procurement.filter((record) => !CLOSED_STAGES.has(record.stage)).length,
      outreachTouches: outreachTouches.length,
    },
    pipeline: currentPipeline,
    markets,
    activatedMarkets: [...activationMarkets.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
    servicesActivated: [...activatedServices.entries()]
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count || a.service.localeCompare(b.service)),
    activations: activations.map((record) => ({
      id: record.id,
      providerId: record.providerId,
      providerName: record.providerName,
      city: record.city,
      state: record.state,
      country: record.country,
      market: marketLabel(record),
      serviceCategory: record.serviceCategory,
      owner: record.owner,
      activatedAt: record.activatedAt,
    })),
    transitions,
    timeline,
  };
}

function delta(current: number, previous: number) {
  return { current, previous, change: current - previous };
}

function escapeCsv(value: unknown) {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

async function loadSourceData() {
  const [procurement, providers, outreach, audits] = await Promise.all([
    db.select().from(procurementRecordsTable).orderBy(desc(procurementRecordsTable.updatedAt)),
    db.select().from(providersTable).orderBy(desc(providersTable.createdAt)),
    db.select().from(outreachRecordsTable).orderBy(desc(outreachRecordsTable.createdAt)),
    db.select().from(auditEventsTable).orderBy(desc(auditEventsTable.createdAt)),
  ]);
  return { procurement, providers, outreach, audits };
}

router.get("/analytics/network-development/expansion", async (req, res): Promise<void> => {
  const period = resolvePeriod(req.query as Record<string, unknown>);
  const source = await loadSourceData();
  res.json(buildExpansionData(source.procurement, source.providers, source.outreach, source.audits, period));
});

router.get("/analytics/network-development/report-data", async (req, res): Promise<void> => {
  const period = resolvePeriod(req.query as Record<string, unknown>);
  const source = await loadSourceData();
  const expansion = buildExpansionData(source.procurement, source.providers, source.outreach, source.audits, period);

  const periodOutreach = source.outreach.filter((record) => inPeriod(record.createdAt || record.sentAt, period.start, period.end));
  const statusCounts = periodOutreach.reduce<Record<string, number>>((acc, record) => {
    const key = String(record.status || "unknown");
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const verifiedProviders = source.providers.filter((provider) => String(provider.verificationStatus || "").toLowerCase() === "verified").length;
  const finalizedRelationships = source.outreach.filter((record) => String(record.status || "").toLowerCase() === "signed").length;

  let previous: ReturnType<typeof buildExpansionData> | null = null;
  if (period.previousStart && period.previousEnd) {
    previous = buildExpansionData(source.procurement, source.providers, source.outreach, source.audits, {
      range: period.range,
      start: period.previousStart,
      end: period.previousEnd,
      previousStart: null,
      previousEnd: null,
    });
  }

  const highlights: string[] = [];
  if (expansion.kpis.activated > 0) highlights.push(`${expansion.kpis.activated} provider relationship${expansion.kpis.activated === 1 ? "" : "s"} activated during the selected period.`);
  if (expansion.kpis.newMarkets > 0) highlights.push(`${expansion.kpis.newMarkets} market${expansion.kpis.newMarkets === 1 ? "" : "s"} gained newly activated coverage.`);
  if (expansion.kpis.servicesAdded > 0) highlights.push(`${expansion.kpis.servicesAdded} service categor${expansion.kpis.servicesAdded === 1 ? "y was" : "ies were"} represented in new activations.`);
  if (expansion.kpis.activeDevelopment > 0) highlights.push(`${expansion.kpis.activeDevelopment} network-development effort${expansion.kpis.activeDevelopment === 1 ? " is" : "s are"} currently active.`);
  if (expansion.kpis.activated === 0 && expansion.kpis.targetsAdded > 0) highlights.push(`${expansion.kpis.targetsAdded} new target${expansion.kpis.targetsAdded === 1 ? " entered" : "s entered"} the development pipeline during the selected period.`);

  res.json({
    generatedAt: new Date().toISOString(),
    period: expansion.period,
    expansion,
    networkSnapshot: {
      totalProviders: source.providers.length,
      verifiedProviders,
      totalProcurementEfforts: source.procurement.length,
      activeDevelopment: expansion.kpis.activeDevelopment,
      liveRelationships: source.procurement.filter((record) => record.stage === "Activated / Live").length,
      finalizedOutreachRelationships: finalizedRelationships,
      marketsTracked: expansion.markets.length,
    },
    outreach: {
      touchesThisPeriod: periodOutreach.length,
      byStatus: statusCounts,
    },
    comparison: previous ? {
      activated: delta(expansion.kpis.activated, previous.kpis.activated),
      newMarkets: delta(expansion.kpis.newMarkets, previous.kpis.newMarkets),
      newProviders: delta(expansion.kpis.newProviders, previous.kpis.newProviders),
      targetsAdded: delta(expansion.kpis.targetsAdded, previous.kpis.targetsAdded),
      outreachTouches: delta(expansion.kpis.outreachTouches, previous.kpis.outreachTouches),
    } : null,
    highlights,
    reportReady: {
      topActivatedMarkets: expansion.activatedMarkets.slice(0, 10),
      topActivatedServices: expansion.servicesActivated.slice(0, 10),
      recentActivations: expansion.activations.slice(0, 20),
      timeline: expansion.timeline,
      pipeline: expansion.pipeline,
    },
  });
});

router.get("/analytics/network-development/activations.csv", async (req, res): Promise<void> => {
  const period = resolvePeriod(req.query as Record<string, unknown>);
  const source = await loadSourceData();
  const expansion = buildExpansionData(source.procurement, source.providers, source.outreach, source.audits, period);
  const headers = ["Provider", "City", "State / Region", "Country", "Market", "Service / Category", "Owner", "Activated At"];
  const rows = expansion.activations.map((item) => [
    item.providerName,
    item.city,
    item.state,
    item.country,
    item.market,
    item.serviceCategory,
    item.owner,
    item.activatedAt ? new Date(item.activatedAt).toISOString() : "",
  ].map(escapeCsv).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="network-expansion-${period.range}-${Date.now()}.csv"`);
  res.send(csv);
});

export default router;
