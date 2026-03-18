import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Calendar, MapPin, Phone, Mail, Users, Waves, TreePine, Trash2, Instagram } from "lucide-react";
import type { Campaign, Stat } from "@shared/schema";
import heroImg from "@assets/ChatGPT_Image_Feb_21,_2026,_11_57_02_AM_1771693058033.png";
import logoImg from "@assets/CA3CB632-FA3F-43F7-8D07-6E1923130FB9_1771895514008.jpeg";

const iconMap: Record<string, typeof Trash2> = {
  trash: Trash2,
  users: Users,
  waves: Waves,
};

const iconColorMap: Record<string, { bg: string; text: string }> = {
  trash: { bg: "bg-[#e8f5e9]", text: "text-[#0e7c5a]" },
  users: { bg: "bg-[#e3f2fd]", text: "text-[#1565c0]" },
  waves: { bg: "bg-[#fff8e1]", text: "text-[#f9a825]" },
};

export default function Home() {
  const { data: campaigns, isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const { data: statsData } = useQuery<Stat[]>({
    queryKey: ["/api/stats"],
  });

  const pastCampaigns = campaigns?.filter((c) => c.status === "completed").slice(0, 3) || [];
  const upcomingCampaigns = campaigns?.filter((c) => c.status === "upcoming").slice(0, 3) || [];

  return (
    <div className="min-h-screen">
      <section className="relative h-[85vh] min-h-[600px] flex items-center" data-testid="section-hero">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Caloosahatchee River cleanup" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1f15]/90 via-[#0a1f15]/70 to-[#0a1f15]/40" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <img src={logoImg} alt="Caloosahatchee Cleanup" className="h-16 sm:h-20 w-auto rounded mb-6" />
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Protecting Our <span className="text-[#5ec4a0]">Waterways</span>
            </h1>
            <p className="text-lg sm:text-xl text-[#c8e6d8] leading-relaxed mb-8 max-w-xl">
              Caloosahatchee Cleanup is dedicated to protecting and restoring the waterways of Southwest Florida through organized cleanup efforts, community involvement, and responsible environmental stewardship.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/volunteer">
                <Button size="lg" className="bg-[#0e7c5a] text-white text-base px-8" data-testid="button-hero-volunteer">
                  Volunteer Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/donate">
                <Button size="lg" variant="outline" className="border-white/30 text-white backdrop-blur-sm bg-white/10 text-base px-8" data-testid="button-hero-donate">
                  Donate
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#f7faf8]" data-testid="section-impact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1a3a2a] mb-4">Our Impact</h2>
            <p className="text-[#4a7a5e] text-lg max-w-2xl mx-auto">
              Together, we're making a measurable difference in Southwest Florida's waterways.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {(statsData || []).map((stat) => {
              const IconComponent = iconMap[stat.icon] || Trash2;
              const colors = iconColorMap[stat.icon] || iconColorMap.trash;
              return (
                <div key={stat.id} className="text-center p-8" data-testid={`stat-${stat.id}`}>
                  <div className={`w-16 h-16 rounded-full ${colors.bg} flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className={`h-7 w-7 ${colors.text}`} />
                  </div>
                  <div className="font-serif text-4xl font-bold text-[#1a3a2a] mb-2">{stat.value}</div>
                  <div className="text-[#4a7a5e] font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {upcomingCampaigns.length > 0 && (
        <section className="py-20 bg-white" data-testid="section-upcoming">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4 mb-10 flex-wrap">
              <div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1a3a2a] mb-2">Upcoming Cleanups</h2>
                <p className="text-[#4a7a5e] text-lg">Join us at our next event</p>
              </div>
              <Link href="/campaigns">
                <Button variant="outline" className="border-[#0e7c5a] text-[#0e7c5a]" data-testid="button-view-all-campaigns">
                  View All Campaigns
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                      <Skeleton className="h-48 w-full rounded-t-md" />
                      <CardContent className="p-5">
                        <Skeleton className="h-6 w-3/4 mb-3" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </CardContent>
                    </Card>
                  ))
                : upcomingCampaigns.map((campaign) => (
                    <Card key={campaign.id} className="group" data-testid={`card-campaign-${campaign.id}`}>
                      <div className="relative h-48 overflow-hidden rounded-t-md">
                        <img
                          src={campaign.imageUrl || "/images/campaign-river-cleanup.png"}
                          alt={campaign.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <Badge className="absolute top-3 left-3 bg-[#0e7c5a] text-white">Upcoming</Badge>
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-serif text-xl font-semibold text-[#1a3a2a] mb-2">{campaign.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-[#4a7a5e] mb-1">
                          <Calendar className="h-4 w-4" />
                          {campaign.date} at {campaign.time}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#4a7a5e] mb-3">
                          <MapPin className="h-4 w-4" />
                          {campaign.location}
                        </div>
                        <Link href="/volunteer">
                          <Button size="sm" className="w-full bg-[#0e7c5a] text-white" data-testid={`button-signup-campaign-${campaign.id}`}>
                            Sign Up
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
            </div>
          </div>
        </section>
      )}

      {pastCampaigns.length > 0 && (
        <section className="py-20 bg-[#f7faf8]" data-testid="section-past-campaigns">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1a3a2a] mb-2">Past Campaigns</h2>
              <p className="text-[#4a7a5e] text-lg">See the difference we've made together</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pastCampaigns.map((campaign) => (
                <Card key={campaign.id} className="group" data-testid={`card-past-campaign-${campaign.id}`}>
                  <div className="relative h-48 overflow-hidden rounded-t-md">
                    <img
                      src={campaign.imageUrl || "/images/campaign-beach-cleanup.png"}
                      alt={campaign.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <Badge className="absolute top-3 left-3 bg-[#6b7280] text-white">Completed</Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-serif text-xl font-semibold text-[#1a3a2a] mb-2">{campaign.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-[#4a7a5e] mb-1">
                      <Calendar className="h-4 w-4" />
                      {campaign.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#4a7a5e] mb-3">
                      <MapPin className="h-4 w-4" />
                      {campaign.location}
                    </div>
                    {campaign.impactSummary && (
                      <p className="text-sm text-[#2d4a3e] bg-[#e8f5e9] rounded-md p-3">
                        <TreePine className="h-4 w-4 inline mr-1 text-[#0e7c5a]" />
                        {campaign.impactSummary}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-white" data-testid="section-mission">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1a3a2a] mb-6">Our Mission</h2>
              <p className="text-[#2d4a3e] text-lg leading-relaxed mb-6">
                Caloosahatchee Cleanup is dedicated to protecting and restoring the waterways of Southwest Florida through organized cleanup efforts, community involvement, and responsible environmental stewardship.
              </p>
              <p className="text-[#4a7a5e] leading-relaxed mb-8">
                The Caloosahatchee River is vital to our ecosystem and community. We organize regular cleanup events, engage local volunteers, and educate the public about the importance of keeping our waterways clean and healthy for generations to come.
              </p>
              <Link href="/campaigns">
                <Button className="bg-[#0e7c5a] text-white" data-testid="button-learn-more">
                  View Our Campaigns
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <img
                src="/images/campaign-mangrove-restoration.png"
                alt="Mangrove restoration"
                className="rounded-md w-full shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#0e7c5a]" data-testid="section-cta">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-[#b8e6d0] text-lg mb-8 max-w-2xl mx-auto">
            Whether you volunteer your time or make a donation, every contribution helps protect our precious waterways.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/volunteer">
              <Button size="lg" className="bg-white text-[#0e7c5a] text-base px-8" data-testid="button-cta-volunteer">
                Become a Volunteer
              </Button>
            </Link>
            <Link href="/donate">
              <Button size="lg" variant="outline" className="border-white/30 text-white backdrop-blur-sm bg-white/10 text-base px-8" data-testid="button-cta-donate">
                Make a Donation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#f7faf8]" data-testid="section-contact">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl font-bold text-[#1a3a2a] mb-6">Get in Touch</h2>
          <p className="text-[#4a7a5e] mb-8">Have questions? We'd love to hear from you.</p>
          <div className="flex flex-wrap justify-center gap-8">
            <a href="tel:239-464-0032" className="flex items-center gap-2 text-[#0e7c5a] font-medium hover:underline" data-testid="link-contact-phone">
              <Phone className="h-5 w-5" />
              239-464-0032
            </a>
            <a href="mailto:info.caloosahatcheecleanup@gmail.com" className="flex items-center gap-2 text-[#0e7c5a] font-medium hover:underline" data-testid="link-contact-email">
              <Mail className="h-5 w-5" />
              info.caloosahatcheecleanup@gmail.com
            </a>
            <a href="https://www.instagram.com/caloosahatchee_cleanup/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#0e7c5a] font-medium hover:underline" data-testid="link-contact-instagram">
              <Instagram className="h-5 w-5" />
              @caloosahatchee_cleanup
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
