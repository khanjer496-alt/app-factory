import { describe, expect, it } from "vitest";
import { MAX_PAUSE_DAYS, atChargeHour, nextCycleStart, pauseDates, renewalChargeAt, wantsRenewalReminder } from "../shared/renewal";

const at = (iso: string) => new Date(iso);

describe("renewal calendar", () => {
  it("charges 3 days before the next cycle's first delivery, at 09:00 UAE", () => {
    // Mon–Fri plan ending Fri 9 Oct → next cycle starts Mon 12 Oct → charge Fri 9 Oct 09:00 UAE (05:00 UTC).
    expect(renewalChargeAt("2026-10-09", 5, at("2026-10-01T00:00:00Z").getTime())).toBe(Date.parse("2026-10-09T05:00:00Z"));
    expect(atChargeHour("2026-10-09")).toBe(Date.parse("2026-10-09T05:00:00Z"));
    // Every-day plan ending Sat 10 Oct → next starts Sun 11 Oct → charge Thu 8 Oct.
    expect(renewalChargeAt("2026-10-10", 7, at("2026-10-01T00:00:00Z").getTime())).toBe(Date.parse("2026-10-08T05:00:00Z"));
  });

  it("never schedules a charge in the past", () => {
    const now = at("2026-10-10T12:00:00Z").getTime();
    expect(renewalChargeAt("2026-10-09", 5, now)).toBe(now + 3_600_000);
  });

  it("starts the next cycle right after the last delivery when paid on time", () => {
    expect(nextCycleStart("2026-10-09", 5, at("2026-10-08T06:00:00Z"))).toBe("2026-10-12");
  });

  it("starts outside the 48h lock when a renewal is paid late", () => {
    // Paid Tue 13 Oct → earliest editable day is Thu 15 Oct.
    expect(nextCycleStart("2026-10-09", 5, at("2026-10-13T06:00:00Z"))).toBe("2026-10-15");
  });

  it("only sends weekly plans a reminder before their first renewal", () => {
    expect(wantsRenewalReminder(1, 1)).toBe(true);
    expect(wantsRenewalReminder(1, 2)).toBe(false);
    expect(wantsRenewalReminder(4, 6)).toBe(true);
  });
});

describe("pause requests", () => {
  const now = at("2026-10-01T06:00:00Z");
  it("returns every date in the range", () => {
    expect(pauseDates("2026-10-12", "2026-10-16", now)).toEqual(["2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16"]);
  });
  it("rejects bad input, locked days and reversed or long ranges", () => {
    expect(typeof pauseDates("2026-10-12", "nope", now)).toBe("string");
    expect(typeof pauseDates("2026-10-02", "2026-10-05", now)).toBe("string");
    expect(typeof pauseDates("2026-10-16", "2026-10-12", now)).toBe("string");
    expect(typeof pauseDates("2026-10-12", "2026-11-09", now)).toBe("string");
    expect(pauseDates("2026-10-12", "2026-11-08", now)).toHaveLength(MAX_PAUSE_DAYS);
  });
});
