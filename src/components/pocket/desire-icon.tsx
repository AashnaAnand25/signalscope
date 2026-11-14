import {
  BadgeDollarSign,
  Gauge,
  Laptop,
  Leaf,
  Palette,
  Puzzle,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Umbrella,
  type LucideIcon,
} from "lucide-react";
import type { DesireId } from "@/lib/types";

export const DESIRE_ICON: Record<DesireId, LucideIcon> = {
  features: Puzzle,
  price: BadgeDollarSign,
  quality: ShieldCheck,
  speed: Gauge,
  convenience: Sparkles,
  reliability: Umbrella,
  appearance: Palette,
  sustainability: Leaf,
  compatibility: Laptop,
  customization: SlidersHorizontal,
};
