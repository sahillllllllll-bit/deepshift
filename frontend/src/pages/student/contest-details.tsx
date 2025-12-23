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
import ShareButton from "@/components/ShareButton";

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
  const shareUrl = `${window.location.origin}/contests/${contest.id}`;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{contest.title}</h1>
           <ShareButton
              title={contest.title}
              text={contest.description}
              url={shareUrl}
            />
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
            <div>Pool Prize: ₹{contest.prize}</div>
            <div>Questions: { (contest as any).questionsCount ?? "-" }</div>
            <div className="mt-2 text-red-400" > Registration Status: { (contest as any).registration ? ( (contest as any).registration.paymentStatus ) : "Not Registered" }</div>
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

       <div className=" p-4 rounded-md text-gray-100">
 <h2 className="text-lg font-semibold mb-4 text-red-500">Prizes For top Rankers</h2>
<ol>
    <li>
      <b>1-10 : </b>  Cash Prizes
    </li>
<br />
    <li>
      <b>11-20 : </b> Refund Contest Fees
    </li>
    <br />
    <li>
      <b>21-30 : </b> New Year Goodies
    </li>
</ol>
      </div>
 
 <div className=" p-4 rounded-md text-gray-100">
   <div className="rules-container">
  <h2 className="text-lg font-semibold mb-4 text-red-500">DeepShift Contest Rules & Regulations</h2>

  <ol>
    <li>
      <p className="text-red-500 font-bold">1: </p> Participants must attempt all contest questions independently. Copying,
      pasting, reproducing, or sharing answers or content from any external source
      or with other users is strictly prohibited.
    </li>
<br />
    <li>
       <p className="text-red-500 font-bold">2: </p>
      Any attempt to manipulate answers, alter contest flow, use automated tools,
      bots, scripts, browser extensions, or unfair practices will result in
      immediate disqualification.
    </li>
<br />
    <li>
       <p className="text-red-500 font-bold">3: </p>
      Copy, paste, screen capture, screen recording, or video recording during
      the contest is not allowed. Changing tabs, minimizing the browser, or
      switching applications may lead to disqualification.
    </li>
<br />
    <li>
       <p className="text-red-500 font-bold">4: </p>
      Each question in the contest carries a different score based on its
      difficulty level. Final scores are calculated as the sum of all correctly
      answered questions.
    </li>
<br />
    <li>
       <p className="text-red-500 font-bold">5: </p>
      In case two or more participants have the same total score, rankings will
      be decided based on the total time taken to complete the contest. The
      participant with the lesser time will be ranked higher.
    </li>
<br />
    <li>
       <p className="text-red-500 font-bold">6: </p>
      Every contest has a fixed time limit. Once the allotted time expires, the
      contest will automatically end, and no further submissions will be
      accepted.
    </li>
<br />
    <li>
       <p className="text-red-500 font-bold">7: </p>
      Each participant is allowed to register and participate using only one
      account. Multiple accounts created by the same individual will result in
      disqualification.
    </li>
<br />
    <li>
       <p className="text-red-500 font-bold">8: </p>
      DeepShift reserves the right to monitor user activity during the contest.
      Any suspicious behavior or violation of rules may lead to immediate
      disqualification without prior notice.
    </li>
<br />
    <li>
       <p className="text-red-500 font-bold">9: </p>
      Winners are selected strictly based on contest rules, scores, and ranking
      criteria. The decision of the DeepShift team will be final and binding.
    </li>
<br />
    <li>
       <p className="text-red-500 font-bold">10: </p>
      Winners will be contacted by the DeepShift team via their registered email
      address and contact number for prize verification and distribution.
      Participants must ensure their contact details are accurate.
    </li>
<br />
    <li>
       <p className="text-red-500 font-bold">11: </p>
      Prizes, rewards, and goodies are non-transferable and cannot be exchanged
      for cash unless explicitly stated. Prize delivery timelines may vary.
    </li>
<br />
    <li>
       <p className="text-red-500 font-bold">12: </p>
      DeepShift reserves the right to disqualify any participant found violating
      the rules, providing false information, or engaging in unethical behavior
      at any stage of the contest.
    </li>
<br />
    <li>
       <p className="text-red-500 font-bold">13: </p>
      DeepShift may update or modify these rules at any time without prior notice.
      Continued participation implies acceptance of the latest rules.
    </li>
<br />
    <li>
       <p className="text-red-500 font-bold">14: </p>
      By participating in a DeepShift contest, users confirm that they have read,
      understood, and agreed to all rules and regulations listed above.
    </li>
    <br />
  </ol>
</div>

 </div>

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
        <ShareButton
              title={contest.title}
              text={contest.description}
              url={shareUrl}
            />
      </div>
    </div>
  );
}
