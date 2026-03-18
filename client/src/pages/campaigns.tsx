import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, TreePine } from "lucide-react";
import type { Campaign } from "@shared/schema";

export default function Campaigns() {
  const { data: campaigns, isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const upcoming = campaigns?.filter((c) => c.status === "upcoming") || [];
  const past = campaigns?.filter((c) => c.status === "completed") || [];

  const CampaignCard = ({ campaign, isPast }: { campaign: Campaign; isPast: boolean }) => (
    <Card className="group" data-testid={`card-campaign-${campaign.id}`}>
      <div className="relative h-56 overflow-hidden rounded-t-md">
        <img
          src={campaign.imageUrl || "/images/campaign-river-cleanup.png"}
          alt={campaign.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Badge className={`absolute top-3 left-3 ${isPast ? "bg-[#6b7280]" : "bg-[#0e7c5a]"} text-white`}>
          {isPast ? "Completed" : "Upcoming"}
        </Badge>
      </div>
      <CardContent className="p-6">
        <h3 className="font-serif text-xl font-semibold text-[#1a3a2a] mb-3">{campaign.title}</h3>
        <p className="text-[#4a7a5e] text-sm mb-4 line-clamp-2">{campaign.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-[#2d4a3e]">
            <Calendar className="h-4 w-4 text-[#0e7c5a]" />
            {campaign.date} at {campaign.time}
          </div>
          <div className="flex items-center gap-2 text-sm text-[#2d4a3e]">
            <MapPin className="h-4 w-4 text-[#0e7c5a]" />
            {campaign.location}
          </div>
          <div className="flex items-center gap-2 text-sm text-[#2d4a3e]">
            <Users className="h-4 w-4 text-[#0e7c5a]" />
            {campaign.volunteersRegistered} / {campaign.volunteersNeeded} volunteers
          </div>
        </div>

        {campaign.impactSummary && (
          <div className="bg-[#e8f5e9] rounded-md p-3 mb-4">
            <p className="text-sm text-[#1a3a2a] flex items-start gap-2">
              <TreePine className="h-4 w-4 text-[#0e7c5a] mt-0.5 shrink-0" />
              {campaign.impactSummary}
            </p>
          </div>
        )}

        {!isPast && (
          <Link href="/volunteer">
            <Button className="w-full bg-[#0e7c5a] text-white" data-testid={`button-signup-${campaign.id}`}>
              Sign Up to Volunteer
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#f7faf8]">
      <div className="bg-[#1a3a2a] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl font-bold text-white mb-3" data-testid="text-campaigns-title">
            Our Campaigns
          </h1>
          <p className="text-[#a8c8b8] text-lg max-w-2xl">
            Explore our cleanup events and join us in making a difference for Southwest Florida's waterways.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-8 bg-white border border-[#d4e4d9]">
            <TabsTrigger value="upcoming" data-testid="tab-upcoming" className="data-[state=active]:bg-[#0e7c5a] data-[state=active]:text-white">
              Upcoming ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past" data-testid="tab-past" className="data-[state=active]:bg-[#0e7c5a] data-[state=active]:text-white">
              Past ({past.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="h-56 w-full rounded-t-md" />
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-3" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3 mb-4" />
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : upcoming.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="h-12 w-12 text-[#a8c8b8] mx-auto mb-4" />
                <h3 className="font-serif text-xl font-semibold text-[#1a3a2a] mb-2">No Upcoming Events</h3>
                <p className="text-[#4a7a5e]">Check back soon for new cleanup campaigns!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcoming.map((c) => (
                  <CampaignCard key={c.id} campaign={c} isPast={false} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {past.length === 0 ? (
              <div className="text-center py-16">
                <TreePine className="h-12 w-12 text-[#a8c8b8] mx-auto mb-4" />
                <h3 className="font-serif text-xl font-semibold text-[#1a3a2a] mb-2">No Past Campaigns Yet</h3>
                <p className="text-[#4a7a5e]">Our first cleanup is just around the corner!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {past.map((c) => (
                  <CampaignCard key={c.id} campaign={c} isPast={true} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
