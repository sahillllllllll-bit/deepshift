import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Plus, 
  ArrowLeft, 
  Trash2, 
  Edit,
  GripVertical,
  Save,
  X,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import type { Contest, Question } from "@shared/schema";

const questionFormSchema = z.object({
  type: z.enum(["mcq", "fill_blank", "short_answer", "integer", "coding"]),
  questionText: z.string().min(5, "Question must be at least 5 characters"),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  marks: z.number().min(1, "Marks must be at least 1"),
  explanation: z.string().optional(),
  order: z.number().min(1),
});

type QuestionFormValues = z.infer<typeof questionFormSchema>;

const typeLabels: Record<string, string> = {
  mcq: "Multiple Choice",
  fill_blank: "Fill in the Blank",
  short_answer: "Short Answer",
  integer: "Integer Type",
  coding: "Coding",
};

export default function AdminQuestions() {
  const { id: contestId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [mcqOptions, setMcqOptions] = useState<string[]>(["", "", "", ""]);

  const { data: contest, isLoading: contestLoading } = useQuery<Contest>({
    queryKey: ["/api/admin/contests", contestId],
    enabled: !!contestId,
  });

  const { data: questions, isLoading: questionsLoading } = useQuery<Question[]>({
    queryKey: ["/api/admin/contests", contestId, "questions"],
    enabled: !!contestId,
  });

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      type: "mcq",
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      marks: 1,
      explanation: "",
      order: (questions?.length || 0) + 1,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: QuestionFormValues) => {
      const payload = {
        type: data.type,
        questionText: data.questionText,
        options: data.type === "mcq" ? mcqOptions.filter(o => o.trim()) : undefined,
        correctAnswer: data.correctAnswer,
        marks: data.marks,
        explanation: data.explanation,
        order: data.order,
      };
      const res = await apiRequest("POST", `/api/admin/contests/${contestId}/questions`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contests", contestId, "questions"] });
      toast({ title: "Question added successfully!" });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add question", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: QuestionFormValues) => {
      const payload = {
        type: data.type,
        questionText: data.questionText,
        options: data.type === "mcq" ? mcqOptions.filter(o => o.trim()) : undefined,
        correctAnswer: data.correctAnswer,
        marks: data.marks,
        explanation: data.explanation,
        order: data.order,
      };
      const res = await apiRequest("PATCH", `/api/admin/questions/${editingQuestion?.id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contests", contestId, "questions"] });
      toast({ title: "Question updated successfully!" });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update question", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/questions/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contests", contestId, "questions"] });
      toast({ title: "Question deleted" });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete question", description: error.message, variant: "destructive" });
    },
  });

  const openAddDialog = () => {
    setEditingQuestion(null);
    form.reset({
      type: contest?.type || "mcq",
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      marks: 1,
      explanation: "",
      order: (questions?.length || 0) + 1,
    });
    setMcqOptions(["", "", "", ""]);
    setIsDialogOpen(true);
  };

  const openEditDialog = (question: Question) => {
    setEditingQuestion(question);
    form.reset({
      type: question.type,
      questionText: (question as any).questionText || (question as any).question || "",
      options: question.options || ["", "", "", ""],
      correctAnswer: question.correctAnswer,
      marks: question.marks,
      explanation: question.explanation || "",
      order: question.order,
    });
    setMcqOptions(question.options || ["", "", "", ""]);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingQuestion(null);
    form.reset();
    setMcqOptions(["", "", "", ""]);
  };

  const onSubmit = (data: QuestionFormValues) => {
    if (editingQuestion) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  // react-query versions expose either `isLoading` or `isPending` for mutation busy state
  const isPending = Boolean(
    (createMutation as any).isLoading || (createMutation as any).isPending ||
    (updateMutation as any).isLoading || (updateMutation as any).isPending
  );
  const isLoading = contestLoading || questionsLoading;

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/contests">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-page-title">
              Questions
            </h1>
            <p className="text-muted-foreground mt-1">
              {contest?.title} - {questions?.length || 0} questions
            </p>
          </div>
        </div>
        <Button onClick={openAddDialog} data-testid="button-add-question">
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {questions && questions.length > 0 ? (
            <div className="divide-y">
              {questions.map((question, idx) => (
                <div 
                  key={question.id} 
                  className="p-4 flex items-start gap-4"
                  data-testid={`question-item-${idx}`}
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical className="w-4 h-4" />
                    <span className="font-mono text-sm">{question.order}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <Badge variant="outline" className="shrink-0">
                        {typeLabels[question.type]}
                      </Badge>
                      <Badge variant="secondary" className="shrink-0">
                        {question.marks} marks
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm">{(question as any).questionText || (question as any).question}</p>
                    {question.type === "mcq" && question.options && (
                      <div className="mt-2 space-y-1">
                        {question.options.map((opt, optIdx) => (
                          <div 
                            key={optIdx} 
                            className={`text-xs px-2 py-1 rounded ${
                              opt === question.correctAnswer 
                                ? "bg-green-500/20 text-green-400" 
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </div>
                        ))}
                      </div>
                    )}
                    {question.type !== "mcq" && (
                      <p className="mt-2 text-xs text-green-400">
                        Answer: {question.correctAnswer}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => openEditDialog(question)}
                      data-testid={`button-edit-${idx}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive"
                      onClick={() => setDeleteId(question.id)}
                      data-testid={`button-delete-${idx}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No questions added yet</p>
              <Button onClick={openAddDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Question
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Edit Question" : "Add Question"}</DialogTitle>
            <DialogDescription>
              {editingQuestion ? "Update the question details" : "Add a new question to this contest"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-question-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="mcq">Multiple Choice</SelectItem>
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="marks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marks</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                            data-testid="input-marks" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                            data-testid="input-order" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="questionText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Text</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={3} 
                        placeholder="Enter your question..." 
                        {...field} 
                        data-testid="textarea-question" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("type") === "mcq" && (
                <div className="space-y-3">
                  <FormLabel>Options</FormLabel>
                  {mcqOptions.map((option, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 text-center font-medium">{String.fromCharCode(65 + idx)}.</span>
                      <Input
                        value={option}
                        onChange={e => {
                          const newOptions = [...mcqOptions];
                          newOptions[idx] = e.target.value;
                          setMcqOptions(newOptions);
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        data-testid={`input-option-${idx}`}
                      />
                    </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setMcqOptions([...mcqOptions, ""])}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Option
                  </Button>
                </div>
              )}

              <FormField
                control={form.control}
                name="correctAnswer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correct Answer</FormLabel>
                    <FormControl>
                      {form.watch("type") === "mcq" ? (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger data-testid="select-correct-answer">
                            <SelectValue placeholder="Select correct option" />
                          </SelectTrigger>
                          <SelectContent>
                            {mcqOptions.filter(o => o.trim()).map((option, idx) => (
                              <SelectItem key={idx} value={option}>
                                {String.fromCharCode(65 + idx)}. {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input {...field} placeholder="Enter correct answer" data-testid="input-correct-answer" />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="explanation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Explanation (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={2} 
                        placeholder="Explain the answer..." 
                        {...field} 
                        data-testid="textarea-explanation" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} data-testid="button-save-question">
                  {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Save className="w-4 h-4 mr-2" />
                  {editingQuestion ? "Update" : "Add"} Question
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The question will be permanently removed.
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
