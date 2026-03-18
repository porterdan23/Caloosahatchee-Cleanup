import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MapPin, AlertTriangle, CheckCircle2, Calendar, Star, Flag } from "lucide-react";
import type { CleanupLocation } from "@shared/schema";

const STATUS_CONFIG = {
  "cleaned": { label: "Cleaned", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2, mapColor: "#16a34a" },
  "needs-cleanup": { label: "Needs Cleanup", color: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle, mapColor: "#dc2626" },
  "scheduled": { label: "Scheduled", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Calendar, mapColor: "#2563eb" },
  "sponsored": { label: "Sponsored Area", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Star, mapColor: "#d97706" },
};

const reportSchema = z.object({
  name: z.string().min(2, "Location name required"),
  description: z.string().optional(),
  lat: z.string().min(1, "Latitude required"),
  lng: z.string().min(1, "Longitude required"),
  reportedBy: z.string().optional(),
});

function LeafletMap({ locations, onLocationClick }: { locations: CleanupLocation[]; onLocationClick: (loc: CleanupLocation) => void }) {
  useEffect(() => {
    let map: any;
    let L: any;

    const initMap = async () => {
      L = (await import("leaflet")).default;

      // Fix default icon URLs
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const el = document.getElementById("cleanup-map");
      if (!el || (el as any)._leaflet_id) return;

      map = L.map("cleanup-map").setView([26.6406, -81.8723], 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      locations.forEach(loc => {
        const cfg = STATUS_CONFIG[loc.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG["needs-cleanup"];
        const icon = L.divIcon({
          html: `<div style="background:${cfg.mapColor};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
          className: "",
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(map);
        marker.on("click", () => onLocationClick(loc));
        marker.bindTooltip(loc.name, { permanent: false });
      });
    };

    initMap();

    return () => {
      if (map) map.remove();
    };
  }, [locations]);

  return <div id="cleanup-map" style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }} />;
}

export default function CleanupMap() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLocation, setSelectedLocation] = useState<CleanupLocation | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  const { data: locations = [] } = useQuery<CleanupLocation[]>({ queryKey: ["/api/cleanup-locations"] });

  const form = useForm<z.infer<typeof reportSchema>>({
    resolver: zodResolver(reportSchema),
    defaultValues: { name: "", description: "", lat: "", lng: "", reportedBy: "" },
  });

  const reportMutation = useMutation({
    mutationFn: (data: z.infer<typeof reportSchema>) =>
      apiRequest("POST", "/api/cleanup-locations", {
        name: data.name,
        description: data.description || null,
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lng),
        status: "needs-cleanup",
        campaignId: null,
        sponsorName: null,
        reportedBy: data.reportedBy || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cleanup-locations"] });
      toast({ title: "Location reported!", description: "Thank you for helping identify areas that need cleanup." });
      setReportOpen(false);
      form.reset();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const counts = {
    cleaned: locations.filter(l => l.status === "cleaned").length,
    "needs-cleanup": locations.filter(l => l.status === "needs-cleanup").length,
    scheduled: locations.filter(l => l.status === "scheduled").length,
    sponsored: locations.filter(l => l.status === "sponsored").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f9f4] to-white">
      {/* Header */}
      <section className="py-12 px-4 bg-gradient-to-r from-[#1a3a2a] to-[#0e7c5a] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <MapPin className="h-10 w-10 mx-auto mb-3 text-[#7dd8b5]" />
          <h1 className="text-3xl font-bold mb-2">Interactive Cleanup Map</h1>
          <p className="text-[#b8e0cc]">
            Explore the Caloosahatchee River watershed — see where we've cleaned, where we're heading next, and areas still needing help.
          </p>
        </div>
      </section>

      {/* Legend & Stats */}
      <section className="py-4 px-4 bg-white border-b border-[#d4e4d9]">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const Icon = cfg.icon;
              return (
                <div key={key} className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${cfg.color}`} data-testid={`legend-${key}`}>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cfg.mapColor }} />
                  {cfg.label}
                  <span className="font-bold ml-0.5">({counts[key as keyof typeof counts]})</span>
                </div>
              );
            })}
          </div>
          <Button
            onClick={() => setReportOpen(true)}
            variant="outline"
            className="border-[#0e7c5a] text-[#0e7c5a]"
            data-testid="button-report-area"
          >
            <Flag className="h-4 w-4 mr-2" /> Report an Area
          </Button>
        </div>
      </section>

      {/* Map */}
      <section className="px-4 py-6 max-w-6xl mx-auto">
        <div style={{ height: "500px" }} className="rounded-xl overflow-hidden border border-[#d4e4d9] shadow-md">
          <LeafletMap locations={locations} onLocationClick={setSelectedLocation} />
        </div>

        {locations.length === 0 && (
          <div className="text-center mt-6 text-[#4a6b5e]">
            <p>No cleanup locations have been added yet. Be the first to report an area!</p>
          </div>
        )}
      </section>

      {/* Location List */}
      {locations.length > 0 && (
        <section className="px-4 pb-12 max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-[#1a3a2a] mb-4">All Locations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map(loc => {
              const cfg = STATUS_CONFIG[loc.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG["needs-cleanup"];
              const Icon = cfg.icon;
              return (
                <div
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc)}
                  className="border border-[#d4e4d9] rounded-xl p-4 bg-white hover:shadow-md cursor-pointer transition-shadow"
                  data-testid={`card-location-${loc.id}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-[#1a3a2a] text-sm">{loc.name}</h3>
                    <Badge className={`text-xs shrink-0 ${cfg.color}`}>{cfg.label}</Badge>
                  </div>
                  {loc.description && <p className="text-xs text-[#4a6b5e] line-clamp-2">{loc.description}</p>}
                  {loc.sponsorName && (
                    <p className="text-xs text-amber-600 mt-1 font-medium">Sponsored by {loc.sponsorName}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Location Detail Dialog */}
      <Dialog open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1a3a2a]">{selectedLocation?.name}</DialogTitle>
          </DialogHeader>
          {selectedLocation && (() => {
            const cfg = STATUS_CONFIG[selectedLocation.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG["needs-cleanup"];
            const Icon = cfg.icon;
            return (
              <div className="space-y-3">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${cfg.color}`}>
                  <Icon className="h-4 w-4" />
                  {cfg.label}
                </div>
                {selectedLocation.description && (
                  <p className="text-[#4a6b5e] text-sm">{selectedLocation.description}</p>
                )}
                {selectedLocation.sponsorName && (
                  <p className="text-sm text-amber-600 font-medium">Sponsored by: {selectedLocation.sponsorName}</p>
                )}
                {selectedLocation.reportedBy && (
                  <p className="text-xs text-[#4a6b5e]">Reported by: {selectedLocation.reportedBy}</p>
                )}
                <p className="text-xs text-[#4a6b5e]">
                  Coordinates: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                </p>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1a3a2a]">Report an Area Needing Cleanup</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(v => reportMutation.mutate(v))} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name *</FormLabel>
                  <FormControl><Input placeholder="e.g., Riverfront Park boat ramp" {...field} data-testid="input-report-name" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Describe the area and type of debris..." rows={3} {...field} data-testid="input-report-description" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="lat" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude *</FormLabel>
                    <FormControl><Input placeholder="26.6406" {...field} data-testid="input-report-lat" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lng" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude *</FormLabel>
                    <FormControl><Input placeholder="-81.8723" {...field} data-testid="input-report-lng" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <p className="text-xs text-[#4a6b5e]">
                Tip: You can get coordinates from Google Maps by right-clicking on a location and selecting "What's here?"
              </p>
              <FormField control={form.control} name="reportedBy" render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name (optional)</FormLabel>
                  <FormControl><Input placeholder="Anonymous" {...field} data-testid="input-report-name-by" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setReportOpen(false)} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1 bg-[#0e7c5a] text-white" disabled={reportMutation.isPending} data-testid="button-report-submit">
                  {reportMutation.isPending ? "Submitting..." : "Report Location"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
