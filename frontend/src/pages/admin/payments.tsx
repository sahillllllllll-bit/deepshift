import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Search, 
  Check,
  X,
  Eye,
  IndianRupee,
  Image as ImageIcon,
  Loader2
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Registration } from "@shared/schema";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  approved: "bg-green-500/20 text-green-400 border-green-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
};

interface PaymentWithDetails extends Registration {
  userName?: string;
  userEmail?: string;
  contestTitle?: string;
  contestFee?: number;
}

export default function AdminPayments() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null);
  const [activeTab, setActiveTab] = useState("pending");

  const { data: payments, isLoading } = useQuery<PaymentWithDetails[]>({
    queryKey: ['/api/admin/payments'],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/admin/payments/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "Payment approved",
        description: "The student can now access the contest.",
      });
      setSelectedPayment(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/admin/payments/${id}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payments'] });
      toast({
        title: "Payment rejected",
        description: "The registration has been rejected.",
      });
      setSelectedPayment(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredPayments = payments?.filter(payment => {
    const matchesSearch = 
      payment.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.contestTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || payment.paymentStatus === activeTab;
    return matchesSearch && matchesTab;
  });

  const pendingCount = payments?.filter(p => p.paymentStatus === "pending").length || 0;
  const approvedCount = payments?.filter(p => p.paymentStatus === "approved").length || 0;
  const rejectedCount = payments?.filter(p => p.paymentStatus === "rejected").length || 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Payment Verification</h1>
        <p className="text-muted-foreground mt-1">
          Review and verify student payment screenshots
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="pending" className="gap-2">
                  Pending
                  {pendingCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {pendingCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by student or contest..."
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
          ) : filteredPayments && filteredPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Contest</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.userName || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">
                            {payment.userEmail || ''}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="truncate max-w-[200px]">
                          {payment.contestTitle || 'Unknown Contest'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <IndianRupee className="w-3 h-3" />
                          {payment.contestFee || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(payment.registeredAt), "MMM d, h:mm a")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[payment.paymentStatus]}>
                          {payment.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setSelectedPayment(payment)}
                            data-testid={`button-view-${payment.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {payment.paymentStatus === "pending" && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-green-500"
                                onClick={() => approveMutation.mutate(payment.id)}
                                disabled={approveMutation.isPending}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-red-500"
                                onClick={() => rejectMutation.mutate(payment.id)}
                                disabled={rejectMutation.isPending}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Check className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {activeTab === "pending" ? "No pending payments" : "No payments found"}
              </h3>
              <p className="text-muted-foreground">
                {activeTab === "pending" 
                  ? "All payments have been processed" 
                  : "Try adjusting your search"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Review the payment screenshot and verify the transaction
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Student</p>
                  <p className="font-medium">{selectedPayment.userName}</p>
                  <p className="text-sm text-muted-foreground">{selectedPayment.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contest</p>
                  <p className="font-medium">{selectedPayment.contestTitle}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium flex items-center">
                    <IndianRupee className="w-4 h-4" />
                    {selectedPayment.contestFee}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registered At</p>
                  <p className="font-medium">
                    {format(new Date(selectedPayment.registeredAt), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Payment Screenshot</p>
                {selectedPayment.paymentScreenshot ? (
                  <div className="rounded-lg border overflow-hidden">
                    <img 
                      src={selectedPayment.paymentScreenshot} 
                      alt="Payment screenshot"
                      className="w-full max-h-[400px] object-contain bg-muted"
                    />
                  </div>
                ) : (
                  <div className="rounded-lg border p-8 text-center bg-muted/50">
                    <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No screenshot uploaded</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedPayment?.paymentStatus === "pending" && (
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => rejectMutation.mutate(selectedPayment.id)}
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Reject
              </Button>
              <Button 
                onClick={() => approveMutation.mutate(selectedPayment.id)}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Approve Payment
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
