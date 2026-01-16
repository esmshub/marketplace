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
import { auth } from "@/auth";

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

export async function AppSidebar() {
  const session = await auth();

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
        {session?.user && <ProfileMenu user={session!.user} />}
      </SidebarFooter>
    </Sidebar>
  );
}
