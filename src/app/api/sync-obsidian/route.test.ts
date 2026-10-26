import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const SECRET = "test-secret-123";

const validBody = {
  logs: [
    {
      dateKey: "2026-10-26",
      completedTaskIds: [],
      skippedTaskIds: [],
      notes: "",
      lastUpdated: 1793000000000,
    },
  ],
  prefs: { startDate: "2026-10-26" },
};

function makeRequest(body: unknown, authorization?: string) {
  return new NextRequest("http://localhost/api/sync-obsidian", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authorization ? { Authorization: authorization } : {}),
    },
    body: JSON.stringify(body),
  });
}

async function loadRoute(env: Record<string, string>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  return import("@/app/api/sync-obsidian/route");
}

describe("POST /api/sync-obsidian", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("menolak semua request bila SYNC_SECRET kosong (503)", async () => {
    const { POST } = await loadRoute({ SYNC_SECRET: "", GITHUB_TOKEN: "t", GITHUB_OBSIDIAN_REPO: "u/r" });
    const res = await POST(makeRequest(validBody, `Bearer ${SECRET}`));
    expect(res.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("menolak tanpa header atau dengan secret salah (401)", async () => {
    const { POST } = await loadRoute({ SYNC_SECRET: SECRET, GITHUB_TOKEN: "t", GITHUB_OBSIDIAN_REPO: "u/r" });
    expect((await POST(makeRequest(validBody))).status).toBe(401);
    expect((await POST(makeRequest(validBody, "Bearer salah"))).status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("menolak payload tidak valid (400) tanpa memanggil GitHub", async () => {
    const { POST } = await loadRoute({ SYNC_SECRET: SECRET, GITHUB_TOKEN: "t", GITHUB_OBSIDIAN_REPO: "u/r" });
    const bad = { ...validBody, logs: [{ ...validBody.logs[0], dateKey: "../x" }] };
    const res = await POST(makeRequest(bad, `Bearer ${SECRET}`));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("menulis note ke GitHub bila secret benar", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response("{}", { status: 201 }));
    const { POST } = await loadRoute({ SYNC_SECRET: SECRET, GITHUB_TOKEN: "t", GITHUB_OBSIDIAN_REPO: "u/r" });

    const res = await POST(makeRequest(validBody, `Bearer ${SECRET}`));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ synced: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1][0])).toContain("/repos/u/r/contents/My Life/daily/2026-10-26");
  });

  it("tidak membocorkan detail error GitHub ke klien", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response("token detail rahasia", { status: 403 }));
    const { POST } = await loadRoute({ SYNC_SECRET: SECRET, GITHUB_TOKEN: "t", GITHUB_OBSIDIAN_REPO: "u/r" });

    const res = await POST(makeRequest(validBody, `Bearer ${SECRET}`));
    const text = await res.text();
    expect(res.status).toBe(502);
    expect(text).not.toContain("rahasia");
  });
});
