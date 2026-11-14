import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AccessibilityProvider, AccessibilitySettings } from "@/components/accessibility";
beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("persists dark, contrast, text and motion choices across remounts", async () => {
  const view = render(
    <AccessibilityProvider>
      <AccessibilitySettings />
    </AccessibilityProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Display & accessibility" }));
  fireEvent.click(screen.getByRole("button", { name: /^Dark$/ }));
  fireEvent.click(screen.getByLabelText("High contrast"));
  fireEvent.click(screen.getByLabelText("Larger text"));
  fireEvent.click(screen.getByLabelText("Reduce motion"));
  await waitFor(() => expect(document.documentElement.classList.contains("dark")).toBe(true));
  expect(document.documentElement.dataset["contrast"]).toBe("high");
  expect(document.documentElement.dataset["textSize"]).toBe("large");
  expect(document.documentElement.dataset["motion"]).toBe("reduced");
  view.unmount();
  render(
    <AccessibilityProvider>
      <AccessibilitySettings />
    </AccessibilityProvider>,
  );
  await waitFor(() => expect(document.documentElement.dataset["contrast"]).toBe("high"));
  expect(localStorage.getItem("signalscope:accessibility:v1")).toContain('"theme":"dark"');
});
