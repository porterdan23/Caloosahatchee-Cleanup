import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import logoImg from "@assets/CA3CB632-FA3F-43F7-8D07-6E1923130FB9_1771895514008.jpeg";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/volunteer", label: "Volunteer" },
  { href: "/map", label: "Map" },
  { href: "/sponsorship", label: "Sponsorship" },
  { href: "/services", label: "Services" },
  { href: "/donate", label: "Donate" },
  { href: "/reviews", label: "Reviews" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const { data: user } = useQuery<{ name: string; email: string }>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#d4e4d9]" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          <Link href="/" className="flex items-center gap-3 shrink-0" data-testid="link-home-logo">
            <img src={logoImg} alt="Caloosahatchee Cleanup" className="h-10 w-auto rounded" />
          </Link>

          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    location === link.href
                      ? "text-[#0e7c5a] font-semibold"
                      : "text-[#2d4a3e] hover:text-[#0e7c5a]"
                  }`}
                  data-testid={`link-nav-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <Link href="/account">
              <Button variant="ghost" size="sm" className="text-[#2d4a3e] hover:text-[#0e7c5a]" data-testid="button-nav-account">
                <User className="h-4 w-4 mr-1" />
                {user ? user.name.split(" ")[0] : "Account"}
              </Button>
            </Link>
            <Link href="/donate">
              <Button size="sm" className="bg-[#0e7c5a] text-white" data-testid="button-nav-donate">
                Donate
              </Button>
            </Link>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button size="icon" variant="ghost" data-testid="button-mobile-menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-white">
              <div className="flex flex-col gap-1 mt-8">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                    <span
                      className={`block px-4 py-3 rounded-md text-base font-medium cursor-pointer ${
                        location === link.href
                          ? "bg-[#e8f5e9] text-[#0e7c5a] font-semibold"
                          : "text-[#2d4a3e] hover:bg-[#f0f7f4]"
                      }`}
                      data-testid={`link-mobile-${link.label.toLowerCase()}`}
                    >
                      {link.label}
                    </span>
                  </Link>
                ))}
                <div className="border-t border-[#d4e4d9] pt-4 mt-2 flex flex-col gap-3 px-4">
                  <Link href="/account" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full border-[#0e7c5a] text-[#0e7c5a]" data-testid="button-mobile-account">
                      <User className="h-4 w-4 mr-2" />
                      {user ? user.name.split(" ")[0] : "Account"}
                    </Button>
                  </Link>
                  <Link href="/donate" onClick={() => setOpen(false)}>
                    <Button className="w-full bg-[#0e7c5a] text-white" data-testid="button-mobile-donate">
                      Donate
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
