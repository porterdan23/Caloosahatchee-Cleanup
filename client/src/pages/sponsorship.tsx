import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Heart, Star, Award, Shield, Building2, CheckCircle2 } from "lucide-react";
import type { Campaign, Sponsorship } from "@shared/schema";

const SPONSORSHIP_LEVELS = [
  {
    id: "river-supporter",
    name: "River Supporter",
    amount: 100,
    icon: Heart,
    color: "bg-blue-50 border-blue-200",
    headerColor: "bg-blue-100",
    textColor: "text-blue-700",
    benefits: ["Name listed on website supporter page"],
  },
  {
    id: "river-guardian",
    name: "River Guardian",
    amount: 500,
    icon: Shield,
    color: "bg-teal-50 border-teal-200",
    headerColor: "bg-teal-100",
    textColor: "text-teal-700",
    benefits: ["Website recognition", "Social media thank-you post"],
  },
  {
    id: "river-champion",
    name: "River Champion",
    amount: 1000,
    icon: Star,
    color: "bg-emerald-50 border-emerald-200",
    headerColor: "bg-emerald-100",
    textColor: "text-emerald-700",
    popular: true,
    benefits: ["Website recognition", "Social media recognition", "Logo placement on campaign page"],
  },
  {
    id: "river-partner",
    name: "River Partner",
    amount: 5000,
    icon: Award,
    color: "bg-amber-50 border-amber-200",
    headerColor: "bg-amber-100",
    textColor: "text-amber-700",
    benefits: ["Logo on sponsor section of website", "Recognition at cleanup events", "Featured sponsor acknowledgment"],
  },
];

const formSchema = z.object({
  sponsorName: z.string().min(2, "Name required"),
  sponsorEmail: z.string().email("Valid email required"),
  sponsorPhone: z.string().optional(),
  sponsorOrg: z.string().optional(),
  level: z.string().min(1, "Select a sponsorship level"),
  amount: z.string().min(1, "Amount required"),
  campaignId: z.string().optional(),
  message: z.string().optional(),
});

export default function Sponsorship() {
  const { toast } = useToast();
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  const { data: campaigns } = useQuery<Campaign[]>({ queryKey: ["/api/campaigns"] });
  const { data: approvedSponsors } = useQuery<Sponsorship[]>({ queryKey: ["/api/sponsorships"] });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { sponsorName: "", sponsorEmail: "", sponsorPhone: "", sponsorOrg: "", level: "", amount: "", campaignId: "", message: "" },
  });

  const submitMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) =>
      apiRequest("POST", "/api/sponsorships", {
        ...data,
        amount: parseInt(data.amount),
        campaignId: data.campaignId || null,
        sponsorPhone: data.sponsorPhone || null,
        sponsorOrg: data.sponsorOrg || null,
        logoUrl: null,
        message: data.message || null,
      }),
    onSuccess: () => {
      setSubmitted(true);
      toast({ title: "Sponsorship submitted!", description: "We'll be in touch within 2 business days." });
    },
    onError: (e: any) => toast({ title: "Submission failed", description: e.message, variant: "destructive" }),
  });

  const handleLevelSelect = (levelId: string) => {
    const level = SPONSORSHIP_LEVELS.find(l => l.id === levelId);
    setSelectedLevel(levelId);
    form.setValue("level", levelId);
    if (level) form.setValue("amount", level.amount.toString());
  };

  const upcomingCampaigns = campaigns?.filter(c => c.status === "upcoming") || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f9f4] to-white">
      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-r from-[#1a3a2a] to-[#0e7c5a] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-[#7dd8b5]" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Become a Sponsor</h1>
          <p className="text-xl text-[#b8e0cc] max-w-2xl mx-auto">
            Partner with Caloosahatchee Cleanup to protect Southwest Florida's waterways.
            Your investment helps fund cleanups, equipment, and community outreach.
          </p>
        </div>
      </section>

      {/* Sponsorship Levels */}
      <section className="py-12 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-[#1a3a2a] mb-2">Sponsorship Levels</h2>
        <p className="text-center text-[#4a6b5e] mb-8">Choose the level that best fits your contribution</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SPONSORSHIP_LEVELS.map(level => {
            const Icon = level.icon;
            const isSelected = selectedLevel === level.id;
            return (
              <div
                key={level.id}
                onClick={() => handleLevelSelect(level.id)}
                className={`relative border-2 rounded-xl cursor-pointer transition-all ${level.color} ${
                  isSelected ? "border-[#0e7c5a] shadow-lg scale-105 ring-2 ring-[#0e7c5a]" : "hover:shadow-md"
                }`}
                data-testid={`card-sponsor-level-${level.id}`}
              >
                {level.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#0e7c5a] text-white text-xs px-3">Most Popular</Badge>
                  </div>
                )}
                <div className={`${level.headerColor} rounded-t-xl p-4 text-center`}>
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${level.textColor}`} />
                  <h3 className={`font-bold text-lg ${level.textColor}`}>{level.name}</h3>
                  <p className="text-2xl font-black text-[#1a3a2a]">${level.amount.toLocaleString()}</p>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    {level.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#2d4a3e]">
                        <CheckCircle2 className="h-4 w-4 text-[#0e7c5a] shrink-0 mt-0.5" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  {isSelected && (
                    <div className="mt-3 text-center">
                      <Badge variant="outline" className="border-[#0e7c5a] text-[#0e7c5a]">Selected</Badge>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sponsorship Form */}
      <section className="py-8 px-4 max-w-2xl mx-auto pb-16">
        {submitted ? (
          <Card className="border-[#d4e4d9] text-center p-8">
            <CheckCircle2 className="h-16 w-16 text-[#0e7c5a] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#1a3a2a] mb-2">Thank You!</h2>
            <p className="text-[#4a6b5e]">Your sponsorship request has been submitted. Our team will contact you within 2 business days to finalize payment and next steps.</p>
            <Button className="mt-6 bg-[#0e7c5a] text-white" onClick={() => { setSubmitted(false); form.reset(); setSelectedLevel(""); }} data-testid="button-sponsor-again">
              Submit Another
            </Button>
          </Card>
        ) : (
          <Card className="border-[#d4e4d9] shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#1a3a2a]">Sponsorship Application</CardTitle>
              <p className="text-sm text-[#4a6b5e]">Fill out the form below and our team will contact you to complete your sponsorship.</p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(v => submitMutation.mutate(v))} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="sponsorName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name *</FormLabel>
                        <FormControl><Input placeholder="Jane Smith" {...field} data-testid="input-sponsor-name" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="sponsorOrg" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization (optional)</FormLabel>
                        <FormControl><Input placeholder="ABC Company" {...field} data-testid="input-sponsor-org" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="sponsorEmail" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl><Input type="email" placeholder="your@email.com" {...field} data-testid="input-sponsor-email" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="sponsorPhone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl><Input type="tel" placeholder="(239) 555-0100" {...field} data-testid="input-sponsor-phone" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="level" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sponsorship Level *</FormLabel>
                      <Select onValueChange={v => handleLevelSelect(v)} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-sponsor-level">
                            <SelectValue placeholder="Select a level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SPONSORSHIP_LEVELS.map(l => (
                            <SelectItem key={l.id} value={l.id}>{l.name} — ${l.amount.toLocaleString()}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="amount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ($)</FormLabel>
                      <FormControl><Input type="number" min="100" {...field} data-testid="input-sponsor-amount" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  {upcomingCampaigns.length > 0 && (
                    <FormField control={form.control} name="campaignId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sponsor a Specific Campaign (optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-sponsor-campaign">
                              <SelectValue placeholder="General fund (no specific campaign)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="general">General Fund</SelectItem>
                            {upcomingCampaigns.map(c => (
                              <SelectItem key={c.id} value={c.id.toString()}>{c.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}
                  <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message (optional)</FormLabel>
                      <FormControl><Textarea placeholder="Tell us about your motivation to sponsor..." rows={3} {...field} data-testid="input-sponsor-message" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="bg-[#f0f9f4] rounded-lg p-4 text-sm text-[#4a6b5e]">
                    <p className="font-medium text-[#1a3a2a] mb-1">How it works:</p>
                    <p>After submitting, our team will contact you to arrange payment via check, bank transfer, or credit card processing. Caloosahatchee Cleanup is a nonprofit organization.</p>
                  </div>
                  <Button type="submit" className="w-full bg-[#0e7c5a] text-white" disabled={submitMutation.isPending} data-testid="button-sponsor-submit">
                    {submitMutation.isPending ? "Submitting..." : "Submit Sponsorship Application"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Current Sponsors */}
      {approvedSponsors && approvedSponsors.length > 0 && (
        <section className="py-12 px-4 bg-[#f0f9f4] border-t border-[#d4e4d9]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-[#1a3a2a] mb-8">Our Sponsors</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {approvedSponsors.map(s => (
                <div key={s.id} className="bg-white border border-[#d4e4d9] rounded-lg px-5 py-3 shadow-sm" data-testid={`card-sponsor-${s.id}`}>
                  <p className="font-semibold text-[#1a3a2a]">{s.sponsorOrg || s.sponsorName}</p>
                  <p className="text-xs text-[#4a6b5e] capitalize">{s.level.replace(/-/g, " ")}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
