# Caloosahatchee Cleanup - Nonprofit Website

## Overview
Professional website for Caloosahatchee Cleanup, a non-profit organization dedicated to protecting and restoring the waterways of Southwest Florida. Built with a coastal color palette (blues, greens, sand tones) and clean, modern design.

## Tech Stack
- **Frontend**: React + TypeScript + Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: wouter (frontend), Express (backend)
- **State Management**: TanStack React Query

## Project Structure
- `client/src/pages/` - Page components (Home, Campaigns, Volunteer, Donate, Reviews, Admin, Login, Sponsorship, Services, CleanupMap)
- `client/src/components/` - Shared components (Navbar, Footer)
- `server/` - Express backend with API routes
- `shared/schema.ts` - Drizzle database schemas and Zod validation
- `server/storage.ts` - Database storage layer (DatabaseStorage class)
- `server/seed.ts` - Seed data for campaigns, reviews, and cleanup locations
- `server/db.ts` - Database connection

## Key Features
- **Home**: Hero section with logo/beach imagery, mission statement, impact stats, campaign previews, CTA, contact info
- **Campaigns**: Tabbed view of upcoming/past cleanup events with sign-up buttons
- **Volunteer Center**: Three-tab page — Sign Up (registration with group option + digital waiver), RSVP (reserve spot at event), Log Hours (submit volunteer hours for admin approval)
- **Donate**: Preset donation amounts, campaign-specific or general fund, Stripe-ready
- **Reviews**: Public testimonial display with submission form, admin approval system
- **Admin Portal**: Login (admin/cleanup2025), campaign CRUD, volunteer list, hours approval, review approval, sponsorship management, service requests, member users, cleanup map locations
- **Account / Login**: Member user registration/login with bcrypt, profile management, notification preferences
- **Sponsorship**: Four tier levels (River Supporter $100, River Guardian $500, River Champion $1000, River Partner $5000+) with application form
- **Waterfront Services**: Service request form with 4 service types (shoreline-cleanup, debris-removal, invasive-species, bank-restoration)
- **Cleanup Map**: Interactive Leaflet map with color-coded pins for cleaned/needs-cleanup/scheduled/sponsored areas, report-an-area dialog

## Database Models
- `users` - Admin accounts (username, password, isAdmin)
- `campaigns` - Cleanup events (title, description, date, time, location, status, imageUrl, impactSummary, volunteersNeeded, volunteersRegistered)
- `volunteers` - Registered volunteers (fullName, email, phone, age, isGroup, groupMembers, campaignId, waiverSigned)
- `reviews` - Volunteer testimonials (volunteerName, email, rating, content, approved, campaignId)
- `donations` - Donation records (amount, donorName, donorEmail, campaignId, status)
- `stats` - Homepage impact statistics (label, value, icon) - editable from admin portal
- `memberUsers` - Public member accounts (email, passwordHash, name, phone, notifyEmail, notifySms)
- `volunteerRsvps` - Event RSVPs (fullName, email, campaignId, rsvpAt)
- `volunteerHours` - Volunteer hours log (volunteerName, volunteerEmail, campaignId, hours, notes, approved, loggedAt)
- `sponsorships` - Sponsorship applications (sponsorName, sponsorOrg, sponsorEmail, level, amount, status, message, campaignId)
- `serviceRequests` - Waterfront service requests (customerName, email, phone, propertyAddress, serviceType, description, status, preferredDate)
- `cleanupLocations` - Map pins (name, lat, lng, status, description, sponsorName, reportedBy)

## API Routes
- `GET /api/campaigns` - List all campaigns
- `POST /api/campaigns` - Create campaign
- `PATCH /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `POST /api/volunteers` - Register volunteer
- `GET /api/reviews/approved` - Get approved reviews
- `POST /api/reviews` - Submit review
- `PATCH /api/reviews/:id` - Approve/reject review
- `POST /api/admin/login` - Admin login
- `GET /api/admin/volunteers` - List all volunteers
- `GET /api/admin/reviews` - List all reviews
- `GET /api/admin/sponsorships` - List all sponsorships (admin)
- `PATCH /api/admin/sponsorships/:id` - Update sponsorship status
- `GET /api/admin/service-requests` - List service requests (admin)
- `PATCH /api/admin/service-requests/:id` - Update service request status
- `GET /api/admin/volunteer-hours` - List all volunteer hours (admin)
- `GET /api/admin/member-users` - List all member accounts (admin)
- `POST /api/donations/create-checkout` - Create donation
- `GET /api/stats` - Get homepage stats
- `PATCH /api/stats/:id` - Update stat (admin only)
- `POST /api/auth/register` - Register member account
- `POST /api/auth/login` - Member login
- `POST /api/auth/logout` - Member logout
- `GET /api/auth/me` - Get current member
- `PATCH /api/auth/profile` - Update member profile
- `PATCH /api/auth/password` - Change member password
- `POST /api/rsvps` - Create RSVP
- `DELETE /api/rsvps/:id` - Cancel RSVP
- `POST /api/volunteer-hours` - Log volunteer hours
- `PATCH /api/volunteer-hours/:id/approve` - Approve hours (admin)
- `POST /api/sponsorships` - Submit sponsorship application
- `GET /api/sponsorships` - List approved sponsorships
- `POST /api/service-requests` - Submit service request
- `GET /api/cleanup-locations` - Get all map locations
- `POST /api/cleanup-locations` - Add map location
- `PATCH /api/cleanup-locations/:id` - Update location
- `DELETE /api/cleanup-locations/:id` - Delete location

## Contact Info
- Phone: 239-464-0032
- Email: info.caloosahatcheecleanup@gmail.com
- Instagram: @caloosahatchee_cleanup
- Location: Southwest Florida

## Running
- `npm run dev` starts both frontend and backend on port 5000
- `npm run db:push` syncs database schema
