"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

import {
  decideEntitlement,
  validateLemonLicenseKey,
} from "@/lib/entitlement";
import { buildReportInsert } from "@/lib/reports";
import { reportInputSchema } from "@/lib/schema";

export type ReportFormState = {
  message: string;
};

const invalidState: ReportFormState = {
  message: "Check the form fields and submit again.",
};

const saveErrorState: ReportFormState = {
  message: "The report could not be saved. Try again later.",
};

const successState: ReportFormState = {
  message: "Report received. It will stay private until reviewed.",
};

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function submitWebReport(
  _previousState: ReportFormState,
  formData: FormData,
): Promise<ReportFormState> {
  const inputResult = reportInputSchema.safeParse({
    appId: readFormString(formData, "appId"),
    appVersion: readFormString(formData, "appVersion"),
    platform: readFormString(formData, "platform"),
    osVersion: readFormString(formData, "osVersion"),
    reporterEmail: readFormString(formData, "reporterEmail"),
    category: readFormString(formData, "category") || undefined,
    summary: readFormString(formData, "summary"),
    description: readFormString(formData, "description"),
    reproductionSteps: readFormString(formData, "reproductionSteps"),
    expectedResult: readFormString(formData, "expectedResult"),
    actualResult: readFormString(formData, "actualResult"),
    source: "web",
  });

  if (!inputResult.success) {
    return invalidState;
  }

  const licenseKey = readFormString(formData, "licenseKey");
  const lemonValid =
    inputResult.data.appId === "gpt_md" || inputResult.data.appId === "pdf_md"
      ? await validateLemonLicenseKey(licenseKey, inputResult.data.reporterEmail)
      : false;

  const entitlement = decideEntitlement({
    appId: inputResult.data.appId,
    source: "web",
    appOriginValid: false,
    lemonValid,
  });

  const insert = buildReportInsert({
    input: inputResult.data,
    entitlementKind: entitlement.kind,
    queue: entitlement.queue,
    reporterUserId: null,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    return saveErrorState;
  }

  const supabase = createSupabaseAdminClient(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false },
  });

  const { error } = await supabase.from("reports").insert(insert);

  if (error) {
    return saveErrorState;
  }

  revalidatePath("/report");
  return successState;
}
