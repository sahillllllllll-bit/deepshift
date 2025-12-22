import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertTriangle, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  Circle,
  Maximize,
  AlertCircle,
  Eye,
  Send
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface Question {
  id: string;
  contestId: string;
  type: "mcq" | "fill_blank" | "short_answer" | "integer" | "coding";
  questionText: string;
  options?: string[];
  marks: number;
  order: number;
}

interface Contest {
  id: string;
  title: string;
  duration: number;
  totalMarks: number;
  negativeMarking: boolean;
  negativeMarkValue: number;
  startTime: string;
  endTime: string;
}

export default function ContestAttempt() {
  const { contestId } = useParams<{ contestId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(true);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const { data, isLoading, error } = useQuery<{
    contest: Contest;
    questions: Question[];
    registration: any;
  }>({
    queryKey: ["/api/student/contests", contestId, "questions"],
    enabled: isAuthenticated && !!contestId,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/student/contests/${contestId}/submit`, { answers, tabSwitchCount });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Contest Submitted",
        description: "Your answers have been submitted successfully!",
      });
      exitFullscreen();
      setLocation("/dashboard/results");
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      setShowFullscreenPrompt(false);
    } catch (err) {
      toast({
        title: "Fullscreen Required",
        description: "Please enable fullscreen to take the contest",
        variant: "destructive",
      });
    }
  }, [toast]);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setIsFullscreen(false);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);
      if (!isNowFullscreen && !showFullscreenPrompt && data) {
        setShowFullscreenPrompt(true);
        setTabSwitchCount(prev => prev + 1);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [showFullscreenPrompt, data]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isFullscreen && data) {
        setTabSwitchCount(prev => prev + 1);
        setShowTabWarning(true);
        setTimeout(() => setShowTabWarning(false), 5000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isFullscreen, data]);

  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      if (isFullscreen) {
        e.preventDefault();
        toast({
          title: "Copy Disabled",
          description: "Copying is not allowed during the contest",
          variant: "destructive",
        });
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (isFullscreen) {
        e.preventDefault();
        toast({
          title: "Paste Disabled",
          description: "Pasting is not allowed during the contest",
          variant: "destructive",
        });
      }
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (isFullscreen) {
        if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "v" || e.key === "a")) {
          e.preventDefault();
        }
        if (e.key === "PrintScreen") {
          e.preventDefault();
        }
      }
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("keydown", handleKeydown);
    
    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [isFullscreen, toast]);

  useEffect(() => {
    if (!data?.contest) return;

    const endTime = new Date(data.contest.endTime).getTime();
    
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        submitMutation.mutate();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [data?.contest]);

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading contest...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Cannot Access Contest</h2>
            <p className="text-muted-foreground mb-4">
              {(error as Error)?.message || "You may not be registered or the contest is not available."}
            </p>
            <Button onClick={() => setLocation("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { contest, questions } = data;
  const question = questions[currentQuestion];
  const answeredCount = Object.keys(answers).filter(id => answers[id]?.trim()).length;
  const progress = (answeredCount / questions.length) * 100;

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (!timeRemaining) return "text-foreground";
    if (timeRemaining < 600) return "text-red-500";
    if (timeRemaining < 1800) return "text-yellow-500";
    return "text-green-500";
  };

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [question.id]: value }));
  };

  const handleSubmit = () => {
    setShowSubmitConfirm(true);
  };

  const confirmSubmit = () => {
    setShowSubmitConfirm(false);
    submitMutation.mutate();
  };

  return (
    <>
      <AlertDialog open={showFullscreenPrompt} onOpenChange={setShowFullscreenPrompt}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Maximize className="w-5 h-5" />
              Fullscreen Mode Required
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                This contest requires fullscreen mode to ensure a fair examination environment.
              </p>
              <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span>Exiting fullscreen will be recorded</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span>Tab switches will be tracked</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span>Copy/paste is disabled</span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLocation("/dashboard")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={enterFullscreen}>
              Enter Fullscreen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <AlertDialogContent className="max-w-md z-[9999]">
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Contest?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {answeredCount} out of {questions.length} questions.
              {answeredCount < questions.length && (
                <span className="block mt-2 text-yellow-500">
                  Warning: {questions.length - answeredCount} questions are unanswered!
                </span>
              )}
              <span className="block mt-2">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowSubmitConfirm(false)}>
              Continue Answering
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit} disabled={submitMutation.isPending}>
              {submitMutation.isPending ? "Submitting..." : "Submit Contest"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="min-h-screen bg-background select-none" onContextMenu={e => e.preventDefault()}>
        {showTabWarning && (
          <div className="fixed top-0 left-0 right-0 bg-red-600 text-white py-2 px-4 z-50 flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Tab switch detected! This has been recorded. Violations: {tabSwitchCount}</span>
          </div>
        )}

        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <h1 className="font-bold text-lg md:text-xl truncate max-w-xs" data-testid="text-contest-title">
                  {contest.title}
                </h1>
                {tabSwitchCount > 0 && (
                  <Badge variant="destructive" className="hidden md:flex">
                    <Eye className="w-3 h-3 mr-1" />
                    {tabSwitchCount} violations
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <div className={`text-2xl md:text-3xl font-bold tabular-nums ${getTimerColor()}`} data-testid="text-timer">
                  <Clock className="w-5 h-5 inline-block mr-2" />
                  {timeRemaining !== null ? formatTime(timeRemaining) : "--:--:--"}
                </div>
                <Button 
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                  data-testid="button-submit-contest"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit
                </Button>
              </div>
            </div>
            
            <div className="mt-3 flex items-center gap-2">
              <Progress value={progress} className="flex-1" />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {answeredCount}/{questions.length} answered
              </span>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Q{currentQuestion + 1}</Badge>
                    <Badge variant="secondary">{question.type.toUpperCase()}</Badge>
                    <Badge>{question.marks} marks</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-lg leading-relaxed" data-testid="text-question">
                    {question.questionText}
                  </div>

                  {question.type === "mcq" && question.options && (
                    <RadioGroup
                      value={answers[question.id] || ""}
                      onValueChange={handleAnswer}
                      className="space-y-3"
                    >
                      {question.options.map((option, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-3 p-4 rounded-md border hover-elevate cursor-pointer"
                          onClick={() => handleAnswer(option)}
                          data-testid={`option-${idx}`}
                        >
                          <RadioGroupItem value={option} id={`option-${idx}`} />
                          <Label htmlFor={`option-${idx}`} className="cursor-pointer flex-1">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {question.type === "integer" && (
                    <Input
                      type="number"
                      placeholder="Enter your answer"
                      value={answers[question.id] || ""}
                      onChange={e => handleAnswer(e.target.value)}
                      className="max-w-xs"
                      data-testid="input-integer-answer"
                    />
                  )}

                  {question.type === "fill_blank" && (
                    <Input
                      type="text"
                      placeholder="Fill in the blank"
                      value={answers[question.id] || ""}
                      onChange={e => handleAnswer(e.target.value)}
                      className="max-w-md"
                      data-testid="input-fill-blank"
                    />
                  )}

                  {question.type === "short_answer" && (
                    <Textarea
                      placeholder="Write your answer"
                      value={answers[question.id] || ""}
                      onChange={e => handleAnswer(e.target.value)}
                      rows={4}
                      data-testid="textarea-short-answer"
                    />
                  )}

                  {question.type === "coding" && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Write your code here..."
                        value={answers[question.id] || ""}
                        onChange={e => handleAnswer(e.target.value)}
                        rows={12}
                        className="font-mono text-sm"
                        data-testid="textarea-code"
                      />
                      <p className="text-sm text-muted-foreground">
                        Write your solution code above
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                  data-testid="button-previous"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <span className="text-muted-foreground">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                  disabled={currentQuestion === questions.length - 1}
                  data-testid="button-next"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Question Palette</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, idx) => (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestion(idx)}
                        className={`w-10 h-10 rounded-md flex items-center justify-center text-sm font-medium transition-colors ${
                          currentQuestion === idx
                            ? "bg-primary text-primary-foreground"
                            : answers[q.id]?.trim()
                            ? "bg-green-600 text-white"
                            : "bg-muted hover-elevate"
                        }`}
                        data-testid={`question-nav-${idx}`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-600" />
                      <span>Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-muted" />
                      <span>Not Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-primary" />
                      <span>Current</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="fixed bottom-4 left-4 flex items-center gap-2 z-50">
          <div className="w-12 h-12 rounded-full border-2 border-red-500 bg-muted flex items-center justify-center animate-pulse">
            <Eye className="w-6 h-6 text-red-500" />
          </div>
          <span className="text-xs text-muted-foreground">Recording</span>
        </div>
      </div>
    </>
  );
}
