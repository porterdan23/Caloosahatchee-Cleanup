import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CheckCircle, Users, AlertTriangle, Minus, Plus, CalendarCheck, Clock } from "lucide-react";
import type { Campaign } from "@shared/schema";

const volunteerFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  age: z.number().min(16, "Must be at least 16 years old").max(120),
  isGroup: z.boolean().default(false),
  groupMembers: z.string().optional(),
  campaignId: z.number().optional(),
  waiverSigned: z.boolean().refine((v) => v === true, "You must sign the waiver to register"),
});

type VolunteerFormValues = z.infer<typeof volunteerFormSchema>;

const WAIVER_TEXT = `RELEASE AND WAIVER OF LIABILITY

I, the undersigned participant, hereby acknowledge and agree to the following:

1. ASSUMPTION OF RISK: I understand that participating in Caloosahatchee Cleanup activities involves certain risks including, but not limited to, exposure to outdoor elements, physical exertion, contact with wildlife, and handling of debris and waste materials.

2. RELEASE OF LIABILITY: I hereby release, waive, discharge, and covenant not to sue Caloosahatchee Cleanup, its officers, directors, volunteers, agents, and employees from any and all liability, claims, demands, or causes of action arising out of or related to any loss, damage, or injury that may be sustained by me during my participation.

3. MEDICAL AUTHORIZATION: I authorize Caloosahatchee Cleanup to seek emergency medical treatment on my behalf if necessary.

4. PHOTO/VIDEO RELEASE: I grant Caloosahatchee Cleanup permission to use any photographs or video taken during events for promotional purposes.

5. I have read this waiver carefully, understand its contents, and sign it voluntarily.`;

export default function Volunteer() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [waiverOpen, setWaiverOpen] = useState(false);
  const [groupCount, setGroupCount] = useState(1);

  const { data: campaigns } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const upcomingCampaigns = campaigns?.filter((c) => c.status === "upcoming") || [];

  const form = useForm<VolunteerFormValues>({
    resolver: zodResolver(volunteerFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      age: undefined as unknown as number,
      isGroup: false,
      groupMembers: "",
      campaignId: undefined,
      waiverSigned: false,
    },
  });

  const isGroup = form.watch("isGroup");

  const mutation = useMutation({
    mutationFn: async (data: VolunteerFormValues) => {
      const res = await apiRequest("POST", "/api/volunteers", {
        ...data,
        registeredAt: new Date().toISOString(),
      });
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/volunteers"] });
    },
    onError: (error: Error) => {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    },
  });

  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [hoursSubmitted, setHoursSubmitted] = useState(false);

  const rsvpForm = useForm({
    defaultValues: { fullName: "", email: "", campaignId: "" },
    resolver: zodResolver(z.object({
      fullName: z.string().min(2, "Name required"),
      email: z.string().email("Valid email required"),
      campaignId: z.string().min(1, "Select a campaign"),
    })),
  });

  const hoursForm = useForm({
    defaultValues: { volunteerName: "", volunteerEmail: "", campaignId: "", hours: "", notes: "" },
    resolver: zodResolver(z.object({
      volunteerName: z.string().min(2, "Name required"),
      volunteerEmail: z.string().email("Valid email required"),
      campaignId: z.string().optional(),
      hours: z.string().min(1, "Hours required"),
      notes: z.string().optional(),
    })),
  });

  const rsvpMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/rsvps", {
      fullName: data.fullName,
      email: data.email,
      campaignId: parseInt(data.campaignId),
    }),
    onSuccess: () => { setRsvpSubmitted(true); toast({ title: "RSVP confirmed!" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const hoursMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/volunteer-hours", {
      volunteerName: data.volunteerName,
      volunteerEmail: data.volunteerEmail,
      campaignId: data.campaignId ? parseInt(data.campaignId) : null,
      hours: parseFloat(data.hours),
      notes: data.notes || null,
    }),
    onSuccess: () => { setHoursSubmitted(true); toast({ title: "Hours submitted for approval!" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const onSubmit = (data: VolunteerFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-[#f7faf8]">
      <div className="bg-[#1a3a2a] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl font-bold text-white mb-3" data-testid="text-volunteer-title">
            Volunteer Center
          </h1>
          <p className="text-[#a8c8b8] text-lg max-w-2xl">
            Sign up, RSVP to events, and track your volunteer hours all in one place.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="signup">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="signup" className="flex-1" data-testid="tab-signup">
              <Users className="h-4 w-4 mr-2" />Sign Up
            </TabsTrigger>
            <TabsTrigger value="rsvp" className="flex-1" data-testid="tab-rsvp">
              <CalendarCheck className="h-4 w-4 mr-2" />RSVP
            </TabsTrigger>
            <TabsTrigger value="hours" className="flex-1" data-testid="tab-hours">
              <Clock className="h-4 w-4 mr-2" />Log Hours
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rsvp">
            {rsvpSubmitted ? (
              <Card><CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-[#0e7c5a] mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[#1a3a2a] mb-2">RSVP Confirmed!</h2>
                <p className="text-[#4a7a5e] mb-4">We'll see you at the event. Check your email for details.</p>
                <Button className="bg-[#0e7c5a] text-white" onClick={() => { setRsvpSubmitted(false); rsvpForm.reset(); }} data-testid="button-rsvp-again">RSVP for Another Event</Button>
              </CardContent></Card>
            ) : (
              <Card><CardContent className="p-6">
                <h2 className="text-xl font-semibold text-[#1a3a2a] mb-1">RSVP to a Cleanup Event</h2>
                <p className="text-sm text-[#4a6b5e] mb-6">Reserve your spot at an upcoming cleanup event.</p>
                <Form {...rsvpForm}>
                  <form onSubmit={rsvpForm.handleSubmit(v => rsvpMutation.mutate(v))} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Full Name</label>
                        <Input placeholder="Jane Smith" {...rsvpForm.register("fullName")} data-testid="input-rsvp-name" />
                        {rsvpForm.formState.errors.fullName && <p className="text-red-500 text-xs mt-1">{rsvpForm.formState.errors.fullName.message}</p>}
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Email</label>
                        <Input type="email" placeholder="your@email.com" {...rsvpForm.register("email")} data-testid="input-rsvp-email" />
                        {rsvpForm.formState.errors.email && <p className="text-red-500 text-xs mt-1">{rsvpForm.formState.errors.email.message}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Select Event</label>
                      <Select onValueChange={v => rsvpForm.setValue("campaignId", v)} value={rsvpForm.watch("campaignId")}>
                        <SelectTrigger data-testid="select-rsvp-campaign">
                          <SelectValue placeholder="Choose an event..." />
                        </SelectTrigger>
                        <SelectContent>
                          {upcomingCampaigns.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.title} — {c.date}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {rsvpForm.formState.errors.campaignId && <p className="text-red-500 text-xs mt-1">{rsvpForm.formState.errors.campaignId.message}</p>}
                    </div>
                    {upcomingCampaigns.length === 0 && (
                      <p className="text-[#4a6b5e] text-sm">No upcoming events available for RSVP right now. Check back soon!</p>
                    )}
                    <Button type="submit" className="w-full bg-[#0e7c5a] text-white" disabled={rsvpMutation.isPending || upcomingCampaigns.length === 0} data-testid="button-rsvp-submit">
                      {rsvpMutation.isPending ? "Submitting..." : "Confirm RSVP"}
                    </Button>
                  </form>
                </Form>
              </CardContent></Card>
            )}
          </TabsContent>

          <TabsContent value="hours">
            {hoursSubmitted ? (
              <Card><CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-[#0e7c5a] mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[#1a3a2a] mb-2">Hours Submitted!</h2>
                <p className="text-[#4a7a5e] mb-4">Your volunteer hours have been submitted for admin approval.</p>
                <Button className="bg-[#0e7c5a] text-white" onClick={() => { setHoursSubmitted(false); hoursForm.reset(); }} data-testid="button-hours-again">Log More Hours</Button>
              </CardContent></Card>
            ) : (
              <Card><CardContent className="p-6">
                <h2 className="text-xl font-semibold text-[#1a3a2a] mb-1">Log Volunteer Hours</h2>
                <p className="text-sm text-[#4a6b5e] mb-6">Track your contribution — hours are verified by our admin team.</p>
                <form onSubmit={hoursForm.handleSubmit(v => hoursMutation.mutate(v))} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Your Name</label>
                      <Input placeholder="Jane Smith" {...hoursForm.register("volunteerName")} data-testid="input-hours-name" />
                      {hoursForm.formState.errors.volunteerName && <p className="text-red-500 text-xs mt-1">{hoursForm.formState.errors.volunteerName.message}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Email</label>
                      <Input type="email" placeholder="your@email.com" {...hoursForm.register("volunteerEmail")} data-testid="input-hours-email" />
                      {hoursForm.formState.errors.volunteerEmail && <p className="text-red-500 text-xs mt-1">{hoursForm.formState.errors.volunteerEmail.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Hours Volunteered</label>
                      <Input type="number" step="0.5" min="0.5" placeholder="e.g. 3.5" {...hoursForm.register("hours")} data-testid="input-hours-amount" />
                      {hoursForm.formState.errors.hours && <p className="text-red-500 text-xs mt-1">{hoursForm.formState.errors.hours.message}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Event (optional)</label>
                      <Select onValueChange={v => hoursForm.setValue("campaignId", v)} value={hoursForm.watch("campaignId")}>
                        <SelectTrigger data-testid="select-hours-campaign">
                          <SelectValue placeholder="Select event..." />
                        </SelectTrigger>
                        <SelectContent>
                          {campaigns?.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Notes (optional)</label>
                    <Textarea placeholder="Describe your activities during this session..." rows={3} {...hoursForm.register("notes")} data-testid="input-hours-notes" />
                  </div>
                  <Button type="submit" className="w-full bg-[#0e7c5a] text-white" disabled={hoursMutation.isPending} data-testid="button-hours-submit">
                    {hoursMutation.isPending ? "Submitting..." : "Submit Hours"}
                  </Button>
                </form>
              </CardContent></Card>
            )}
          </TabsContent>

          <TabsContent value="signup">
        <Card>
          <CardContent className="p-6 sm:p-8">
            {submitted ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-[#e8f5e9] rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-[#0e7c5a]" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#1a3a2a] mb-3" data-testid="text-signup-success">
                  Registration Complete!
                </h2>
                <p className="text-[#4a7a5e] mb-6">
                  Thank you for signing up as a volunteer! We'll be in touch with event details and next steps.
                </p>
                <Button onClick={() => { setSubmitted(false); form.reset(); }} className="bg-[#0e7c5a] text-white" data-testid="button-register-another">
                  Register Another Volunteer
                </Button>
              </div>
            ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Smith" {...field} data-testid="input-fullname" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="(239) 555-0123" {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="25"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            value={field.value || ""}
                            data-testid="input-age"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {upcomingCampaigns.length > 0 && (
                  <FormField
                    control={form.control}
                    name="campaignId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select a Campaign (optional)</FormLabel>
                        <Select
                          onValueChange={(v) => field.onChange(v ? parseInt(v) : undefined)}
                          value={field.value?.toString() || ""}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-campaign">
                              <SelectValue placeholder="Choose a specific campaign..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {upcomingCampaigns.map((c) => (
                              <SelectItem key={c.id} value={c.id.toString()}>
                                {c.title} - {c.date}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="isGroup"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-group"
                        />
                      </FormControl>
                      <FormLabel className="font-normal flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#0e7c5a]" />
                        I'm attending as a group
                      </FormLabel>
                    </FormItem>
                  )}
                />

                {isGroup && (
                  <FormField
                    control={form.control}
                    name="groupMembers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Group Members</FormLabel>
                        <p className="text-sm text-muted-foreground mb-2">
                          Enter names and contact info of additional group members (one per line)
                        </p>
                        <FormControl>
                          <Textarea
                            placeholder={"Jane Doe, jane@email.com, (239) 555-0124\nBob Smith, bob@email.com, (239) 555-0125"}
                            rows={4}
                            {...field}
                            data-testid="textarea-group-members"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="border border-[#d4e4d9] rounded-md">
                  <button
                    type="button"
                    onClick={() => setWaiverOpen(!waiverOpen)}
                    className="w-full flex items-center justify-between gap-4 p-4 text-left"
                    data-testid="button-waiver-toggle"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-[#f9a825]" />
                      <span className="font-medium text-[#1a3a2a]">Digital Waiver</span>
                    </div>
                    <span className="text-sm text-[#4a7a5e]">{waiverOpen ? "Hide" : "Read & Sign"}</span>
                  </button>
                  {waiverOpen && (
                    <div className="px-4 pb-4">
                      <div className="bg-[#f7faf8] rounded-md p-4 mb-4 max-h-64 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm text-[#2d4a3e] font-sans">{WAIVER_TEXT}</pre>
                      </div>
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="waiverSigned"
                  render={({ field }) => (
                    <FormItem className="flex items-start gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-waiver"
                        />
                      </FormControl>
                      <div>
                        <FormLabel className="font-normal">
                          I have read and agree to the waiver terms above *
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-[#0e7c5a] text-white text-base"
                  disabled={mutation.isPending}
                  data-testid="button-submit-volunteer"
                >
                  {mutation.isPending ? "Registering..." : "Complete Registration"}
                </Button>
              </form>
            </Form>
            )}
          </CardContent>
        </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
