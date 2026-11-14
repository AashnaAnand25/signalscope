import { useId, type ReactNode } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { allDesireStats, coOccurrence } from "@/lib/metrics";
import { DESIRE_META, SOURCE_LABEL } from "@/lib/labels";
import { SOURCE_TYPES, type EvidenceRecord, type DesireId } from "@/lib/types";
const CHART_HELP: Record<string, string> = {
  "Demand signals":
    "Which needs come up most? A 9 means 9 records mention that need. 28% means 9 out of 32 records. One record can mention several needs, so percentages may add up to more than 100. This is not a share of all customers.",
  "Source mix":
    "Where did the evidence come from? Each slice counts records from one source. A bigger slice means more records, not better evidence or more unique people.",
  "Evidence over time":
    "When were these records written? Taller points mean more records dated in that month. This does not measure sales, demand, or satisfaction. Records without dates are excluded.",
  "Needs that travel together":
    "A cell showing 3 means three records mention both needs. This does not mean one causes the other or that customers would trade one for the other.",
  "Fulfillment gaps":
    "2 / 5 means two of five records with a clear assessment report an unmet need. Unknown and conflicting assessments are excluded. 100% based on one record is a weak signal, not proof of widespread dissatisfaction.",
};
export function ChartPanel({
  title,
  meta,
  children,
  className = "",
}: {
  title: string;
  meta: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`chart-panel ${className}`}>
      <header>
        <h2>{title}</h2>
        <span>{meta}</span>
      </header>
      {CHART_HELP[title] && (
        <details className="metric-help">
          <summary>What does this mean?</summary>
          <p>{CHART_HELP[title]}</p>
        </details>
      )}
      {children}
    </section>
  );
}
export function NeedsChart({
  records,
  onSelect,
}: {
  records: EvidenceRecord[];
  onSelect: (desire: DesireId) => void;
}) {
  const stats = allDesireStats(records).sort((a, b) => b.mentions - a.mentions);
  const max = Math.max(1, ...stats.map((s) => s.mentions));
  return (
    <ChartPanel title="Demand signals" meta={`${records.length} records`}>
      <div className="need-bars">
        {stats.map((s) => (
          <button
            type="button"
            key={s.desire}
            aria-label={`Explore ${DESIRE_META[s.desire].label} evidence`}
            onClick={() => onSelect(s.desire)}
          >
            <span className="bar-name">{DESIRE_META[s.desire].label}</span>
            <span className="bar-track">
              <span style={{ width: `${(s.mentions / max) * 100}%` }} />
            </span>
            <strong>{s.mentions}</strong>
            <small>{records.length ? Math.round((s.mentions / records.length) * 100) : 0}%</small>
          </button>
        ))}
      </div>
      <p className="chart-note">Mentions / filtered records. Categories overlap.</p>
    </ChartPanel>
  );
}
const colors = ["#087C70", "#5965D9", "#B36518", "#B14563", "#54677D"];
export function SourceChart({ records }: { records: EvidenceRecord[] }) {
  const parts = SOURCE_TYPES.map((source, i) => ({
    source,
    count: records.filter((r) => r.sourceType === source).length,
    color: colors[i]!,
  })).filter((s) => s.count > 0);
  let offset = 0;
  return (
    <ChartPanel title="Source mix" meta="Records by source">
      <div className="source-chart">
        <svg viewBox="0 0 160 160" role="img" aria-label={`Source mix, ${records.length} records`}>
          <circle cx="80" cy="80" r="61" fill="none" stroke="var(--border)" strokeWidth="18" />
          {parts.map((p) => {
            const amount = (p.count / Math.max(1, records.length)) * 100;
            const start = offset;
            offset += amount;
            return (
              <circle
                key={p.source}
                cx="80"
                cy="80"
                r="61"
                fill="none"
                stroke={p.color}
                strokeWidth="18"
                pathLength="100"
                strokeDasharray={`${amount} ${100 - amount}`}
                strokeDashoffset={-start}
                transform="rotate(-90 80 80)"
              />
            );
          })}
          <text x="80" y="78" textAnchor="middle" className="donut-value">
            {records.length}
          </text>
          <text x="80" y="99" textAnchor="middle" className="donut-label">
            records
          </text>
        </svg>
        <ul>
          {parts.map((p) => (
            <li key={p.source}>
              <span className="legend-dot" style={{ background: p.color }} />
              <span>{SOURCE_LABEL[p.source]}</span>
              <strong>{p.count}</strong>
            </li>
          ))}
        </ul>
      </div>
      {parts.length === 0 && <p className="chart-note">No sources in this filter.</p>}
    </ChartPanel>
  );
}
export function TrendChart({ records }: { records: EvidenceRecord[] }) {
  const id = useId().replaceAll(":", "");
  const byMonth = new Map<string, number>();
  for (const r of records)
    if (r.date) byMonth.set(r.date.slice(0, 7), (byMonth.get(r.date.slice(0, 7)) ?? 0) + 1);
  const entries = [...byMonth].sort(([a], [b]) => a.localeCompare(b));
  const data = entries.map(([month, count]) => ({ month, count }));
  const undated = records.filter((r) => !r.date).length;
  return (
    <ChartPanel
      title="Evidence over time"
      meta={`${records.length - undated} dated · ${undated} undated`}
    >
      <div className="trend-chart">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 15, right: 10, left: -24, bottom: 0 }}
              accessibilityLayer
            >
              <defs>
                <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--paper)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: "var(--foreground)",
                }}
              />
              <Area
                dataKey="count"
                name="Records"
                type="linear"
                stroke="var(--primary)"
                fill={`url(#${id})`}
                strokeWidth={2.5}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="chart-note">No dated records.</p>
        )}
      </div>
      <details className="chart-table">
        <summary>View data table</summary>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Records</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.month}>
                <td>{d.month}</td>
                <td>{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </ChartPanel>
  );
}
export function CoOccurrenceChart({ records }: { records: EvidenceRecord[] }) {
  const top = allDesireStats(records)
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 5);
  const pairs = coOccurrence(records);
  const get = (a: DesireId, b: DesireId) =>
    a === b
      ? records.filter((r) => r.codings.some((c) => c.desire === a)).length
      : (pairs.find((p) => (p.a === a && p.b === b) || (p.a === b && p.b === a))?.count ?? 0);
  const max = Math.max(1, ...pairs.map((p) => p.count));
  return (
    <ChartPanel title="Needs that travel together" meta="Same-record co-mentions">
      <div className="matrix-scroll">
        <table className="co-matrix">
          <thead>
            <tr>
              <th scope="col">Need</th>
              {top.map((t, i) => (
                <th scope="col" key={t.desire} title={DESIRE_META[t.desire].label}>
                  {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {top.map((a, i) => (
              <tr key={a.desire}>
                <th scope="row">
                  {i + 1}. {DESIRE_META[a.desire].label}
                </th>
                {top.map((b) => (
                  <td key={b.desire}>
                    <span
                      title={`${DESIRE_META[a.desire].label} and ${DESIRE_META[b.desire].label}`}
                      style={
                        a.desire === b.desire
                          ? {}
                          : {
                              background: `color-mix(in srgb, var(--primary) ${8 + (get(a.desire, b.desire) / max) * 18}%, var(--paper))`,
                            }
                      }
                    >
                      {a.desire === b.desire ? "N/A" : get(a.desire, b.desire)}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="chart-note">Co-mentions show association, not a trade-off or cause.</p>
    </ChartPanel>
  );
}
