"use client";

import { ProfileMenu } from "./components/ui/profile-menu";
import { useSession } from "next-auth/react";
import { Button } from "./components/ui/button";
import Image from "next/image";
import { ArrowLeftRightIcon } from "lucide-react";
import Link from "next/link";
import HubLogo from "@/img/hub_logo.png";

export default function Home() {
  const session = useSession({
    required: false,
  });
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col min-h-screen w-1/2 max-w-3xl justify-start py-24 items-center bg-white dark:bg-black space-y-4">
        <div className="flex flex-row w-full justify-end">
          <ProfileMenu user={session.data?.user} />
        </div>
        <div className="flex flex-col w-full items-center mb-10">
          <Image className="w-24" src={HubLogo} alt="ESMS Hub logo" />
          <h1 className="text-2xl text-black dark:invert">ESMS Hub Toolkit</h1>
        </div>
        <div className="flex flex-col w-1/2 self-center items-center">
          <Button className="w-full" variant="outline" size="sm" asChild>
            <Link href="/ssl/market">
              {" "}
              <ArrowLeftRightIcon />
              SSL Transfer Market
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
