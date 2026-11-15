import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowRight, Fingerprint, GitCompareArrows, Layers3 } from "lucide-react";
import { SignalSculpture } from "@/components/signal-sculpture";
export const Route = createFileRoute("/")({ component: Home });
function Home() {
  return (
    <div className="scope-landing">
      <section className="scope-hero">
        <div className="hero-copy">
          <span className="scope-eyebrow">
            <i /> CONSUMER INSIGHTS, RECONSIDERED
          </span>
          <h1>
            Hear the need.
            <br />
            <span>Shape what’s next.</span>
          </h1>
          <p>
            Go beyond the star rating. Connect what customers want, why they buy, and what they wish
            worked differently.
          </p>
          <Link to="/kearney" className="scope-cta hero-cta">
            Try now
            <ArrowUpRight size={20} />
          </Link>
          <small>No account needed. Every finding leads back to its evidence.</small>
        </div>
        <SignalSculpture />
      </section>
      <section className="scope-intro">
        <span className="scope-eyebrow">THE QUESTION BEHIND THE COMMENT</span>
        <h2>
          Better products start
          <br />
          with better listening.
        </h2>
        <p>
          A review tells you what happened. A useful insight connects the need, the purchase context
          and the improvement worth testing.
        </p>
      </section>
      <section className="scope-method" aria-label="How it works">
        {[
          {
            n: "01",
            icon: Fingerprint,
            title: "Understand the need",
            text: "Bring together reviews, questions and permitted research. Separate customer voices from marketing claims.",
          },
          {
            n: "02",
            icon: GitCompareArrows,
            title: "See the alternatives",
            text: "Discover relevant competitors automatically. Compare supported capabilities and make evidence gaps visible.",
          },
          {
            n: "03",
            icon: Layers3,
            title: "Choose the next move",
            text: "Turn recurring needs into cited product hypotheses, clear experiments and a research roadmap.",
          },
        ].map((item) => (
          <article key={item.n}>
            <span>
              {item.n}
              <item.icon size={22} />
            </span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>
      <section className="scope-end">
        <div>
          <span className="scope-eyebrow">KEARNEY PRODUCT &amp; PORTFOLIO ANALYSIS</span>
          <h2>
            Make the next decision
            <br />
            an informed one.
          </h2>
          <p>
            Explore a documented Kearney offering. Follow its evidence into a product renewal plan.
          </p>
        </div>
        <Link className="scope-cta" to="/kearney">
          Launch workspace
          <ArrowRight size={18} />
        </Link>
      </section>
      <p className="landing-attribution">
        Independent hackathon prototype for the Consumer Insights challenge. Not an official Kearney
        product. Product facts and findings are cited inside the workspace.
      </p>
    </div>
  );
}
