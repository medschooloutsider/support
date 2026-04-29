import { expect, test } from "@playwright/test";

test("public support pages render", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Med School Outsider Support" }),
  ).toBeVisible();

  const issuesLink = page
    .getByRole("link", { name: "View Issues" })
    .or(page.getByRole("link", { name: "Browse issues" }));

  await issuesLink.click();

  await expect(
    page.getByRole("heading", { name: "Support issues" }),
  ).toBeVisible();
});

test("report page renders private intake form", async ({ page }) => {
  await page.goto("/report");

  await expect(
    page.getByRole("heading", { name: "Report an issue" }),
  ).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Submit report" }),
  ).toBeVisible();
});
