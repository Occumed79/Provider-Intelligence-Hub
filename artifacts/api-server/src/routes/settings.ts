import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { appSettingsTable, auditEventsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

const DEFAULT_SETTINGS = [
  { key: "autoApproveHighConfidence", value: "true", valueType: "boolean", isSecret: false },
  { key: "strictEntityMatching", value: "true", valueType: "boolean", isSecret: false },
  { key: "geolocationApiKey", value: "", valueType: "secret", isSecret: true },
  { key: "ocrEngineToken", value: "", valueType: "secret", isSecret: true },
];

function decodeSetting(row: any) {
  const hidden = row.isSecret && row.value;
  return {
    key: row.key,
    value: hidden ? "********" : row.value,
    valueType: row.valueType,
    isSecret: row.isSecret,
    updatedBy: row.updatedBy,
    updatedAt: row.updatedAt,
  };
}

async function ensureDefaults() {
  for (const setting of DEFAULT_SETTINGS) {
    await db.insert(appSettingsTable).values(setting).onConflictDoNothing({ target: appSettingsTable.key });
  }
}

router.get("/settings", async (_req, res): Promise<void> => {
  await ensureDefaults();
  const rows = await db.select().from(appSettingsTable).orderBy(sql`${appSettingsTable.key} ASC`);
  res.json(rows.map(decodeSetting));
});

router.patch("/settings", async (req, res): Promise<void> => {
  await ensureDefaults();
  const updates = Array.isArray(req.body?.settings) ? req.body.settings : [];
  if (!updates.length) {
    res.status(400).json({ error: "settings array required" });
    return;
  }

  const changed = [];
  for (const update of updates) {
    const key = String(update?.key || "").trim();
    if (!key) continue;
    const value = String(update?.value ?? "");
    const [before] = await db.select().from(appSettingsTable).where(eq(appSettingsTable.key, key));
    const [after] = await db
      .insert(appSettingsTable)
      .values({ key, value, valueType: String(update?.valueType || before?.valueType || "string"), isSecret: Boolean(update?.isSecret ?? before?.isSecret ?? false), updatedBy: "current-user" })
      .onConflictDoUpdate({ target: appSettingsTable.key, set: { value, valueType: String(update?.valueType || before?.valueType || "string"), isSecret: Boolean(update?.isSecret ?? before?.isSecret ?? false), updatedBy: "current-user", updatedAt: new Date() } })
      .returning();
    changed.push(after);
    await db.insert(auditEventsTable).values({ entityType: "settings", entityId: after.id, action: "setting_updated", summary: `Setting updated: ${key}`, beforeJson: before ? JSON.stringify({ ...before, value: before.isSecret ? "********" : before.value }) : undefined, afterJson: JSON.stringify({ ...after, value: after.isSecret ? "********" : after.value }), actor: "current-user" });
  }

  const rows = await db.select().from(appSettingsTable).orderBy(sql`${appSettingsTable.key} ASC`);
  res.json(rows.map(decodeSetting));
});

export default router;
