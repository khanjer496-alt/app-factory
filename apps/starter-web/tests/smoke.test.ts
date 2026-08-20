import { describe, expect, it } from "vitest";
import { productConfig } from "../product.config";

describe("starter config", () => {
  it("has a product identity", () => expect(productConfig.name.length).toBeGreaterThan(2));
  it("has a safe slug", () => expect(productConfig.slug).toMatch(/^[a-z0-9-]+$/));
  it("has unique billing plan ids", () => { const ids=productConfig.billing.plans.map(p=>p.id); expect(new Set(ids).size).toBe(ids.length); });
  it("has a product description", () => expect(productConfig.description.length).toBeGreaterThan(10));
  it("has at least one billable plan", () => expect(productConfig.billing.plans.length).toBeGreaterThan(0));
  it("keeps uploads behind a feature flag", () => expect(typeof productConfig.features.uploads).toBe("boolean"));
});
