import { createClient } from "@/lib/supabase/server";

type OwnerAuthResult =
  | {
      allowed: true;
      email: string;
      userId: string | null;
    }
  | {
      allowed: false;
      email: string | null;
      userId: string | null;
    };

type ClaimsData = {
  claims?: {
    email?: unknown;
    sub?: unknown;
  };
};

export async function requireOwner(): Promise<OwnerAuthResult> {
  const supabase = await createClient();
  const { data } = (await supabase.auth.getClaims()) as { data: ClaimsData | null };
  const email =
    typeof data?.claims?.email === "string" ? data.claims.email : null;
  const userId =
    typeof data?.claims?.sub === "string" ? data.claims.sub : null;
  const ownerEmail = process.env.OWNER_EMAIL;

  if (!email || !ownerEmail || email !== ownerEmail) {
    return { allowed: false, email, userId };
  }

  return { allowed: true, email, userId };
}
