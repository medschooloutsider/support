import { describe, expect, it } from "vitest";

import { decideEntitlement } from "@/lib/entitlement";

describe("decideEntitlement", () => {
  it("verifies app-originated reports with a valid app origin", () => {
    expect(
      decideEntitlement({
        appId: "alarmist",
        source: "app",
        appOriginValid: true,
        lemonValid: false,
      }),
    ).toEqual({ allowed: true, kind: "app_origin", queue: "verified" });
  });

  it("verifies Lemon-verified web reports for GPT-MD", () => {
    expect(
      decideEntitlement({
        appId: "gpt_md",
        source: "web",
        appOriginValid: false,
        lemonValid: true,
      }),
    ).toEqual({ allowed: true, kind: "lemon_license", queue: "verified" });
  });

  it("accepts unsupported or unverified web reports into the unverified queue", () => {
    expect(
      decideEntitlement({
        appId: "alarmist",
        source: "web",
        appOriginValid: false,
        lemonValid: false,
      }),
    ).toEqual({ allowed: true, kind: "unverified", queue: "unverified" });
  });
});
