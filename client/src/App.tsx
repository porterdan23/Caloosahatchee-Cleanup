import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Home from "@/pages/home";
import Volunteer from "@/pages/volunteer";
import Campaigns from "@/pages/campaigns";
import Donate from "@/pages/donate";
import Reviews from "@/pages/reviews";
import Admin from "@/pages/admin";
import Login from "@/pages/login";
import Sponsorship from "@/pages/sponsorship";
import Services from "@/pages/services";
import CleanupMap from "@/pages/cleanup-map";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/campaigns" component={Campaigns} />
      <Route path="/volunteer" component={Volunteer} />
      <Route path="/donate" component={Donate} />
      <Route path="/reviews" component={Reviews} />
      <Route path="/admin" component={Admin} />
      <Route path="/account" component={Login} />
      <Route path="/sponsorship" component={Sponsorship} />
      <Route path="/services" component={Services} />
      <Route path="/map" component={CleanupMap} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
