import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Trophy, Medal, Award, TrendingUp, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Result } from "@shared/schema";
import { format } from "date-fns";

interface ResultWithContest extends Result {
  contestTitle?: string;
  contestCategory?: string;
}

const rankBadges: Record<number, { icon: typeof Trophy; color: string; label: string }> = {
  1: { icon: Trophy, color: "text-yellow-500", label: "Gold" },
  2: { icon: Medal, color: "text-gray-400", label: "Silver" },
  3: { icon: Award, color: "text-amber-600", label: "Bronze" },
};

export default function StudentResults() {
  const { contestId } = useParams<{ contestId?: string }>();
  const { user } = useAuth();

  const queryKey = contestId ? [`/api/contests/${contestId}/results`] : ['/api/student/results'];

  const { data: results, isLoading } = useQuery<ResultWithContest[]>({
    queryKey,
  });

  // Local enriched results with computed rank when server didn't provide it
  const [enrichedResults, setEnrichedResults] = useState<ResultWithContest[] | undefined>(undefined);

  useEffect(() => {
    if (!results || !results.length) {
      setEnrichedResults(results);
      return;
    }

    // Find contestIds where rank is missing but result is published
    const contestsToFetch = Array.from(new Set(results
      .filter(r => (r.rank === undefined || r.rank === null) && r.publishedAt)
      .map(r => r.contestId)
    ));

    if (!contestsToFetch.length) {
      setEnrichedResults(results);
      return;
    }

    (async () => {
      try {
        const rankMaps: Record<string, Record<string, number>> = {};
        await Promise.all(contestsToFetch.map(async cid => {
          const res = await fetch(`/api/contests/${cid}/results`);
          if (!res.ok) return;
          const published: Result[] = await res.json();
          // sort by score desc and build map userId->rank
          const map: Record<string, number> = {};
          published.slice().sort((a, b) => b.score - a.score).forEach((p, i) => { map[p.userId] = i + 1; });
          rankMaps[cid] = map;
        }));

        const merged = results.map(r => {
          if ((r.rank === undefined || r.rank === null) && r.publishedAt) {
            const map = rankMaps[r.contestId];
            if (map && r.userId && map[r.userId]) {
              return { ...r, rank: map[r.userId] };
            }
          }
          return r;
        });
        setEnrichedResults(merged);
      } catch (e) {
        setEnrichedResults(results);
      }
    })();
  }, [results]);

  const totalWinnings = results?.reduce((sum, r) => sum + (r.prize || 0), 0) || 0;
  const bestRank = results?.length ? Math.min(...results.map(r => r.rank)) : null;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">My Results</h1>
        <p className="text-muted-foreground mt-1">
          {user?.name ? `${user.name} — View your contest performances and rankings` : "View your contest performances and rankings"}
        </p>
      </div>

      <marquee behavior="" direction="" className="text-red-500">If you secure a rank where prizes are assigned in any DeepShift
          contest, the DeepShift team will contact you via your registered
          email address or contact number within <strong>24 hours</strong></marquee>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Contests</p>
                <p className="text-2xl font-bold mt-1">{results?.length || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Best Rank</p>
                <p className="text-2xl font-bold mt-1">
                  {bestRank ? `#${bestRank}` : "N/A"}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Winnings</p>
                <p className="text-2xl font-bold mt-1 flex items-center">
                  <IndianRupee className="w-5 h-5" />
                  {totalWinnings.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold mt-1">
                  {results?.length 
                    ? `${Math.round((results.filter(r => r.isWinner).length / results.length) * 100)}%`
                    : "N/A"
                  }
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results List */}
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
      ) : contestId ? (
        // Show table of all participants for a specific contest
        results && results.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Rank</TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead className="text-center">Accuracy</TableHead>
                  <TableHead className="text-center">Questions</TableHead>
                  <TableHead className="text-center">Time</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-right">Prize</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result, idx) => (
                  <TableRow key={result.id} className={idx < 3 ? "bg-muted/30" : ""}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{result.userName || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{result.userCollege}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {result.totalQuestions && result.totalQuestions > 0
                        ? `${Math.round(((result.correctAnswers || 0) / result.totalQuestions) * 100)}%`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-green-500">{result.correctAnswers || 0}</span>
                      {" / "}
                      <span className="text-red-500">{result.wrongAnswers || 0}</span>
                      {" / "}
                      <span className="text-muted-foreground">{result.unanswered || 0}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      {result.timeTakenSeconds ? `${Math.floor(result.timeTakenSeconds/60)}m ${result.timeTakenSeconds%60}s` : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-bold text-lg">{result.score}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      {result.prize ? (
                        <Badge variant="default" className="bg-yellow-500/20 text-yellow-400">
                          <IndianRupee className="w-3 h-3" />
                          {result.prize.toLocaleString()}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No submissions yet</h3>
            <p className="text-muted-foreground">
              Results will appear here once participants submit their answers
            </p>
          </div>
        )
      ) : results && results.length > 0 ? (
        // Student's personal results view (cards)
        <div className="space-y-4">
          {results.map((result) => {
            const rankInfo = rankBadges[result.rank as number];
            const totalQuestions = result.totalQuestions ?? 0;
            const correctAnswers = result.correctAnswers ?? 0;
            const wrongAnswers = result.wrongAnswers ?? 0;
            const unanswered = result.unanswered ?? 0;
            const accuracy = totalQuestions > 0
              ? Math.round((correctAnswers / totalQuestions) * 100)
              : 0;

            return (
              <Card key={result.id} className={result.isWinner ? "ring-2 ring-yellow-500/50" : ""}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {rankInfo && (
                          <rankInfo.icon className={`w-5 h-5 ${rankInfo.color}`} />
                        )}
                        <h3 className="font-semibold text-lg">
                          {result.contestTitle || 'Contest'}
                        </h3>
                        {result.isWinner && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            Winner
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Rank</p>
                          <p className="text-xl font-bold">{result.rank ? `#${result.rank}` : "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Score</p>
                          <p className="text-xl font-bold">{result.score}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Accuracy</p>
                          <div className="flex items-center gap-2">
                            <Progress value={accuracy} className="w-16 h-2" />
                            <span className="text-sm font-medium">{accuracy}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Questions</p>
                            <p className="text-sm">
                              <span className="text-green-500">{correctAnswers}</span>
                              {" / "}
                              <span className="text-red-500">{wrongAnswers}</span>
                              {" / "}
                              <span className="text-gray-500">{unanswered}</span>
                            </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Time Taken</p>
                          <p className="text-sm">{result.timeTakenSeconds ? `${Math.floor(result.timeTakenSeconds/60)}m ${result.timeTakenSeconds%60}s` : "-"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Link href={`/dashboard/results/${result.contestId}`}>
                        <Button variant="outline" size="sm">View All Results</Button>
                      </Link>
                      {result.prize !== undefined && result.prize > 0 && (
                        <div className="text-center p-4 rounded-lg bg-emerald-500/10">
                          <p className="text-sm text-muted-foreground">Prize Won</p>
                          <p className="text-2xl font-bold text-emerald-500 flex items-center justify-center">
                            <IndianRupee className="w-5 h-5" />
                            {result.prize.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
                    Published: {result.publishedAt ? format(new Date(result.publishedAt), "MMM d, yyyy h:mm a") : "Not published"}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No results yet</h3>
            <p className="text-muted-foreground">
              Complete contests to see your results here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
