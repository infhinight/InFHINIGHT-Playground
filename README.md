# UpdateDraft — Landing Page

Scaffolding for the UpdateDraft marketing site. No section copy/UI has been
built yet — this is the layout shell, sticky header, dark mode, and empty
section placeholders ready to be filled in.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- shadcn/ui primitives (`components/ui`)
- Framer Motion (see `components/motion/fade-in.tsx`)
- `next/font` (Inter)
- `next-themes` for light/dark mode

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Structure

```
app/
  layout.tsx        Root layout: font, ThemeProvider, SiteHeader
  page.tsx           Landing page — composes section components
  globals.css         Tailwind layers + shadcn CSS variables (light/dark)
components/
  layout/
    site-header.tsx  Sticky header: logo, nav, theme toggle, mobile menu, CTA
  sections/          One file per landing page section (currently empty shells)
    hero.tsx
    problem.tsx
    features.tsx
    how-it-works.tsx
    pricing.tsx
    testimonials.tsx
    faq.tsx
    cta.tsx
    footer.tsx
    _section-placeholder.tsx   Shared stub UI, delete as sections get built
  motion/
    fade-in.tsx      Reusable scroll-reveal wrapper (Framer Motion)
  ui/
    button.tsx       shadcn/ui Button primitive
  theme-provider.tsx
  theme-toggle.tsx
```

## Adding shadcn/ui components

`components.json` is already configured. Once you have the shadcn CLI
available (or copy components manually), new primitives should land in
`components/ui/`.

## Building out a section

Each section in `components/sections/` currently renders a
`SectionPlaceholder`. Replace the placeholder with real content and wrap
it in `<FadeIn>` (from `components/motion/fade-in.tsx`) for a scroll-in
animation, e.g.:

```tsx
import { FadeIn } from "@/components/motion/fade-in";

export function Hero() {
  return (
    <section id="hero" className="container py-20 sm:py-28">
      <FadeIn>{/* real hero content */}</FadeIn>
    </section>
  );
}
```

## Deploying to Vercel

Push to a Git repo and import it in Vercel — no configuration needed,
Vercel auto-detects Next.js. Or deploy directly:

```bash
npx vercel
```
