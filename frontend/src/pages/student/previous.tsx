import { useQuery } from "@tanstack/react-query";
import { Trophy, Calendar, IndianRupee, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Contest } from "@shared/schema";
import { format } from "date-fns";

const categoryColors: Record<string, string> = {
  aptitude: "bg-blue-600/20 text-blue-400 border-blue-500/30",
  gk: "bg-emerald-600/20 text-emerald-400 border-emerald-500/30",
  coding: "bg-purple-600/20 text-purple-400 border-purple-500/30",
  hackathon: "bg-orange-600/20 text-orange-400 border-orange-500/30",
};

export default function StudentPreviousContests() {
  const { data: contests, isLoading } = useQuery<Contest[]>({
    queryKey: ['/api/contests/completed'],
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Previous Contests</h1>
        <p className="text-muted-foreground mt-1">
          Browse completed contests and their results
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : contests && contests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contests.map((contest) => (
            <Card key={contest.id} className="hover-elevate" data-testid={`card-contest-${contest.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{contest.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {contest.description}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={categoryColors[contest.category]}
                  >
                    {contest.category.toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Prize Pool</span>
                    <span className="font-semibold text-primary flex items-center">
                      <IndianRupee className="w-4 h-4" />
                      {contest.prize.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Held On</span>
                    <span className="text-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(contest.startTime), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Type</span>
                    <span className="text-sm capitalize">
                      {contest.type.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <Badge variant="secondary" className="w-full justify-center mt-4">
                  Completed
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No previous contests</h3>
            <p className="text-muted-foreground">
              Completed contests will appear here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
