"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ArrowLeftRightIcon, TagsIcon } from "lucide-react";
import { GameSwitcher } from "./game-switcher";
import { ProfileMenu } from "./profile-menu";
import { useSession } from "next-auth/react";
import { Skeleton } from "./ui/skeleton";

const menuGroups: Record<
  string,
  { name: string; href: string; icon: React.ReactNode }[]
> = {
  transfers: [
    {
      name: "Marketplace",
      href: "/transfers/market",
      icon: <TagsIcon />,
    },
    {
      name: "History",
      href: "/transfers/history",
      icon: <ArrowLeftRightIcon />,
    },
  ],
};

const SkeletonMenu = () => (
  <Sidebar>
    <SidebarHeader>
      <div className="flex w-fit items-center gap-4 p-3">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="grid gap-2">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      </div>
    </SidebarHeader>
    <SidebarContent>
      <div className="flex w-full max-w-xs flex-col gap-7 p-3">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-full" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
    </SidebarContent>
    <SidebarFooter>
      <div className="flex w-fit items-center gap-4 p-3">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="grid gap-2">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      </div>
    </SidebarFooter>
  </Sidebar>
);

export function AppSidebar() {
  const { data: session, status } = useSession({ required: true });

  const isLoading = status === "loading";
  if (isLoading) return <SkeletonMenu />;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <GameSwitcher allowCreate={session?.user.isAdmin} />
      </SidebarHeader>
      <SidebarContent>
        {Object.keys(menuGroups).map((key) => (
          <SidebarGroup key={key}>
            <SidebarGroupLabel>{key}</SidebarGroupLabel>
            <SidebarMenu>
              {menuGroups[key].map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <a href={item.href}>
                      {item.icon}
                      {/* <item.icon /> */}
                      <span>{item.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            {/* {userMenuGroups[key].name} */}
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <ProfileMenu user={session.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
