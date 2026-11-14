import { EventEmitter } from "node:events";
import { Readable } from "node:stream";
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ lookup: vi.fn(), get: vi.fn() }));
vi.mock("node:dns/promises", () => ({ lookup: mocks.lookup, default: { lookup: mocks.lookup } }));
vi.mock("node:https", () => ({ get: mocks.get, default: { get: mocks.get } }));
import { capturePublicPage } from "@/server/web-capture.server";
function reply(status: number, body: string, headers: Record<string, string> = {}) {
  mocks.get.mockImplementationOnce((_url, _options, callback) => {
    const req = new EventEmitter();
    queueMicrotask(() => {
      const res = Object.assign(Readable.from([Buffer.from(body)]), {
        statusCode: status,
        headers,
      });
      res.on("end", () => req.emit("close"));
      callback(res);
    });
    return req;
  });
}
beforeEach(() => {
  mocks.lookup.mockReset().mockResolvedValue([{ address: "8.8.8.8", family: 4 }]);
  mocks.get.mockReset();
});
describe("Network capture policy", () => {
  it("honors robots disallow without downloading the page", async () => {
    reply(200, "User-agent: *\nDisallow: /private\n");
    await expect(capturePublicPage("https://example.com/private/page")).rejects.toThrow(
      "disallowed",
    );
    expect(mocks.get).toHaveBeenCalledTimes(1);
  });
  it("pins a public address and returns attributed page text", async () => {
    reply(404, "");
    reply(
      200,
      "<title>Product specs</title><main>The manufacturer states this backpack fits a 16-inch laptop and has padded shoulder straps. These are specifications, not a consumer survey.</main>",
      { "content-type": "text/html" },
    );
    const result = await capturePublicPage("https://example.com/bag");
    expect(result.url).toBe("https://example.com/bag");
    expect(result.method).toBe("public-html");
    expect(mocks.get.mock.calls[0]?.[1].family).toBe(4);
    const cb = vi.fn();
    mocks.get.mock.calls[0]?.[1].lookup("example.com", {}, cb);
    expect(cb).toHaveBeenCalledWith(null, "8.8.8.8", 4);
  });
  it("rejects a redirect into localhost", async () => {
    reply(404, "");
    reply(302, "", { location: "https://127.0.0.1/internal" });
    await expect(capturePublicPage("https://example.com/bag")).rejects.toThrow("Private");
    expect(mocks.get).toHaveBeenCalledTimes(2);
  });
  it("rejects mixed DNS results before any connection", async () => {
    mocks.lookup.mockResolvedValue([
      { address: "8.8.8.8", family: 4 },
      { address: "10.0.0.1", family: 4 },
    ]);
    await expect(capturePublicPage("https://example.com/bag")).rejects.toThrow("private");
    expect(mocks.get).not.toHaveBeenCalled();
  });
});
