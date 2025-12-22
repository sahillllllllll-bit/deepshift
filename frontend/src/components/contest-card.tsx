import { Calendar, Users, Trophy, Clock, IndianRupee } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Contest } from "@shared/schema";
import { format } from "date-fns";
import { useLocation } from "wouter";

interface ContestCardProps {
  contest: Contest;
  showJoinButton?: boolean;
  participantCount?: number;
  isJoined?: boolean;
  onJoin?: () => void;
  onViewDetails?: () => void;
}

const categoryColors: Record<string, string> = {
  aptitude: "bg-blue-600/20 text-blue-400 border-blue-500/30",
  gk: "bg-emerald-600/20 text-emerald-400 border-emerald-500/30",
  coding: "bg-purple-600/20 text-purple-400 border-purple-500/30",
  hackathon: "bg-orange-600/20 text-orange-400 border-orange-500/30",
};

const statusColors: Record<string, string> = {
  upcoming: "bg-blue-500",
  live: "bg-green-500",
  completed: "bg-gray-500",
};

const statusText: Record<string, string> = {
  upcoming: "Upcoming",
  live: "Live Now",
  completed: "Completed",
};

export function ContestCard({
  contest,
  showJoinButton = true,
  participantCount = 0,
  isJoined = false,
  onJoin,
  onViewDetails,
}: ContestCardProps) {
  const [, navigate] = useLocation();

  const categoryStyle =
    categoryColors[contest.category] || categoryColors.aptitude;
  const statusColor =
    statusColors[contest.status] || statusColors.upcoming;

  const handleViewDetails = () => {
    if (onViewDetails) return onViewDetails();
    navigate(`/contests/${contest.id}`);
  };

  const handleJoin = () => {
    if (onJoin) return onJoin();
    navigate(`/contest/${contest.id}/register`);
  };

  // The API may include a `registration` object when the user is authenticated.
  // Use it to control button states for students: pending -> not approved,
  // approved + not live -> not started, approved + live -> start test.
  const registration = (contest as any).registration as { paymentStatus?: string; attempt?: { submittedAt?: string } } | undefined;
  const isRegistered = !!registration;
  const isApproved = registration?.paymentStatus === "approved";
  const hasSubmittedAttempt = !!registration?.attempt?.submittedAt;
  const participants =
    typeof participantCount === "number"
      ? participantCount
      : (contest as any).participantCount || (contest as any).participants || (contest as any).registrations?.length || 0;

  const [liveParticipants, setLiveParticipants] = useState<number | null>(
    participants > 0 ? participants : null
  );

  useEffect(() => {
    if (liveParticipants !== null) return;
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/contests/${contest.id}/registrations-count`);
        if (!res.ok) return;
        const json = await res.json();
        if (mounted && typeof json.count === "number") setLiveParticipants(json.count);
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [contest.id, liveParticipants]);

  // Compute action element according to simplified rules:
  // - If contest completed: show results / ended
  // - Otherwise, if user not registered: allow Register (even if contest is live)
  // - If registered: show approval / start states
  const actionElement = (() => {
    if (contest.status === "completed") {
      return isRegistered ? (
        <Button className="w-full" onClick={() => navigate(`/dashboard/results`)}>
          View Results
        </Button>
      ) : (
        <div className="w-full text-center text-sm text-muted-foreground">Contest Ended</div>
      );
    }
    // If contest is live, don't allow new registrations
    if (contest.status === "live") {
      
      if (isRegistered && isApproved) {
        if (hasSubmittedAttempt) {
          return <div className="w-full text-center text-sm text-muted-foreground">Submitted</div>;
        }
        return (
          <Button className="w-full" onClick={() => navigate(`/contest/${contest.id}/attempt`)}>
            Start Contest
          </Button>
        );
      }

      if (isRegistered && !isApproved) {
        return <div className="w-full text-center text-sm text-muted-foreground">Not Approved</div>;
      }

      return <div className="w-full text-center text-sm text-destructive">Registration Closed</div>;
    }

    // For upcoming contests (not live and not completed)
    if (!isRegistered) {
      return (
        <Button className="w-full" onClick={handleJoin}>
          Register
        </Button>
      );
    }

    if (isRegistered && !isApproved) {
      return <div className="w-full text-center text-sm text-muted-foreground">Not Approved</div>;
    }

    if (isRegistered && isApproved) {
      return <div className="w-full text-center text-sm text-muted-foreground">Contest Not Started</div>;
    }

    return null;
  })();

  return (
    <Card
      className="group overflow-visible hover-elevate active-elevate-2 transition-all duration-200"
      data-testid={`card-contest-${contest.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-lg leading-tight truncate"
              data-testid={`text-contest-title-${contest.id}`}
            >
              {contest.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {contest.description}
            </p>
          </div>
          <Badge
            variant="outline"
            className={`shrink-0 ${categoryStyle}`}
          >
            {contest.category.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusColor} animate-pulse`} />
          <span className="text-sm font-medium">
            {statusText[contest.status]}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-2xl font-bold text-primary">
            <IndianRupee className="w-5 h-5" />
            {contest.prize.toLocaleString()}
          </div>
          <Badge variant="secondary">
            <IndianRupee className="w-3 h-3 mr-1" />
            {contest.fee} Entry
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {format(new Date(contest.startTime), "MMM d, h:mm a")}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {contest.duration} mins
          </div>
          {/* <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {(liveParticipants ?? participants)} joined
          </div> */}
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            {contest.type.replace("_", " ")}
          </div>
        </div>
      </CardContent>

      {showJoinButton && (
        <CardFooter className="pt-0 flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleViewDetails}
          >
            View Details
          </Button>

          {actionElement}
        </CardFooter>
      )}
    </Card>
  );
}
