import { type NextRequest, NextResponse } from "next/server";

import { validateLemonLicenseKey } from "@/lib/entitlement";

type LemonEntitlementRequestBody = {
  licenseKey: string;
  reporterEmail: string;
};

export function parseLemonEntitlementRequestBody(
  body: unknown,
): LemonEntitlementRequestBody | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }

  const candidate = body as Record<string, unknown>;

  return {
    licenseKey:
      typeof candidate.licenseKey === "string" ? candidate.licenseKey : "",
    reporterEmail:
      typeof candidate.reporterEmail === "string" ? candidate.reporterEmail : "",
  };
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const parsedBody = parseLemonEntitlementRequestBody(body);

  if (!parsedBody) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const valid = await validateLemonLicenseKey(
    parsedBody.licenseKey,
    parsedBody.reporterEmail,
  );

  return NextResponse.json({ valid });
}
