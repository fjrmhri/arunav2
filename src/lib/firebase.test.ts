import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key) => store.get(key) ?? null,
    key: (index) => [...store.keys()][index] ?? null,
    removeItem: (key) => void store.delete(key),
    setItem: (key, value) => void store.set(key, String(value)),
  };
}

describe("getUserPreferences", () => {
  beforeEach(() => {
    vi.stubGlobal("window", globalThis);
    vi.stubGlobal("localStorage", createMemoryStorage());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("menyimpan startDate saat pertama kali dan tidak bergeser di hari berikutnya", async () => {
    const { getUserPreferences } = await import("@/lib/firebase");

    vi.setSystemTime(new Date(2026, 9, 26, 9, 0));
    const first = await getUserPreferences();
    expect(first.startDate).toBe("2026-10-26");
    expect(localStorage.getItem("user_prefs")).not.toBeNull();

    vi.setSystemTime(new Date(2026, 9, 29, 9, 0));
    const later = await getUserPreferences();
    expect(later.startDate).toBe("2026-10-26");
  });

  it("saveUserPreferences menggabungkan dan bisa mengosongkan lastFastStartDate", async () => {
    const { getUserPreferences, saveUserPreferences } = await import("@/lib/firebase");

    await saveUserPreferences({ lastFastStartDate: "2026-11-08" });
    expect((await getUserPreferences()).lastFastStartDate).toBe("2026-11-08");

    await saveUserPreferences({ lastFastStartDate: undefined });
    expect((await getUserPreferences()).lastFastStartDate).toBeUndefined();
  });
});
