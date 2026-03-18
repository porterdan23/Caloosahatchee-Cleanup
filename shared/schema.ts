import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, serial, real, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const memberUsers = pgTable("member_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  createdAt: text("created_at").notNull(),
  notifyEmail: boolean("notify_email").default(true).notNull(),
  notifyVolunteerAlerts: boolean("notify_volunteer_alerts").default(true).notNull(),
  notifyEventReminders: boolean("notify_event_reminders").default(true).notNull(),
}, (t) => ({
  emailIdx: index("member_users_email_idx").on(t.email),
}));

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url"),
  status: text("status").notNull().default("upcoming"),
  impactSummary: text("impact_summary"),
  volunteersNeeded: integer("volunteers_needed").default(50),
  volunteersRegistered: integer("volunteers_registered").default(0),
});

export const volunteers = pgTable("volunteers", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  age: integer("age").notNull(),
  isGroup: boolean("is_group").default(false).notNull(),
  groupMembers: text("group_members"),
  campaignId: integer("campaign_id"),
  waiverSigned: boolean("waiver_signed").default(false).notNull(),
  registeredAt: text("registered_at").notNull(),
});

export const volunteerRsvps = pgTable("volunteer_rsvps", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  campaignId: integer("campaign_id").notNull(),
  rsvpAt: text("rsvp_at").notNull(),
});

export const volunteerHours = pgTable("volunteer_hours", {
  id: serial("id").primaryKey(),
  volunteerEmail: text("volunteer_email").notNull(),
  volunteerName: text("volunteer_name").notNull(),
  campaignId: integer("campaign_id"),
  hours: real("hours").notNull(),
  notes: text("notes"),
  loggedAt: text("logged_at").notNull(),
  approved: boolean("approved").default(false).notNull(),
}, (t) => ({
  volunteerEmailIdx: index("volunteer_hours_email_idx").on(t.volunteerEmail),
}));

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  volunteerName: text("volunteer_name").notNull(),
  email: text("email").notNull(),
  rating: integer("rating").notNull(),
  content: text("content").notNull(),
  photoUrl: text("photo_url"),
  approved: boolean("approved").default(false).notNull(),
  campaignId: integer("campaign_id"),
  submittedAt: text("submitted_at").notNull(),
}, (t) => ({
  approvedIdx: index("reviews_approved_idx").on(t.approved),
}));

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  amount: integer("amount").notNull(),
  donorName: text("donor_name"),
  donorEmail: text("donor_email"),
  campaignId: integer("campaign_id"),
  stripeSessionId: text("stripe_session_id"),
  status: text("status").notNull().default("pending"),
  donatedAt: text("donated_at").notNull(),
});

export const sponsorships = pgTable("sponsorships", {
  id: serial("id").primaryKey(),
  sponsorName: text("sponsor_name").notNull(),
  sponsorEmail: text("sponsor_email").notNull(),
  sponsorPhone: text("sponsor_phone"),
  sponsorOrg: text("sponsor_org"),
  level: text("level").notNull(),
  amount: integer("amount").notNull(),
  campaignId: integer("campaign_id"),
  logoUrl: text("logo_url"),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull(),
}, (t) => ({
  statusIdx: index("sponsorships_status_idx").on(t.status),
}));

export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  propertyAddress: text("property_address").notNull(),
  serviceType: text("service_type").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  requestedAt: text("requested_at").notNull(),
});

export const cleanupLocations = pgTable("cleanup_locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  status: text("status").notNull().default("needs-cleanup"),
  campaignId: integer("campaign_id"),
  sponsorName: text("sponsor_name"),
  reportedBy: text("reported_by"),
  createdAt: text("created_at").notNull(),
});

export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  value: text("value").notNull(),
  icon: text("icon").notNull().default("trash"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMemberUserSchema = createInsertSchema(memberUsers).omit({
  id: true,
  createdAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  volunteersRegistered: true,
});

export const insertVolunteerSchema = createInsertSchema(volunteers).omit({
  id: true,
  registeredAt: true,
});

export const insertVolunteerRsvpSchema = createInsertSchema(volunteerRsvps).omit({
  id: true,
  rsvpAt: true,
});

export const insertVolunteerHoursSchema = createInsertSchema(volunteerHours).omit({
  id: true,
  loggedAt: true,
  approved: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  approved: true,
  submittedAt: true,
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  donatedAt: true,
});

export const insertSponsorshipSchema = createInsertSchema(sponsorships).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({
  id: true,
  requestedAt: true,
  status: true,
});

export const insertCleanupLocationSchema = createInsertSchema(cleanupLocations).omit({
  id: true,
  createdAt: true,
});

export const insertStatSchema = createInsertSchema(stats).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type MemberUser = typeof memberUsers.$inferSelect;
export type InsertMemberUser = z.infer<typeof insertMemberUserSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Volunteer = typeof volunteers.$inferSelect;
export type InsertVolunteer = z.infer<typeof insertVolunteerSchema>;
export type VolunteerRsvp = typeof volunteerRsvps.$inferSelect;
export type InsertVolunteerRsvp = z.infer<typeof insertVolunteerRsvpSchema>;
export type VolunteerHours = typeof volunteerHours.$inferSelect;
export type InsertVolunteerHours = z.infer<typeof insertVolunteerHoursSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Donation = typeof donations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Sponsorship = typeof sponsorships.$inferSelect;
export type InsertSponsorship = z.infer<typeof insertSponsorshipSchema>;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type CleanupLocation = typeof cleanupLocations.$inferSelect;
export type InsertCleanupLocation = z.infer<typeof insertCleanupLocationSchema>;
export type Stat = typeof stats.$inferSelect;
export type InsertStat = z.infer<typeof insertStatSchema>;
