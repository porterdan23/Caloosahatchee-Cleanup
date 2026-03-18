import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Waves, MapPin, Calendar, RefreshCw, CheckCircle2, Phone, Mail } from "lucide-react";

const formSchema = z.object({
  customerName: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Phone number required"),
  propertyAddress: z.string().min(5, "Property address required"),
  serviceType: z.string().min(1, "Please select a service type"),
  notes: z.string().optional(),
});

const SERVICE_TYPES = [
  { value: "one-time", label: "One-Time Cleanup", description: "A single thorough seawall & shoreline cleanup", icon: MapPin },
  { value: "annual", label: "Annual Cleanup", description: "Scheduled once per year for ongoing maintenance", icon: Calendar },
  { value: "quarterly", label: "Quarterly Service", description: "Four cleanups per year, once every 3 months", icon: RefreshCw },
  { value: "custom", label: "Custom Schedule", description: "Work with us to create a personalized plan", icon: Waves },
];

export default function Services() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { customerName: "", email: "", phone: "", propertyAddress: "", serviceType: "", notes: "" },
  });

  const submitMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) =>
      apiRequest("POST", "/api/service-requests", {
        ...data,
        notes: data.notes || null,
      }),
    onSuccess: () => {
      setSubmitted(true);
      toast({ title: "Request submitted!", description: "We'll contact you within 2 business days." });
    },
    onError: (e: any) => toast({ title: "Submission failed", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f9f4] to-white">
      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-r from-[#0e4d7a] to-[#0e7c5a] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Waves className="h-12 w-12 mx-auto mb-4 text-[#7dd8b5]" />
          <h1 className="text-4xl font-bold mb-4">Waterfront Cleanup Services</h1>
          <p className="text-xl text-[#b8e0cc] max-w-2xl mx-auto">
            Professional seawall and shoreline cleaning for waterfront homeowners and businesses
            in Southwest Florida.
          </p>
        </div>
      </section>

      {/* Service Types */}
      <section className="py-12 px-4 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-[#1a3a2a] mb-2">Our Services</h2>
        <p className="text-center text-[#4a6b5e] mb-8">Choose the service plan that works best for you</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {SERVICE_TYPES.map(st => {
            const Icon = st.icon;
            return (
              <div key={st.value} className="border border-[#d4e4d9] rounded-xl p-5 bg-white hover:shadow-md transition-shadow" data-testid={`card-service-${st.value}`}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#e8f5e9] flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-[#0e7c5a]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1a3a2a] mb-1">{st.label}</h3>
                    <p className="text-sm text-[#4a6b5e]">{st.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* What We Clean */}
        <div className="bg-[#f0f9f4] rounded-2xl p-8 mb-12">
          <h2 className="text-xl font-bold text-[#1a3a2a] mb-4">What We Clean</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Seawall faces and caps",
              "Dock pilings and decking",
              "Shoreline debris removal",
              "Invasive aquatic vegetation",
              "Litter and marine debris",
              "Algae and organic buildup",
              "Boat ramp areas",
              "Riparian buffer zones",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-[#2d4a3e]">
                <CheckCircle2 className="h-4 w-4 text-[#0e7c5a] shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Note */}
        <div className="bg-[#1a3a2a] text-white rounded-2xl p-6 mb-12 text-center">
          <h3 className="text-lg font-semibold mb-2">Custom Pricing</h3>
          <p className="text-[#b8e0cc] text-sm max-w-xl mx-auto">
            Pricing varies based on property size, waterfront footage, debris volume, and selected
            service frequency. Submit a request below and we'll provide a free quote tailored to
            your property.
          </p>
        </div>
      </section>

      {/* Request Form */}
      <section className="px-4 pb-16 max-w-2xl mx-auto">
        {submitted ? (
          <Card className="border-[#d4e4d9] text-center p-8">
            <CheckCircle2 className="h-16 w-16 text-[#0e7c5a] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#1a3a2a] mb-2">Request Received!</h2>
            <p className="text-[#4a6b5e] mb-4">
              Thank you for reaching out. Our team will contact you within 2 business days to discuss
              your property and provide a free quote.
            </p>
            <div className="flex justify-center gap-4 text-sm text-[#4a6b5e]">
              <a href="tel:239-464-0032" className="flex items-center gap-1 hover:text-[#0e7c5a]">
                <Phone className="h-4 w-4" /> 239-464-0032
              </a>
              <a href="mailto:info.caloosahatcheecleanup@gmail.com" className="flex items-center gap-1 hover:text-[#0e7c5a]">
                <Mail className="h-4 w-4" /> Email Us
              </a>
            </div>
            <Button className="mt-6 bg-[#0e7c5a] text-white" onClick={() => { setSubmitted(false); form.reset(); }} data-testid="button-request-again">
              Submit Another Request
            </Button>
          </Card>
        ) : (
          <Card className="border-[#d4e4d9] shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#1a3a2a]">Request a Quote</CardTitle>
              <p className="text-sm text-[#4a6b5e]">Tell us about your property and we'll get back to you with a free estimate.</p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(v => submitMutation.mutate(v))} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="customerName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl><Input placeholder="Jane Smith" {...field} data-testid="input-service-name" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone *</FormLabel>
                        <FormControl><Input type="tel" placeholder="(239) 555-0100" {...field} data-testid="input-service-phone" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl><Input type="email" placeholder="your@email.com" {...field} data-testid="input-service-email" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="propertyAddress" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Address *</FormLabel>
                      <FormControl><Input placeholder="123 River Dr, Fort Myers, FL 33901" {...field} data-testid="input-service-address" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="serviceType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-service-type">
                            <SelectValue placeholder="Select service type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SERVICE_TYPES.map(st => (
                            <SelectItem key={st.value} value={st.value}>{st.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your property, waterfront footage, specific concerns, or any other details that would help us provide an accurate quote..."
                          rows={4}
                          {...field}
                          data-testid="input-service-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full bg-[#0e7c5a] text-white" disabled={submitMutation.isPending} data-testid="button-service-submit">
                    {submitMutation.isPending ? "Submitting..." : "Request a Free Quote"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
