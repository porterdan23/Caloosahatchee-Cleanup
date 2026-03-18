import { Link } from "wouter";
import { Phone, Mail, MapPin } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import logoImg from "@assets/CA3CB632-FA3F-43F7-8D07-6E1923130FB9_1771895514008.jpeg";

export default function Footer() {
  return (
    <footer className="bg-[#1a3a2a] text-white" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <img src={logoImg} alt="Caloosahatchee Cleanup" className="h-12 w-auto rounded mb-4" />
            <p className="text-[#a8c8b8] text-sm leading-relaxed">
              Protecting and restoring the waterways of Southwest Florida through organized cleanup efforts and community involvement.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold mb-4">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Link href="/campaigns" className="text-[#a8c8b8] hover:text-white transition-colors text-sm" data-testid="link-footer-campaigns">
                Campaigns
              </Link>
              <Link href="/volunteer" className="text-[#a8c8b8] hover:text-white transition-colors text-sm" data-testid="link-footer-volunteer">
                Volunteer
              </Link>
              <Link href="/donate" className="text-[#a8c8b8] hover:text-white transition-colors text-sm" data-testid="link-footer-donate">
                Donate
              </Link>
              <Link href="/reviews" className="text-[#a8c8b8] hover:text-white transition-colors text-sm" data-testid="link-footer-reviews">
                Reviews
              </Link>
              <Link href="/admin" className="text-[#a8c8b8] hover:text-white transition-colors text-sm" data-testid="link-footer-admin">
                Admin
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold mb-4">Contact Us</h3>
            <div className="flex flex-col gap-3">
              <a href="tel:239-464-0032" className="flex items-center gap-2 text-[#a8c8b8] hover:text-white transition-colors text-sm" data-testid="link-phone">
                <Phone className="h-4 w-4 shrink-0" />
                239-464-0032
              </a>
              <a href="mailto:info.caloosahatcheecleanup@gmail.com" className="flex items-center gap-2 text-[#a8c8b8] hover:text-white transition-colors text-sm" data-testid="link-email">
                <Mail className="h-4 w-4 shrink-0" />
                info.caloosahatcheecleanup@gmail.com
              </a>
              <div className="flex items-center gap-2 text-[#a8c8b8] text-sm">
                <MapPin className="h-4 w-4 shrink-0" />
                Southwest Florida
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <a href="https://www.instagram.com/caloosahatchee_cleanup/" target="_blank" rel="noopener noreferrer" className="text-[#a8c8b8] hover:text-white transition-colors" data-testid="link-instagram">
                <SiInstagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#2d5a3e] mt-10 pt-6 text-center">
          <p className="text-[#7aab8e] text-sm">
            &copy; {new Date().getFullYear()} Caloosahatchee Cleanup. All rights reserved. A non-profit organization.
          </p>
        </div>
      </div>
    </footer>
  );
}
