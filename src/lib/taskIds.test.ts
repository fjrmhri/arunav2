import { describe, expect, it } from "vitest";
import { slugify, uniqueSlugs } from "@/lib/taskIds";
import { generateTasks, getDayIndexFromDateKey } from "@/lib/utils";
import { migrateLogTaskIds } from "@/lib/migrations";

const PREFS = { startDate: "2026-10-26" };

describe("slug task ID", () => {
  it("slugify menghapus karakter non-alfanumerik", () => {
    expect(slugify("Goblet Squat (Dumbbell vertikal)")).toBe("goblet-squat-dumbbell-vertikal");
    expect(slugify("MyWell Vitamin D3 1000 IU")).toBe("mywell-vitamin-d3-1000-iu");
  });

  it("uniqueSlugs memberi akhiran untuk nama kembar", () => {
    expect(uniqueSlugs(["Plank", "Plank", "Lunge"])).toEqual(["plank", "plank-2", "lunge"]);
  });
});

describe("generateTasks", () => {
  it("menghasilkan ID unik dan stabil berbasis nama", () => {
    const dateKey = "2026-10-27"; // Selasa, hari normal
    const ids = generateTasks(getDayIndexFromDateKey(dateKey), dateKey, PREFS).map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.some((id) => /_(ex|meal|supp|skin_pm)_\d+$/.test(id))).toBe(false);
    expect(ids).toContain(`${dateKey}_supp_hemaviton-stamina-plus-pagi`);
    expect(ids).toContain(`${dateKey}_supp_hemaviton-stamina-plus-siang`);
  });

  it("hari puasa penuh tetap punya task Creatine dan Magnesium", () => {
    const dateKey = "2026-11-02"; // Senin, puasa penuh
    const tasks = generateTasks(getDayIndexFromDateKey(dateKey), dateKey, PREFS);
    const supps = tasks.filter((t) => t.category === "supplement").map((t) => t.label);
    expect(supps.some((label) => label.includes("Creatine"))).toBe(true);
    expect(supps.some((label) => label.includes("Magnesium"))).toBe(true);
    expect(supps.some((label) => label.includes("Hemaviton"))).toBe(false);
    expect(tasks.some((t) => t.category === "nutrition")).toBe(false);
  });

  it("ID suplemen sama walau jadwalnya digeser ke refeed", () => {
    const normal = "2026-10-27";
    const refeed = "2026-11-03"; // Selasa refeed
    const key = (dateKey: string) =>
      generateTasks(getDayIndexFromDateKey(dateKey), dateKey, PREFS)
        .filter((t) => t.category === "supplement")
        .map((t) => t.id.replace(`${dateKey}_`, ""))
        .sort();
    expect(key(refeed)).toEqual(key(normal));
  });
});

describe("migrateLogTaskIds", () => {
  it("mengubah ID berbasis indeks ke ID berbasis nama", () => {
    const dateKey = "2026-10-27";
    const log = {
      dateKey,
      completedTaskIds: [`${dateKey}_ex_main`, `${dateKey}_supp_0`, `${dateKey}_meal_1`, `${dateKey}_hydration`],
      skippedTaskIds: [],
      notes: "",
      lastUpdated: 0,
    };
    const migrated = migrateLogTaskIds(log, PREFS);
    expect(migrated.completedTaskIds).toEqual([
      `${dateKey}_ex_main`,
      `${dateKey}_supp_hemaviton-stamina-plus-pagi`,
      `${dateKey}_meal_makan-siang`,
      `${dateKey}_hydration`,
    ]);

    const validIds = generateTasks(getDayIndexFromDateKey(dateKey), dateKey, PREFS).map((t) => t.id);
    expect(migrated.completedTaskIds.every((id) => validIds.includes(id))).toBe(true);
  });

  it("log tanpa ID lama dikembalikan apa adanya", () => {
    const log = { dateKey: "2026-10-27", completedTaskIds: ["2026-10-27_hydration"], skippedTaskIds: [], notes: "", lastUpdated: 0 };
    expect(migrateLogTaskIds(log, PREFS)).toBe(log);
  });
});
