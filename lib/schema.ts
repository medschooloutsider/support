import { z } from "zod";

export const APP_IDS = ["gpt_md", "pdf_md", "alarmist"] as const;
export const REPORT_CATEGORIES = [
  "bug",
  "bad_output",
  "missing_feature",
  "purchase_access",
  "safety",
  "other",
] as const;
export const PUBLIC_STATUSES = [
  "known",
  "being_resolved",
  "to_be_resolved",
] as const;
export const REPORT_STATUSES = [
  "new",
  "needs_info",
  "merged",
  "published",
  "closed",
  "unverified",
] as const;
export const REPORT_SOURCES = ["web", "app"] as const;

export const appIdSchema = z.enum(APP_IDS);
export const reportCategorySchema = z.enum(REPORT_CATEGORIES);
export const publicStatusSchema = z.enum(PUBLIC_STATUSES);
export const reportStatusSchema = z.enum(REPORT_STATUSES);
export const reportSourceSchema = z.enum(REPORT_SOURCES);

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);

export const workflowContextSchema = z
  .record(z.string(), jsonValueSchema)
  .refine((value) => Object.keys(value).length > 0, {
    message: "Workflow context must not be empty.",
  });

export const diagnosticPacketSchema = z
  .object({
    recentLog: z.string().trim().min(1).max(60000),
    lastError: z.string().trim().max(10000).optional(),
    stackTrace: z.array(z.string().trim().max(2000)).max(200).optional(),
    crashReport: z.string().trim().max(120000).optional(),
    metadata: z.record(z.string(), jsonValueSchema).optional(),
  })
  .catchall(jsonValueSchema);

export const reportInputSchema = z
  .object({
    appId: appIdSchema,
    appName: z.string().trim().min(1).max(120).optional(),
    appVersion: z.string().trim().min(1).max(80),
    appBuild: z.string().trim().min(1).max(80).optional(),
    platform: z.string().trim().min(1).max(80),
    osVersion: z.string().trim().min(1).max(80),
    reporterEmail: z.string().trim().email().max(320),
    category: reportCategorySchema.optional(),
    summary: z.string().trim().min(8).max(160),
    description: z.string().trim().min(20).max(5000),
    reproductionSteps: z.string().trim().min(8).max(5000),
    expectedResult: z.string().trim().min(3).max(1000),
    actualResult: z.string().trim().min(3).max(1000),
    workflowContext: workflowContextSchema.optional(),
    diagnostics: diagnosticPacketSchema.optional(),
    source: reportSourceSchema,
  })
  .strict()
  .superRefine((input, context) => {
    if (input.source !== "app") {
      return;
    }

    if (!input.appName) {
      context.addIssue({
        code: "custom",
        path: ["appName"],
        message: "App-origin reports must include app name.",
      });
    }

    if (!input.appBuild) {
      context.addIssue({
        code: "custom",
        path: ["appBuild"],
        message: "App-origin reports must include app build.",
      });
    }

    if (!input.category) {
      context.addIssue({
        code: "custom",
        path: ["category"],
        message: "App-origin reports must include a category.",
      });
    }

    if (!input.workflowContext) {
      context.addIssue({
        code: "custom",
        path: ["workflowContext"],
        message: "App-origin reports must include workflow context.",
      });
    }

    if (!input.diagnostics) {
      context.addIssue({
        code: "custom",
        path: ["diagnostics"],
        message: "App-origin reports must include diagnostics.",
      });
    }
  });

export type AppId = z.infer<typeof appIdSchema>;
export type ReportCategory = z.infer<typeof reportCategorySchema>;
export type PublicStatus = z.infer<typeof publicStatusSchema>;
export type ReportStatus = z.infer<typeof reportStatusSchema>;
export type ReportSource = z.infer<typeof reportSourceSchema>;
export type ReportInput = z.infer<typeof reportInputSchema>;
