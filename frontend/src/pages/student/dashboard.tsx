import { useQuery } from "@tanstack/react-query";
import { Trophy, Calendar, IndianRupee, Award, Loader2, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContestCard } from "@/components/contest-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Contest, StudentStats } from "@shared/schema";
import { useState } from "react";

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1" data-testid={`stat-${title.toLowerCase().replace(/\s/g, '-')}`}>
              {value}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ContestSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export default function StudentDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: stats, isLoading: statsLoading } = useQuery<StudentStats>({
    queryKey: ['/api/student/stats'],
  });

  const { data: contests, isLoading: contestsLoading } = useQuery<Contest[]>({
    queryKey: ['/api/contests'],
  });

  const { data: registrations } = useQuery<any[]>({
    queryKey: ['/api/student/registrations'],
    enabled: true,
  });

  const filteredContests = contests?.filter(contest => {
    const matchesSearch = contest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          contest.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || contest.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const upcomingContests = (filteredContests || []).filter(c => c.status === "upcoming");
  const liveContests = (filteredContests || []).filter(c => c.status === "live");

  // Attach registration (if any) to contests so ContestCard can render correct CTA
  const attachRegistration = (contest: Contest) => {
    const reg = registrations?.find(r => r.contestId === contest.id);
    return { ...(contest as any), registration: reg } as any;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-dashboard-title">
          Welcome back!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your contests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map(i => (
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
              title="Contests Joined"
              value={stats?.contestsJoined || 0}
              icon={Trophy}
              color="bg-primary/10 text-primary"
            />
            <StatCard
              title="Upcoming"
              value={stats?.upcomingContests || 0}
              icon={Calendar}
              color="bg-blue-500/10 text-blue-500"
            />
            <StatCard
              title="Total Winnings"
              value={`₹${(stats?.totalWinnings || 0).toLocaleString()}`}
              icon={IndianRupee}
              color="bg-emerald-500/10 text-emerald-500"
            />
            <StatCard
              title="Best Rank"
              value={stats?.bestRank ? `#${stats.bestRank}` : "N/A"}
              icon={Award}
              color="bg-orange-500/10 text-orange-500"
            />
          </>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Browse Contests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search contests..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all", "aptitude", "gk", "coding", "hackathon"].map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  data-testid={`button-filter-${cat}`}
                >
                  {cat === "all" ? "All" : cat.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Contests */}
      {liveContests.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <h2 className="text-xl font-semibold">Live Now</h2>
            <Badge variant="secondary">{liveContests.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveContests.map((contest) => (
              <ContestCard key={contest.id} contest={attachRegistration(contest)} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Contests */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold">Upcoming Contests</h2>
          <Badge variant="secondary">{upcomingContests.length}</Badge>
        </div>
        
        {contestsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <ContestSkeleton key={i} />
            ))}
          </div>
        ) : upcomingContests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingContests.map((contest) => (
              <ContestCard key={contest.id} contest={attachRegistration(contest)} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No contests found</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== "all"
                  ? "Try adjusting your search or filters"
                  : "Check back soon for new contests!"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
