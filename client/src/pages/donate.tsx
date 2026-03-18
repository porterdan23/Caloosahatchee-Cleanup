import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Heart, Shield, DollarSign, CreditCard } from "lucide-react";
import type { Campaign } from "@shared/schema";

const PRESET_AMOUNTS = [25, 50, 100, 250, 500];

export default function Donate() {
  const { toast } = useToast();
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("general");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");

  const { data: campaigns } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const upcomingCampaigns = campaigns?.filter((c) => c.status === "upcoming") || [];

  const [donationSuccess, setDonationSuccess] = useState(false);

  const donateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/donations/create-checkout", {
        amount: amount * 100,
        campaignId: selectedCampaign !== "general" ? parseInt(selectedCampaign) : null,
        donorName,
        donorEmail,
      });
      return res.json();
    },
    onSuccess: () => {
      setDonationSuccess(true);
      toast({
        title: "Thank you!",
        description: "Your donation has been recorded. Payment processing will be available once Stripe is configured.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Something went wrong",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (donationSuccess) {
    return (
      <div className="min-h-screen bg-[#f7faf8] flex items-center justify-center px-4">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-[#e8f5e9] rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-8 w-8 text-[#0e7c5a]" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#1a3a2a] mb-3" data-testid="text-donation-success">
              Thank You for Your Generosity!
            </h2>
            <p className="text-[#4a7a5e] mb-2">
              Your ${amount} donation has been recorded.
            </p>
            <p className="text-sm text-[#4a7a5e] mb-6">
              Secure payment processing via Stripe will be enabled by the administrator.
            </p>
            <Button onClick={() => setDonationSuccess(false)} className="bg-[#0e7c5a] text-white" data-testid="button-donate-again">
              Make Another Donation
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7faf8]">
      <div className="bg-[#1a3a2a] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl font-bold text-white mb-3" data-testid="text-donate-title">
            Support Our Mission
          </h1>
          <p className="text-[#a8c8b8] text-lg max-w-2xl">
            Your donation directly supports our cleanup efforts and helps protect the Caloosahatchee River.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="font-serif text-2xl font-bold text-[#1a3a2a] mb-6">Make a Donation</h2>

                <div className="space-y-6">
                  <div>
                    <Label className="text-[#2d4a3e] font-medium mb-3 block">Select Amount</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
                      {PRESET_AMOUNTS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setAmount(preset);
                            setCustomAmount("");
                          }}
                          className={`py-3 px-4 rounded-md text-center font-semibold transition-all ${
                            amount === preset && !customAmount
                              ? "bg-[#0e7c5a] text-white"
                              : "bg-white border border-[#d4e4d9] text-[#2d4a3e] hover:border-[#0e7c5a]"
                          }`}
                          data-testid={`button-amount-${preset}`}
                        >
                          ${preset}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4a7a5e]" />
                      <Input
                        type="number"
                        placeholder="Custom amount"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          if (e.target.value) setAmount(parseInt(e.target.value));
                        }}
                        className="pl-8"
                        data-testid="input-custom-amount"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-[#2d4a3e] font-medium mb-2 block">Donate To</Label>
                    <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                      <SelectTrigger data-testid="select-donation-campaign">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Fund</SelectItem>
                        {upcomingCampaigns.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#2d4a3e] font-medium mb-2 block">Name (optional)</Label>
                      <Input
                        placeholder="Your name"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        data-testid="input-donor-name"
                      />
                    </div>
                    <div>
                      <Label className="text-[#2d4a3e] font-medium mb-2 block">Email (optional)</Label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        data-testid="input-donor-email"
                      />
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full bg-[#0e7c5a] text-white text-base"
                    onClick={() => donateMutation.mutate()}
                    disabled={donateMutation.isPending || amount < 1}
                    data-testid="button-donate-submit"
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    {donateMutation.isPending ? "Processing..." : `Donate $${amount}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#e8f5e9] rounded-full flex items-center justify-center">
                    <Heart className="h-5 w-5 text-[#0e7c5a]" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-[#1a3a2a]">Your Impact</h3>
                </div>
                <div className="space-y-3 text-sm text-[#2d4a3e]">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-[#0e7c5a]">$25</span>
                    <span>provides supplies for one volunteer</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-[#0e7c5a]">$50</span>
                    <span>funds trash removal for a cleanup event</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-[#0e7c5a]">$100</span>
                    <span>sponsors one community cleanup day</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-[#0e7c5a]">$250</span>
                    <span>supports a month of waterway monitoring</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-[#0e7c5a]">$500</span>
                    <span>funds a full campaign event</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="h-5 w-5 text-[#0e7c5a]" />
                  <h3 className="font-medium text-[#1a3a2a]">Secure Donations</h3>
                </div>
                <p className="text-sm text-[#4a7a5e]">
                  All donations are processed securely through Stripe. Caloosahatchee Cleanup is a registered non-profit organization.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
