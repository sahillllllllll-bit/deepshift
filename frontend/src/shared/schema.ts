import { z } from "zod";

// ---------- Auth / Signup Schemas ----------
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const studentSignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  college: z.string().min(2, "College name is required"),
  referralCode: z.string().optional(),
});

export const creatorSignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(6).optional(),
});

export const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type StudentSignupInput = z.infer<typeof studentSignupSchema>;
export type CreatorSignupInput = z.infer<typeof creatorSignupSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

// ---------- User / Domain Types (zod-backed) ----------
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string(),
  name: z.string(),
  role: z.enum(["student", "creator", "admin"]),
  college: z.string().optional(),
  phone: z.string().optional(),
  upiId: z.string().optional(),
  avatar: z.string().optional(),
  referralCode: z.string().optional(),
  referredBy: z.string().optional(),
  createdAt: z.string().optional(),
});

export type UserRole = z.infer<typeof userSchema.shape.role>;

export const insertUserSchema = userSchema.omit({ id: true, createdAt: true }).extend({
  password: z.string().min(6),
  role: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// ---------- Contest Schemas ----------
export const contestSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.enum(["mcq", "fill_blank", "short_answer", "integer", "coding"]),
  category: z.enum(["aptitude", "gk", "coding", "hackathon"]),
  prize: z.number(),
  prizes: z.array(z.object({ rank: z.number(), prize: z.number(), title: z.string().optional() })).optional(),
  fee: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  duration: z.number(),
  maxParticipants: z.number().optional(),
  status: z.enum(["upcoming", "live", "completed"]),
  qrCodeUrl: z.string().optional(),
  commissionPerRegistration: z.number().optional(),
  negativeMarking: z.boolean().optional(),
  negativeMarkValue: z.number().optional(),
  totalMarks: z.number(),
  passingMarks: z.number().optional(),
  createdAt: z.string().optional(),
});

export const insertContestSchema = contestSchema.omit({ id: true, createdAt: true, status: true });
export type Contest = z.infer<typeof contestSchema>;
export type InsertContest = z.infer<typeof insertContestSchema>;

// ---------- Question Schemas ----------
export const questionSchema = z.object({
  id: z.string(),
  contestId: z.string(),
  type: z.enum(["mcq", "fill_blank", "short_answer", "integer", "coding"]),
  questionText: z.string(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
  marks: z.number(),
  explanation: z.string().optional(),
  testCases: z.array(z.object({ input: z.string(), expectedOutput: z.string() })).optional(),
  order: z.number(),
});

export const insertQuestionSchema = questionSchema.omit({ id: true });
export type Question = z.infer<typeof questionSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

// ---------- Registration Schemas ----------
export type PaymentStatus = "pending" | "approved" | "rejected";

export const registrationSchema = z.object({
  id: z.string(),
  contestId: z.string(),
  userId: z.string(),
  paymentScreenshot: z.string().optional(),
  paymentStatus: z.enum(["pending", "approved", "rejected"]),
  referralCode: z.string().optional(),
  registeredAt: z.string(),
  approvedAt: z.string().optional(),
});

export const insertRegistrationSchema = registrationSchema.omit({ id: true, registeredAt: true, approvedAt: true, paymentStatus: true });
export type Registration = z.infer<typeof registrationSchema>;
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;

// ---------- Attempt Schemas ----------
export const attemptSchema = z.object({
  id: z.string(),
  contestId: z.string(),
  userId: z.string(),
  answers: z.record(z.string(), z.string()).optional(),
  startedAt: z.string(),
  submittedAt: z.string().optional(),
  autoSubmitted: z.boolean().optional(),
  tabSwitchCount: z.number().optional(),
  score: z.number().optional(),
  rank: z.number().optional(),
});

export const insertAttemptSchema = attemptSchema.omit({ id: true, startedAt: true, score: true, rank: true });
export type Attempt = z.infer<typeof attemptSchema>;
export type InsertAttempt = z.infer<typeof insertAttemptSchema>;

// ---------- Result Schemas ----------
export const resultSchema = z.object({
  id: z.string(),
  contestId: z.string(),
  userId: z.string(),
  score: z.number(),
  rank: z.number(),
  totalQuestions: z.number().optional(),
  correctAnswers: z.number().optional(),
  wrongAnswers: z.number().optional(),
  unanswered: z.number().optional(),
  prize: z.number().optional(),
  isWinner: z.boolean().optional(),
  publishedAt: z.string().optional(),
  timeTakenSeconds: z.number().optional(),
  answers: z.record(z.string(), z.string()).optional(),
  tabSwitchCount: z.number().optional(),
});

export const insertResultSchema = resultSchema.omit({ id: true, publishedAt: true });
export type Result = z.infer<typeof resultSchema>;
export type InsertResult = z.infer<typeof insertResultSchema>;

// ---------- Earnings & Withdrawals ----------
export const earningSchema = z.object({
  id: z.string(),
  creatorId: z.string(),
  registrationId: z.string(),
  contestId: z.string(),
  amount: z.number(),
  earnedAt: z.string().optional(),
});
export const withdrawalSchema = z.object({
  id: z.string(),
  creatorId: z.string(),
  amount: z.number(),
  paymentMethod: z.enum(["upi", "bank"]),
  upiId: z.string().optional(),
  bankDetails: z.object({ accountNumber: z.string(), ifscCode: z.string(), accountHolder: z.string() }).optional(),
  status: z.enum(["pending", "approved", "rejected"]),
  requestedAt: z.string().optional(),
  processedAt: z.string().optional(),
});

export type Earning = z.infer<typeof earningSchema>;
export type Withdrawal = z.infer<typeof withdrawalSchema>;

// ---------- Stats ----------
export interface StudentStats {
  contestsJoined: number;
  upcomingContests: number;
  totalWinnings: number;
  bestRank: number | null;
}

export interface AdminStats {
  totalStudents: number;
  totalContests: number;
  activeContests: number;
  totalRevenue: number;
  pendingPayments: number;
  totalCreators: number;
}

export interface CreatorStats {
  totalEarnings: number;
  pendingWithdrawals: number;
  totalReferrals: number;
  availableBalance: number;
}

// ---------- Misc ----------
export interface ApiError { message: string; code?: string }

export interface AuthResponse { user: Omit<User, "password">; accessToken: string; refreshToken: string }

