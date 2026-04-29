import { createClient } from "@/lib/supabase/server";

type OwnerAuthResult =
  | {
      allowed: true;
      email: string;
    }
  | {
      allowed: false;
      email: string | null;
    };

type ClaimsData = {
  claims?: {
    email?: unknown;
  };
};

export async function requireOwner(): Promise<OwnerAuthResult> {
  const supabase = await createClient();
  const { data } = (await supabase.auth.getClaims()) as { data: ClaimsData | null };
  const email =
    typeof data?.claims?.email === "string" ? data.claims.email : null;
  const ownerEmail = process.env.OWNER_EMAIL;

  if (!email || !ownerEmail || email !== ownerEmail) {
    return { allowed: false, email };
  }

  return { allowed: true, email };
}
