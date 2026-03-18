import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Shield, LogOut, Plus, Users, Calendar, Star, CheckCircle, XCircle,
  Eye, Trash2, Edit, LayoutDashboard, Building2, Waves, Clock, UserCheck, MapPin
} from "lucide-react";
import type { Campaign, Volunteer, Review, Stat, Sponsorship, ServiceRequest, VolunteerHours, CleanupLocation } from "@shared/schema";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const campaignFormSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().min(10, "Description is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  location: z.string().min(2, "Location is required"),
  imageUrl: z.string().optional(),
  status: z.string().default("upcoming"),
  impactSummary: z.string().optional(),
  volunteersNeeded: z.number().min(1).default(50),
});

type CampaignFormValues = z.infer<typeof campaignFormSchema>;

export default function Admin() {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [showCampaignForm, setShowCampaignForm] = useState(false);

  useQuery({
    queryKey: ["/api/admin/session"],
    queryFn: async () => {
      const res = await fetch("/api/admin/session", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) setIsLoggedIn(true);
      }
      return null;
    },
  });

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const campaignForm = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      imageUrl: "",
      status: "upcoming",
      impactSummary: "",
      volunteersNeeded: 50,
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: z.infer<typeof loginSchema>) => {
      const res = await apiRequest("POST", "/api/admin/login", data);
      return res.json();
    },
    onSuccess: () => {
      setIsLoggedIn(true);
      toast({ title: "Logged in successfully" });
    },
    onError: () => {
      toast({ title: "Invalid credentials", variant: "destructive" });
    },
  });

  const { data: campaigns, isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
    enabled: isLoggedIn,
  });

  const { data: volunteers, isLoading: volunteersLoading } = useQuery<Volunteer[]>({
    queryKey: ["/api/admin/volunteers"],
    enabled: isLoggedIn,
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ["/api/admin/reviews"],
    enabled: isLoggedIn,
  });

  const { data: siteStats } = useQuery<Stat[]>({
    queryKey: ["/api/stats"],
  });

  const { data: sponsorships, isLoading: sponsorshipsLoading } = useQuery<Sponsorship[]>({
    queryKey: ["/api/admin/sponsorships"],
    enabled: isLoggedIn,
  });

  const { data: serviceRequests, isLoading: serviceRequestsLoading } = useQuery<ServiceRequest[]>({
    queryKey: ["/api/admin/service-requests"],
    enabled: isLoggedIn,
  });

  const { data: volunteerHours, isLoading: hoursLoading } = useQuery<VolunteerHours[]>({
    queryKey: ["/api/admin/volunteer-hours"],
    enabled: isLoggedIn,
  });

  const { data: memberUsers, isLoading: usersLoading } = useQuery<{ id: number; email: string; name: string; phone?: string; createdAt: string; notifyEmail: boolean }[]>({
    queryKey: ["/api/admin/member-users"],
    enabled: isLoggedIn,
  });

  const { data: cleanupLocations, isLoading: locationsLoading } = useQuery<CleanupLocation[]>({
    queryKey: ["/api/cleanup-locations"],
    enabled: isLoggedIn,
  });

  const updateSponsorshipMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/sponsorships/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sponsorships"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sponsorships"] });
      toast({ title: "Sponsorship updated" });
    },
  });

  const updateServiceRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/service-requests/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-requests"] });
      toast({ title: "Request status updated" });
    },
  });

  const approveHoursMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/volunteer-hours/${id}/approve`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/volunteer-hours"] });
      toast({ title: "Hours approved" });
    },
  });

  const updateLocationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/cleanup-locations/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cleanup-locations"] });
      toast({ title: "Location updated" });
    },
  });

  const deleteLocationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cleanup-locations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cleanup-locations"] });
      toast({ title: "Location deleted" });
    },
  });

  const [editingStats, setEditingStats] = useState<Record<number, { label: string; value: string }>>({});

  const updateStatMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { label?: string; value?: string } }) => {
      const res = await apiRequest("PATCH", `/api/stats/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Stat updated" });
      setEditingStats({});
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    },
  });

  const campaignMutation = useMutation({
    mutationFn: async (data: CampaignFormValues) => {
      if (editingCampaign) {
        const res = await apiRequest("PATCH", `/api/campaigns/${editingCampaign.id}`, data);
        return res.json();
      }
      const res = await apiRequest("POST", "/api/campaigns", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: editingCampaign ? "Campaign updated" : "Campaign created" });
      campaignForm.reset();
      setShowCampaignForm(false);
      setEditingCampaign(null);
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    },
  });

  const approveReviewMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: number; approved: boolean }) => {
      const res = await apiRequest("PATCH", `/api/reviews/${id}`, { approved });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/approved"] });
      toast({ title: "Review updated" });
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({ title: "Campaign deleted" });
    },
  });

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f7faf8] flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-[#e8f5e9] rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-7 w-7 text-[#0e7c5a]" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-[#1a3a2a]" data-testid="text-admin-login-title">
                Admin Portal
              </h1>
              <p className="text-[#4a7a5e] mt-1">Sign in to manage your organization</p>
            </div>
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit((d) => loginMutation.mutate(d))} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="admin" {...field} data-testid="input-admin-username" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter password" {...field} data-testid="input-admin-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-[#0e7c5a] text-white"
                  disabled={loginMutation.isPending}
                  data-testid="button-admin-login"
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const startEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    campaignForm.reset({
      title: campaign.title,
      description: campaign.description,
      date: campaign.date,
      time: campaign.time,
      location: campaign.location,
      imageUrl: campaign.imageUrl || "",
      status: campaign.status,
      impactSummary: campaign.impactSummary || "",
      volunteersNeeded: campaign.volunteersNeeded || 50,
    });
    setShowCampaignForm(true);
  };

  const pendingReviews = reviews?.filter((r) => !r.approved) || [];
  const approvedReviews = reviews?.filter((r) => r.approved) || [];

  return (
    <div className="min-h-screen bg-[#f7faf8]">
      <div className="bg-[#1a3a2a] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-6 w-6 text-[#5ec4a0]" />
            <h1 className="font-serif text-2xl font-bold text-white" data-testid="text-admin-dashboard">
              Admin Dashboard
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
              setIsLoggedIn(false);
              queryClient.invalidateQueries({ queryKey: ["/api/admin/session"] });
            }}
            className="border-white/20 text-white bg-white/10"
            data-testid="button-admin-logout"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#e3f2fd] rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-[#1565c0]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#1a3a2a]" data-testid="text-campaigns-count">
                  {campaigns?.length || 0}
                </div>
                <div className="text-sm text-[#4a7a5e]">Campaigns</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#e8f5e9] rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-[#0e7c5a]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#1a3a2a]" data-testid="text-volunteers-count">
                  {volunteers?.length || 0}
                </div>
                <div className="text-sm text-[#4a7a5e]">Volunteers</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#fff8e1] rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-[#f9a825]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#1a3a2a]" data-testid="text-reviews-pending">
                  {pendingReviews.length}
                </div>
                <div className="text-sm text-[#4a7a5e]">Pending Reviews</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="campaigns" className="w-full">
          <div className="overflow-x-auto pb-1 mb-6">
            <TabsList className="bg-white border border-[#d4e4d9] inline-flex w-max">
              <TabsTrigger value="campaigns" className="data-[state=active]:bg-[#0e7c5a] data-[state=active]:text-white" data-testid="tab-admin-campaigns">
                <Calendar className="h-4 w-4 mr-1" />Campaigns
              </TabsTrigger>
              <TabsTrigger value="volunteers" className="data-[state=active]:bg-[#0e7c5a] data-[state=active]:text-white" data-testid="tab-admin-volunteers">
                <Users className="h-4 w-4 mr-1" />Volunteers
              </TabsTrigger>
              <TabsTrigger value="hours" className="data-[state=active]:bg-[#0e7c5a] data-[state=active]:text-white" data-testid="tab-admin-hours">
                <Clock className="h-4 w-4 mr-1" />Hours
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-[#0e7c5a] data-[state=active]:text-white" data-testid="tab-admin-reviews">
                <Star className="h-4 w-4 mr-1" />Reviews
              </TabsTrigger>
              <TabsTrigger value="sponsorships" className="data-[state=active]:bg-[#0e7c5a] data-[state=active]:text-white" data-testid="tab-admin-sponsorships">
                <Building2 className="h-4 w-4 mr-1" />Sponsors
              </TabsTrigger>
              <TabsTrigger value="services" className="data-[state=active]:bg-[#0e7c5a] data-[state=active]:text-white" data-testid="tab-admin-services">
                <Waves className="h-4 w-4 mr-1" />Services
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-[#0e7c5a] data-[state=active]:text-white" data-testid="tab-admin-users">
                <UserCheck className="h-4 w-4 mr-1" />Members
              </TabsTrigger>
              <TabsTrigger value="map" className="data-[state=active]:bg-[#0e7c5a] data-[state=active]:text-white" data-testid="tab-admin-map">
                <MapPin className="h-4 w-4 mr-1" />Map
              </TabsTrigger>
              <TabsTrigger value="stats" className="data-[state=active]:bg-[#0e7c5a] data-[state=active]:text-white" data-testid="tab-admin-stats">
                Stats
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="campaigns">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <h2 className="font-serif text-xl font-semibold text-[#1a3a2a]">Manage Campaigns</h2>
              <Button
                onClick={() => {
                  setEditingCampaign(null);
                  campaignForm.reset();
                  setShowCampaignForm(!showCampaignForm);
                }}
                className="bg-[#0e7c5a] text-white"
                data-testid="button-new-campaign"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Campaign
              </Button>
            </div>

            {showCampaignForm && (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="font-serif text-lg font-semibold text-[#1a3a2a] mb-4">
                    {editingCampaign ? "Edit Campaign" : "Create Campaign"}
                  </h3>
                  <Form {...campaignForm}>
                    <form onSubmit={campaignForm.handleSubmit((d) => campaignMutation.mutate(d))} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={campaignForm.control} name="title" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl><Input {...field} data-testid="input-campaign-title" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={campaignForm.control} name="location" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl><Input {...field} data-testid="input-campaign-location" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={campaignForm.control} name="date" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl><Input type="date" {...field} data-testid="input-campaign-date" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={campaignForm.control} name="time" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time</FormLabel>
                            <FormControl><Input type="time" {...field} data-testid="input-campaign-time" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={campaignForm.control} name="status" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-campaign-status">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="upcoming">Upcoming</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={campaignForm.control} name="volunteersNeeded" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Volunteers Needed</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 50)} data-testid="input-campaign-volunteers" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <FormField control={campaignForm.control} name="description" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl><Textarea rows={3} {...field} data-testid="textarea-campaign-description" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={campaignForm.control} name="imageUrl" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL (optional)</FormLabel>
                          <FormControl><Input placeholder="/images/campaign-river-cleanup.png" {...field} data-testid="input-campaign-image" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={campaignForm.control} name="impactSummary" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Impact Summary (for completed campaigns)</FormLabel>
                          <FormControl><Textarea rows={2} {...field} data-testid="textarea-campaign-impact" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <div className="flex gap-3 flex-wrap">
                        <Button type="submit" className="bg-[#0e7c5a] text-white" disabled={campaignMutation.isPending} data-testid="button-save-campaign">
                          {campaignMutation.isPending ? "Saving..." : editingCampaign ? "Update Campaign" : "Create Campaign"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => { setShowCampaignForm(false); setEditingCampaign(null); }}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Volunteers</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaignsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 6 }).map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : campaigns && campaigns.length > 0 ? (
                      campaigns.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.title}</TableCell>
                          <TableCell>{c.date}</TableCell>
                          <TableCell>{c.location}</TableCell>
                          <TableCell>
                            <Badge className={c.status === "upcoming" ? "bg-[#0e7c5a] text-white" : "bg-[#6b7280] text-white"}>
                              {c.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{c.volunteersRegistered}/{c.volunteersNeeded}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="icon" variant="ghost" onClick={() => startEdit(c)} data-testid={`button-edit-campaign-${c.id}`}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => deleteCampaignMutation.mutate(c.id)} data-testid={`button-delete-campaign-${c.id}`}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-[#4a7a5e]">No campaigns yet</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="volunteers">
            <h2 className="font-serif text-xl font-semibold text-[#1a3a2a] mb-6">Registered Volunteers</h2>
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Registered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {volunteersLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 6 }).map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : volunteers && volunteers.length > 0 ? (
                      volunteers.map((v) => (
                        <TableRow key={v.id}>
                          <TableCell className="font-medium">{v.fullName}</TableCell>
                          <TableCell>{v.email}</TableCell>
                          <TableCell>{v.phone}</TableCell>
                          <TableCell>{v.age}</TableCell>
                          <TableCell>
                            {v.isGroup ? <Badge className="bg-[#e3f2fd] text-[#1565c0]">Group</Badge> : "Individual"}
                          </TableCell>
                          <TableCell>{new Date(v.registeredAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-[#4a7a5e]">No volunteers yet</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <h2 className="font-serif text-xl font-semibold text-[#1a3a2a] mb-6">Manage Reviews</h2>

            {pendingReviews.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-[#1a3a2a] mb-4">Pending Approval ({pendingReviews.length})</h3>
                <div className="space-y-3">
                  {pendingReviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4 flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-[#1a3a2a]">{review.volunteerName}</span>
                            <span className="text-sm text-[#4a7a5e]">{review.email}</span>
                          </div>
                          <p className="text-sm text-[#2d4a3e] mb-2">{review.content}</p>
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-[#f9a825] text-[#f9a825]" : "text-[#d4e4d9]"}`} />
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => approveReviewMutation.mutate({ id: review.id, approved: true })}
                            data-testid={`button-approve-review-${review.id}`}
                          >
                            <CheckCircle className="h-5 w-5 text-[#0e7c5a]" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => approveReviewMutation.mutate({ id: review.id, approved: false })}
                            data-testid={`button-reject-review-${review.id}`}
                          >
                            <XCircle className="h-5 w-5 text-red-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <h3 className="text-lg font-medium text-[#1a3a2a] mb-4">Approved Reviews ({approvedReviews.length})</h3>
            {approvedReviews.length > 0 ? (
              <div className="space-y-3">
                {approvedReviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-[#1a3a2a]">{review.volunteerName}</span>
                        <Badge className="bg-[#e8f5e9] text-[#0e7c5a]">Approved</Badge>
                      </div>
                      <p className="text-sm text-[#2d4a3e]">{review.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-[#4a7a5e] text-center py-8">No approved reviews yet</p>
            )}
          </TabsContent>

          <TabsContent value="hours">
            <h2 className="font-serif text-xl font-semibold text-[#1a3a2a] mb-6">Volunteer Hours</h2>
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Volunteer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Logged</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hoursLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => (<TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>))}</TableRow>
                      ))
                    ) : volunteerHours && volunteerHours.length > 0 ? (
                      volunteerHours.map((h) => (
                        <TableRow key={h.id} data-testid={`row-hours-${h.id}`}>
                          <TableCell className="font-medium">{h.volunteerName}</TableCell>
                          <TableCell>{h.volunteerEmail}</TableCell>
                          <TableCell>{h.hours}</TableCell>
                          <TableCell className="max-w-xs truncate">{h.notes || "—"}</TableCell>
                          <TableCell>{new Date(h.loggedAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {h.approved ? (
                              <Badge className="bg-[#e8f5e9] text-[#0e7c5a]">Approved</Badge>
                            ) : (
                              <Button size="sm" className="bg-[#0e7c5a] text-white" onClick={() => approveHoursMutation.mutate(h.id)} disabled={approveHoursMutation.isPending} data-testid={`button-approve-hours-${h.id}`}>
                                Approve
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-[#4a7a5e]">No volunteer hours logged yet</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="sponsorships">
            <h2 className="font-serif text-xl font-semibold text-[#1a3a2a] mb-6">Sponsorship Applications</h2>
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sponsor</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sponsorshipsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>{Array.from({ length: 7 }).map((_, j) => (<TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>))}</TableRow>
                      ))
                    ) : sponsorships && sponsorships.length > 0 ? (
                      sponsorships.map((s) => (
                        <TableRow key={s.id} data-testid={`row-sponsorship-${s.id}`}>
                          <TableCell className="font-medium">{s.sponsorName}</TableCell>
                          <TableCell>{s.sponsorOrg || "—"}</TableCell>
                          <TableCell>{s.sponsorEmail}</TableCell>
                          <TableCell className="capitalize">{s.level.replace(/-/g, " ")}</TableCell>
                          <TableCell>${s.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={s.status === "approved" ? "bg-[#e8f5e9] text-[#0e7c5a]" : s.status === "rejected" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"}>
                              {s.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="text-[#0e7c5a]" onClick={() => updateSponsorshipMutation.mutate({ id: s.id, status: "approved" })} data-testid={`button-approve-sponsor-${s.id}`}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-500" onClick={() => updateSponsorshipMutation.mutate({ id: s.id, status: "rejected" })} data-testid={`button-reject-sponsor-${s.id}`}>
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-[#4a7a5e]">No sponsorship applications yet</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <h2 className="font-serif text-xl font-semibold text-[#1a3a2a] mb-6">Waterfront Service Requests</h2>
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Update Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceRequestsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>{Array.from({ length: 7 }).map((_, j) => (<TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>))}</TableRow>
                      ))
                    ) : serviceRequests && serviceRequests.length > 0 ? (
                      serviceRequests.map((r) => (
                        <TableRow key={r.id} data-testid={`row-service-${r.id}`}>
                          <TableCell className="font-medium">{r.customerName}</TableCell>
                          <TableCell>{r.email}</TableCell>
                          <TableCell>{r.phone}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{r.propertyAddress}</TableCell>
                          <TableCell className="capitalize">{r.serviceType.replace(/-/g, " ")}</TableCell>
                          <TableCell>
                            <Badge className={r.status === "completed" ? "bg-[#e8f5e9] text-[#0e7c5a]" : r.status === "scheduled" ? "bg-blue-100 text-blue-700" : r.status === "quoted" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}>
                              {r.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select defaultValue={r.status} onValueChange={(v) => updateServiceRequestMutation.mutate({ id: r.id, status: v })}>
                              <SelectTrigger className="h-8 text-xs w-28" data-testid={`select-service-status-${r.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="quoted">Quoted</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-[#4a7a5e]">No service requests yet</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <h2 className="font-serif text-xl font-semibold text-[#1a3a2a] mb-6">Registered Members</h2>
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email Notifs</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => (<TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>))}</TableRow>
                      ))
                    ) : memberUsers && memberUsers.length > 0 ? (
                      memberUsers.map((u) => (
                        <TableRow key={u.id} data-testid={`row-member-${u.id}`}>
                          <TableCell className="font-medium">{u.name}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>{u.phone || "—"}</TableCell>
                          <TableCell>
                            {u.notifyEmail ? <Badge className="bg-[#e8f5e9] text-[#0e7c5a]">On</Badge> : <Badge variant="outline">Off</Badge>}
                          </TableCell>
                          <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-[#4a7a5e]">No members registered yet</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="map">
            <h2 className="font-serif text-xl font-semibold text-[#1a3a2a] mb-6">Cleanup Map Locations</h2>
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sponsor</TableHead>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Update Status</TableHead>
                      <TableHead>Delete</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locationsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => (<TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>))}</TableRow>
                      ))
                    ) : cleanupLocations && cleanupLocations.length > 0 ? (
                      cleanupLocations.map((loc) => (
                        <TableRow key={loc.id} data-testid={`row-location-${loc.id}`}>
                          <TableCell className="font-medium">{loc.name}</TableCell>
                          <TableCell>
                            <Badge className={
                              loc.status === "cleaned" ? "bg-green-100 text-green-700" :
                              loc.status === "scheduled" ? "bg-blue-100 text-blue-700" :
                              loc.status === "sponsored" ? "bg-amber-100 text-amber-700" :
                              "bg-red-100 text-red-700"
                            }>
                              {loc.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{loc.sponsorName || "—"}</TableCell>
                          <TableCell>{loc.reportedBy || "—"}</TableCell>
                          <TableCell>
                            <Select defaultValue={loc.status} onValueChange={(v) => updateLocationMutation.mutate({ id: loc.id, status: v })}>
                              <SelectTrigger className="h-8 text-xs w-36" data-testid={`select-location-status-${loc.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="needs-cleanup">Needs Cleanup</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="cleaned">Cleaned</SelectItem>
                                <SelectItem value="sponsored">Sponsored</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button size="icon" variant="ghost" onClick={() => deleteLocationMutation.mutate(loc.id)} data-testid={`button-delete-location-${loc.id}`}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-[#4a7a5e]">No locations yet</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <h2 className="font-serif text-xl font-semibold text-[#1a3a2a] mb-6">Homepage Stats</h2>
            <p className="text-[#4a7a5e] mb-6">Update the three impact statistics displayed on the homepage.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {(siteStats || []).map((stat) => {
                const isEditing = editingStats[stat.id] !== undefined;
                const editValues = editingStats[stat.id] || { label: stat.label, value: stat.value };
                return (
                  <Card key={stat.id}>
                    <CardContent className="p-6">
                      {isEditing ? (
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-[#2d4a3e] block mb-1">Value</label>
                            <Input
                              value={editValues.value}
                              onChange={(e) => setEditingStats({ ...editingStats, [stat.id]: { ...editValues, value: e.target.value } })}
                              data-testid={`input-stat-value-${stat.id}`}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-[#2d4a3e] block mb-1">Label</label>
                            <Input
                              value={editValues.label}
                              onChange={(e) => setEditingStats({ ...editingStats, [stat.id]: { ...editValues, label: e.target.value } })}
                              data-testid={`input-stat-label-${stat.id}`}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-[#0e7c5a] text-white"
                              onClick={() => updateStatMutation.mutate({ id: stat.id, data: editValues })}
                              disabled={updateStatMutation.isPending}
                              data-testid={`button-save-stat-${stat.id}`}
                            >
                              {updateStatMutation.isPending ? "Saving..." : "Save"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const next = { ...editingStats };
                                delete next[stat.id];
                                setEditingStats(next);
                              }}
                              data-testid={`button-cancel-stat-${stat.id}`}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="font-serif text-3xl font-bold text-[#1a3a2a] mb-1" data-testid={`text-stat-value-${stat.id}`}>
                            {stat.value}
                          </div>
                          <div className="text-[#4a7a5e] font-medium mb-4" data-testid={`text-stat-label-${stat.id}`}>
                            {stat.label}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#0e7c5a] text-[#0e7c5a]"
                            onClick={() => setEditingStats({ ...editingStats, [stat.id]: { label: stat.label, value: stat.value } })}
                            data-testid={`button-edit-stat-${stat.id}`}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
