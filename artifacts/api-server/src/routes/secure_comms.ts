import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { db } from "@workspace/db";
import { providerInvitesTable, secureMessagesTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";

const secureUploadDir = path.resolve(process.cwd(), "uploads", "secure-comms");
if (!fs.existsSync(secureUploadDir)) {
  fs.mkdirSync(secureUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, secureUploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

const router: IRouter = Router();

router.get("/secure-comms/unread-count", async (_req, res): Promise<void> => {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(secureMessagesTable)
    .where(
      and(
        eq(secureMessagesTable.senderType, "provider"),
        eq(secureMessagesTable.readByHub, false),
      ),
    );
  res.json({ count: Number(result?.count ?? 0) });
});

async function touchActivity(token: string) {
  await db
    .update(providerInvitesTable)
    .set({ lastActivityAt: new Date() })
    .where(eq(providerInvitesTable.token, token));
}

router.get("/secure-comms/invites", async (_req, res): Promise<void> => {
  const invites = await db
    .select()
    .from(providerInvitesTable)
    .orderBy(desc(providerInvitesTable.createdAt));

  const withUnread = await Promise.all(
    invites.map(async (inv) => {
      const [unread] = await db
        .select({ count: sql<number>`count(*)` })
        .from(secureMessagesTable)
        .where(
          and(
            eq(secureMessagesTable.inviteToken, inv.token),
            eq(secureMessagesTable.senderType, "provider"),
            eq(secureMessagesTable.readByHub, false),
          ),
        );
      const [lastMsg] = await db
        .select()
        .from(secureMessagesTable)
        .where(eq(secureMessagesTable.inviteToken, inv.token))
        .orderBy(desc(secureMessagesTable.createdAt))
        .limit(1);
      return { ...inv, unreadCount: unread?.count ?? 0, lastMessage: lastMsg ?? null };
    }),
  );

  res.json(withUnread);
});

router.post("/secure-comms/invite", async (req, res): Promise<void> => {
  const { providerId, providerName, providerEmail, providerOrg, notes } = req.body;

  if (!providerName) {
    res.status(400).json({ error: "providerName required" });
    return;
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  const [invite] = await db
    .insert(providerInvitesTable)
    .values({ token, providerId, providerName, providerEmail, providerOrg, notes, expiresAt })
    .returning();

  res.status(201).json(invite);
});

router.patch("/secure-comms/invite/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { notes, status } = req.body;
  const updates: Record<string, unknown> = {};
  if (notes !== undefined) updates.notes = notes;
  if (status !== undefined) updates.status = status;

  const [updated] = await db
    .update(providerInvitesTable)
    .set(updates)
    .where(eq(providerInvitesTable.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

router.delete("/secure-comms/invite/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(providerInvitesTable).where(eq(providerInvitesTable.id, id));
  res.status(204).send();
});

router.get("/secure-comms/thread/:token", async (req, res): Promise<void> => {
  const { token } = req.params;
  const [invite] = await db
    .select()
    .from(providerInvitesTable)
    .where(eq(providerInvitesTable.token, token));
  if (!invite) { res.status(404).json({ error: "Thread not found" }); return; }

  const messages = await db
    .select()
    .from(secureMessagesTable)
    .where(eq(secureMessagesTable.inviteToken, token))
    .orderBy(secureMessagesTable.createdAt);

  await db
    .update(secureMessagesTable)
    .set({ readByHub: true })
    .where(
      and(
        eq(secureMessagesTable.inviteToken, token),
        eq(secureMessagesTable.senderType, "provider"),
        eq(secureMessagesTable.readByHub, false),
      ),
    );

  res.json({ invite, messages });
});

router.post("/secure-comms/thread/:token/message", async (req, res): Promise<void> => {
  const { token } = req.params;
  const { messageText, senderName } = req.body;

  const [invite] = await db
    .select()
    .from(providerInvitesTable)
    .where(eq(providerInvitesTable.token, token));
  if (!invite) { res.status(404).json({ error: "Thread not found" }); return; }

  const [msg] = await db
    .insert(secureMessagesTable)
    .values({
      inviteToken: token,
      senderType: "hub",
      senderName: senderName || "Occu-Med Team",
      messageText,
      isFile: false,
      readByHub: true,
      readByProvider: false,
    })
    .returning();

  if (invite.status === "pending") {
    await db.update(providerInvitesTable).set({ status: "active" }).where(eq(providerInvitesTable.token, token));
  }
  await touchActivity(token);
  res.status(201).json(msg);
});

router.post(
  "/secure-comms/thread/:token/upload",
  upload.single("file"),
  async (req: Request, res: Response): Promise<void> => {
    const { token } = req.params;
    const file = req.file;

    if (!file) { res.status(400).json({ error: "No file uploaded" }); return; }

    const [invite] = await db
      .select()
      .from(providerInvitesTable)
      .where(eq(providerInvitesTable.token, token));
    if (!invite) { res.status(404).json({ error: "Thread not found" }); return; }

    const [msg] = await db
      .insert(secureMessagesTable)
      .values({
        inviteToken: token,
        senderType: "hub",
        senderName: req.body.senderName || "Occu-Med Team",
        isFile: true,
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        readByHub: true,
        readByProvider: false,
      })
      .returning();

    if (invite.status === "pending") {
      await db.update(providerInvitesTable).set({ status: "active" }).where(eq(providerInvitesTable.token, token));
    }
    await touchActivity(token);
    res.status(201).json(msg);
  },
);

router.get("/secure-comms/file/:messageId", async (req, res): Promise<void> => {
  const id = parseInt(req.params.messageId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [msg] = await db
    .select()
    .from(secureMessagesTable)
    .where(eq(secureMessagesTable.id, id));

  if (!msg || !msg.filePath || !msg.isFile) { res.status(404).json({ error: "File not found" }); return; }
  if (!fs.existsSync(msg.filePath)) { res.status(404).json({ error: "File no longer available" }); return; }

  res.setHeader("Content-Disposition", `attachment; filename="${msg.fileName}"`);
  if (msg.mimeType) res.setHeader("Content-Type", msg.mimeType);
  res.sendFile(path.resolve(msg.filePath));
});

router.get("/portal-api/:token/verify", async (req, res): Promise<void> => {
  const { token } = req.params;
  const [invite] = await db
    .select()
    .from(providerInvitesTable)
    .where(eq(providerInvitesTable.token, token));

  if (!invite) { res.status(404).json({ error: "Invalid or expired invite link" }); return; }
  if (invite.expiresAt && new Date() > invite.expiresAt) {
    res.status(410).json({ error: "This invite link has expired" });
    return;
  }

  if (invite.status === "pending") {
    await db
      .update(providerInvitesTable)
      .set({ status: "active", acceptedAt: new Date() })
      .where(eq(providerInvitesTable.token, token));
  }
  await touchActivity(token);

  res.json({
    providerName: invite.providerName,
    providerOrg: invite.providerOrg,
    status: invite.status === "pending" ? "active" : invite.status,
    invitedAt: invite.invitedAt,
  });
});

router.get("/portal-api/:token/messages", async (req, res): Promise<void> => {
  const { token } = req.params;
  const [invite] = await db
    .select()
    .from(providerInvitesTable)
    .where(eq(providerInvitesTable.token, token));
  if (!invite) { res.status(404).json({ error: "Invalid invite" }); return; }

  const messages = await db
    .select()
    .from(secureMessagesTable)
    .where(eq(secureMessagesTable.inviteToken, token))
    .orderBy(secureMessagesTable.createdAt);

  await db
    .update(secureMessagesTable)
    .set({ readByProvider: true })
    .where(
      and(
        eq(secureMessagesTable.inviteToken, token),
        eq(secureMessagesTable.senderType, "hub"),
        eq(secureMessagesTable.readByProvider, false),
      ),
    );

  await touchActivity(token);
  res.json(messages);
});

router.post("/portal-api/:token/message", async (req, res): Promise<void> => {
  const { token } = req.params;
  const { messageText, senderName } = req.body;

  const [invite] = await db
    .select()
    .from(providerInvitesTable)
    .where(eq(providerInvitesTable.token, token));
  if (!invite) { res.status(404).json({ error: "Invalid invite" }); return; }

  const [msg] = await db
    .insert(secureMessagesTable)
    .values({
      inviteToken: token,
      senderType: "provider",
      senderName: senderName || invite.providerName,
      messageText,
      isFile: false,
      readByHub: false,
      readByProvider: true,
    })
    .returning();

  await touchActivity(token);
  res.status(201).json(msg);
});

router.post(
  "/portal-api/:token/upload",
  upload.single("file"),
  async (req: Request, res: Response): Promise<void> => {
    const { token } = req.params;
    const file = req.file;

    if (!file) { res.status(400).json({ error: "No file uploaded" }); return; }

    const [invite] = await db
      .select()
      .from(providerInvitesTable)
      .where(eq(providerInvitesTable.token, token));
    if (!invite) { res.status(404).json({ error: "Invalid invite" }); return; }

    const [msg] = await db
      .insert(secureMessagesTable)
      .values({
        inviteToken: token,
        senderType: "provider",
        senderName: invite.providerName,
        isFile: true,
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        readByHub: false,
        readByProvider: true,
      })
      .returning();

    await touchActivity(token);
    res.status(201).json(msg);
  },
);

router.get("/portal-api/:token/file/:messageId", async (req, res): Promise<void> => {
  const { token } = req.params;
  const id = parseInt(req.params.messageId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [msg] = await db
    .select()
    .from(secureMessagesTable)
    .where(and(eq(secureMessagesTable.id, id), eq(secureMessagesTable.inviteToken, token)));

  if (!msg || !msg.filePath || !msg.isFile) { res.status(404).json({ error: "File not found" }); return; }
  if (!fs.existsSync(msg.filePath)) { res.status(404).json({ error: "File no longer available" }); return; }

  res.setHeader("Content-Disposition", `attachment; filename="${msg.fileName}"`);
  if (msg.mimeType) res.setHeader("Content-Type", msg.mimeType);
  res.sendFile(path.resolve(msg.filePath));
});

export default router;
