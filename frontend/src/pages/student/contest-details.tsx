import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Contest } from "@shared/schema";
import { format } from "date-fns";

export default function ContestDetails() {
  const { contestId } = useParams<{ contestId: string }>();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: contest, isLoading, error } = useQuery<Contest>({
    queryKey: [`/api/contests`, contestId],
  });

  // Registration flow is handled on the dedicated register page.

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error || !contest) return <div className="p-6">Failed to load contest</div>;

  const now = Date.now();
  const startTime = new Date(contest.startTime).getTime();
  const canRegister = contest.status === "upcoming" && startTime > now;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{contest.title}</h1>
          <p className="text-muted-foreground mt-1">{contest.description}</p>
        </div>
        <div className="text-right">
          <Badge variant="outline">{contest.category.toUpperCase()}</Badge>
          <div className="mt-2 text-sm">Start: {format(new Date(contest.startTime), 'PP p')}</div>
          <div className="text-sm">End: {format(new Date(contest.endTime), 'PP p')}</div>
        </div>
      </div>

      <Card>
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Details</h3>
            <div className="text-sm">Duration: {contest.duration} mins</div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>Entry Fee: ₹{contest.fee}</div>
            <div>Prize: ₹{contest.prize}</div>
            <div>Questions: { (contest as any).questionsCount ?? "-" }</div>
            <div>Registration Status: { (contest as any).registration ? ( (contest as any).registration.paymentStatus ) : "Not Registered" }</div>
          </div>
        </CardContent>
      </Card>

      { (contest as any).prizes && (contest as any).prizes.length > 0 && (
        <Card>
          <CardHeader className="p-4">
            <h3 className="font-semibold">Prizes</h3>
          </CardHeader>
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-auto">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="w-24">Rank</th>
                    <th>Prize</th>
                    <th>Title</th>
                  </tr>
                </thead>
                <tbody>
                  {((contest as any).prizes as Array<any>).slice().sort((a,b)=>a.rank-b.rank).map((p) => (
                    <tr key={p.rank} className="border-t">
                      <td className="py-2">#{p.rank}</td>
                      <td className="py-2">₹{(p.prize || 0).toLocaleString()}</td>
                      <td className="py-2 text-muted-foreground">{p.title || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          disabled={!canRegister}
          onClick={() => {
            if (!canRegister) return;
            setLocation(`/contest/${contestId}/register`);
          }}
        >
          Register
        </Button>
        {contest.status === "live" && (
          <Button variant="outline">Join Contest</Button>
        )}
        {contest.status === "completed" && (
          <Button variant="ghost">View Result</Button>
        )}
      </div>
    </div>
  );
}
