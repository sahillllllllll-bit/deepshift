import { useState } from "react";
import { Link } from "wouter";
import { Brain, Menu, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              {/* <Zap className="w-5 h-5 text-primary-foreground" /> */}
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold" data-testid="text-logo">DeepShift</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <a href="#contests" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contests
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#winners" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Winners
            </a>
            <a href="#creators" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              For Creators
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" data-testid="button-login">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button data-testid="button-signup">
                Join Now
              </Button>
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-lg">
          <div className="px-4 py-4 space-y-3">
            <a
              href="#contests"
              className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contests
            </a>
            <a
              href="#how-it-works"
              className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#winners"
              className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Winners
            </a>
            <a
              href="#creators"
              className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              For Creators
            </a>
            <div className="pt-3 border-t border-border/50 space-y-2">
              <Link href="/login">
                <Button variant="outline" className="w-full" data-testid="button-login-mobile">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="w-full" data-testid="button-signup-mobile">
                  Join Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
