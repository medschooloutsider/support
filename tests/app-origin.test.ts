import { describe, expect, it } from "vitest";

import {
  createAppOriginSignature,
  verifyAppOriginSignature,
} from "@/lib/app-origin";

describe("app origin signatures", () => {
  it("verifies a valid signature", async () => {
    const input = {
      body: JSON.stringify({ appId: "gpt_md", summary: "Export failed" }),
      timestamp: "2026-04-29T00:00:00.000Z",
      secret: "test-secret",
    };
    const signature = await createAppOriginSignature(input);

    await expect(
      verifyAppOriginSignature({ ...input, signature }),
    ).resolves.toBe(true);
  });

  it("rejects a signature when the body is tampered", async () => {
    const input = {
      body: JSON.stringify({ appId: "gpt_md", summary: "Export failed" }),
      timestamp: "2026-04-29T00:00:00.000Z",
      secret: "test-secret",
    };
    const signature = await createAppOriginSignature(input);

    await expect(
      verifyAppOriginSignature({
        ...input,
        body: JSON.stringify({ appId: "gpt_md", summary: "Export passed" }),
        signature,
      }),
    ).resolves.toBe(false);
  });
});
