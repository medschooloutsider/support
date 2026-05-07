"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { requireOwner } from "@/lib/auth";

export type PasswordChangeState = {
  message: string;
  status: "idle" | "success" | "error";
};

export async function changeOwnerPassword(
  _previousState: PasswordChangeState,
  formData: FormData,
): Promise<PasswordChangeState> {
  const owner = await requireOwner();

  if (!owner.allowed) {
    return {
      status: "error",
      message: "Owner session is required before changing the password.",
    };
  }

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const nextPassword = String(formData.get("nextPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !nextPassword || !confirmPassword) {
    return {
      status: "error",
      message: "Enter the current password and the new password twice.",
    };
  }

  if (nextPassword.length < 16) {
    return {
      status: "error",
      message: "Use at least 16 characters for the new password.",
    };
  }

  if (nextPassword !== confirmPassword) {
    return {
      status: "error",
      message: "The new password entries do not match.",
    };
  }

  if (nextPassword === currentPassword) {
    return {
      status: "error",
      message: "Choose a new password that is different from the current one.",
    };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: owner.email,
    password: currentPassword,
  });

  if (signInError) {
    return {
      status: "error",
      message: "Check the current password.",
    };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: nextPassword,
  });

  if (updateError) {
    return {
      status: "error",
      message: "Password could not be changed. Check the current password.",
    };
  }

  await supabase.auth.signOut({ scope: "global" });
  redirect("/login?message=password_changed");
}
