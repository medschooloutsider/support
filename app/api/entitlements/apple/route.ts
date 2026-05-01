import { type NextRequest, NextResponse } from "next/server";

import { validateAppleReceipt } from "@/lib/entitlement";

type AppleEntitlementRequestBody = {
  appId: string;
  receiptData: string;
};

export function parseAppleEntitlementRequestBody(
  body: unknown,
): AppleEntitlementRequestBody | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }

  const candidate = body as Record<string, unknown>;

  return {
    appId: typeof candidate.appId === "string" ? candidate.appId : "",
    receiptData:
      typeof candidate.receiptData === "string" ? candidate.receiptData : "",
  };
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const parsedBody = parseAppleEntitlementRequestBody(body);

  if (!parsedBody) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const valid = await validateAppleReceipt({
    appId: parsedBody.appId,
    receiptData: parsedBody.receiptData,
    sharedSecret: process.env.APPLE_RECEIPT_SHARED_SECRET,
  });

  return NextResponse.json({ valid });
}
