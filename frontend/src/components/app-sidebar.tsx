import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Trophy, 
  History, 
  CheckCircle, 
  BarChart3, 
  User, 
  LogOut,
  Zap,
  Contact,
  Bot,
  Brain
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
import { useAuth } from "@/lib/auth";


const studentMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Contests", url: "/dashboard/contests", icon: Trophy },
  { title: "My Contests", url: "/dashboard/joined", icon: CheckCircle },
  { title: "Previous Contests", url: "/dashboard/previous", icon: History },
  { title: "Results", url: "/dashboard/results", icon: BarChart3 },
  { title: "Profile", url: "/dashboard/profile", icon: User },
  { title: "Help", url: "/dashboard/help", icon: Contact },
  { title: "AI Chatbot", url: "/dashboard/chatbot", icon: Bot  },


];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            {/* <Zap className="w-5 h-5 text-primary-foreground" /> */}
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">DeepShift</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {studentMenuItems.map((item) => (
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
            <AvatarFallback className="bg-primary/10">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-user-name">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || ''}
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
