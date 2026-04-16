import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  ChefHat,
  Utensils,
  ShoppingBag,
  Sparkles,
  BookOpen,
  User,
  Tag,
  Leaf,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { usePlan } from "@/hooks/usePlan";
import { PlanBadge } from "@/components/PlanBadge";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { plan } = usePlan();
  const { t } = useTranslation();

  const mainItems = [
    { title: t("nav.dashboard"), url: "/dashboard", icon: LayoutDashboard },
    { title: t("nav.recipes"), url: "/recipes", icon: ChefHat },
    { title: t("nav.restaurants"), url: "/restaurants", icon: Utensils },
    { title: t("nav.marketplace"), url: "/marketplace", icon: ShoppingBag },
    { title: t("nav.ai_chat"), url: "/ai", icon: Sparkles },
    { title: t("nav.blog"), url: "/blog", icon: BookOpen },
  ];

  const accountItems = [
    { title: t("nav.profile"), url: "/profile", icon: User },
    { title: t("nav.pricing"), url: "/pricing", icon: Tag },
  ];

  const isActive = (path: string) => location.pathname === path;
  const linkCls = (active: boolean) =>
    active
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
      : "hover:bg-sidebar-accent/60";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <NavLink to="/" className="flex items-center gap-2 px-2 py-1.5">
          <span className="size-9 rounded-xl bg-primary grid place-items-center shrink-0">
            <Leaf className="size-5 text-primary-foreground" />
          </span>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-display text-lg font-bold leading-tight">Vireo</span>
              {plan && <PlanBadge tier={plan.tier} className="mt-0.5 self-start" />}
            </div>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.explore")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive: a }) => linkCls(a || isActive(item.url))}
                    >
                      <item.icon className="size-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.account")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive: a }) => linkCls(a)}
                    >
                      <item.icon className="size-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {user && (
        <SidebarFooter className="border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-sidebar-foreground hover:text-foreground"
            onClick={signOut}
          >
            <LogOut className="size-4" />
            {!collapsed && <span>{t("nav.logout")}</span>}
          </Button>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
