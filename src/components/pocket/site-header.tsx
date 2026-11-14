import { Link, useRouterState } from "@tanstack/react-router";
import {
  Check,
  Compass,
  Database,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  LayoutDashboard,
  Heart,
  Route,
  Library,
  Lightbulb,
  MessageSquare,
  Settings,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  { to: "/data", label: "Data workspace" },
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
          <span>Evidence provenance · Local</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 rounded-2xl border-2 bg-paper p-4 text-sm" align="end">
        <p className="font-display text-base font-semibold">Where this data comes from</p>
        <p className="mt-2 font-semibold text-lavender-strong">
          Synthetic demonstration evidence; not findings about a real product.
        </p>
        <ul className="mt-3 space-y-1.5 tabular text-muted-foreground">
          <li>
            <span className="font-semibold text-foreground">{seeded}</span> synthetic seed records
            (fictional IDs, no real sources)
          </li>
          <li>
            <span className="font-semibold text-foreground">{collected}</span> collected or imported
            records in this browser
          </li>
        </ul>
        <p className="mt-3 rounded-xl bg-butter px-3 py-2 text-xs font-semibold text-butter-strong">
          {storageNotice}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Records stay in this browser. The Data workspace offers optional server-side Gemini
          analysis. AI suggestions require your review.
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
                    trail[s.id]
                      ? "bg-sage-strong text-navy-foreground"
                      : "bg-muted text-muted-foreground",
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
          Every number in this demo is calculated from the synthetic records plus any survey answers
          you add.
        </div>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => {
            if (
              window.confirm(
                "Clear your survey answers, tag edits, bookmarks and trail progress in this browser?",
              )
            )
              resetDemo();
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
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("signalscope:sidebar") === "collapsed");
    } catch {
      /* use expanded */
    }
  }, []);
  useEffect(() => {
    document.documentElement.dataset["sidebar"] = collapsed ? "collapsed" : "expanded";
  }, [collapsed]);
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    try {
      localStorage.setItem("signalscope:sidebar", !collapsed ? "collapsed" : "expanded");
    } catch {
      /* visit only */
    }
  };
  const navIcons = [LayoutDashboard, Heart, Route, Library, Lightbulb, MessageSquare, Settings];
  const [trailOpen, setTrailOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const links = NAV.map((n, i) => (
    <Link
      key={n.to}
      to={n.to}
      title={n.label}
      aria-label={n.label}
      aria-current={
        (n.to === "/" ? pathname === "/" : pathname.startsWith(n.to)) ? "page" : undefined
      }
    >
      {(() => {
        const Icon = navIcons[i]!;
        return <Icon size={18} aria-hidden />;
      })()}
      <span className="nav-label">{n.label}</span>
    </Link>
  ));
  return (
    <>
      <aside className="workspace-sidebar">
        <Button
          variant="ghost"
          size="icon"
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
        <Link to="/" className="flex items-center gap-3">
          <PocketPal className="h-9 w-9" />
          <span className="brand-name">SignalScope</span>
        </Link>
        <div>
          <span className="text-[10px] uppercase tracking-[.18em] text-slate-400">
            Research workspace
          </span>
          <nav className="mt-4" aria-label="Main">
            {links}
          </nav>
        </div>
        <div className="mt-auto">
          <small>
            Customer evidence.
            <br />
            Clearer decisions.
          </small>
          <div className="mt-4 border-t border-slate-600 pt-4">
            <small>
              Research prototype
              <br />
              Local storage · no account required
            </small>
          </div>
        </div>
      </aside>
      <header className="workspace-topbar">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Consumer intelligence
          </p>
          <p className="text-sm font-semibold">
            {NAV.find((n) => n.to === pathname)?.label ?? "Workspace"}
          </p>
        </div>
        <div>
          <Select value={product.id} onValueChange={setProductId}>
            <SelectTrigger className="h-9 w-52 bg-paper" aria-label="Research product">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.shortName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ProvenanceBadge />
          <Button variant="outline" size="sm" onClick={() => setTrailOpen(true)}>
            <Compass />
            Demo guide
          </Button>
        </div>
      </header>
      <nav className="workspace-mobile-nav" aria-label="Mobile navigation">
        {links}
      </nav>
      <DemoTrail open={trailOpen} onOpenChange={setTrailOpen} />
    </>
  );
}
