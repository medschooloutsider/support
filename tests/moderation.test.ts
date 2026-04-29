import { describe, expect, it } from "vitest";

import { canTransitionReport } from "@/lib/moderation";

describe("canTransitionReport", () => {
  it("allows new reports to move to needs_info", () => {
    expect(canTransitionReport("new", "needs_info")).toBe(true);
  });

  it("allows new reports to move to published", () => {
    expect(canTransitionReport("new", "published")).toBe(true);
  });

  it("allows needs_info reports to move to closed", () => {
    expect(canTransitionReport("needs_info", "closed")).toBe(true);
  });

  it("rejects reopening closed reports as new", () => {
    expect(canTransitionReport("closed", "new")).toBe(false);
  });
});
