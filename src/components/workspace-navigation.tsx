import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useDemo } from "@/lib/demo-store";
import { campusBackpack } from "@/data/campus-backpack";
const items = [
  { to: "/analytics", label: "Overview" },
  { to: "/desires", label: "Customer needs" },
  { to: "/journey", label: "Customer journey" },
  { to: "/evidence", label: "Evidence library" },
  { to: "/opportunities", label: "Product roadmap" },
  { to: "/data", label: "Import & AI analysis" },
  { to: "/feedback", label: "Collect feedback" },
] as const;
export function WorkspaceNavigation() {
  const [collapsed, setCollapsed] = useState(false);
  const { product, products, setProductId } = useDemo();
  const navigate = useNavigate();
  return (
    <aside
      className={`restored-sidebar ${collapsed ? "is-collapsed" : ""}`}
      aria-label="Workspace navigation"
    >
      <button
        className="sidebar-collapse"
        onClick={() => setCollapsed(!collapsed)}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        <span>Workspace</span>
      </button>
      <div className="sidebar-body">
        <label>
          Product in scope
          <select
            aria-label="Workspace product"
            value={product.id}
            onChange={(e) => {
              setProductId(e.target.value);
              void navigate({
                to: e.target.value === campusBackpack.id ? "/analytics" : "/kearney",
              });
            }}
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.shortName}
              </option>
            ))}
          </select>
        </label>
        <button
          className="sidebar-demo"
          onClick={() => {
            setProductId(campusBackpack.id);
            void navigate({ to: "/analytics" });
          }}
        >
          Backpack example <small>Synthetic demo evidence</small>
        </button>
        <Link to="/kearney" className="sidebar-portfolio">
          Kearney portfolio
        </Link>
        <nav aria-label="Analysis sections">
          {items.map((item, i) => (
            <Link key={item.to} to={item.to} activeProps={{ className: "is-active" }}>
              <b>{String(i + 1).padStart(2, "0")}</b>
              {item.label}
            </Link>
          ))}
        </nav>
        <p>
          Groq powers comment analysis. Kearney product facts and customer evidence stay separate.
        </p>
      </div>
    </aside>
  );
}
