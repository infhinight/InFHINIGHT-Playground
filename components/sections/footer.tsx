import Link from "next/link";
import { Github, Linkedin, Twitter } from "lucide-react";
import { head } from "framer-motion/client";

interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

const COLUMNS: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "#" },
      { label: "Terms of service", href: "#" },
      { label: "Cookie policy", href: "#" },
    ],
  },
];

const SOCIAL_LINKS = [
  { label: "Twitter", href: "#", icon: Twitter },
  { label: "LinkedIn", href: "#", icon: Linkedin },
  { label: "GitHub", href: "#", icon: Github },
];


export function Footer() {
  return (
    <footer id="footer" className="border-t border-border">
      <div className="container py-14 sm:py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Logo + tagline */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                I
              </span>
              InFHINIGHT
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              AI-drafted client updates that read like you spent an hour on
              them.
            </p>

            <div className="mt-5 flex items-center gap-3">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-semibold text-foreground">
                {column.title}
              </p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
          &copy;1999 - {new Date().getFullYear()} InFHINIGHT. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
