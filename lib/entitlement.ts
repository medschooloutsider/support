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

  if (input.source === "app") {
    return { allowed: false, kind: "unverified", queue: "unverified" };
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

export async function validateLemonLicenseKey(
  licenseKey: string,
  instanceName: string,
): Promise<boolean> {
  const trimmedLicenseKey = licenseKey.trim();
  const trimmedInstanceName = instanceName.trim();

  if (!trimmedLicenseKey || !trimmedInstanceName) {
    return false;
  }

  const response = await fetch(
    "https://api.lemonsqueezy.com/v1/licenses/validate",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        license_key: trimmedLicenseKey,
        instance_name: trimmedInstanceName,
      }),
    },
  );

  if (!response.ok) {
    return false;
  }

  const data = await response.json();

  return data.valid === true && data.license_key?.status === "active";
}
