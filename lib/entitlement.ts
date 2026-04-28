import type { AppId, ReportSource } from "@/lib/schema";

type EntitlementInput = {
  appId: AppId;
  source: ReportSource;
  appOriginValid: boolean;
  lemonValid: boolean;
};

export type EntitlementDecision = {
  allowed: boolean;
  kind: "app_origin" | "lemon_license" | "unverified";
  queue: "verified" | "unverified";
};

export function decideEntitlement(
  input: EntitlementInput,
): EntitlementDecision {
  if (input.source === "app" && input.appOriginValid) {
    return { allowed: true, kind: "app_origin", queue: "verified" };
  }

  if (
    input.source === "web" &&
    input.lemonValid &&
    (input.appId === "gpt_md" || input.appId === "pdf_md")
  ) {
    return { allowed: true, kind: "lemon_license", queue: "verified" };
  }

  return { allowed: true, kind: "unverified", queue: "unverified" };
}
