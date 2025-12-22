import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Trophy, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut,
  Zap,
  UserPlus,
  Wallet
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";

const adminMenuItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Contests", url: "/admin/contests", icon: Trophy },
  { title: "Students", url: "/admin/students", icon: Users },
  { title: "Payments", url: "/admin/payments", icon: CreditCard, badge: true },
  { title: "Creators", url: "/admin/creators", icon: UserPlus },
  { title: "Withdrawals", url: "/admin/withdrawals", icon: Wallet },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
];

export function AdminSidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-lg font-bold">DeepShift</span>
            <Badge variant="secondary" className="ml-2 text-xs">Admin</Badge>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url || location.startsWith(item.url + '/')}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="destructive" className="ml-auto text-xs">
                          New
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Admin Panel</p>
            <p className="text-xs text-muted-foreground">sahil</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
