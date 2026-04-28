import { createHmac, timingSafeEqual } from "node:crypto";

type SignatureInput = {
  body: string;
  timestamp: string;
  secret: string;
};

export async function createAppOriginSignature(
  input: SignatureInput,
): Promise<string> {
  return createHmac("sha256", input.secret)
    .update(`${input.timestamp}.${input.body}`)
    .digest("hex");
}

export async function verifyAppOriginSignature(
  input: SignatureInput & { signature: string },
): Promise<boolean> {
  const expected = await createAppOriginSignature(input);
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(input.signature, "hex");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}
