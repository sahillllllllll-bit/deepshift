import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Link as LinkIcon, 
  Wallet, 
  History, 
  LogOut,
  Zap,
  TrendingUp
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";

const creatorMenuItems = [
  { title: "Dashboard", url: "/creator/dashboard", icon: LayoutDashboard },
  { title: "Referrals", url: "/creator/referrals", icon: LinkIcon },
  { title: "Earnings", url: "/creator/earnings", icon: TrendingUp },
  { title: "Withdrawals", url: "/creator/withdrawals", icon: Wallet },
];

export function CreatorSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/creator/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-lg font-bold">DeepShift</span>
            <Badge variant="secondary" className="ml-2 text-xs bg-emerald-500/20 text-emerald-400">
              Creator
            </Badge>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {creatorMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
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
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.avatar || undefined} />
            <AvatarFallback className="bg-emerald-500/10 text-emerald-500">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'C'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-creator-name">
              {user?.name || 'Creator'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.referralCode || ''}
            </p>
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
