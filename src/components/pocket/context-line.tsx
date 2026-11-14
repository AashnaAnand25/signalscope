import { dateRange } from "@/lib/metrics";
import { formatDate, SOURCE_LABEL } from "@/lib/labels";
import type { EvidenceRecord, SourceType } from "@/lib/types";

/** Plain-language filter & time context shown alongside every set of shares. */
export function contextText(records: EvidenceRecord[], source: string) {
  const r = dateRange(records);
  const collected = records.filter((x) => x.origin === "collected").length;
  const src = source === "all" ? "all sources" : `${SOURCE_LABEL[source as SourceType]} only`;
  const dates = r.from ? `dated ${formatDate(r.from)} – ${formatDate(r.to)}` : "no dated records";
  return `Within ${records.length} evidence records · ${src} · synthetic seed${collected ? ` + ${collected} collected here` : ""} · ${dates}${r.undated ? `, ${r.undated} undated` : ""}`;
}
