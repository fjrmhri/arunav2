import { describe, expect, it } from "vitest";
import { MAX_SYNC_LOGS, isValidDateKey, validateSyncPayload } from "@/lib/syncValidation";

const validLog = {
  dateKey: "2026-10-26",
  completedTaskIds: ["2026-10-26_hydration"],
  skippedTaskIds: [],
  notes: "catatan",
  lastUpdated: 1793000000000,
};

const validBody = {
  logs: [validLog],
  prefs: { startDate: "2026-10-26" },
};

describe("isValidDateKey", () => {
  it("menerima tanggal nyata dan menolak format/tanggal palsu", () => {
    expect(isValidDateKey("2026-02-28")).toBe(true);
    expect(isValidDateKey("2026-02-30")).toBe(false);
    expect(isValidDateKey("../../README")).toBe(false);
    expect(isValidDateKey("2026-10-26/../../x")).toBe(false);
    expect(isValidDateKey(20261026)).toBe(false);
  });
});

describe("validateSyncPayload", () => {
  it("menerima payload valid dan hanya meneruskan field yang dikenal", () => {
    const result = validateSyncPayload({
      ...validBody,
      prefs: { startDate: "2026-10-26", name: "x", extra: true },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.prefs).toEqual({ startDate: "2026-10-26", lastFastStartDate: undefined });
    }
  });

  it("menolak dateKey yang bisa dipakai untuk path traversal", () => {
    const result = validateSyncPayload({
      ...validBody,
      logs: [{ ...validLog, dateKey: "../../.github/workflows/x" }],
    });
    expect(result.ok).toBe(false);
  });

  it(`menolak lebih dari ${MAX_SYNC_LOGS} log`, () => {
    const logs = Array.from({ length: MAX_SYNC_LOGS + 1 }, () => validLog);
    expect(validateSyncPayload({ ...validBody, logs }).ok).toBe(false);
  });

  it("menolak catatan terlalu panjang dan skinReaction asing", () => {
    expect(
      validateSyncPayload({ ...validBody, logs: [{ ...validLog, notes: "a".repeat(5001) }] }).ok,
    ).toBe(false);
    expect(
      validateSyncPayload({ ...validBody, logs: [{ ...validLog, skinReaction: "x" }] }).ok,
    ).toBe(false);
  });

  it("menolak prefs dan progressData yang tidak valid", () => {
    expect(validateSyncPayload({ logs: [], prefs: {} }).ok).toBe(false);
    expect(validateSyncPayload({ ...validBody, progressData: { last7: "x" } }).ok).toBe(false);
  });

  it("menolak body yang bukan objek", () => {
    expect(validateSyncPayload(null).ok).toBe(false);
    expect(validateSyncPayload([]).ok).toBe(false);
  });
});
