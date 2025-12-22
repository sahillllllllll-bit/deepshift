import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  IndianRupee,
  Users,
  Calendar,
  FileQuestion,
  Trophy
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Contest } from "@shared/schema";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  upcoming: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  live: "bg-green-500/20 text-green-400 border-green-500/30",
  completed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const categoryColors: Record<string, string> = {
  aptitude: "bg-blue-600/20 text-blue-400",
  gk: "bg-emerald-600/20 text-emerald-400",
  coding: "bg-purple-600/20 text-purple-400",
  hackathon: "bg-orange-600/20 text-orange-400",
};

export default function AdminContests() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: contests, isLoading } = useQuery<Contest[]>({
    queryKey: ['/api/admin/contests'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/contests/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/contests'] });
      toast({
        title: "Contest deleted",
        description: "The contest has been removed successfully.",
      });
      setDeleteId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete contest. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredContests = contests?.filter(contest =>
    contest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contest.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Contests</h1>
          <p className="text-muted-foreground mt-1">
            Manage all contests on the platform
          </p>
        </div>
        <Link href="/admin/contests/new">
          <Button data-testid="button-create-contest">
            <Plus className="w-4 h-4 mr-2" />
            Create Contest
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search contests..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Total: {filteredContests?.length || 0} contests</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredContests && filteredContests.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contest</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Prize</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContests.map((contest) => (
                    <TableRow key={contest.id} data-testid={`row-contest-${contest.id}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{contest.title}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {contest.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={categoryColors[contest.category]}>
                          {contest.category.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <IndianRupee className="w-3 h-3" />
                          {contest.prize.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <IndianRupee className="w-3 h-3" />
                          {contest.fee}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(contest.startTime), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[contest.status]}>
                          {contest.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/contests/${contest.id}/questions`}>
                                <FileQuestion className="w-4 h-4 mr-2" />
                                Manage Questions
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/contests/${contest.id}/results`}>
                                <Trophy className="w-4 h-4 mr-2" />
                                View Results
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/contests/${contest.id}/edit`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Contest
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => setDeleteId(contest.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No contests yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first contest to get started
              </p>
              <Link href="/admin/contests/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Contest
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contest?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contest
              and all associated data including registrations and results.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
