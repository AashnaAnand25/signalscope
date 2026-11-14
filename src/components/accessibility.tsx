import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Accessibility, Check, Monitor, Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";
type Prefs = {
  theme: "light" | "dark" | "system";
  contrast: "standard" | "high";
  text: "normal" | "large";
  motion: boolean;
};
const defaults: Prefs = { theme: "light", contrast: "standard", text: "normal", motion: false };
const key = "signalscope:accessibility:v1";
const Context = createContext<{ prefs: Prefs; set: (patch: Partial<Prefs>) => void }>({
  prefs: defaults,
  set: () => {},
});
export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(defaults);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem(key) ?? "{}");
      setPrefs({
        theme: ["light", "dark", "system"].includes(p.theme) ? p.theme : "light",
        contrast: p.contrast === "high" ? "high" : "standard",
        text: p.text === "large" ? "large" : "normal",
        motion: p.motion === true,
      });
    } catch {
      /* Use safe defaults. */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    function apply() {
      const root = document.documentElement;
      root.classList.toggle(
        "dark",
        prefs.theme === "dark" || (prefs.theme === "system" && media.matches),
      );
      root.dataset["contrast"] = prefs.contrast;
      root.dataset["textSize"] = prefs.text;
      root.dataset["motion"] = prefs.motion ? "reduced" : "system";
    }
    apply();
    media.addEventListener("change", apply);
    try {
      localStorage.setItem(key, JSON.stringify(prefs));
    } catch {
      /* Preferences remain active for this visit. */
    }
    return () => media.removeEventListener("change", apply);
  }, [prefs, ready]);
  return (
    <Context.Provider value={{ prefs, set: (patch) => setPrefs((p) => ({ ...p, ...patch })) }}>
      {children}
    </Context.Provider>
  );
}
export function AccessibilitySettings() {
  const { prefs, set } = useContext(Context);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="accessibility-trigger">
          <Accessibility size={16} />
          Display & accessibility
        </Button>
      </DialogTrigger>
      <DialogContent className="settings-dialog">
        <DialogTitle>Make it yours</DialogTitle>
        <DialogDescription>Saved in this browser. No account needed.</DialogDescription>
        <fieldset>
          <legend>Appearance</legend>
          <div className="settings-options">
            {(
              [
                { value: "light", label: "Light", icon: Sun },
                { value: "dark", label: "Dark", icon: Moon },
                { value: "system", label: "System", icon: Monitor },
              ] as const
            ).map((x) => (
              <button
                type="button"
                key={x.value}
                aria-pressed={prefs.theme === x.value}
                onClick={() => set({ theme: x.value })}
              >
                <x.icon size={18} />
                {x.label}
                {prefs.theme === x.value && <Check size={14} />}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="settings-toggle">
          <div>
            <strong>High contrast</strong>
            <small>Stronger borders and labels</small>
          </div>
          <input
            aria-label="High contrast"
            type="checkbox"
            checked={prefs.contrast === "high"}
            onChange={(e) => set({ contrast: e.target.checked ? "high" : "standard" })}
          />
        </div>
        <div className="settings-toggle">
          <div>
            <strong>Larger text</strong>
            <small>Increase interface text size</small>
          </div>
          <input
            aria-label="Larger text"
            type="checkbox"
            checked={prefs.text === "large"}
            onChange={(e) => set({ text: e.target.checked ? "large" : "normal" })}
          />
        </div>
        <div className="settings-toggle">
          <div>
            <strong>Reduce motion</strong>
            <small>Minimize transitions and animation</small>
          </div>
          <input
            aria-label="Reduce motion"
            type="checkbox"
            checked={prefs.motion}
            onChange={(e) => set({ motion: e.target.checked })}
          />
        </div>
        <Button variant="ghost" onClick={() => set(defaults)}>
          Reset display settings
        </Button>
      </DialogContent>
    </Dialog>
  );
}
