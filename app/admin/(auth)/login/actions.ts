"use server";

import { redirect } from "next/navigation";
import { loginAdmin } from "@/lib/auth";

export async function loginAction(
  prevState: { error?: string } | null,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  const result = await loginAdmin(email, password);

  if (!result.success) {
    return { error: result.error || "Invalid credentials." };
  }

  redirect("/admin");
}
