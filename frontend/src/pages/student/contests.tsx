import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, Trophy, Calendar, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContestCard } from "@/components/contest-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Contest } from "@shared/schema";

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

export default function StudentContests() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: contests, isLoading } = useQuery<Contest[]>({
    queryKey: ['/api/contests'],
  });

  const { data: registrations } = useQuery<any[]>({
    queryKey: ['/api/student/registrations'],
    enabled: true,
  });

  const attachRegistration = (contest: Contest) => {
    const reg = registrations?.find(r => r.contestId === contest.id);
    return { ...(contest as any), registration: reg } as any;
  };

  const filteredContests = contests?.filter(contest => {
    const matchesSearch = contest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          contest.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || contest.category === selectedCategory;
    const matchesStatus = statusFilter === "all" || contest.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const liveContests = filteredContests?.filter(c => c.status === "live") || [];
  const upcomingContests = filteredContests?.filter(c => c.status === "upcoming") || [];
  const completedContests = filteredContests?.filter(c => c.status === "completed") || [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* <div>
        <h1 className="text-2xl md:text-3xl font-bold">All Contests</h1>
        <p className="text-muted-foreground mt-1">
          Browse and join skill-based contests
        </p>
      </div> */}

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
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
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground self-center">Category:</span>
              {["all", "aptitude", "gk", "coding", "hackathon"].map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  data-testid={`button-category-${cat}`}
                >
                  {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground self-center">Status:</span>
            {["all", "live", "upcoming", "completed"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                data-testid={`button-status-${status}`}
              >
                {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <ContestSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
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
                  <ContestCard 
                    key={contest.id} 
                    contest={attachRegistration(contest)} 
                    onJoin={() => setLocation(`/contest/${contest.id}/register`)}
                    onViewDetails={() => setLocation(`/contests/${contest.id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Contests */}
          {upcomingContests.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-semibold">Upcoming</h2>
                <Badge variant="secondary">{upcomingContests.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingContests.map((contest) => (
                  <ContestCard 
                    key={contest.id} 
                    contest={attachRegistration(contest)} 
                    onJoin={() => setLocation(`/contest/${contest.id}/register`)}
                    onViewDetails={() => setLocation(`/contests/${contest.id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Contests */}
          {completedContests.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-gray-500" />
                <h2 className="text-xl font-semibold">Completed</h2>
                <Badge variant="secondary">{completedContests.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedContests.map((contest) => (
                  <ContestCard 
                    key={contest.id} 
                    contest={attachRegistration(contest)} 
                    onJoin={() => setLocation(`/contest/${contest.id}/register`)}
                    onViewDetails={() => setLocation(`/contests/${contest.id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {filteredContests?.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No contests found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
