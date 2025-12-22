import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Trophy,
  Medal,
  Users,
  Award,
  IndianRupee,
  Download,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Contest, Result } from "@shared/schema";

interface EnrichedResult extends Result {
  userName?: string;
  userEmail?: string;
  userCollege?: string;
}

export default function AdminResults() {
  const { id: contestId } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { data: contest, isLoading: contestLoading } = useQuery<Contest>({
    queryKey: ["/api/admin/contests", contestId],
    enabled: !!contestId,
  });

  const { data: results, isLoading: resultsLoading } = useQuery<EnrichedResult[]>({
    queryKey: ["/api/admin/contests", contestId, "results"],
    enabled: !!contestId,
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      // build prizes payload from local state (if edited) or fallback to contest prizes
      const payloadPrizes = prizes.length ? prizes : (contest?.prizes || []);
      const res = await apiRequest("POST", `/api/admin/contests/${contestId}/publish-results`, { prizes: payloadPrizes });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contests", contestId, "results"] });
      toast({ title: "Results published successfully!" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to publish results", description: error.message, variant: "destructive" });
    },
  });

  const isLoading = contestLoading || resultsLoading;
  const sortedResults = results?.slice().sort((a, b) => b.score - a.score) || [];

  // Editable prizes state: map of { rank, prize }
  const [prizes, setPrizes] = useState<{ rank: number; prize: number; title?: string }[]>([]);
  const [editingPrizes, setEditingPrizes] = useState(false);

  useEffect(() => {
    if (contest?.prizes && contest.prizes.length) {
      setPrizes(contest.prizes.slice());
    } else if (sortedResults.length) {
      // initialize default empty prize rows for top 3 ranks if none provided
      setPrizes(prev => prev.length ? prev : [{ rank: 1, prize: 0 }, { rank: 2, prize: 0 }, { rank: 3, prize: 0 }]);
    }
  }, [contest, sortedResults.length]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500/20 text-yellow-400"><Trophy className="w-3 h-3 mr-1" />1st</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400/20 text-gray-300"><Medal className="w-3 h-3 mr-1" />2nd</Badge>;
    if (rank === 3) return <Badge className="bg-orange-500/20 text-orange-400"><Medal className="w-3 h-3 mr-1" />3rd</Badge>;
    return <Badge variant="outline">#{rank}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/contests">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-page-title">
              Results & Leaderboard
            </h1>
            <p className="text-muted-foreground mt-1">
              {contest?.title}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/contests", contestId, "results"] })}
            data-testid="button-refresh"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant={editingPrizes ? "secondary" : "ghost"}
            onClick={() => setEditingPrizes(v => !v)}
            data-testid="button-edit-prizes"
          >
            <Medal className="w-4 h-4 mr-2" />
            {editingPrizes ? "Close Prize Editor" : "Edit Prizes"}
          </Button>
          <Button 
            onClick={() => publishMutation.mutate()}
            disabled={publishMutation.isPending || !sortedResults.length}
            data-testid="button-publish"
          >
            <Award className="w-4 h-4 mr-2" />
            Publish Results
          </Button>
        </div>
      </div>

      {editingPrizes && (
        <Card>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Edit prizes for ranks. Values in ₹.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {prizes.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-12 text-sm font-medium">#{p.rank}</div>
                    <input
                      type="number"
                      min={0}
                      className="input input-sm w-full rounded border px-2 py-1"
                      value={p.prize}
                      onChange={(e) => {
                        const val = Number(e.target.value || 0);
                        setPrizes(prev => prev.map(x => x.rank === p.rank ? { ...x, prize: val } : x));
                      }}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => setPrizes(prev => prev.filter(x => x.rank !== p.rank))}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <div className="col-span-full flex gap-2">
                  <Button type="button" onClick={() => setPrizes(prev => [...prev, { rank: (prev[prev.length-1]?.rank || 0) + 1, prize: 0 }])}>Add Rank</Button>
                  <Button type="button" variant="outline" onClick={() => setPrizes([])}>Clear</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Participants</p>
                <p className="text-xl font-bold">{sortedResults.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Highest Score</p>
                <p className="text-xl font-bold">{sortedResults[0]?.score || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-xl font-bold">
                  {sortedResults.length ? Math.round(sortedResults.reduce((a, b) => a + b.score, 0) / sortedResults.length) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prize Pool</p>
                <p className="text-xl font-bold">₹{contest?.prize?.toLocaleString() || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-lg">Leaderboard</CardTitle>
            <CardDescription>All participants ranked by score</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {sortedResults.length > 0 ? (
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
                  {sortedResults.map((result, idx) => (
                    <TableRow 
                      key={result.id} 
                      className={idx < 3 ? "bg-muted/30" : ""}
                      data-testid={`result-row-${idx}`}
                    >
                      <TableCell>{getRankBadge(idx + 1)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{result.userName || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{result.userEmail}</p>
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
                        <span className="text-muted-foreground text-sm">/{contest?.totalMarks}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        {editingPrizes ? (
                          <div className="flex items-center justify-end gap-2">
                            <Input
                              type="number"
                              min={0}
                              className="w-28 text-right"
                              value={String(prizes.find(p => p.rank === idx + 1)?.prize ?? result.prize ?? 0)}
                              onChange={(e: any) => {
                                const val = Number(e.target.value || 0);
                                setPrizes(prev => {
                                  const exists = prev.find(x => x.rank === idx + 1);
                                  if (exists) return prev.map(x => x.rank === idx + 1 ? { ...x, prize: val } : x);
                                  return [...prev, { rank: idx + 1, prize: val }].sort((a,b)=>a.rank-b.rank);
                                });
                              }}
                            />
                          </div>
                        ) : (
                          (prizes.find(p => p.rank === idx + 1)?.prize ?? result.prize) ? (
                            <Badge variant="default" className="bg-yellow-500/20 text-yellow-400">
                              <IndianRupee className="w-3 h-3" />
                              {(prizes.find(p => p.rank === idx + 1)?.prize ?? result.prize)?.toLocaleString()}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
