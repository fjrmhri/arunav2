import { describe, expect, it } from "vitest";
import {
  addDaysToDateKey,
  diffCalendarDays,
  getDateKeysInRange,
  getLocalDateKey,
  parseLocalDateKey,
} from "@/lib/date";

describe("date helpers", () => {
  it("parse dan format dateKey bolak-balik", () => {
    expect(getLocalDateKey(parseLocalDateKey("2026-02-28"))).toBe("2026-02-28");
  });

  it("addDaysToDateKey melewati batas bulan dan tahun", () => {
    expect(addDaysToDateKey("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDaysToDateKey("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDaysToDateKey("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("diffCalendarDays menghitung selisih hari kalender", () => {
    expect(diffCalendarDays("2026-10-26", "2026-11-09")).toBe(14);
    expect(diffCalendarDays("2026-11-09", "2026-10-26")).toBe(-14);
  });

  it("getDateKeysInRange inklusif dan kosong bila terbalik", () => {
    expect(getDateKeysInRange("2026-10-30", "2026-11-02")).toEqual([
      "2026-10-30",
      "2026-10-31",
      "2026-11-01",
      "2026-11-02",
    ]);
    expect(getDateKeysInRange("2026-11-02", "2026-10-30")).toEqual([]);
  });
});
