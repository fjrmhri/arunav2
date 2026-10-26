// ============================================================
// TASK IDS — arunav2
// ID task stabil berbasis nama (bukan indeks), agar centang tidak pindah
// ke item lain saat urutan atau isi jadwal berubah.
// Format: ${dateKey}_ex_main | _ex_<slug> | _meal_<slug> | _supp_<key>
//         | _skin_am | _skin_pm_<slug> | _hydration | _fasting
// ============================================================

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Slug unik per daftar: nama kembar mendapat akhiran -2, -3, dst. */
export function uniqueSlugs(names: string[]): string[] {
  const seen = new Map<string, number>();
  return names.map((name) => {
    const base = slugify(name) || "item";
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  });
}

export function exerciseTaskIds(dateKey: string, exercises: { name: string }[]): string[] {
  return uniqueSlugs(exercises.map((ex) => ex.name)).map((slug) => `${dateKey}_ex_${slug}`);
}

export function mealTaskIds(dateKey: string, meals: { label: string }[]): string[] {
  return uniqueSlugs(meals.map((meal) => meal.label)).map((slug) => `${dateKey}_meal_${slug}`);
}

export function supplementTaskIds(dateKey: string, supplements: { key: string }[]): string[] {
  return uniqueSlugs(supplements.map((supp) => supp.key)).map((slug) => `${dateKey}_supp_${slug}`);
}

export function skinPmTaskIds(dateKey: string, steps: { productShort: string }[]): string[] {
  return uniqueSlugs(steps.map((step) => step.productShort)).map(
    (slug) => `${dateKey}_skin_pm_${slug}`,
  );
}
