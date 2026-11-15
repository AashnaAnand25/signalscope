import { Link } from "@tanstack/react-router";
import { useDemo } from "@/lib/demo-store";
import { PUBLIC_CASE_ID, PUBLIC_CASE_SPECS, PUBLIC_CASE_IMAGE_SOURCE } from "@/data/osprey-case";
import { SourceBadge } from "./source-badge";
export function PublicCaseSummary() {
  const { product, records } = useDemo();
  if (product.id !== PUBLIC_CASE_ID) return null;
  const linked = records.filter((r) => r.sourceUrl);
  const urls = [...new Set(linked.map((r) => r.sourceUrl!))];
  const opinions = records.filter((r) => r.tone && ["discussion", "review"].includes(r.sourceType));
  const unmet = records.filter((r) => r.codings.some((c) => c.fulfillment === "unmet"));
  const sourcesFor = (ids: string[]) =>
    [
      ...new Set(
        records
          .filter((r) => ids.includes(r.id))
          .map((r) => r.sourceUrl)
          .filter(Boolean),
      ),
    ] as string[];
  return (
    <section className="public-case-summary" aria-label="Real product case study">
      <div className="public-case-intro">
        <div>
          <span className="section-kicker">Real product / public source snapshot</span>
          <h2>What should Osprey improve next?</h2>
          <p>
            A cited case that follows the same records across every analysis tab. Original comments
            and labeled summaries, checked 15 Nov 2026.
          </p>
        </div>
        <Link to="/evidence">Inspect the source records →</Link>
      </div>
      <div className="public-case-stats">
        <div>
          <strong>{linked.length}</strong>
          <span>source-linked records</span>
        </div>
        <div>
          <strong>{urls.length}</strong>
          <span>public source pages</span>
        </div>
        <div>
          <strong>{unmet.length}</strong>
          <span>records with an unmet need</span>
        </div>
        <div>
          <strong>{product.opportunities.length}</strong>
          <span>testable hypotheses</span>
        </div>
      </div>
      <p className="chart-note">
        Calculated from the current product records and roadmap. One record can mention several
        needs. These are sample counts, not distinct customers or market rates.
      </p>
      <div className="public-case-reading">
        <div>
          <h3>How do the comments read?</h3>
          {(["positive", "mixed", "negative"] as const).map((t) => {
            const count = opinions.filter((r) => r.tone === t).length;
            return (
              <div className="public-tone-row" key={t}>
                <span>{t}</span>
                <meter
                  min={0}
                  max={Math.max(1, opinions.length)}
                  value={count}
                  aria-label={`${t} passages`}
                />
                <strong>
                  {count} / {opinions.length}
                </strong>
              </div>
            );
          })}
          <p className="chart-note">
            Initial AI tone labels for review/discussion records only. Questions excluded. Inspect
            and review the source before acting.
          </p>
        </div>
        <div>
          <h3>Why did people choose it?</h3>
          <p>
            One reviewer describes choosing a discounted color. Another bought the pack for
            pickleball equipment. A poster found a second-hand pack for a hiking trip.
          </p>
          {sourcesFor(["ODP-01", "ODP-18", "ODP-19"]).map((url) => (
            <SourceBadge
              key={url}
              url={url}
              platform={new URL(url).hostname.replace(/^www\./, "")}
            />
          ))}
          <p className="chart-note">
            Explicitly reported purchase contexts, not inferred drivers for all buyers.
          </p>
        </div>
      </div>
      <div className="public-case-opportunity">
        <strong>Featured renewal hypothesis: integrated strap keepers</strong>
        <p>
          Loose straps and obstructed access recur across owner and editorial passages. One reviewer
          reports using zip ties. Test access time and interference with a reversible keeper
          prototype.
        </p>
        {sourcesFor(["ODP-04", "ODP-13", "ODP-14", "ODP-20"]).map((url) => (
          <SourceBadge key={url} url={url} platform={new URL(url).hostname.replace(/^www\./, "")} />
        ))}
        <Link to="/opportunities">Open the experiment and counterevidence →</Link>
      </div>
      <details>
        <summary>Sources, product facts and collection limits</summary>
        <p>
          No invented reviews or seeded survey participants in this case. Public posts are
          self-selected. This is a stored source snapshot, not a continuously refreshed feed. Some
          reports concern older revisions. Missing dates stay missing. Initial AI tags need reviewer
          checks. New surveys start at zero and save locally.
        </p>
        <SourceBadge url={PUBLIC_CASE_SPECS} platform="Osprey.com / manufacturer context" />
        <SourceBadge url={PUBLIC_CASE_IMAGE_SOURCE} platform="Pack Hacker / 2019 product photo" />
        {urls.map((url) => (
          <a key={url} href={url} target="_blank" rel="noreferrer">
            {url}
          </a>
        ))}
        <p>The PERLab source label names this research workflow, not authorship or endorsement.</p>
      </details>
    </section>
  );
}
