import { Footer } from "@/components/sections/footer";

/**
 * Blank starter page — a reusable pattern for any new route.
 *
 * SiteHeader is already global (mounted in app/layout.tsx), so every page
 * gets it automatically. Footer is NOT global — it's only composed inside
 * app/page.tsx's landing page today — so any new page needs to render it
 * explicitly, as below.
 *
 * Copy this folder/file to start a real page, e.g.:
 *   app/blank/page.tsx  ->  app/dashboard/page.tsx
 *   app/blank/page.tsx  ->  app/login/page.tsx
 * and replace the content placeholder with the real page content.
 */
export default function BlankPage() {
  return (
    <>
      <div className="container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center sm:py-24">
        <p className="text-sm text-muted-foreground">
          LogIn Now
        </p>
      </div>
      <Footer />
    </>
  );
}
