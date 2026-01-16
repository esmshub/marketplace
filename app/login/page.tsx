"use client";

import LoginForm from "./login-form";
import { redirect, RedirectType, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { Suspense, useEffect } from "react";

export default function LoginPage() {
  const { status } = useSession();

  if (status === "authenticated") {
    return redirect("/", RedirectType.replace);
  }

  // const session = await auth();
  // if (session) {
  // return redirect(query.redirect ?? "/", RedirectType.replace);
  // }

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense>
          <LoginForm />
        </Suspense>
        <Toaster position="top-center" />
      </div>
    </div>
  );
}
