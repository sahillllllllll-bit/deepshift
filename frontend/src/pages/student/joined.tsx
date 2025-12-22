import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { CheckCircle, Clock, Trophy, Calendar, IndianRupee, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Contest, Registration } from "@shared/schema";
import { format } from "date-fns";

interface JoinedContest extends Registration {
  contest?: Contest;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  approved: "bg-green-500/20 text-green-400 border-green-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
};

const contestStatusColors: Record<string, string> = {
  upcoming: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  live: "bg-green-500/20 text-green-400 border-green-500/30",
  completed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export default function StudentJoinedContests() {
  const { data: joinedContests, isLoading } = useQuery<JoinedContest[]>({
    queryKey: ['/api/student/registrations'],
  });

  const pendingContests = joinedContests?.filter(j => j.paymentStatus === "pending") || [];
  const approvedContests = joinedContests?.filter(j => j.paymentStatus === "approved") || [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">My Contests</h1>
        <p className="text-muted-foreground mt-1">
          View contests you've registered for
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : joinedContests && joinedContests.length > 0 ? (
        <div className="space-y-8">
          {/* Pending Approval */}
          {pendingContests.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-yellow-500" />
                <h2 className="text-xl font-semibold">Pending Approval</h2>
                <Badge variant="secondary">{pendingContests.length}</Badge>
              </div>
              <div className="space-y-4">
                {pendingContests.map((item) => (
                  <Card key={item.id} className="hover-elevate">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">
                              {item.contest?.title || 'Unknown Contest'}
                            </h3>
                            <Badge variant="outline" className={statusColors[item.paymentStatus]}>
                              Payment Pending
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            {item.contest && (
                              <>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {format(new Date(item.contest.startTime), "MMM d, yyyy")}
                                </span>
                                <span className="flex items-center gap-1">
                                  <IndianRupee className="w-3 h-3" />
                                  {item.contest.prize.toLocaleString()} Prize
                                </span>
                              </>
                            )}
                            <span>
                              Registered: {format(new Date(item.registeredAt), "MMM d, h:mm a")}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            Waiting for admin approval
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Approved / Ready to Join */}
          {approvedContests.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h2 className="text-xl font-semibold">Ready to Participate</h2>
                <Badge variant="secondary">{approvedContests.length}</Badge>
              </div>
              <div className="space-y-4">
                {approvedContests.map((item) => (
                  <Card key={item.id} className="hover-elevate">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">
                              {item.contest?.title || 'Unknown Contest'}
                            </h3>
                            {item.contest && (
                              <Badge variant="outline" className={contestStatusColors[item.contest.status]}>
                                {item.contest.status === 'live' && (
                                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-1" />
                                )}
                                {item.contest.status}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            {item.contest && (
                              <>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {format(new Date(item.contest.startTime), "MMM d, yyyy h:mm a")}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {item.contest.duration} mins
                                </span>
                                <span className="flex items-center gap-1">
                                  <IndianRupee className="w-3 h-3" />
                                  {item.contest.prize.toLocaleString()} Prize
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.contest?.status === 'live' ? (
                            <Link href={`/contest/${item.contestId}/attempt`}>
                              <Button data-testid={`button-start-${item.id}`}>
                                Start Contest
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                          ) : item.contest?.status === 'upcoming' ? (
                            <Button variant="secondary" disabled>
                              Starts Soon
                            </Button>
                          ) : (
                            <Link href={`/dashboard/results/${item.contestId}`}>
                              <Button variant="outline">
                                View Results
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No contests joined yet</h3>
            <p className="text-muted-foreground mb-4">
              Browse available contests and register to participate
            </p>
            <Link href="/dashboard/contests">
              <Button>
                Browse Contests
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
