import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Trophy, 
  IndianRupee, 
  CreditCard, 
  UserPlus, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye
} from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import type { AdminStats, Contest, Registration } from "@shared/schema";
import { format } from "date-fns";

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  trendUp = true,
  color 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  trend?: string;
  trendUp?: boolean;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1" data-testid={`stat-${title.toLowerCase().replace(/\s/g, '-')}`}>
              {value}
            </p>
            {trend && (
              <div className={`flex items-center gap-1 mt-1 text-xs ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
                {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span>{trend}</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
  });

  const { data: recentContests, isLoading: contestsLoading } = useQuery<Contest[]>({
    queryKey: ['/api/admin/contests/recent'],
  });

  const { data: pendingPayments, isLoading: paymentsLoading } = useQuery<Registration[]>({
    queryKey: ['/api/admin/payments/pending'],
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-admin-title">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage contests, students, and payments
          </p>
        </div>
        <Link href="/admin/contests/new">
          <Button data-testid="button-create-contest">
            <Plus className="w-4 h-4 mr-2" />
            Create Contest
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Total Students"
              value={stats?.totalStudents || 0}
              icon={Users}
              trend="+12% this week"
              color="bg-blue-500/10 text-blue-500"
            />
            <StatCard
              title="Total Contests"
              value={stats?.totalContests || 0}
              icon={Trophy}
              color="bg-purple-500/10 text-purple-500"
            />
            <StatCard
              title="Active Contests"
              value={stats?.activeContests || 0}
              icon={TrendingUp}
              color="bg-green-500/10 text-green-500"
            />
            <StatCard
              title="Total Revenue"
              value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
              icon={IndianRupee}
              trend="+8% this month"
              color="bg-emerald-500/10 text-emerald-500"
            />
            <StatCard
              title="Pending Payments"
              value={stats?.pendingPayments || 0}
              icon={CreditCard}
              trendUp={false}
              trend="Needs attention"
              color="bg-orange-500/10 text-orange-500"
            />
            <StatCard
              title="Total Creators"
              value={stats?.totalCreators || 0}
              icon={UserPlus}
              color="bg-pink-500/10 text-pink-500"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Contests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Recent Contests</CardTitle>
              <CardDescription>Latest contests on the platform</CardDescription>
            </div>
            <Link href="/admin/contests">
              <Button variant="ghost" size="sm">
                View All
                <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {contestsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentContests && recentContests.length > 0 ? (
              <div className="space-y-3">
                {recentContests.slice(0, 5).map((contest) => (
                  <div 
                    key={contest.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{contest.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(contest.startTime), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge 
                      variant={contest.status === 'live' ? 'default' : contest.status === 'upcoming' ? 'secondary' : 'outline'}
                    >
                      {contest.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No contests yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Pending Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Pending Payments</CardTitle>
              <CardDescription>Awaiting verification</CardDescription>
            </div>
            <Link href="/admin/payments">
              <Button variant="ghost" size="sm">
                View All
                <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : pendingPayments && pendingPayments.length > 0 ? (
              <div className="space-y-3">
                {pendingPayments.slice(0, 5).map((payment) => (
                  <div 
                    key={payment.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">Registration #{payment.id.slice(-6)}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(payment.registeredAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                    <Link href={`/admin/payments/${payment.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        Review
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No pending payments
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
