import { Link } from "@tanstack/react-router";
import { useDemo } from "@/lib/demo-store";
import { campusBackpack } from "@/data/campus-backpack";
import { ArrowUpRight, Activity } from "lucide-react";
export const NAV = [
  { to: "/", label: "Home" },
  { to: "/kearney", label: "Analysis workspace" },
  { to: "/data", label: "Data & sources" },
] as const;
export function SiteHeader() {
  const { setProductId } = useDemo();
  return (
    <header className="scope-header">
      <Link to="/" className="scope-brand">
        <span className="scope-logo">
          <Activity size={20} />
        </span>
        SignalScope<span className="scope-beta">RESEARCH STUDIO</span>
      </Link>
      <nav aria-label="Main">
        <Link to="/" activeOptions={{ exact: true }}>
          Home
        </Link>
        <Link to="/kearney">Workspace</Link>
        <details className="scope-resources">
          <summary>Resources</summary>
          <div>
            <Link to="/data">Import &amp; AI settings</Link>
            <Link to="/evidence">Evidence library</Link>
            <Link to="/feedback">Collect feedback</Link>
            <Link to="/company">Company pilot</Link>
          </div>
        </details>
      </nav>
      <Link to="/analytics" onClick={() => setProductId(campusBackpack.id)} className="scope-cta">
        Try now
        <ArrowUpRight size={16} />
      </Link>
    </header>
  );
}
