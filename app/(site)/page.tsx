import { ThemeToggle } from "@/components/hex/theme-toggle";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-xl space-y-8 border border-border bg-surface p-8">
        <header className="flex items-center justify-between border-b border-border pb-6">
          <div className="space-y-1">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {siteConfig.tagline}
            </p>
            <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
              {siteConfig.name}
            </h1>
          </div>
          <ThemeToggle />
        </header>

        <section className="space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {siteConfig.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button variant="default">Primary Action</Button>
            <Button variant="outline">Secondary Action</Button>
          </div>
        </section>

        <footer className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
          <span className="font-mono">PHASE 0: FOUNDATION</span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 bg-success" />
            <span className="font-mono">TOKENS READY</span>
          </span>
        </footer>
      </div>
    </main>
  );
}
