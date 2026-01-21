"use client";

import LoginForm from "./login-form";
import { redirect, RedirectType } from "next/navigation";
import { useSession } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";
import { EmptyPanel } from "@/components/empty-panel";
import { Spinner } from "@/components/ui/spinner";

export default function LoginPage() {
  const { status } = useSession();

  console.log(status);
  if (status === "loading") {
    return null;
  } else if (status === "authenticated") {
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
