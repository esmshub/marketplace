import { auth } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { EmptyPanel } from "@/components/empty-panel";
import { GameProvider } from "@/components/game-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Spinner } from "@/components/ui/spinner";
import { mapToGameDto } from "@/lib/mapper";
import { getGames } from "@/lib/repos/game";
import { Suspense } from "react";

export default async function ProtectedAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const games = await getGames();
  const dtos = games.map(mapToGameDto);

  if (!session?.user) {
    return <EmptyPanel icon={<Spinner />} title="Loading..." description="" />;
  }

  return (
    <GameProvider games={dtos}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        <div className="flex w-full flex-col">
          <div className="flex justify-end pb-0 pr-4 py-4">
            <ModeToggle />
          </div>
          <main className="flex pr-6">{children}</main>
          <Toaster position="top-center" />
        </div>
      </SidebarProvider>
    </GameProvider>
  );
}
