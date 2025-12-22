import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { ArrowLeft, Save, Loader2, Plus, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Contest } from "@shared/schema";

const contestFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(["mcq", "fill_blank", "short_answer", "integer", "coding"]),
  category: z.enum(["aptitude", "gk", "coding", "hackathon"]),
  prize: z.number().min(0, "Prize cannot be negative"),
  fee: z.number().min(0, "Fee cannot be negative"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  totalMarks: z.number().min(1, "Total marks must be at least 1"),
  commissionPerRegistration: z.number().min(0, "Commission cannot be negative"),
  negativeMarking: z.boolean(),
  negativeMarkValue: z.number().min(0).max(1),
  maxParticipants: z.number().optional(),
  passingMarks: z.number().optional(),
  qrCodeUrl: z.string().optional(),
});

type ContestFormValues = z.infer<typeof contestFormSchema>;

export default function ContestForm() {
  const { id } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isEditing = !!id;
  const [prizes, setPrizes] = useState<{ rank: number; prize: number; title?: string }[]>([]);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);

  const { data: contest, isLoading } = useQuery<Contest>({
    queryKey: ["/api/admin/contests", id],
    enabled: isEditing,
  });

  const form = useForm<ContestFormValues>({
    resolver: zodResolver(contestFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "mcq",
      category: "aptitude",
      prize: 10000,
      fee: 99,
      startTime: "",
      endTime: "",
      duration: 60,
      totalMarks: 100,
      commissionPerRegistration: 10,
      negativeMarking: false,
      negativeMarkValue: 0.25,
      maxParticipants: undefined,
      passingMarks: undefined,
      qrCodeUrl: "",
    },
  });

  useEffect(() => {
    if (contest) {
      form.reset({
        title: contest.title,
        description: contest.description,
        type: contest.type,
        category: contest.category,
        prize: contest.prize,
        fee: contest.fee,
        startTime: contest.startTime.slice(0, 16),
        endTime: contest.endTime.slice(0, 16),
        duration: contest.duration,
        totalMarks: contest.totalMarks,
        commissionPerRegistration: contest.commissionPerRegistration || 0,
        negativeMarking: contest.negativeMarking,
        negativeMarkValue: contest.negativeMarkValue,
        maxParticipants: contest.maxParticipants,
        passingMarks: contest.passingMarks,
        qrCodeUrl: contest.qrCodeUrl || "",
      });
      if ((contest as any).prizes) {
        setPrizes((contest as any).prizes.slice());
      }
      if (contest.qrCodeUrl) {
        setQrPreview(contest.qrCodeUrl);
      }
    }
  }, [contest, form]);

  const createMutation = useMutation({
    mutationFn: async (data: ContestFormValues) => {
      const payload = {
        ...data,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
        prizes: prizes.length ? prizes : undefined,
        qrCodeUrl: qrPreview || (data as any).qrCodeUrl || undefined,
      };
      const res = await apiRequest("POST", "/api/admin/contests", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contests"] });
      toast({ title: "Contest created successfully!" });
      setLocation("/admin/contests");
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create contest", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ContestFormValues) => {
      const payload = {
        ...data,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
      };
      // attach prizes when editing
      if (prizes.length) {
        (payload as any).prizes = prizes;
      }
      // attach qrPreview if available (file uploaded)
      if (qrPreview) {
        (payload as any).qrCodeUrl = qrPreview;
      } else if ((data as any).qrCodeUrl) {
        (payload as any).qrCodeUrl = (data as any).qrCodeUrl;
      }
      // Debug: log payload so browser console shows what is sent
      // eslint-disable-next-line no-console
      console.log("Updating contest", id, payload);
      const res = await apiRequest("PATCH", `/api/admin/contests/${id}`, payload);
      const json = await res.json();
      // eslint-disable-next-line no-console
      console.log("Update response", json);
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contests"] });
      toast({ title: "Contest updated successfully!" });
      setLocation("/admin/contests");
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update contest", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: ContestFormValues) => {
    // Quick debug ping to ensure the submit handler is invoked
    // eslint-disable-next-line no-console
    console.log("contest-form onSubmit called", { isEditing, data });
    toast({ title: "Submitting..." });
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  // react-query versions expose either `isLoading` or `isPending` on mutations.
  const isPending = Boolean(
    (createMutation as any).isLoading || (createMutation as any).isPending ||
    (updateMutation as any).isLoading || (updateMutation as any).isPending
  );

  if (isEditing && isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/contests">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-page-title">
            {isEditing ? "Edit Contest" : "Create Contest"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? "Update contest details" : "Fill in the details to create a new contest"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
              <CardDescription>General details about the contest</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Contest Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Aptitude Challenge 2024" {...field} data-testid="input-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the contest..." 
                        rows={3}
                        {...field} 
                        data-testid="textarea-description" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
                        <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
                        <SelectItem value="short_answer">Short Answer</SelectItem>
                        <SelectItem value="integer">Integer Type</SelectItem>
                        <SelectItem value="coding">Coding</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="aptitude">Aptitude</SelectItem>
                        <SelectItem value="gk">General Knowledge</SelectItem>
                        <SelectItem value="coding">Coding</SelectItem>
                        <SelectItem value="hackathon">Hackathon</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Schedule & Duration</CardTitle>
              <CardDescription>Set when the contest takes place</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} data-testid="input-start-time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} data-testid="input-end-time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-duration" 
                      />
                    </FormControl>
                    <FormDescription>Time given to complete</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prize & Fees</CardTitle>
              <CardDescription>Financial details for the contest</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="prize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prize Pool (INR)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-prize" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Fee (INR)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-fee" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="commissionPerRegistration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Creator Commission (INR)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-commission" 
                      />
                    </FormControl>
                    <FormDescription>Per referral signup</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-3">
                <FormLabel>Prizes</FormLabel>
                <FormDescription>Define prizes per rank. Click "Add Rank" to add rows.</FormDescription>
                <div className="mt-2 space-y-2">
                  {prizes.length === 0 && (
                    <div className="text-sm text-muted-foreground">No prizes defined yet.</div>
                  )}
                  <div className="grid gap-2">
                    {prizes.map((p, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-12 text-sm font-medium">#{p.rank}</div>
                          <Input
                            type="number"
                            min={0}
                            className="w-40"
                            value={String(p.prize)}
                            onChange={(e: any) => {
                              const val = Number(e.target.value || 0);
                              setPrizes(prev => prev.map(x => x.rank === p.rank ? { ...x, prize: val } : x));
                            }}
                            aria-label={`prize-for-rank-${p.rank}`}
                          />
                          <Input
                            type="text"
                            placeholder="Title (optional)"
                            className="flex-1"
                            value={p.title || ""}
                            onChange={(e: any) => setPrizes(prev => prev.map(x => x.rank === p.rank ? { ...x, title: e.target.value } : x))}
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => setPrizes(prev => prev.filter(x => x.rank !== p.rank))}>
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                  </div>

                  <div className="flex gap-2 mt-2">
                    <Button type="button" onClick={() => setPrizes(prev => {
                      const nextRank = prev.length ? Math.max(...prev.map(p => p.rank)) + 1 : 1;
                      return [...prev, { rank: nextRank, prize: 0 }];
                    })}>
                      <Plus className="w-4 h-4 mr-2" /> Add Rank
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setPrizes([])}>Clear</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scoring</CardTitle>
              <CardDescription>Configure marks and scoring rules</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="totalMarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Marks</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-total-marks" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passingMarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passing Marks (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        value={field.value || ""}
                        onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        data-testid="input-passing-marks" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="negativeMarking"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Negative Marking</FormLabel>
                      <FormDescription>Deduct marks for wrong answers</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-negative-marking"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("negativeMarking") && (
                <FormField
                  control={form.control}
                  name="negativeMarkValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Negative Mark Fraction</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-negative-value" 
                        />
                      </FormControl>
                      <FormDescription>e.g., 0.25 means 25% of marks deducted</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment</CardTitle>
              <CardDescription>Configure payment options</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="qrCodeUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment QR Code (Optional)</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <input
                          id="qr-file"
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const f = e.target.files?.[0] || null;
                            setQrFile(f);
                            if (f) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setQrPreview(reader.result as string);
                                // also update form field value for consistency
                                field.onChange(reader.result as string);
                              };
                              reader.readAsDataURL(f);
                            } else {
                              setQrPreview(null);
                              field.onChange("");
                            }
                          }}
                          data-testid="input-qr-file"
                        />
                        {qrPreview ? (
                          <img src={qrPreview} alt="QR preview" className="max-h-40 rounded-md" />
                        ) : field.value ? (
                          <img src={field.value} alt="QR preview" className="max-h-40 rounded-md" />
                        ) : null}
                      </div>
                    </FormControl>
                    <FormDescription>Upload an image file for the payment QR code (PNG/JPG).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxParticipants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Participants (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Leave empty for unlimited"
                        {...field} 
                        value={field.value || ""}
                        onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        data-testid="input-max-participants" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4">
            <Link href="/admin/contests">
              <Button variant="outline" type="button" data-testid="button-cancel">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isPending}
              data-testid="button-submit"
              onClick={() => {
                // Debug click handler to verify button wiring even if validation blocks submit
                // eslint-disable-next-line no-console
                console.log("submit button clicked (debug)");
                const submitFn = form.handleSubmit(onSubmit);
                submitFn();
              }}
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? "Update Contest" : "Create Contest"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
