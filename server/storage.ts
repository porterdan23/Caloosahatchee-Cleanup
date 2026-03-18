import {
  type User, type InsertUser,
  type MemberUser, type InsertMemberUser,
  type Campaign, type InsertCampaign,
  type Volunteer, type InsertVolunteer,
  type VolunteerRsvp, type InsertVolunteerRsvp,
  type VolunteerHours, type InsertVolunteerHours,
  type Review, type InsertReview,
  type Donation, type InsertDonation,
  type Sponsorship, type InsertSponsorship,
  type ServiceRequest, type InsertServiceRequest,
  type CleanupLocation, type InsertCleanupLocation,
  type Stat, type InsertStat,
  users, memberUsers, campaigns, volunteers, volunteerRsvps, volunteerHours,
  reviews, donations, sponsorships, serviceRequests, cleanupLocations, stats,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getMemberUser(id: number): Promise<MemberUser | undefined>;
  getMemberUserByEmail(email: string): Promise<MemberUser | undefined>;
  createMemberUser(user: InsertMemberUser & { createdAt: string }): Promise<MemberUser>;
  updateMemberUser(id: number, data: Partial<InsertMemberUser>): Promise<MemberUser | undefined>;
  getAllMemberUsers(): Promise<MemberUser[]>;

  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, data: Partial<InsertCampaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<void>;

  getVolunteers(): Promise<Volunteer[]>;
  createVolunteer(volunteer: InsertVolunteer & { registeredAt: string }): Promise<Volunteer>;

  getVolunteerRsvps(campaignId: number): Promise<VolunteerRsvp[]>;
  createVolunteerRsvp(rsvp: InsertVolunteerRsvp & { rsvpAt: string }): Promise<VolunteerRsvp>;
  deleteVolunteerRsvp(id: number): Promise<void>;

  getVolunteerHours(email?: string): Promise<VolunteerHours[]>;
  getAllVolunteerHours(): Promise<VolunteerHours[]>;
  createVolunteerHours(entry: InsertVolunteerHours & { loggedAt: string }): Promise<VolunteerHours>;
  approveVolunteerHours(id: number): Promise<VolunteerHours | undefined>;

  getApprovedReviews(): Promise<Review[]>;
  getAllReviews(): Promise<Review[]>;
  createReview(review: InsertReview & { submittedAt: string }): Promise<Review>;
  updateReviewApproval(id: number, approved: boolean): Promise<Review | undefined>;

  createDonation(donation: InsertDonation & { donatedAt: string }): Promise<Donation>;

  getSponsorships(): Promise<Sponsorship[]>;
  createSponsorship(s: InsertSponsorship & { createdAt: string }): Promise<Sponsorship>;
  updateSponsorshipStatus(id: number, status: string): Promise<Sponsorship | undefined>;

  getServiceRequests(): Promise<ServiceRequest[]>;
  createServiceRequest(r: InsertServiceRequest & { requestedAt: string }): Promise<ServiceRequest>;
  updateServiceRequestStatus(id: number, status: string): Promise<ServiceRequest | undefined>;

  getCleanupLocations(): Promise<CleanupLocation[]>;
  createCleanupLocation(loc: InsertCleanupLocation & { createdAt: string }): Promise<CleanupLocation>;
  updateCleanupLocation(id: number, data: Partial<InsertCleanupLocation>): Promise<CleanupLocation | undefined>;
  deleteCleanupLocation(id: number): Promise<void>;

  getStats(): Promise<Stat[]>;
  updateStat(id: number, data: Partial<InsertStat>): Promise<Stat | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getMemberUser(id: number): Promise<MemberUser | undefined> {
    const [user] = await db.select().from(memberUsers).where(eq(memberUsers.id, id));
    return user;
  }

  async getMemberUserByEmail(email: string): Promise<MemberUser | undefined> {
    const [user] = await db.select().from(memberUsers).where(eq(memberUsers.email, email));
    return user;
  }

  async createMemberUser(user: InsertMemberUser & { createdAt: string }): Promise<MemberUser> {
    const [created] = await db.insert(memberUsers).values(user).returning();
    return created;
  }

  async updateMemberUser(id: number, data: Partial<InsertMemberUser>): Promise<MemberUser | undefined> {
    const [updated] = await db.update(memberUsers).set(data).where(eq(memberUsers.id, id)).returning();
    return updated;
  }

  async getAllMemberUsers(): Promise<MemberUser[]> {
    return db.select().from(memberUsers).orderBy(desc(memberUsers.id));
  }

  async getCampaigns(): Promise<Campaign[]> {
    return db.select().from(campaigns).orderBy(desc(campaigns.id));
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [created] = await db.insert(campaigns).values(campaign).returning();
    return created;
  }

  async updateCampaign(id: number, data: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const [updated] = await db.update(campaigns).set(data).where(eq(campaigns.id, id)).returning();
    return updated;
  }

  async deleteCampaign(id: number): Promise<void> {
    await db.delete(campaigns).where(eq(campaigns.id, id));
  }

  async getVolunteers(): Promise<Volunteer[]> {
    return db.select().from(volunteers).orderBy(desc(volunteers.id));
  }

  async createVolunteer(volunteer: InsertVolunteer & { registeredAt: string }): Promise<Volunteer> {
    const [created] = await db.insert(volunteers).values(volunteer).returning();
    return created;
  }

  async getVolunteerRsvps(campaignId: number): Promise<VolunteerRsvp[]> {
    return db.select().from(volunteerRsvps).where(eq(volunteerRsvps.campaignId, campaignId)).orderBy(desc(volunteerRsvps.id));
  }

  async createVolunteerRsvp(rsvp: InsertVolunteerRsvp & { rsvpAt: string }): Promise<VolunteerRsvp> {
    const [created] = await db.insert(volunteerRsvps).values(rsvp).returning();
    return created;
  }

  async deleteVolunteerRsvp(id: number): Promise<void> {
    await db.delete(volunteerRsvps).where(eq(volunteerRsvps.id, id));
  }

  async getVolunteerHours(email?: string): Promise<VolunteerHours[]> {
    if (email) {
      return db.select().from(volunteerHours).where(eq(volunteerHours.volunteerEmail, email)).orderBy(desc(volunteerHours.id));
    }
    return db.select().from(volunteerHours).orderBy(desc(volunteerHours.id));
  }

  async getAllVolunteerHours(): Promise<VolunteerHours[]> {
    return db.select().from(volunteerHours).orderBy(desc(volunteerHours.id));
  }

  async createVolunteerHours(entry: InsertVolunteerHours & { loggedAt: string }): Promise<VolunteerHours> {
    const [created] = await db.insert(volunteerHours).values(entry).returning();
    return created;
  }

  async approveVolunteerHours(id: number): Promise<VolunteerHours | undefined> {
    const [updated] = await db.update(volunteerHours).set({ approved: true }).where(eq(volunteerHours.id, id)).returning();
    return updated;
  }

  async getApprovedReviews(): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.approved, true)).orderBy(desc(reviews.id));
  }

  async getAllReviews(): Promise<Review[]> {
    return db.select().from(reviews).orderBy(desc(reviews.id));
  }

  async createReview(review: InsertReview & { submittedAt: string }): Promise<Review> {
    const [created] = await db.insert(reviews).values(review).returning();
    return created;
  }

  async updateReviewApproval(id: number, approved: boolean): Promise<Review | undefined> {
    const [updated] = await db.update(reviews).set({ approved }).where(eq(reviews.id, id)).returning();
    return updated;
  }

  async createDonation(donation: InsertDonation & { donatedAt: string }): Promise<Donation> {
    const [created] = await db.insert(donations).values(donation).returning();
    return created;
  }

  async getSponsorships(): Promise<Sponsorship[]> {
    return db.select().from(sponsorships).orderBy(desc(sponsorships.id));
  }

  async createSponsorship(s: InsertSponsorship & { createdAt: string }): Promise<Sponsorship> {
    const [created] = await db.insert(sponsorships).values(s).returning();
    return created;
  }

  async updateSponsorshipStatus(id: number, status: string): Promise<Sponsorship | undefined> {
    const [updated] = await db.update(sponsorships).set({ status }).where(eq(sponsorships.id, id)).returning();
    return updated;
  }

  async getServiceRequests(): Promise<ServiceRequest[]> {
    return db.select().from(serviceRequests).orderBy(desc(serviceRequests.id));
  }

  async createServiceRequest(r: InsertServiceRequest & { requestedAt: string }): Promise<ServiceRequest> {
    const [created] = await db.insert(serviceRequests).values(r).returning();
    return created;
  }

  async updateServiceRequestStatus(id: number, status: string): Promise<ServiceRequest | undefined> {
    const [updated] = await db.update(serviceRequests).set({ status }).where(eq(serviceRequests.id, id)).returning();
    return updated;
  }

  async getCleanupLocations(): Promise<CleanupLocation[]> {
    return db.select().from(cleanupLocations).orderBy(desc(cleanupLocations.id));
  }

  async createCleanupLocation(loc: InsertCleanupLocation & { createdAt: string }): Promise<CleanupLocation> {
    const [created] = await db.insert(cleanupLocations).values(loc).returning();
    return created;
  }

  async updateCleanupLocation(id: number, data: Partial<InsertCleanupLocation>): Promise<CleanupLocation | undefined> {
    const [updated] = await db.update(cleanupLocations).set(data).where(eq(cleanupLocations.id, id)).returning();
    return updated;
  }

  async deleteCleanupLocation(id: number): Promise<void> {
    await db.delete(cleanupLocations).where(eq(cleanupLocations.id, id));
  }

  async getStats(): Promise<Stat[]> {
    return db.select().from(stats).orderBy(stats.id);
  }

  async updateStat(id: number, data: Partial<InsertStat>): Promise<Stat | undefined> {
    const [updated] = await db.update(stats).set(data).where(eq(stats.id, id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
