"use server";

import { revalidatePath } from "next/cache";

import {
  decideEntitlement,
  validateLemonLicenseKey,
} from "@/lib/entitlement";
import { buildReportInsert } from "@/lib/reports";
import { reportInputSchema } from "@/lib/schema";
import { createClient } from "@/lib/supabase/server";

export type ReportFormState = {
  message: string;
};

const signedOutState: ReportFormState = {
  message: "Sign in with a verified email before submitting a report.",
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
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    return signedOutState;
  }

  const inputResult = reportInputSchema.safeParse({
    appId: readFormString(formData, "appId"),
    appVersion: readFormString(formData, "appVersion"),
    platform: readFormString(formData, "platform"),
    osVersion: readFormString(formData, "osVersion"),
    reporterEmail: readFormString(formData, "reporterEmail"),
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
    reporterUserId: userId,
  });

  const { error } = await supabase.from("reports").insert(insert);

  if (error) {
    return saveErrorState;
  }

  revalidatePath("/report");
  return successState;
}
