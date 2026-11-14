import { Link, useRouterState } from "@tanstack/react-router";
import { Check, Compass, Database, Menu, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TRAIL_STEPS, useDemo } from "@/lib/demo-store";
import { cn } from "@/lib/utils";
import { PocketPal } from "./pocket-pal";

export const NAV = [
  { to: "/", label: "Overview" },
  { to: "/desires", label: "Customer desires" },
  { to: "/journey", label: "Journey & coverage" },
  { to: "/evidence", label: "Evidence library" },
  { to: "/opportunities", label: "Opportunities" },
  { to: "/feedback", label: "Collect feedback" },
] as const;

function ProvenanceBadge() {
  const { storageNotice, records } = useDemo();
  const seeded = records.filter((r) => r.origin === "synthetic-seed").length;
  const collected = records.filter((r) => r.origin === "collected").length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-dashed border-lavender-strong/40 bg-lavender px-3 py-1.5 text-xs font-semibold text-lavender-strong transition hover:border-lavender-strong"
        >
          <Database className="size-3.5" aria-hidden />
          <span>Synthetic data · Local demo</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 rounded-2xl border-2 bg-paper p-4 text-sm" align="end">
        <p className="font-display text-base font-semibold">Where this data comes from</p>
        <p className="mt-2 font-semibold text-lavender-strong">
          Synthetic demonstration evidence—not findings about a real product.
        </p>
        <ul className="mt-3 space-y-1.5 tabular text-muted-foreground">
          <li>
            <span className="font-semibold text-foreground">{seeded}</span> synthetic seed records (fictional IDs, no real sources)
          </li>
          <li>
            <span className="font-semibold text-foreground">{collected}</span> survey responses collected in this browser
          </li>
        </ul>
        <p className="mt-3 rounded-xl bg-butter px-3 py-2 text-xs font-semibold text-butter-strong">{storageNotice}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          No backend is connected, so responses from other devices are not shared here. Tags are pre-coded demo tags — no live analysis runs.
        </p>
      </PopoverContent>
    </Popover>
  );
}

function DemoTrail({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { trail, resetDemo } = useDemo();
  const done = TRAIL_STEPS.filter((s) => trail[s.id]).length;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md border-l-2 sm:max-w-md">
        <SheetHeader className="text-left">
          <div className="flex items-center gap-3">
            <PocketPal className="h-16 w-16" />
            <div>
              <SheetTitle className="font-display text-2xl">The demo trail</SheetTitle>
              <SheetDescription>
                No sign-in needed. {done} of {TRAIL_STEPS.length} steps visited.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <ol className="mt-6 space-y-2.5">
          {TRAIL_STEPS.map((s, i) => (
            <li key={s.id}>
              <Link
                to={s.to}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border-2 px-4 py-3 transition hover:border-primary hover:bg-primary-soft/40",
                  trail[s.id] ? "border-sage-strong/30 bg-sage/50" : "border-border bg-paper",
                )}
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full font-display font-semibold",
                    trail[s.id] ? "bg-sage-strong text-navy-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {trail[s.id] ? <Check className="size-4" aria-label="Visited" /> : i + 1}
                </span>
                <span className="font-medium">{s.label}</span>
              </Link>
            </li>
          ))}
        </ol>
        <div className="mt-6 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
          Every number in this demo is calculated from the synthetic records plus any survey answers you add.
        </div>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => {
            if (window.confirm("Clear your survey answers, tag edits, bookmarks and trail progress in this browser?")) resetDemo();
          }}
        >
          <RotateCcw /> Reset demo in this browser
        </Button>
      </SheetContent>
    </Sheet>
  );
}

export function SiteHeader() {
  const { product, products, setProductId } = useDemo();
  const [trailOpen, setTrailOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b-2 border-dashed border-stitch/60 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="The Missing Pocket — overview">
          <PocketPal className="h-11 w-11 shrink-0" animated={false} />
          <span className="min-w-0">
            <span className="block font-display text-lg font-semibold leading-tight sm:text-xl">The Missing Pocket</span>
            <span className="hidden truncate text-xs text-muted-foreground sm:block">
              Find the needs your reviews leave behind.
            </span>
          </span>
        </Link>
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <Select value={product.id} onValueChange={setProductId}>
            <SelectTrigger className="h-9 w-56 rounded-full border-2 bg-paper" aria-label="Product">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ProvenanceBadge />
          <Button size="sm" onClick={() => setTrailOpen(true)}>
            <Compass /> Explore demo
          </Button>
        </div>
        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <Button size="sm" onClick={() => setTrailOpen(true)}>
            <Compass /> <span className="hidden sm:inline">Explore demo</span><span className="sm:hidden">Demo</span>
          </Button>
          <Button size="icon" variant="outline" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu />
          </Button>
        </div>
      </div>
      <nav aria-label="Main" className="mx-auto hidden max-w-7xl gap-1 px-4 pb-2 sm:px-6 lg:flex">
        {NAV.map((n) => {
          const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-semibold transition",
                active ? "bg-navy text-navy-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-80 border-r-2">
          <SheetHeader className="text-left">
            <SheetTitle className="font-display text-xl">The Missing Pocket</SheetTitle>
            <SheetDescription>Find the needs your reviews leave behind.</SheetDescription>
          </SheetHeader>
          <nav aria-label="Main" className="mt-6 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-2.5 font-semibold hover:bg-muted"
                activeProps={{ className: "bg-navy text-navy-foreground hover:bg-navy" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 space-y-3">
            <Select value={product.id} onValueChange={setProductId}>
              <SelectTrigger className="rounded-full border-2 bg-paper" aria-label="Product">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ProvenanceBadge />
          </div>
        </SheetContent>
      </Sheet>
      <DemoTrail open={trailOpen} onOpenChange={setTrailOpen} />
    </header>
  );
}
