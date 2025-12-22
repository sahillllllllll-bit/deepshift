import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Search, 
  Wallet,
  Check,
  X,
  IndianRupee,
  Clock,
  CheckCircle,
  XCircle
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
import { format } from "date-fns";

interface Withdrawal {
  id: string;
  creatorId: string;
  amount: number;
  paymentMethod: "upi" | "bank";
  upiId?: string;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    accountHolder: string;
  };
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  processedAt?: string;
  creatorName?: string;
  creatorEmail?: string;
}

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  approved: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-3 h-3 mr-1" />,
  approved: <CheckCircle className="w-3 h-3 mr-1" />,
  rejected: <XCircle className="w-3 h-3 mr-1" />,
};

export default function AdminWithdrawals() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [actionDialog, setActionDialog] = useState<{ id: string; action: "approve" | "reject" } | null>(null);

  const { data: withdrawals, isLoading } = useQuery<Withdrawal[]>({
    queryKey: ["/api/admin/withdrawals"],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/admin/withdrawals/${id}/approve`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      toast({ title: "Withdrawal approved!" });
      setActionDialog(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to approve", description: error.message, variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/admin/withdrawals/${id}/reject`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      toast({ title: "Withdrawal rejected" });
      setActionDialog(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to reject", description: error.message, variant: "destructive" });
    },
  });

  const filteredWithdrawals = withdrawals?.filter(w =>
    w.creatorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.creatorEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const pendingCount = withdrawals?.filter(w => w.status === "pending").length || 0;
  const totalPending = withdrawals?.filter(w => w.status === "pending").reduce((a, b) => a + b.amount, 0) || 0;
  const totalApproved = withdrawals?.filter(w => w.status === "approved").reduce((a, b) => a + b.amount, 0) || 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-page-title">
          Creator Withdrawals
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage withdrawal requests from creators
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Amount</p>
                <p className="text-xl font-bold">₹{totalPending.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-xl font-bold">₹{totalApproved.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-xl font-bold">{withdrawals?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search creators..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
              />
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
          ) : filteredWithdrawals.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Creator</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWithdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id} data-testid={`row-withdrawal-${withdrawal.id}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{withdrawal.creatorName || "Unknown"}</p>
                          <p className="text-sm text-muted-foreground">{withdrawal.creatorEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center font-medium">
                          <IndianRupee className="w-4 h-4" />
                          {withdrawal.amount.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {withdrawal.paymentMethod === "upi" ? (
                          <div>
                            <Badge variant="outline">UPI</Badge>
                            <p className="text-xs text-muted-foreground mt-1">{withdrawal.upiId}</p>
                          </div>
                        ) : (
                          <div>
                            <Badge variant="outline">Bank Transfer</Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {withdrawal.bankDetails?.accountHolder}
                            </p>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(withdrawal.requestedAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusStyles[withdrawal.status]}>
                          {statusIcons[withdrawal.status]}
                          {withdrawal.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {withdrawal.status === "pending" && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-500 border-green-500/30"
                              onClick={() => setActionDialog({ id: withdrawal.id, action: "approve" })}
                              data-testid={`button-approve-${withdrawal.id}`}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500 border-red-500/30"
                              onClick={() => setActionDialog({ id: withdrawal.id, action: "reject" })}
                              data-testid={`button-reject-${withdrawal.id}`}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                        {withdrawal.status !== "pending" && (
                          <span className="text-sm text-muted-foreground">
                            {withdrawal.processedAt && format(new Date(withdrawal.processedAt), "MMM d")}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No withdrawal requests</h3>
              <p className="text-muted-foreground">
                Withdrawal requests from creators will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog?.action === "approve" ? "Approve Withdrawal?" : "Reject Withdrawal?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog?.action === "approve" 
                ? "This will mark the withdrawal as approved. Make sure you have processed the payment."
                : "This will reject the withdrawal request. The amount will be returned to the creator's balance."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={actionDialog?.action === "approve" ? "bg-green-600" : "bg-destructive"}
              onClick={() => {
                if (actionDialog?.action === "approve") {
                  approveMutation.mutate(actionDialog.id);
                } else if (actionDialog) {
                  rejectMutation.mutate(actionDialog.id);
                }
              }}
            >
              {actionDialog?.action === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
