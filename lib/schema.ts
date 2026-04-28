import { z } from "zod";

export const APP_IDS = ["gpt_md", "pdf_md", "alarmist"] as const;
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
export const publicStatusSchema = z.enum(PUBLIC_STATUSES);
export const reportStatusSchema = z.enum(REPORT_STATUSES);
export const reportSourceSchema = z.enum(REPORT_SOURCES);

export const reportInputSchema = z
  .object({
    appId: appIdSchema,
    appVersion: z.string().trim().min(1).max(80),
    platform: z.string().trim().min(1).max(80),
    osVersion: z.string().trim().min(1).max(80),
    reporterEmail: z.string().trim().email().max(320),
    summary: z.string().trim().min(8).max(160),
    description: z.string().trim().min(20).max(5000),
    reproductionSteps: z.string().trim().min(8).max(5000),
    expectedResult: z.string().trim().min(3).max(1000),
    actualResult: z.string().trim().min(3).max(1000),
    source: reportSourceSchema,
  })
  .strict();

export type AppId = z.infer<typeof appIdSchema>;
export type PublicStatus = z.infer<typeof publicStatusSchema>;
export type ReportStatus = z.infer<typeof reportStatusSchema>;
export type ReportSource = z.infer<typeof reportSourceSchema>;
export type ReportInput = z.infer<typeof reportInputSchema>;
