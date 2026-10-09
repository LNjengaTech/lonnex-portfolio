"use client";

import * as React from "react";
import { useActionState } from "react";
import { BrandLogoMark } from "@/components/hex/brand-logo-mark";
import { ThemeToggle } from "@/components/hex/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAction } from "./actions";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm border border-border bg-surface p-8 shadow-xl space-y-6">
        <div className="flex flex-col items-center space-y-3 text-center">
          <BrandLogoMark size={48} className="text-primary" />
          <div className="space-y-1">
            <h1 className="text-xl font-black uppercase tracking-tight text-foreground">
              The Hive Control
            </h1>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Single-Admin Access
            </p>
          </div>
        </div>

        {state?.error && (
          <div className="border border-danger/40 bg-danger/10 p-3 text-xs text-danger font-medium">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block font-mono text-xs uppercase tracking-wider text-muted-foreground"
            >
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="admin@lonnex.dev"
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block font-mono text-xs uppercase tracking-wider text-muted-foreground"
            >
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              disabled={isPending}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            variant="default"
            disabled={isPending}
          >
            {isPending ? "Authenticating..." : "Sign In to Admin"}
          </Button>
        </form>

        <div className="border-t border-border pt-4 text-center">
          <span className="font-mono text-[10px] uppercase text-muted-foreground tracking-widest">
            Protected by Session Guard & Audit Trail
          </span>
        </div>
      </div>
    </div>
  );
}
