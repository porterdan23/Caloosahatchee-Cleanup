import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, Mail, Phone, Lock, Bell, LogOut, Settings } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const profileSchema = z.object({
  name: z.string().min(2, "Name required"),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Required"),
  newPassword: z.string().min(8, "Must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type MemberUser = {
  id: number;
  email: string;
  name: string;
  phone?: string | null;
  createdAt: string;
  notifyEmail: boolean;
  notifyVolunteerAlerts: boolean;
  notifyEventReminders: boolean;
};

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const loginMutation = useMutation({
    mutationFn: (data: z.infer<typeof loginSchema>) => apiRequest("POST", "/api/auth/login", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Welcome back!" });
    },
    onError: (e: any) => toast({ title: "Login failed", description: e.message, variant: "destructive" }),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(v => loginMutation.mutate(v))} className="space-y-4">
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="your@email.com" {...field} data-testid="input-login-email" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input type="password" placeholder="••••••••" {...field} data-testid="input-login-password" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" className="w-full bg-[#0e7c5a] text-white" disabled={loginMutation.isPending} data-testid="button-login-submit">
          {loginMutation.isPending ? "Signing in..." : "Sign In"}
        </Button>
        <p className="text-center text-sm text-[#4a6b5e]">
          Don't have an account?{" "}
          <button type="button" onClick={onSwitch} className="text-[#0e7c5a] font-semibold hover:underline" data-testid="link-switch-register">
            Create one
          </button>
        </p>
      </form>
    </Form>
  );
}

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof registerSchema>>({ resolver: zodResolver(registerSchema), defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" } });

  const registerMutation = useMutation({
    mutationFn: (data: z.infer<typeof registerSchema>) => apiRequest("POST", "/api/auth/register", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Account created!", description: "Welcome to Caloosahatchee Cleanup." });
    },
    onError: (e: any) => toast({ title: "Registration failed", description: e.message, variant: "destructive" }),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(v => registerMutation.mutate(v))} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl><Input placeholder="Jane Smith" {...field} data-testid="input-register-name" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl><Input type="email" placeholder="your@email.com" {...field} data-testid="input-register-email" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem>
            <FormLabel>Phone (optional)</FormLabel>
            <FormControl><Input type="tel" placeholder="(239) 555-0100" {...field} data-testid="input-register-phone" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl><Input type="password" placeholder="Min. 8 characters" {...field} data-testid="input-register-password" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
          <FormItem>
            <FormLabel>Confirm Password</FormLabel>
            <FormControl><Input type="password" placeholder="••••••••" {...field} data-testid="input-register-confirm" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" className="w-full bg-[#0e7c5a] text-white" disabled={registerMutation.isPending} data-testid="button-register-submit">
          {registerMutation.isPending ? "Creating account..." : "Create Account"}
        </Button>
        <p className="text-center text-sm text-[#4a6b5e]">
          Already have an account?{" "}
          <button type="button" onClick={onSwitch} className="text-[#0e7c5a] font-semibold hover:underline" data-testid="link-switch-login">
            Sign in
          </button>
        </p>
      </form>
    </Form>
  );
}

function ProfileSection({ user }: { user: MemberUser }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, phone: user.phone || "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const profileMutation = useMutation({
    mutationFn: (data: z.infer<typeof profileSchema>) => apiRequest("PATCH", "/api/auth/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Profile updated!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const passwordMutation = useMutation({
    mutationFn: (data: z.infer<typeof passwordSchema>) => apiRequest("PATCH", "/api/auth/password", data),
    onSuccess: () => {
      toast({ title: "Password updated!" });
      passwordForm.reset();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const notifyMutation = useMutation({
    mutationFn: (data: Partial<MemberUser>) => apiRequest("PATCH", "/api/auth/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Preferences saved" });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Signed out" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#0e7c5a] flex items-center justify-center">
            <span className="text-white font-bold text-lg">{user.name[0].toUpperCase()}</span>
          </div>
          <div>
            <p className="font-semibold text-[#1a3a2a]" data-testid="text-user-name">{user.name}</p>
            <p className="text-sm text-[#4a6b5e]" data-testid="text-user-email">{user.email}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => logoutMutation.mutate()} className="border-red-200 text-red-600" data-testid="button-logout">
          <LogOut className="h-4 w-4 mr-1" /> Sign Out
        </Button>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="w-full">
          <TabsTrigger value="profile" className="flex-1" data-testid="tab-profile"><Settings className="h-4 w-4 mr-1" /> Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1" data-testid="tab-notifications"><Bell className="h-4 w-4 mr-1" /> Notifications</TabsTrigger>
          <TabsTrigger value="security" className="flex-1" data-testid="tab-security"><Lock className="h-4 w-4 mr-1" /> Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4 pt-4">
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(v => profileMutation.mutate(v))} className="space-y-4">
              <FormField control={profileForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input {...field} data-testid="input-profile-name" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={profileForm.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input type="tel" {...field} data-testid="input-profile-phone" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="bg-[#0e7c5a] text-white" disabled={profileMutation.isPending} data-testid="button-save-profile">
                {profileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 pt-4">
          <p className="text-sm text-[#4a6b5e]">Choose how you'd like to hear from us.</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-[#d4e4d9] rounded-lg">
              <div>
                <p className="font-medium text-[#1a3a2a]">Email Notifications</p>
                <p className="text-xs text-[#4a6b5e]">General updates and news</p>
              </div>
              <Switch
                checked={user.notifyEmail}
                onCheckedChange={v => notifyMutation.mutate({ notifyEmail: v })}
                data-testid="switch-notify-email"
              />
            </div>
            <div className="flex items-center justify-between p-3 border border-[#d4e4d9] rounded-lg">
              <div>
                <p className="font-medium text-[#1a3a2a]">Volunteer Alerts</p>
                <p className="text-xs text-[#4a6b5e]">New volunteer opportunities</p>
              </div>
              <Switch
                checked={user.notifyVolunteerAlerts}
                onCheckedChange={v => notifyMutation.mutate({ notifyVolunteerAlerts: v })}
                data-testid="switch-notify-volunteer"
              />
            </div>
            <div className="flex items-center justify-between p-3 border border-[#d4e4d9] rounded-lg">
              <div>
                <p className="font-medium text-[#1a3a2a]">Event Reminders</p>
                <p className="text-xs text-[#4a6b5e]">Reminders before cleanup events</p>
              </div>
              <Switch
                checked={user.notifyEventReminders}
                onCheckedChange={v => notifyMutation.mutate({ notifyEventReminders: v })}
                data-testid="switch-notify-events"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4 pt-4">
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(v => passwordMutation.mutate(v))} className="space-y-4">
              <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl><Input type="password" {...field} data-testid="input-current-password" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl><Input type="password" {...field} data-testid="input-new-password" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl><Input type="password" {...field} data-testid="input-confirm-new-password" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="bg-[#0e7c5a] text-white" disabled={passwordMutation.isPending} data-testid="button-change-password">
                {passwordMutation.isPending ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { data: user, isLoading } = useQuery<MemberUser>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9f4] to-[#e8f5e9] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#0e7c5a] flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1a3a2a]">
            {user ? "My Account" : mode === "login" ? "Sign In" : "Create Account"}
          </h1>
          <p className="text-[#4a6b5e] text-sm mt-1">Caloosahatchee Cleanup Community</p>
        </div>

        <Card className="border-[#d4e4d9] shadow-lg">
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8 text-[#4a6b5e]">Loading...</div>
            ) : user ? (
              <ProfileSection user={user} />
            ) : mode === "login" ? (
              <LoginForm onSwitch={() => setMode("register")} />
            ) : (
              <RegisterForm onSwitch={() => setMode("login")} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
