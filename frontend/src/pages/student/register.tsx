import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  QrCode, 
  Upload, 
  Check, 
  ArrowLeft, 
  Trophy,
  Clock,
  Users,
  IndianRupee,
  Image,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { LandingNavbar } from "@/components/landing-navbar";

interface Contest {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  prize: number;
  fee: number;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  totalMarks: number;
}

export default function ContestRegister() {
  const { contestId } = useParams<{ contestId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  const [step, setStep] = useState(1);
  const [referralCode, setReferralCode] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const { data: contest, isLoading } = useQuery<Contest>({
    queryKey: ["/api/contests", contestId],
    enabled: !!contestId,
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/student/register/${contestId}`, {
        referralCode: referralCode || undefined,
        paymentScreenshot,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "Your payment is pending verification. You'll be notified once approved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/student/registrations"] });
      setLocation("/dashboard/joined");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentScreenshot(reader.result as string);
        setFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  if (!contest) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Contest Not Found</h2>
            <p className="text-muted-foreground mb-4">
              This contest doesn't exist or has been removed.
            </p>
            <Button onClick={() => setLocation("/dashboard/contests") }>
              Browse Contests
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const now = Date.now();
  const hasStarted = new Date(contest.startTime).getTime() <= now;
  const hasEnded = new Date(contest.endTime).getTime() <= now;

  if (hasStarted || hasEnded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Registration Closed</h2>
            <p className="text-muted-foreground mb-4">
              Registration is closed because this contest has already started or ended.
            </p>
            <Button onClick={() => setLocation(`/contest/${contestId}`)}>Back to Contest</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/dashboard/contests")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Contests
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl" data-testid="text-contest-title">{contest.title}</CardTitle>
                <CardDescription>{contest.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3 text-sm">
                    <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        {step > 1 ? <Check className="w-4 h-4" /> : "1"}
                      </div>
                      <span className="hidden sm:inline">Details</span>
                    </div>
                    <div className={`w-12 h-0.5 ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
                    <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        {step > 2 ? <Check className="w-4 h-4" /> : "2"}
                      </div>
                      <span className="hidden sm:inline">Payment</span>
                    </div>
                    <div className={`w-12 h-0.5 ${step >= 3 ? "bg-primary" : "bg-muted"}`} />
                    <div className={`flex items-center gap-2 ${step >= 3 ? "text-primary" : "text-muted-foreground"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        3
                      </div>
                      <span className="hidden sm:inline">Confirm</span>
                    </div>
                  </div>
                </div>

                {step === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-muted rounded-md text-center">
                        <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                        <p className="text-2xl font-bold" data-testid="text-prize">Rs.{contest.prize.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Prize Pool</p>
                      </div>
                      <div className="p-4 bg-muted rounded-md text-center">
                        <IndianRupee className="w-6 h-6 mx-auto mb-2 text-green-500" />
                        <p className="text-2xl font-bold" data-testid="text-fee">Rs.{contest.fee}</p>
                        <p className="text-sm text-muted-foreground">Entry Fee</p>
                      </div>
                      <div className="p-4 bg-muted rounded-md text-center">
                        <Clock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                        <p className="text-2xl font-bold">{contest.duration}</p>
                        <p className="text-sm text-muted-foreground">Minutes</p>
                      </div>
                      <div className="p-4 bg-muted rounded-md text-center">
                        <Users className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                        <p className="text-2xl font-bold">{contest.totalMarks}</p>
                        <p className="text-sm text-muted-foreground">Total Marks</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-muted-foreground">Contest Type</Label>
                        <p className="font-medium capitalize">{contest.type.replace("_", " ")}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Category</Label>
                        <p className="font-medium capitalize">{contest.category}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Start Time</Label>
                        <p className="font-medium">{formatDate(contest.startTime)}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">End Time</Label>
                        <p className="font-medium">{formatDate(contest.endTime)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="referral">Referral Code (Optional)</Label>
                      <Input
                        id="referral"
                        placeholder="Enter referral code if you have one"
                        value={referralCode}
                        onChange={e => setReferralCode(e.target.value.toUpperCase())}
                        data-testid="input-referral"
                      />
                      <p className="text-sm text-muted-foreground">
                        Using a referral code supports our community creators
                      </p>
                    </div>

                    <Button 
                      onClick={() => setStep(2)} 
                      className="w-full"
                      data-testid="button-proceed-payment"
                    >
                      Proceed to Payment
                    </Button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold mb-2">Scan QR Code to Pay</h3>
                      <p className="text-muted-foreground mb-4">
                        Pay Rs.{contest.fee} using any UPI app
                      </p>
                    </div>

                    <div className="flex justify-center">
                      <div className="bg-white p-6 rounded-lg">
                        <div className="w-64 h-64 bg-muted rounded-md flex items-center justify-center relative">
                          { (contest as any).qrCodeUrl ? (
                            <img src={(contest as any).qrCodeUrl} alt="Payment QR" className="max-h-64 max-w-64 object-contain" />
                          ) : (
                            <>
                              <QrCode className="w-48 h-48 text-foreground" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white px-2 py-1 rounded text-xs font-medium">
                                  deepshift@upi
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-center space-y-2">
                      <p className="font-semibold">UPI ID: deepshift@upi</p>
                      <p className="text-2xl font-bold text-primary" data-testid="text-payment-amount">
                        Rs.{contest.fee}
                      </p>
                    </div>

                    <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="payment-screenshot"
                        data-testid="input-screenshot"
                      />
                      <label htmlFor="payment-screenshot" className="cursor-pointer">
                        {paymentScreenshot ? (
                          <div className="space-y-4">
                            <img 
                              src={paymentScreenshot} 
                              alt="Payment screenshot" 
                              className="max-h-48 mx-auto rounded-md"
                            />
                            <div className="flex items-center justify-center gap-2 text-green-500">
                              <CheckCircle className="w-5 h-5" />
                              <span>{fileName}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Click to upload a different screenshot
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                            <div>
                              <p className="font-medium">Upload Payment Screenshot</p>
                              <p className="text-sm text-muted-foreground">
                                Click or drag and drop your payment screenshot here
                              </p>
                            </div>
                          </div>
                        )}
                      </label>
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setStep(1)} 
                        className="flex-1"
                        data-testid="button-back-details"
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={() => setStep(3)} 
                        className="flex-1"
                        disabled={!paymentScreenshot}
                        data-testid="button-proceed-confirm"
                      >
                        Review & Confirm
                      </Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold">Confirm Registration</h3>
                      <p className="text-muted-foreground">
                        Please review your registration details
                      </p>
                    </div>

                    <div className="bg-muted p-6 rounded-lg space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contest</span>
                        <span className="font-medium">{contest.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Entry Fee</span>
                        <span className="font-medium">Rs.{contest.fee}</span>
                      </div>
                      {referralCode && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Referral Code</span>
                          <span className="font-medium">{referralCode}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Payment Screenshot</span>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Image className="w-3 h-3" />
                          Uploaded
                        </Badge>
                      </div>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                      <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-yellow-500">Payment Verification</p>
                          <p className="text-muted-foreground">
                            Your payment will be manually verified by our team. 
                            You'll receive a notification once approved (usually within 24 hours).
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setStep(2)} 
                        className="flex-1"
                        disabled={registerMutation.isPending}
                        data-testid="button-back-payment"
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={() => registerMutation.mutate()} 
                        className="flex-1"
                        disabled={registerMutation.isPending}
                        data-testid="button-confirm-register"
                      >
                        {registerMutation.isPending ? "Registering..." : "Confirm Registration"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Registration Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contest</span>
                  <span className="font-medium text-right max-w-32 truncate">{contest.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <Badge variant="outline" className="capitalize">{contest.type}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <Badge variant="secondary" className="capitalize">{contest.category}</Badge>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Entry Fee</span>
                  <span className="text-primary">Rs.{contest.fee}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
