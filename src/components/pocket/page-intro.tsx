import { HelpCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PocketPal } from "./pocket-pal";

interface Props {
  eyebrow: string;
  title: string;
  description: ReactNode;
  guide?: { title?: string; points: string[] };
  actions?: ReactNode;
}

export function PageIntro({ eyebrow, title, description, guide, actions }: Props) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">{title}</h1>
        <div className="mt-3 text-sm text-muted-foreground">{description}</div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {actions}
        {guide && <HowToRead {...guide} />}
      </div>
    </div>
  );
}

export function HowToRead({
  title = "How to read this",
  points,
}: {
  title?: string;
  points: string[];
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HelpCircle /> How to read this
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-1.5rem)]">
        <DialogHeader className="flex-row items-center gap-3 space-y-0 text-left">
          <PocketPal className="h-14 w-14 shrink-0" mood="curious" />
          <div>
            <DialogTitle className="font-display text-xl">{title}</DialogTitle>
            <DialogDescription>How to interpret this evidence.</DialogDescription>
          </div>
        </DialogHeader>
        <ul className="space-y-2.5">
          {points.map((p) => (
            <li key={p} className="flex gap-2.5 rounded-xl bg-muted/70 px-3 py-2.5 text-sm">
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

export function SyntheticNotice({ className = "" }: { className?: string }) {
  return (
    <p
      className={`inline-flex items-center gap-2 rounded-full border-2 border-dashed border-lavender-strong/40 bg-lavender/70 px-3 py-1 text-xs font-semibold text-lavender-strong ${className}`}
    >
      Synthetic demonstration evidence; not findings about a real product.
    </p>
  );
}
