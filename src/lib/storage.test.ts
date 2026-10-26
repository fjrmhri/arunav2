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
    const { getUserPreferences } = await import("@/lib/storage");

    vi.setSystemTime(new Date(2026, 9, 26, 9, 0));
    const first = await getUserPreferences();
    expect(first.startDate).toBe("2026-10-26");
    expect(localStorage.getItem("user_prefs")).not.toBeNull();

    vi.setSystemTime(new Date(2026, 9, 29, 9, 0));
    const later = await getUserPreferences();
    expect(later.startDate).toBe("2026-10-26");
  });

  it("saveUserPreferences menggabungkan dan bisa mengosongkan lastFastStartDate", async () => {
    const { getUserPreferences, saveUserPreferences } = await import("@/lib/storage");

    await saveUserPreferences({ lastFastStartDate: "2026-11-08" });
    expect((await getUserPreferences()).lastFastStartDate).toBe("2026-11-08");

    await saveUserPreferences({ lastFastStartDate: undefined });
    expect((await getUserPreferences()).lastFastStartDate).toBeUndefined();
  });

  it("entri rusak tidak membuat pembacaan crash", async () => {
    const { getCompletionLog, getCompletionLogsInRange } = await import("@/lib/storage");
    localStorage.setItem("log_2026-10-26", "{bukan json");
    vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(getCompletionLog("2026-10-26")).resolves.toBeNull();
    await expect(getCompletionLogsInRange("2026-10-25", "2026-10-27")).resolves.toEqual([]);
  });

  it("ekspor lalu impor backup mengembalikan data yang sama", async () => {
    const { exportBackup, importBackup, getCompletionLog, saveCompletionLog, saveUserPreferences } =
      await import("@/lib/storage");
    const log = {
      dateKey: "2026-10-27",
      completedTaskIds: ["2026-10-27_hydration"],
      skippedTaskIds: [],
      notes: "uji",
      lastUpdated: 1,
    };
    await saveUserPreferences({ startDate: "2026-10-20" });
    await saveCompletionLog(log.dateKey, log);
    const backup = await exportBackup();

    localStorage.clear();
    const count = await importBackup(JSON.parse(JSON.stringify(backup)));

    expect(count).toBe(1);
    expect(await getCompletionLog(log.dateKey)).toEqual(log);
    expect(JSON.parse(localStorage.getItem("user_prefs") ?? "{}").startDate).toBe("2026-10-20");
  });

  it("impor menolak file yang bukan backup arunav2", async () => {
    const { importBackup } = await import("@/lib/storage");
    await expect(importBackup({ foo: 1 })).rejects.toThrow();
  });
});
