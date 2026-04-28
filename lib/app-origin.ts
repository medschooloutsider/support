import { createHmac, timingSafeEqual } from "node:crypto";

type SignatureInput = {
  body: string;
  timestamp: string;
  secret: string;
};

type VerificationInput = SignatureInput & {
  signature: string;
  nowSeconds?: number;
  maxSkewSeconds?: number;
};

const DEFAULT_MAX_SKEW_SECONDS = 5 * 60;
const UNIX_SECONDS_PATTERN = /^(0|[1-9]\d*)$/;

export async function createAppOriginSignature(
  input: SignatureInput,
): Promise<string> {
  return createHmac("sha256", input.secret)
    .update(`${input.timestamp}.${input.body}`)
    .digest("hex");
}

export async function verifyAppOriginSignature(
  input: VerificationInput,
): Promise<boolean> {
  if (!UNIX_SECONDS_PATTERN.test(input.timestamp)) {
    return false;
  }

  const timestampSeconds = Number(input.timestamp);
  const nowSeconds = input.nowSeconds ?? Math.floor(Date.now() / 1000);
  const maxSkewSeconds = input.maxSkewSeconds ?? DEFAULT_MAX_SKEW_SECONDS;

  if (!Number.isSafeInteger(timestampSeconds)) {
    return false;
  }

  if (Math.abs(nowSeconds - timestampSeconds) > maxSkewSeconds) {
    return false;
  }

  const expected = await createAppOriginSignature(input);
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(input.signature, "hex");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}
