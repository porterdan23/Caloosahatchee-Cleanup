import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Star, Quote, CheckCircle, PenLine } from "lucide-react";
import type { Review, Campaign } from "@shared/schema";

const reviewFormSchema = z.object({
  volunteerName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  rating: z.number().min(1).max(5),
  content: z.string().min(10, "Please write at least 10 characters"),
  campaignId: z.number().optional(),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

function StarRating({ rating, onSelect, interactive = false }: { rating: number; onSelect?: (r: number) => void; interactive?: boolean }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onSelect?.(star)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          data-testid={`star-${star}`}
        >
          <Star
            className={`h-5 w-5 ${
              star <= rating ? "fill-[#f9a825] text-[#f9a825]" : "text-[#d4e4d9]"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function Reviews() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews/approved"],
  });

  const { data: campaigns } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      volunteerName: "",
      email: "",
      rating: 5,
      content: "",
      campaignId: undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      const res = await apiRequest("POST", "/api/reviews", data);
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      setShowForm(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/approved"] });
    },
    onError: (error: Error) => {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen bg-[#f7faf8]">
      <div className="bg-[#1a3a2a] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl font-bold text-white mb-3" data-testid="text-reviews-title">
            Volunteer Reviews
          </h1>
          <p className="text-[#a8c8b8] text-lg max-w-2xl">
            Hear from our amazing volunteers about their cleanup experiences.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <h2 className="font-serif text-2xl font-bold text-[#1a3a2a]">What Volunteers Say</h2>
          {!showForm && !submitted && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-[#0e7c5a] text-white"
              data-testid="button-write-review"
            >
              <PenLine className="mr-2 h-4 w-4" />
              Write a Review
            </Button>
          )}
        </div>

        {submitted && (
          <Card className="mb-8">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-10 w-10 text-[#0e7c5a] mx-auto mb-3" />
              <h3 className="font-serif text-xl font-semibold text-[#1a3a2a] mb-2" data-testid="text-review-submitted">
                Review Submitted!
              </h3>
              <p className="text-[#4a7a5e] mb-4">
                Thank you for sharing your experience. Your review will be published after approval.
              </p>
              <Button
                variant="outline"
                onClick={() => setSubmitted(false)}
                className="border-[#0e7c5a] text-[#0e7c5a]"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        )}

        {showForm && (
          <Card className="mb-8">
            <CardContent className="p-6 sm:p-8">
              <h3 className="font-serif text-xl font-semibold text-[#1a3a2a] mb-6">Share Your Experience</h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="volunteerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Jane Doe" {...field} data-testid="input-review-name" />
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
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="jane@email.com" {...field} data-testid="input-review-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {campaigns && campaigns.length > 0 && (
                    <FormField
                      control={form.control}
                      name="campaignId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Campaign (optional)</FormLabel>
                          <Select
                            onValueChange={(v) => field.onChange(v ? parseInt(v) : undefined)}
                            value={field.value?.toString() || ""}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-review-campaign">
                                <SelectValue placeholder="Select a campaign..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {campaigns.map((c) => (
                                <SelectItem key={c.id} value={c.id.toString()}>
                                  {c.title}
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
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating *</FormLabel>
                        <FormControl>
                          <StarRating rating={field.value} onSelect={field.onChange} interactive />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Review *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your experience volunteering with Caloosahatchee Cleanup..."
                            rows={5}
                            {...field}
                            data-testid="textarea-review-content"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 flex-wrap">
                    <Button
                      type="submit"
                      className="bg-[#0e7c5a] text-white"
                      disabled={mutation.isPending}
                      data-testid="button-submit-review"
                    >
                      {mutation.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      className="border-[#d4e4d9]"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reviews && reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <Card key={review.id} data-testid={`card-review-${review.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Quote className="h-8 w-8 text-[#0e7c5a]/20 shrink-0 mt-1" />
                    <div>
                      <StarRating rating={review.rating} />
                      <p className="text-[#2d4a3e] mt-3 leading-relaxed">{review.content}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-[#e8f5e9]">
                    <span className="font-medium text-[#1a3a2a]">{review.volunteerName}</span>
                    <span className="text-sm text-[#4a7a5e]">
                      {new Date(review.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Quote className="h-12 w-12 text-[#a8c8b8] mx-auto mb-4" />
            <h3 className="font-serif text-xl font-semibold text-[#1a3a2a] mb-2">No Reviews Yet</h3>
            <p className="text-[#4a7a5e] mb-6">Be the first to share your volunteer experience!</p>
            {!showForm && (
              <Button onClick={() => setShowForm(true)} className="bg-[#0e7c5a] text-white" data-testid="button-first-review">
                Write the First Review
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
