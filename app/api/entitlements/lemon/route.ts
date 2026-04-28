import { type NextRequest, NextResponse } from "next/server";

import { validateLemonLicenseKey } from "@/lib/entitlement";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const licenseKey = typeof body.licenseKey === "string" ? body.licenseKey : "";
  const reporterEmail =
    typeof body.reporterEmail === "string" ? body.reporterEmail : "";

  const valid = await validateLemonLicenseKey(licenseKey, reporterEmail);

  return NextResponse.json({ valid });
}
