import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertVolunteerSchema, insertReviewSchema, insertCampaignSchema, insertStatSchema,
  insertMemberUserSchema, insertVolunteerRsvpSchema, insertVolunteerHoursSchema,
  insertSponsorshipSchema, insertServiceRequestSchema, insertCleanupLocationSchema,
} from "@shared/schema";
import session from "express-session";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { seedDatabase } from "./seed";

declare module "express-session" {
  interface SessionData {
    adminId: number;
    memberId: number;
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!(req.session as any).adminId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

function requireMember(req: Request, res: Response, next: NextFunction) {
  if (!(req.session as any).memberId) {
    return res.status(401).json({ message: "Please log in to continue" });
  }
  next();
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable must be set in production");
  }

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "caloosahatchee-cleanup-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: "lax" },
    })
  );

  await seedDatabase();

  // ─── CAMPAIGNS ────────────────────────────────────────────────
  app.get("/api/campaigns", async (_req, res) => {
    try {
      const allCampaigns = await storage.getCampaigns();
      res.json(allCampaigns);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const campaign = await storage.getCampaign(parseInt(req.params.id));
      if (!campaign) return res.status(404).json({ message: "Campaign not found" });
      res.json(campaign);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/campaigns", requireAdmin, async (req, res) => {
    const parsed = insertCampaignSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    try {
      const campaign = await storage.createCampaign(parsed.data);
      res.status(201).json(campaign);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/campaigns/:id", requireAdmin, async (req, res) => {
    const partial = insertCampaignSchema.partial().safeParse(req.body);
    if (!partial.success) return res.status(400).json({ message: partial.error.message });
    try {
      const updated = await storage.updateCampaign(parseInt(req.params.id), partial.data);
      if (!updated) return res.status(404).json({ message: "Campaign not found" });
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/campaigns/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteCampaign(parseInt(req.params.id));
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ─── VOLUNTEERS ───────────────────────────────────────────────
  app.post("/api/volunteers", async (req, res) => {
    const data = {
      ...req.body,
      age: typeof req.body.age === "string" ? parseInt(req.body.age) : req.body.age,
      campaignId: req.body.campaignId ? (typeof req.body.campaignId === "string" ? parseInt(req.body.campaignId) : req.body.campaignId) : null,
      registeredAt: req.body.registeredAt || new Date().toISOString(),
    };
    const parsed = insertVolunteerSchema.safeParse(data);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    try {
      const volunteer = await storage.createVolunteer({ ...parsed.data, registeredAt: data.registeredAt });
      res.status(201).json(volunteer);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ─── VOLUNTEER RSVPs ──────────────────────────────────────────
  app.get("/api/campaigns/:id/rsvps", async (req, res) => {
    try {
      const rsvps = await storage.getVolunteerRsvps(parseInt(req.params.id));
      res.json(rsvps);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/rsvps", async (req, res) => {
    const data = { ...req.body, rsvpAt: new Date().toISOString() };
    const parsed = insertVolunteerRsvpSchema.safeParse(data);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    try {
      const rsvp = await storage.createVolunteerRsvp({ ...parsed.data, rsvpAt: data.rsvpAt });
      res.status(201).json(rsvp);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/rsvps/:id", async (req, res) => {
    try {
      await storage.deleteVolunteerRsvp(parseInt(req.params.id));
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ─── VOLUNTEER HOURS ─────────────────────────────────────────
  app.get("/api/volunteer-hours", async (req, res) => {
    try {
      const email = req.query.email as string | undefined;
      const hours = await storage.getVolunteerHours(email);
      res.json(hours);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/volunteer-hours", async (req, res) => {
    const data = { ...req.body, hours: parseFloat(req.body.hours), loggedAt: new Date().toISOString() };
    const parsed = insertVolunteerHoursSchema.safeParse(data);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    try {
      const entry = await storage.createVolunteerHours({ ...parsed.data, loggedAt: data.loggedAt });
      res.status(201).json(entry);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/volunteer-hours/:id/approve", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.approveVolunteerHours(parseInt(req.params.id));
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/volunteer-hours", requireAdmin, async (_req, res) => {
    try {
      const hours = await storage.getAllVolunteerHours();
      res.json(hours);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ─── REVIEWS ──────────────────────────────────────────────────
  app.get("/api/reviews/approved", async (_req, res) => {
    try {
      const approvedReviews = await storage.getApprovedReviews();
      res.json(approvedReviews);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    const data = {
      ...req.body,
      campaignId: req.body.campaignId || null,
      photoUrl: req.body.photoUrl || null,
      submittedAt: new Date().toISOString(),
    };
    const parsed = insertReviewSchema.safeParse(data);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    try {
      const review = await storage.createReview({ ...parsed.data, submittedAt: data.submittedAt });
      res.status(201).json(review);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/reviews/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateReviewApproval(parseInt(req.params.id), req.body.approved);
      if (!updated) return res.status(404).json({ message: "Review not found" });
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ─── MEMBER AUTH ─────────────────────────────────────────────
  app.post("/api/auth/register", authLimiter, async (req, res) => {
    const { email, password, name, phone } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: "Email, password, and name are required" });
    }
    try {
      const existing = await storage.getMemberUserByEmail(email);
      if (existing) return res.status(409).json({ message: "An account with this email already exists" });
      const hashed = await bcrypt.hash(password, 10);
      const user = await storage.createMemberUser({
        email,
        password: hashed,
        name,
        phone: phone || null,
        notifyEmail: true,
        notifyVolunteerAlerts: true,
        notifyEventReminders: true,
        createdAt: new Date().toISOString(),
      });
      req.session.memberId = user.id;
      const { password: _, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", authLimiter, async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await storage.getMemberUserByEmail(email);
      if (!user) return res.status(401).json({ message: "Invalid email or password" });
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ message: "Invalid email or password" });
      req.session.memberId = user.id;
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => { res.json({ success: true }); });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.memberId) return res.status(401).json({ message: "Not logged in" });
    try {
      const user = await storage.getMemberUser(req.session.memberId);
      if (!user) return res.status(404).json({ message: "User not found" });
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/auth/profile", requireMember, async (req, res) => {
    const { name, phone, notifyEmail, notifyVolunteerAlerts, notifyEventReminders } = req.body;
    try {
      const updated = await storage.updateMemberUser(req.session.memberId!, {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(notifyEmail !== undefined && { notifyEmail }),
        ...(notifyVolunteerAlerts !== undefined && { notifyVolunteerAlerts }),
        ...(notifyEventReminders !== undefined && { notifyEventReminders }),
      });
      if (!updated) return res.status(404).json({ message: "User not found" });
      const { password: _, ...safeUser } = updated;
      res.json(safeUser);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/auth/password", requireMember, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
      const user = await storage.getMemberUser(req.session.memberId!);
      if (!user) return res.status(404).json({ message: "User not found" });
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) return res.status(401).json({ message: "Current password is incorrect" });
      const hashed = await bcrypt.hash(newPassword, 10);
      await storage.updateMemberUser(user.id, { password: hashed });
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ─── ADMIN AUTH ───────────────────────────────────────────────
  app.post("/api/admin/login", authLimiter, async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await storage.getUserByUsername(username);
      const validPassword = user ? await bcrypt.compare(password, user.password) : false;
      if (!user || !validPassword || !user.isAdmin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session.adminId = user.id;
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy(() => { res.json({ success: true }); });
  });

  app.get("/api/admin/session", (req, res) => {
    if (req.session.adminId) {
      res.json({ authenticated: true });
    } else {
      res.status(401).json({ authenticated: false });
    }
  });

  app.get("/api/admin/volunteers", requireAdmin, async (_req, res) => {
    try {
      const allVolunteers = await storage.getVolunteers();
      res.json(allVolunteers);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/reviews", requireAdmin, async (_req, res) => {
    try {
      const allReviews = await storage.getAllReviews();
      res.json(allReviews);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/member-users", requireAdmin, async (_req, res) => {
    try {
      const allUsers = await storage.getAllMemberUsers();
      const safeUsers = allUsers.map(({ password: _, ...u }) => u);
      res.json(safeUsers);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ─── SPONSORSHIPS ─────────────────────────────────────────────
  app.get("/api/sponsorships", async (_req, res) => {
    try {
      const all = await storage.getSponsorships();
      res.json(all.filter(s => s.status === "approved"));
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/sponsorships", requireAdmin, async (_req, res) => {
    try {
      const all = await storage.getSponsorships();
      res.json(all);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/sponsorships", async (req, res) => {
    const data = { ...req.body, amount: parseInt(req.body.amount), campaignId: req.body.campaignId || null };
    const parsed = insertSponsorshipSchema.safeParse(data);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    try {
      const s = await storage.createSponsorship({ ...parsed.data, createdAt: new Date().toISOString() });
      res.status(201).json(s);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/admin/sponsorships/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateSponsorshipStatus(parseInt(req.params.id), req.body.status);
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ─── SERVICE REQUESTS ─────────────────────────────────────────
  app.get("/api/admin/service-requests", requireAdmin, async (_req, res) => {
    try {
      const all = await storage.getServiceRequests();
      res.json(all);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/service-requests", async (req, res) => {
    const parsed = insertServiceRequestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    try {
      const r = await storage.createServiceRequest({ ...parsed.data, requestedAt: new Date().toISOString() });
      res.status(201).json(r);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/admin/service-requests/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateServiceRequestStatus(parseInt(req.params.id), req.body.status);
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ─── CLEANUP LOCATIONS (MAP) ─────────────────────────────────
  app.get("/api/cleanup-locations", async (_req, res) => {
    try {
      const all = await storage.getCleanupLocations();
      res.json(all);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/cleanup-locations", requireAdmin, async (req, res) => {
    const data = { ...req.body, lat: parseFloat(req.body.lat), lng: parseFloat(req.body.lng) };
    const parsed = insertCleanupLocationSchema.safeParse(data);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    try {
      const loc = await storage.createCleanupLocation({ ...parsed.data, createdAt: new Date().toISOString() });
      res.status(201).json(loc);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/cleanup-locations/:id", requireAdmin, async (req, res) => {
    const data = { ...req.body };
    if (data.lat) data.lat = parseFloat(data.lat);
    if (data.lng) data.lng = parseFloat(data.lng);
    try {
      const updated = await storage.updateCleanupLocation(parseInt(req.params.id), data);
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/cleanup-locations/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteCleanupLocation(parseInt(req.params.id));
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ─── STATS ────────────────────────────────────────────────────
  app.get("/api/stats", async (_req, res) => {
    try {
      const allStats = await storage.getStats();
      res.json(allStats);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/stats/:id", requireAdmin, async (req, res) => {
    const partial = insertStatSchema.partial().safeParse(req.body);
    if (!partial.success) return res.status(400).json({ message: partial.error.message });
    try {
      const updated = await storage.updateStat(parseInt(req.params.id), partial.data);
      if (!updated) return res.status(404).json({ message: "Stat not found" });
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ─── DONATIONS ────────────────────────────────────────────────
  app.post("/api/donations/create-checkout", async (req, res) => {
    const { amount, campaignId, donorName, donorEmail } = req.body;
    try {
      const donation = await storage.createDonation({
        amount: amount || 5000,
        campaignId: campaignId || null,
        donorName: donorName || null,
        donorEmail: donorEmail || null,
        stripeSessionId: null,
        status: "recorded",
        donatedAt: new Date().toISOString(),
      });
      res.json({ donation, message: "Thank you for your donation! Payment processing via Stripe will be configured by the administrator." });
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
