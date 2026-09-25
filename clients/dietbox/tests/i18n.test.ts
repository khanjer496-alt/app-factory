import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { AR } from "../src/i18n/ar";
import { AR_CATALOG } from "../src/i18n/catalog-ar";
import { MEALS, PROGRAMS } from "../shared/catalog";

const files = (dir: string): string[] => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? files(p) : p.endsWith(".tsx") ? [p] : [];
});
const placeholders = (s: string) => (s.match(/\{\w+\}/g) || []).sort();

describe("Arabic translations", () => {
  const keys = new Set<string>();
  for (const f of files(join(__dirname, "../src"))) {
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(/\bt\(\s*"((?:[^"\\]|\\.)*)"/g)) keys.add(m[1]);
    for (const m of src.matchAll(/\bt\([^()"]*?\?\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"/g)) { keys.add(m[1]); keys.add(m[2]); }
  }

  it("covers every UI string", () => {
    const missing = [...keys].filter((k) => !(k in AR));
    expect(missing).toEqual([]);
  });

  it("keeps placeholders intact", () => {
    const singular = new Set(["{w} week · {n} deliveries", "{n} week"]); // Arabic says "one week" in words
    const broken = Object.entries(AR).filter(([k, v]) => !singular.has(k) && placeholders(k).join() !== placeholders(v).join());
    expect(broken).toEqual([]);
  });

  it("names every dish and programme", () => {
    expect(MEALS.filter((m) => !AR_CATALOG.meals[m.id]?.name || !AR_CATALOG.meals[m.id]?.description).map((m) => m.id)).toEqual([]);
    expect(PROGRAMS.filter((p) => !AR_CATALOG.programs[p.id]).map((p) => p.id)).toEqual([]);
  });
});
