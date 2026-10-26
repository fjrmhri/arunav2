import { describe, expect, it } from "vitest";
import { addDaysToDateKey } from "@/lib/date";
import { deriveInitialFastAnchor, getFastingContext } from "@/lib/fasting";

// 2026-10-26 adalah Senin; Minggu pertama setelahnya adalah 2026-11-01.
const START_DATE = "2026-10-26";

function dayStatus(dateKey: string, prefs: { startDate: string; lastFastStartDate?: string }) {
  const ctx = getFastingContext(dateKey, prefs);
  if (ctx.isFastStartDay) return "start";
  if (ctx.isStrictFastDay) return "strict";
  if (ctx.isRefeedDay) return "refeed";
  return "-";
}

describe("siklus puasa 36 jam", () => {
  it("anchor awal adalah Minggu pertama pada/setelah startDate", () => {
    expect(deriveInitialFastAnchor(START_DATE)).toBe("2026-11-01");
    expect(deriveInitialFastAnchor("2026-11-01")).toBe("2026-11-01");
  });

  it("pola Minggu mulai, Senin puasa penuh, Selasa refeed, berulang tiap 14 hari", () => {
    const prefs = { startDate: START_DATE };
    const statuses = Array.from({ length: 28 }, (_, i) =>
      dayStatus(addDaysToDateKey("2026-11-01", i), prefs),
    );

    expect(statuses.slice(0, 3)).toEqual(["start", "strict", "refeed"]);
    expect(statuses.slice(3, 14).every((s) => s === "-")).toBe(true);
    expect(statuses.slice(14, 17)).toEqual(["start", "strict", "refeed"]);
    expect(statuses.slice(17).every((s) => s === "-")).toBe(true);
  });

  it("puasa tidak muncul tiap Minggu (regresi startDate bergeser)", () => {
    const prefs = { startDate: START_DATE };
    expect(dayStatus("2026-11-08", prefs)).toBe("-");
    expect(dayStatus("2026-11-09", prefs)).toBe("-");
  });

  it("lastFastStartDate menggantikan anchor dari startDate", () => {
    const prefs = { startDate: START_DATE, lastFastStartDate: "2026-11-08" };
    expect(dayStatus("2026-11-01", prefs)).toBe("-");
    expect(dayStatus("2026-11-08", prefs)).toBe("start");
    expect(dayStatus("2026-11-09", prefs)).toBe("strict");
    expect(dayStatus("2026-11-22", prefs)).toBe("start");
  });

  it("jendela aktif 20:00 Minggu sampai 08:00 Selasa", () => {
    const prefs = { startDate: START_DATE };
    const before = getFastingContext("2026-11-01", prefs, new Date(2026, 10, 1, 19, 59));
    const during = getFastingContext("2026-11-02", prefs, new Date(2026, 10, 2, 12, 0));
    const after = getFastingContext("2026-11-03", prefs, new Date(2026, 10, 3, 8, 0));

    expect(before.isActiveFastingWindow).toBe(false);
    expect(during.isActiveFastingWindow).toBe(true);
    expect(during.hourElapsed).toBe(16);
    expect(after.isActiveFastingWindow).toBe(false);
    expect(after.isRefeedWindow).toBe(true);
  });
});
