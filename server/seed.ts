import { db } from "./db";
import { campaigns, users, reviews, stats, cleanupLocations } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  const existingStats = await db.select().from(stats);
  if (existingStats.length === 0) {
    await db.insert(stats).values([
      { label: "Pounds of Trash Removed", value: "25,000+", icon: "trash" },
      { label: "Volunteers Engaged", value: "1,200+", icon: "users" },
      { label: "Cleanup Events", value: "50+", icon: "waves" },
    ]);
    console.log("Stats seeded");
  }

  const existingCampaigns = await db.select().from(campaigns);
  if (existingCampaigns.length === 0) {
    const existingAdmin = await db.select().from(users).where(eq(users.username, "admin"));
    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash("cleanup2025", 10);
      await db.insert(users).values({
        username: "admin",
        password: hashedPassword,
        isAdmin: true,
      });
    }

    await db.insert(campaigns).values([
      {
        title: "Spring River Cleanup",
        description: "Join us for our annual spring cleanup along the Caloosahatchee River. We'll focus on removing debris from the riverbanks and surrounding mangrove areas near downtown Fort Myers.",
        date: "2026-03-15",
        time: "8:00 AM",
        location: "Centennial Park, Fort Myers",
        imageUrl: "/images/campaign-river-cleanup.png",
        status: "upcoming",
        volunteersNeeded: 75,
        volunteersRegistered: 32,
      },
      {
        title: "Sanibel Shoreline Restoration",
        description: "Help us restore the beautiful Sanibel Island shoreline. Activities include beach cleanup, dune restoration, and sea oat planting to protect our coastal ecosystem.",
        date: "2026-04-05",
        time: "7:30 AM",
        location: "Lighthouse Beach Park, Sanibel Island",
        imageUrl: "/images/campaign-beach-cleanup.png",
        status: "upcoming",
        volunteersNeeded: 60,
        volunteersRegistered: 18,
      },
      {
        title: "Mangrove Trail Cleanup",
        description: "Explore and clean up the mangrove trails along the Caloosahatchee estuary. This event focuses on removing plastics and fishing line that harm local wildlife.",
        date: "2026-05-10",
        time: "8:30 AM",
        location: "Bunche Beach Preserve, Fort Myers",
        imageUrl: "/images/campaign-mangrove-restoration.png",
        status: "upcoming",
        volunteersNeeded: 40,
        volunteersRegistered: 8,
      },
      {
        title: "Fall River Rally 2025",
        description: "Our biggest cleanup event of 2025! Over 200 volunteers came together to remove trash and debris from a 5-mile stretch of the Caloosahatchee River near Cape Coral.",
        date: "2025-11-08",
        time: "7:00 AM",
        location: "Four Mile Cove Ecological Preserve, Cape Coral",
        imageUrl: "/images/campaign-river-cleanup.png",
        status: "completed",
        impactSummary: "Removed 3,200 lbs of trash with 215 volunteers across 5 miles of riverbank.",
        volunteersNeeded: 200,
        volunteersRegistered: 215,
      },
      {
        title: "Cape Coral Canal Cleanup",
        description: "Community members gathered to clean the canal system in Cape Coral, removing invasive plants, trash, and abandoned fishing gear from waterways.",
        date: "2025-09-20",
        time: "8:00 AM",
        location: "Jaycee Park, Cape Coral",
        imageUrl: "/images/campaign-beach-cleanup.png",
        status: "completed",
        impactSummary: "Cleared 1,800 lbs of debris from 3 canal segments with 120 volunteers.",
        volunteersNeeded: 100,
        volunteersRegistered: 120,
      },
      {
        title: "Summer Estuary Expedition",
        description: "A kayak-based cleanup exploring the lower Caloosahatchee estuary. Volunteers paddled to remote areas to collect floating debris and plastic waste.",
        date: "2025-07-12",
        time: "6:30 AM",
        location: "Punta Rassa Boat Ramp, Fort Myers",
        imageUrl: "/images/campaign-mangrove-restoration.png",
        status: "completed",
        impactSummary: "Collected 950 lbs of floating debris from estuary channels with 65 kayakers.",
        volunteersNeeded: 50,
        volunteersRegistered: 65,
      },
    ]);

    await db.insert(reviews).values([
      {
        volunteerName: "Maria Gonzalez",
        email: "maria@example.com",
        rating: 5,
        content: "What an incredible experience! The Fall River Rally was so well organized, and it was amazing to see the river banks transform before our eyes. I'm bringing my whole family to the next event.",
        approved: true,
        campaignId: 4,
        submittedAt: "2025-11-10T14:00:00.000Z",
      },
      {
        volunteerName: "Tom Henderson",
        email: "tom@example.com",
        rating: 5,
        content: "I've volunteered with several organizations, but Caloosahatchee Cleanup is by far the best. The team provides everything you need, the locations are beautiful, and the impact is immediate and visible.",
        approved: true,
        campaignId: 5,
        submittedAt: "2025-09-22T10:00:00.000Z",
      },
      {
        volunteerName: "Sarah Chen",
        email: "sarah@example.com",
        rating: 4,
        content: "The kayak cleanup was such a unique and fun way to give back. Paddling through the estuary and collecting trash felt like a real adventure. Highly recommend for anyone who loves being on the water.",
        approved: true,
        campaignId: 6,
        submittedAt: "2025-07-15T09:00:00.000Z",
      },
      {
        volunteerName: "Jake Morrison",
        email: "jake@example.com",
        rating: 5,
        content: "Brought my Boy Scout troop to the canal cleanup and it was a fantastic experience for the kids. They learned so much about environmental stewardship while making a real difference in the community.",
        approved: true,
        submittedAt: "2025-09-25T11:00:00.000Z",
      },
    ]);

    console.log("Database seeded successfully");
  }

  // Seed cleanup locations if empty
  const existingLocations = await db.select().from(cleanupLocations);
  if (existingLocations.length === 0) {
    await db.insert(cleanupLocations).values([
      { name: "Centennial Park Riverbank", description: "Downtown Fort Myers riverfront — heavy litter and debris accumulation near boat docks.", lat: 26.6434, lng: -81.8724, status: "scheduled", createdAt: new Date().toISOString() },
      { name: "Four Mile Cove Ecological Preserve", description: "Cleaned in Fall 2025 — cleared 3,200 lbs from 5 miles of riverbank.", lat: 26.6202, lng: -81.9516, status: "cleaned", createdAt: new Date().toISOString() },
      { name: "Jaycee Park Canal", description: "Cape Coral canal segment cleaned in September 2025. Clear of debris.", lat: 26.6287, lng: -81.9499, status: "cleaned", createdAt: new Date().toISOString() },
      { name: "Bunche Beach Preserve", description: "Mangrove trail with plastic and fishing line buildup. Upcoming cleanup scheduled.", lat: 26.4866, lng: -81.9531, status: "scheduled", createdAt: new Date().toISOString() },
      { name: "Punta Rassa Estuary", description: "Lower Caloosahatchee estuary — kayak cleanup completed July 2025.", lat: 26.4981, lng: -81.9952, status: "cleaned", createdAt: new Date().toISOString() },
      { name: "Sanibel Lighthouse Beach", description: "Shoreline restoration area — upcoming volunteer event April 2026.", lat: 26.4452, lng: -81.8756, status: "scheduled", createdAt: new Date().toISOString() },
      { name: "Cape Coral Spreader Canal", description: "Invasive species and debris reported by community members. Needs attention.", lat: 26.6637, lng: -81.9901, status: "needs-cleanup", createdAt: new Date().toISOString() },
      { name: "Telegraph Creek", description: "Remote tributary with significant debris and fishing gear accumulation.", lat: 26.7204, lng: -81.6908, status: "needs-cleanup", createdAt: new Date().toISOString() },
      { name: "Ortona Lock Area", description: "Waterway junction — debris accumulation from upstream flow.", lat: 26.7881, lng: -81.3143, status: "needs-cleanup", createdAt: new Date().toISOString() },
      { name: "Caloosahatchee National Wildlife Refuge", description: "Sponsored cleanup area — maintained in partnership with local business donors.", lat: 26.7667, lng: -81.5167, status: "sponsored", sponsorName: "River Guardian Sponsors", createdAt: new Date().toISOString() },
    ]);
    console.log("Cleanup locations seeded");
  }
}
