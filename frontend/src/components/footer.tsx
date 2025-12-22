import { Link } from "wouter";
import { Zap, Shield, Headphones, Lock, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">DeepShift</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              India's premier skill-based contest platform. Win cash prizes and goodies by showcasing your talents.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                data-testid="link-twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                data-testid="link-instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                data-testid="link-linkedin"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                data-testid="link-youtube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/signup" className="text-muted-foreground hover:text-foreground transition-colors">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                  Student Login
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-muted-foreground hover:text-foreground transition-colors">
                  Admin Login
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Creator Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contest Types</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/signup" className="text-muted-foreground hover:text-foreground transition-colors">
                  Aptitude Tests
                </a>
              </li>
              <li>
                <a href="/signup" className="text-muted-foreground hover:text-foreground transition-colors">
                  General Knowledge
                </a>
              </li>
              <li>
                <a href="/signup" className="text-muted-foreground hover:text-foreground transition-colors">
                  Coding Contests
                </a>
              </li>
              <li>
                <a href="/signup" className="text-muted-foreground hover:text-foreground transition-colors">
                  Hackathons
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/help-center" className="text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/terms-and-conditions" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/contact-us" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Headphones className="w-4 h-4 text-blue-500" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4 text-purple-500" />
                <span>Encrypted Data</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} DeepShift. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
