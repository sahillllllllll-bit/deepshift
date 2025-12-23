import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

import Landing from "@/pages/landing";
import StudentLogin from "@/pages/student/login";
import StudentSignup from "@/pages/student/signup";
import StudentDashboard from "@/pages/student/dashboard";
import StudentContests from "@/pages/student/contests";
import StudentJoined from "@/pages/student/joined";
import StudentPrevious from "@/pages/student/previous";
import StudentResults from "@/pages/student/results";
import StudentProfile from "@/pages/student/profile";
import ContestAttempt from "@/pages/student/attempt";
import ContestRegister from "@/pages/student/register";
import ContestDetails from "@/pages/student/contest-details";

import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminContests from "@/pages/admin/contests";
import AdminContestForm from "@/pages/admin/contest-form";
import AdminQuestions from "@/pages/admin/questions";
import AdminResults from "@/pages/admin/results";
import AdminPayments from "@/pages/admin/payments";
import AdminWithdrawals from "@/pages/admin/withdrawals";

import CreatorLogin from "@/pages/creator/login";
import CreatorSignup from "@/pages/creator/signup";
import CreatorDashboard from "@/pages/creator/dashboard";

import { AppSidebar } from "@/components/app-sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { CreatorSidebar } from "@/components/creator-sidebar";

import NotFound from "@/pages/not-found";
import Help from "./pages/student/Help";
import Chatbot from "./pages/student/Chatbot";
import ContactUs from "./pages/ContactUs";
import HelpCenter from "./pages/HelpCenter";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Certificates from "./pages/student/Certificates";

function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode; 
  allowedRoles?: string[];
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") {
      return <Redirect to="/admin/dashboard" />;
    } else if (user.role === "creator") {
      return <Redirect to="/creator/dashboard" />;
    }
    return <Redirect to="/dashboard" />;
  }

  return <>{children}</>;
}

function StudentLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 p-3 border-b border-border shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 p-3 border-b border-border shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function CreatorLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <CreatorSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 p-3 border-b border-border shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={StudentLogin} />
      <Route path="/signup" component={StudentSignup} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/creator/login" component={CreatorLogin} />
      <Route path="/creator/signup" component={CreatorSignup} />
      <Route path="/contact-us" component={ContactUs} />
      <Route path="/help-center" component={HelpCenter} />
      <Route path="/terms-and-conditions" component={TermsAndConditions} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />





      {/* Student Dashboard Routes */}
      <Route path="/dashboard">
        <ProtectedRoute allowedRoles={["student"]}>
          <StudentLayout>
            <StudentDashboard />
          </StudentLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/contests">
        <ProtectedRoute allowedRoles={["student"]}>
          <StudentLayout>
            <StudentContests />
          </StudentLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/joined">
        <ProtectedRoute allowedRoles={["student"]}>
          <StudentLayout>
            <StudentJoined />
          </StudentLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/results/:contestId">
        <ProtectedRoute allowedRoles={["student"]}>
          <StudentLayout>
            <StudentResults />
          </StudentLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/previous">
        <ProtectedRoute allowedRoles={["student"]}>
          <StudentLayout>
            <StudentPrevious />
          </StudentLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/results">
        <ProtectedRoute allowedRoles={["student"]}>
          <StudentLayout>
            <StudentResults />
          </StudentLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/profile">
        <ProtectedRoute allowedRoles={["student"]}>
          <StudentLayout>
            <StudentProfile />
          </StudentLayout>
        </ProtectedRoute>
      </Route>
         <Route path="/dashboard/help">
        <ProtectedRoute allowedRoles={["student"]}>
          <StudentLayout>
            <Help />
          </StudentLayout>
        </ProtectedRoute>
      </Route>
       <Route path="/dashboard/chatbot">
        <ProtectedRoute allowedRoles={["student"]}>
          <StudentLayout>
            <Chatbot />
          </StudentLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/certificates">
        <ProtectedRoute allowedRoles={["student"]}>
          <StudentLayout>
            <Certificates />
          </StudentLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/contest/:contestId/register">
        <ProtectedRoute allowedRoles={["student"]}>
          <ContestRegister />
        </ProtectedRoute>
      </Route>
      <Route path="/contests/:contestId">
        <ProtectedRoute allowedRoles={["student"]}>
          <StudentLayout>
            <ContestDetails />
          </StudentLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/contest/:contestId/attempt">
        <ProtectedRoute allowedRoles={["student"]}>
          <ContestAttempt />
        </ProtectedRoute>
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/dashboard">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/contests">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminLayout>
            <AdminContests />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/payments">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminLayout>
            <AdminPayments />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/contests/new">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminLayout>
            <AdminContestForm />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/contests/:id/edit">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminLayout>
            <AdminContestForm />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/contests/:id/questions">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminLayout>
            <AdminQuestions />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/contests/:id/results">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminLayout>
            <AdminResults />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/withdrawals">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminLayout>
            <AdminWithdrawals />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      {/* Creator Routes */}
      <Route path="/creator/dashboard">
        <ProtectedRoute allowedRoles={["creator"]}>
          <CreatorLayout>
            <CreatorDashboard />
          </CreatorLayout>
        </ProtectedRoute>
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
