import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Waves } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 bg-[#f7faf8]">
      <div className="text-center max-w-md">
        <Waves className="h-16 w-16 text-[#0e7c5a]/30 mx-auto mb-6" />
        <h1 className="font-serif text-4xl font-bold text-[#1a3a2a] mb-3">404</h1>
        <p className="text-[#4a7a5e] text-lg mb-6">This page has drifted out to sea.</p>
        <Link href="/">
          <Button className="bg-[#0e7c5a] text-white" data-testid="button-go-home">
            Back to Shore
          </Button>
        </Link>
      </div>
    </div>
  );
}
