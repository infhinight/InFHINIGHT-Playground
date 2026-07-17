"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Playground", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu automatically if the viewport grows past the
  // mobile breakpoint (e.g. rotating a device or resizing a browser window).
  React.useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-colors",
        scrolled
          ? "border-b border-border/80 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
          : "border-b border-transparent bg-background/0"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo placeholder */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
          onClick={() => setMobileOpen(false)}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            I
          </span>
          <span className="text-base">InFHINIGHT</span>
        </Link>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav><br /><br />


          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link href="./login">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="#">Sign up</Link>
          </Button>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-b border-border md:hidden"
          >
            <nav className="container flex flex-col gap-1 py-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-2 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
                <Button variant="outline" asChild>
                  <Link href="#" onClick={() => setMobileOpen(false)}>
                    Log in
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="#" onClick={() => setMobileOpen(false)}>
                    Sign up
                  </Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
