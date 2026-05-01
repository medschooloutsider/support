import type { AppId, ReportSource } from "@/lib/schema";

const APPLE_PRODUCTION_RECEIPT_URL =
  "https://buy.itunes.apple.com/verifyReceipt";
const APPLE_SANDBOX_RECEIPT_URL =
  "https://sandbox.itunes.apple.com/verifyReceipt";

const APPLE_BUNDLE_IDS = {
  gpt_md: "io.gptmd.app",
  pdf_md: "io.pdfmd.app",
} as const;

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

  try {
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
  } catch {
    return false;
  }
}

type AppleReceiptValidationPayload = {
  appId: string;
  receiptData: string;
  sharedSecret?: string;
};

type AppleReceiptValidationResponse = {
  status?: unknown;
  receipt?: {
    bundle_id?: unknown;
  };
};

function getExpectedAppleBundleId(appId: string): string | null {
  return appId in APPLE_BUNDLE_IDS
    ? APPLE_BUNDLE_IDS[appId as keyof typeof APPLE_BUNDLE_IDS]
    : null;
}

function getAppleReceiptRequestBody(
  receiptData: string,
  sharedSecret?: string,
): Record<string, string> {
  const body: Record<string, string> = {
    "receipt-data": receiptData,
  };

  const trimmedSharedSecret = sharedSecret?.trim();

  if (trimmedSharedSecret) {
    body.password = trimmedSharedSecret;
  }

  return body;
}

async function validateAppleReceiptAtUrl(
  url: string,
  payload: AppleReceiptValidationPayload,
): Promise<AppleReceiptValidationResponse | null> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        getAppleReceiptRequestBody(
          payload.receiptData,
          payload.sharedSecret,
        ),
      ),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as AppleReceiptValidationResponse;
  } catch {
    return null;
  }
}

export async function validateAppleReceipt(
  payload: AppleReceiptValidationPayload,
): Promise<boolean> {
  const expectedBundleId = getExpectedAppleBundleId(payload.appId);

  if (!expectedBundleId || !payload.receiptData.trim()) {
    return false;
  }

  const productionResponse = await validateAppleReceiptAtUrl(
    APPLE_PRODUCTION_RECEIPT_URL,
    payload,
  );

  if (!productionResponse || typeof productionResponse.status !== "number") {
    return false;
  }

  if (productionResponse.status === 21007) {
    const sandboxResponse = await validateAppleReceiptAtUrl(
      APPLE_SANDBOX_RECEIPT_URL,
      payload,
    );

    if (!sandboxResponse || sandboxResponse.status !== 0) {
      return false;
    }

    return sandboxResponse.receipt?.bundle_id === expectedBundleId;
  }

  if (productionResponse.status !== 0) {
    return false;
  }

  return productionResponse.receipt?.bundle_id === expectedBundleId;
}
