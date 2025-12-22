import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  IndianRupee, 
  Users, 
  Wallet, 
  TrendingUp,
  Copy,
  Check,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CreatorStats, Earning } from "@shared/schema";
import { format } from "date-fns";

const withdrawalSchema = z.object({
  amount: z.number().min(300, "Minimum withdrawal is ₹300"),
  paymentMethod: z.enum(["upi", "bank"]),
  upiId: z.string().optional(),
  bankDetails: z.object({
    accountNumber: z.string(),
    ifscCode: z.string(),
    accountHolder: z.string(),
  }).optional(),
}).refine(data => {
  if (data.paymentMethod === "upi") {
    return data.upiId && data.upiId.length >= 5;
  }
  if (data.paymentMethod === "bank") {
    return data.bankDetails?.accountNumber && data.bankDetails?.ifscCode && data.bankDetails?.accountHolder;
  }
  return true;
}, {
  message: "Please provide valid payment details",
  path: ["paymentMethod"],
});

type WithdrawalFormValues = z.infer<typeof withdrawalSchema>;

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color,
  subtitle
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  color: string;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1" data-testid={`stat-${title.toLowerCase().replace(/\s/g, '-')}`}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CreatorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery<CreatorStats>({
    queryKey: ['/api/creator/stats'],
  });

  const { data: recentEarnings, isLoading: earningsLoading } = useQuery<Earning[]>({
    queryKey: ['/api/creator/earnings/recent'],
  });

  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: 300,
      paymentMethod: "upi",
      upiId: "",
      bankDetails: {
        accountNumber: "",
        ifscCode: "",
        accountHolder: "",
      },
    },
  });

  const paymentMethod = form.watch("paymentMethod");

  const withdrawMutation = useMutation({
    mutationFn: async (data: WithdrawalFormValues) => {
      const res = await apiRequest("POST", "/api/creator/withdrawals", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creator/stats"] });
      toast({ title: "Withdrawal request submitted!" });
      setWithdrawOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to submit withdrawal", description: error.message, variant: "destructive" });
    },
  });

  const referralLink = `${window.location.origin}/signup?ref=${user?.referralCode || ''}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const canWithdraw = (stats?.availableBalance || 0) >= 300;

  const onSubmitWithdrawal = (data: WithdrawalFormValues) => {
    if (data.amount > (stats?.availableBalance || 0)) {
      toast({ title: "Insufficient balance", variant: "destructive" });
      return;
    }
    withdrawMutation.mutate(data);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-creator-title">
          Creator Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your referrals and earnings
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Total Earnings"
              value={`₹${(stats?.totalEarnings || 0).toLocaleString()}`}
              icon={TrendingUp}
              color="bg-emerald-500/10 text-emerald-500"
            />
            <StatCard
              title="Available Balance"
              value={`₹${(stats?.availableBalance || 0).toLocaleString()}`}
              icon={Wallet}
              color="bg-blue-500/10 text-blue-500"
              subtitle={canWithdraw ? "Ready to withdraw" : "Min ₹300 to withdraw"}
            />
            <StatCard
              title="Total Referrals"
              value={stats?.totalReferrals || 0}
              icon={Users}
              color="bg-purple-500/10 text-purple-500"
            />
            <StatCard
              title="Pending Withdrawals"
              value={`₹${(stats?.pendingWithdrawals || 0).toLocaleString()}`}
              icon={IndianRupee}
              color="bg-orange-500/10 text-orange-500"
            />
          </>
        )}
      </div>

      {/* Referral Link Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Your Referral Link
            <Badge variant="secondary">
              {user?.referralCode || 'Loading...'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Share this link with students to earn commissions when they join contests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input 
                value={referralLink}
                readOnly
                className="pr-10 font-mono text-sm"
                data-testid="input-referral-link"
              />
            </div>
            <Button 
              onClick={copyReferralLink}
              data-testid="button-copy-link"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Earnings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Recent Earnings</CardTitle>
              <CardDescription>Your latest commission earnings</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {earningsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentEarnings && recentEarnings.length > 0 ? (
              <div className="space-y-3">
                {recentEarnings.slice(0, 5).map((earning, index) => (
                  <div 
                    key={earning.id || index} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">Contest Registration</p>
                      <p className="text-sm text-muted-foreground">
                        {earning.earnedAt ? format(new Date(earning.earnedAt), "MMM d, h:mm a") : 'Recent'}
                      </p>
                    </div>
                    <Badge variant="default" className="bg-emerald-500/20 text-emerald-400">
                      +₹{earning.amount}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No earnings yet. Share your referral link to start earning!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Withdraw Card */}
        <Card className={canWithdraw ? "ring-2 ring-emerald-500/50" : ""}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Withdraw Earnings
            </CardTitle>
            <CardDescription>
              {canWithdraw 
                ? "You can withdraw your earnings now!" 
                : "Minimum ₹300 required to withdraw"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-3xl font-bold mt-1 flex items-center justify-center">
                <IndianRupee className="w-6 h-6" />
                {(stats?.availableBalance || 0).toLocaleString()}
              </p>
            </div>
            <Button 
              className="w-full" 
              disabled={!canWithdraw}
              onClick={() => setWithdrawOpen(true)}
              data-testid="button-withdraw"
            >
              {canWithdraw ? (
                <>
                  Request Withdrawal
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                `Need ₹${Math.max(0, 300 - (stats?.availableBalance || 0))} more`
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Withdrawal</DialogTitle>
            <DialogDescription>
              Enter the amount and payment details for your withdrawal.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitWithdrawal)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (Min: 300)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          type="number" 
                          className="pl-9"
                          placeholder="300"
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value))}
                          data-testid="input-withdrawal-amount"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Available: {(stats?.availableBalance || 0).toLocaleString()}
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-payment-method">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {paymentMethod === "upi" && (
                <FormField
                  control={form.control}
                  name="upiId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UPI ID</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="example@upi" 
                          {...field}
                          data-testid="input-upi-id"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {paymentMethod === "bank" && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="bankDetails.accountHolder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Holder Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Account holder name" 
                            {...field}
                            data-testid="input-account-holder"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bankDetails.accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Account number" 
                            {...field}
                            data-testid="input-account-number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bankDetails.ifscCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IFSC Code</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="IFSC code" 
                            {...field}
                            data-testid="input-ifsc-code"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setWithdrawOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={withdrawMutation.isPending}
                  data-testid="button-submit-withdrawal"
                >
                  {withdrawMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
