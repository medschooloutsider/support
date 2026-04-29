import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { decideEntitlement } from "@/lib/entitlement";
import { verifyAppOriginSignature } from "@/lib/app-origin";
import { buildReportInsert } from "@/lib/reports";
import { reportInputSchema } from "@/lib/schema";

type ReportInsertResult = {
  id: string;
  status: string;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function parseJsonObject(rawBody: string): unknown | null {
  try {
    return JSON.parse(rawBody);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const timestamp = request.headers.get("x-support-timestamp") ?? "";
  const signature = request.headers.get("x-support-signature") ?? "";
  const secret = process.env.APP_ORIGIN_HMAC_SECRET;

  if (!secret) {
    return jsonError("App report intake is not configured.", 500);
  }

  const appOriginValid = await verifyAppOriginSignature({
    body: rawBody,
    timestamp,
    signature,
    secret,
  });

  const parsedBody = parseJsonObject(rawBody);

  if (parsedBody === null) {
    return jsonError("Invalid JSON body.", 400);
  }

  const inputResult = reportInputSchema.safeParse({
    ...(typeof parsedBody === "object" && parsedBody !== null
      ? parsedBody
      : {}),
    source: "app",
  });

  if (!inputResult.success) {
    return jsonError("Invalid report payload.", 422);
  }

  const entitlement = decideEntitlement({
    appId: inputResult.data.appId,
    source: "app",
    appOriginValid,
    lemonValid: false,
  });

  if (!entitlement.allowed) {
    return jsonError("Invalid app origin.", 401);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    return jsonError("Report storage is not configured.", 500);
  }

  const supabase = createClient(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false },
  });
  const insert = buildReportInsert({
    input: inputResult.data,
    entitlementKind: entitlement.kind,
    queue: entitlement.queue,
    reporterUserId: null,
  });

  const { data, error } = await supabase
    .from("reports")
    .insert(insert)
    .select("id,status")
    .single<ReportInsertResult>();

  if (error || !data) {
    return jsonError("Report could not be saved.", 500);
  }

  return NextResponse.json(
    { reportId: data.id, status: data.status },
    { status: 201 },
  );
}
