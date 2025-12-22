import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { RegistrationModel } from "./models";
import type { AuthRequest } from "./types/auth-request";

import {
  loginSchema,
  studentSignupSchema,
  creatorSignupSchema,
  adminLoginSchema,
  insertContestSchema,
  insertQuestionSchema,
} from "./shared/schema";

const JWT_SECRET = process.env.SESSION_SECRET || "deepshift-secret-key-2024";
const JWT_REFRESH_SECRET = JWT_SECRET + "-refresh";




function generateTokens(user: { id: string; email: string; role: string }) {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
}

function authMiddleware(allowedRoles?: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };

      if (allowedRoles && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      req.user = decoded;
      next();
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ============ AUTH ROUTES ============

  // Student Signup
  app.post("/api/auth/student/signup", async (req, res) => {
    try {
      const data = studentSignupSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const user = await storage.createUser({
        ...data,
        role: "student",
      });

      // Handle referral
      if (data.referralCode) {
        const creator = (await storage.getUsers("creator")).find(
          c => c.referralCode === data.referralCode
        );
        if (creator) {
          await storage.updateUser(user.id, { referredBy: creator.id });
        }
      }

      const { password, ...userWithoutPassword } = user;
      const tokens = generateTokens(user);

      res.json({
        user: userWithoutPassword,
        ...tokens,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Signup failed";
      res.status(400).json({ message });
    }
  });

  // Student Login
  app.post("/api/auth/student/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(data.email);
      if (!user || user.role !== "student") {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(data.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const { password, ...userWithoutPassword } = user;
      const tokens = generateTokens(user);

      res.json({
        user: userWithoutPassword,
        ...tokens,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login failed";
      res.status(400).json({ message });
    }
  });

  // Admin Login
  app.post("/api/auth/admin/login", async (req, res) => {
    try {
      const data = adminLoginSchema.parse(req.body);
      
      if (data.username !== "sahil") {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      const admin = await storage.getUserByUsername("sahil");
      if (!admin) {
        return res.status(401).json({ message: "Admin not found" });
      }

      const validPassword = await bcrypt.compare(data.password, admin.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      const { password, ...adminWithoutPassword } = admin;
      const tokens = generateTokens(admin);

      res.json({
        user: adminWithoutPassword,
        ...tokens,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login failed";
      res.status(400).json({ message });
    }
  });

  // Creator Signup
  app.post("/api/auth/creator/signup", async (req, res) => {
    try {
      const data = creatorSignupSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const user = await storage.createUser({
        ...data,
        role: "creator",
      });

      const { password, ...userWithoutPassword } = user;
      const tokens = generateTokens(user);

      res.json({
        user: userWithoutPassword,
        ...tokens,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Signup failed";
      res.status(400).json({ message });
    }
  });

  // Creator Login
  app.post("/api/auth/creator/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(data.email);
      if (!user || user.role !== "creator") {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(data.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const { password, ...userWithoutPassword } = user;
      const tokens = generateTokens(user);

      res.json({
        user: userWithoutPassword,
        ...tokens,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login failed";
      res.status(400).json({ message });
    }
  });

  // Token Refresh
  app.post("/api/auth/refresh", async (req, res) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token required" });
      }

      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { id: string };
      const user = await storage.getUser(decoded.id);
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const tokens = generateTokens(user);
      const { password, ...userWithoutPassword } = user;
      
      res.json({
        user: userWithoutPassword,
        ...tokens,
      });
    } catch {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
  });

  // ============ CONTEST ROUTES (PUBLIC) ============

  app.get("/api/contests", async (req, res) => {
    try {
      const contests = await storage.getContests();

      // Efficiently compute participant counts for the returned contests in one aggregation
      const contestIds = contests.map(c => c.id);
      const countsAgg = await RegistrationModel.aggregate([
        { $match: { contestId: { $in: contestIds } } },
        { $group: { _id: "$contestId", count: { $sum: 1 } } }
      ]).allowDiskUse(true);

      const countsMap: Record<string, number> = {};
      for (const item of countsAgg) countsMap[item._id] = item.count || 0;

      const enriched = contests.map(c => ({ ...c, participantCount: countsMap[c.id] || 0 }));
      res.json(enriched);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contests" });
    }
  });

  app.get("/api/contests/completed", async (req, res) => {
    try {
      const contests = await storage.getContests("completed");
      res.json(contests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contests" });
    }
  });

  app.get("/api/contests/:id", async (req, res) => {
    try {
      const contest = await storage.getContest(req.params.id);
      if (!contest) {
        return res.status(404).json({ message: "Contest not found" });
      }

      // Include questions count
      const questions = await storage.getQuestions(contest.id);
      const questionsCount = Array.isArray(questions) ? questions.length : 0;

      // Optionally include registration status if token provided
      let registration = null;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          const token = authHeader.split(" ")[1];
          const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
          const regs = await storage.getRegistrations({ userId: decoded.id, contestId: contest.id });
          registration = regs && regs.length ? regs[0] : null;
        } catch {
          // ignore invalid token - return public contest data
          registration = null;
        }
      }

      res.json({ ...contest, questionsCount, registration });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contest" });
    }
  });

  // Public: Get registration count for a contest
  app.get("/api/contests/:id/registrations-count", async (req, res) => {
    try {
      const contestId = req.params.id;
      const count = await RegistrationModel.countDocuments({ contestId });
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch registration count" });
    }
  });

  // Public: Get published results for a contest (visible after admin publishes)
  app.get("/api/contests/:id/results", async (req, res) => {
    try {
      const contestId = req.params.id;
      const results = await storage.getResults({ contestId });
      const published = results.filter(r => !!r.publishedAt);

      const enriched = await Promise.all(published.map(async result => {
        const user = await storage.getUser(result.userId);
        return {
          ...result,
          userName: user?.name,
          userCollege: user?.college,
        };
      }));

      res.json(enriched);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contest results" });
    }
  });

  // ============ STUDENT ROUTES ============

  app.get("/api/student/stats", authMiddleware(["student"]), async (req: AuthRequest, res) => {
    try {
      const stats = await storage.getStudentStats(req.user!.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/student/registrations", authMiddleware(["student"]), async (req: AuthRequest, res) => {
    try {
      const registrations = await storage.getRegistrations({ userId: req.user!.id });
      
      // Enrich with contest data
      const enriched = await Promise.all(registrations.map(async reg => {
        const contest = await storage.getContest(reg.contestId);
        return { ...reg, contest };
          // Attach any existing attempt for this user+contest so frontend
        // can determine submitted/in-progress state.
        const attempt = await storage.getAttemptByUserAndContest(reg.userId, reg.contestId);
        return { ...reg, contest, attempt };
      }));
      
      res.json(enriched);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  app.get("/api/student/results", authMiddleware(["student"]), async (req: AuthRequest, res) => {
    try {
      let results = await storage.getResults({ userId: req.user!.id });
      // do not show results until admin publishes them
      results = results.filter(r => !!r.publishedAt);
      
      // Enrich with contest data
      const enriched = await Promise.all(results.map(async result => {
        const contest = await storage.getContest(result.contestId);
        return { 
          ...result, 
          contestTitle: contest?.title,
          contestCategory: contest?.category,
        };
      }));
      
      res.json(enriched);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  app.patch("/api/student/profile", authMiddleware(["student"]), async (req: AuthRequest, res) => {
    try {
      const { name, college, phone, upiId } = req.body;
      const updated = await storage.updateUser(req.user!.id, { name, college, phone, upiId });
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = updated;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Student contest registration with payment
  app.post("/api/student/register/:contestId", authMiddleware(["student"]), async (req: AuthRequest, res) => {
    try {
      const { contestId } = req.params;
      const { referralCode, paymentScreenshot } = req.body;
      
      const contest = await storage.getContest(contestId);
      if (!contest) {
        return res.status(404).json({ message: "Contest not found" });
      }

      // Check if already registered
      const existingRegs = await storage.getRegistrations({ userId: req.user!.id, contestId });
      if (existingRegs.length > 0) {
        return res.status(400).json({ message: "Already registered for this contest" });
      }

      const registration = await storage.createRegistration({
        userId: req.user!.id,
        contestId,
        referralCode: referralCode || undefined,
        paymentScreenshot: paymentScreenshot || undefined,
      });

      res.json(registration);
    } catch (error) {
      res.status(500).json({ message: "Failed to register for contest" });
    }
  });

  // Upload payment screenshot
  app.post("/api/student/registrations/:id/upload-payment", authMiddleware(["student"]), async (req: AuthRequest, res) => {
    try {
      const { paymentScreenshot } = req.body;
      
      if (!paymentScreenshot) {
        return res.status(400).json({ message: "Payment screenshot is required" });
      }

      const registration = await storage.getRegistration(req.params.id);
      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }

      if (registration.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updated = await storage.updateRegistration(req.params.id, {
        paymentScreenshot,
        paymentStatus: "pending",
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to upload payment" });
    }
  });

  // Get contest questions for attempt
  app.get("/api/student/contests/:contestId/questions", authMiddleware(["student"]), async (req: AuthRequest, res) => {
    try {
      const { contestId } = req.params;
      
      // Check if student is registered and payment approved
      const registrations = await storage.getRegistrations({ userId: req.user!.id, contestId });
      const registration = registrations[0];
      
      if (!registration || registration.paymentStatus !== "approved") {
        return res.status(403).json({ message: "Payment not approved or not registered" });
      }

      const contest = await storage.getContest(contestId);
      if (!contest) {
        return res.status(404).json({ message: "Contest not found" });
      }

      // Check if contest is live
      const now = new Date();
      const startTime = new Date(contest.startTime);
      const endTime = new Date(contest.endTime);
      
      if (now < startTime) {
        return res.status(403).json({ message: "Contest has not started yet" });
      }
      
      if (now > endTime) {
        return res.status(403).json({ message: "Contest has ended" });
      }

      const questions = await storage.getQuestions(contestId);
      
      // Remove correct answers for security
      const sanitizedQuestions = questions.map(q => ({
        id: q.id,
        contestId: q.contestId,
        type: q.type,
        questionText: q.questionText,
        options: q.options,
        marks: q.marks,
        order: q.order,
        // Don't send correctAnswer, testCases, sampleInput, sampleOutput for security
      }));

      res.json({
        contest,
        questions: sanitizedQuestions,
        registration,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Submit contest answers
  app.post("/api/student/contests/:contestId/submit", authMiddleware(["student"]), async (req: AuthRequest, res) => {
    try {
      const { contestId } = req.params;
      const { answers, tabSwitchCount } = req.body;
      
      // Verify registration
      const registrations = await storage.getRegistrations({ userId: req.user!.id, contestId });
      const registration = registrations[0];
      
      if (!registration || registration.paymentStatus !== "approved") {
        return res.status(403).json({ message: "Not authorized to submit" });
      }

      const contest = await storage.getContest(contestId);
      if (!contest) {
        return res.status(404).json({ message: "Contest not found" });
      }

      const questions = await storage.getQuestions(contestId);
      
      // Calculate score
      let score = 0;
      const questionResults: Record<string, { correct: boolean; marks: number }> = {};
      
      for (const question of questions) {
        const userAnswer = answers[question.id];
        let isCorrect = false;
        
        if (userAnswer && question.correctAnswer) {
          if (question.type === "mcq") {
            isCorrect = userAnswer === question.correctAnswer;
          } else if (question.type === "integer") {
            isCorrect = parseInt(userAnswer) === parseInt(question.correctAnswer);
          } else if (question.type === "fill_blank" || question.type === "short_answer") {
            isCorrect = userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
          }
        }
        
        if (isCorrect) {
          score += question.marks;
          questionResults[question.id] = { correct: true, marks: question.marks };
        } else if (userAnswer && contest.negativeMarking) {
          score -= question.marks * (contest.negativeMarkValue || 0);
          questionResults[question.id] = { correct: false, marks: -question.marks * (contest.negativeMarkValue || 0) };
        } else {
          questionResults[question.id] = { correct: false, marks: 0 };
        }
      }

      // Compute total and use a robust summary by comparing answers map
      const totalQuestions = questions.length;
      const computedCorrect = Object.values(questionResults).filter(r => r.correct).length;
      const computedAnswered = Object.keys(answers || {}).filter(k => (answers[k] || "").toString().trim() !== "").length;
      const computedUnanswered = Math.max(0, totalQuestions - computedAnswered);
      const computedWrong = Math.max(0, computedAnswered - computedCorrect);

      // Create result (include required summary fields)
      // compute time taken from attempt if exists
      const attempt = await storage.getAttemptByUserAndContest(req.user!.id, contestId);
      let timeTakenSeconds: number | undefined = undefined;
      if (attempt) {
        const submittedAt = new Date().toISOString();
        const started = new Date(attempt.startedAt).getTime();
        const taken = Math.max(0, new Date(submittedAt).getTime() - started);
        timeTakenSeconds = Math.floor(taken / 1000);
        await storage.updateAttempt(attempt.id, { submittedAt: submittedAt, score: Math.max(0, score) });
      }

      const result = await storage.createResult({
        userId: req.user!.id,
        contestId,
        score: Math.max(0, score),
        answers: answers,
        tabSwitchCount: tabSwitchCount || 0,
        rank: 0,
        totalQuestions: totalQuestions,
        correctAnswers: computedCorrect,
        wrongAnswers: computedWrong,
        unanswered: computedUnanswered,
        timeTakenSeconds,
      });

      res.json({
        result,
        questionResults,
        message: "Submission successful",
      });
    } catch (error) {
      console.error("Error submitting answers:", error);
      res.status(500).json({ message: "Failed to submit answers" });
    }
  });

  // ============ ADMIN ROUTES ============

  app.get("/api/admin/stats", authMiddleware(["admin"]), async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/contests", authMiddleware(["admin"]), async (req, res) => {
    try {
      const contests = await storage.getContests();
      res.json(contests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contests" });
    }
  });

  app.get("/api/admin/contests/recent", authMiddleware(["admin"]), async (req, res) => {
    try {
      const contests = await storage.getRecentContests(5);
      res.json(contests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contests" });
    }
  });

  app.post("/api/admin/contests", authMiddleware(["admin"]), async (req, res) => {
    try {
      const data = insertContestSchema.parse(req.body);
      const contest = await storage.createContest(data);
      res.json(contest);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create contest";
      res.status(400).json({ message });
    }
  });

  app.patch("/api/admin/contests/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
      // Log incoming update for debugging
      console.log(`PATCH /api/admin/contests/${req.params.id} payload: ${JSON.stringify(req.body)}`);
      const contest = await storage.updateContest(req.params.id, req.body);
      console.log(`Update result for ${req.params.id}: ${contest ? "ok" : "not-found"}`);
      if (!contest) {
        return res.status(404).json({ message: "Contest not found" });
      }
      res.json(contest);
    } catch (error) {
      res.status(500).json({ message: "Failed to update contest" });
    }
  });

  app.delete("/api/admin/contests/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
      const deleted = await storage.deleteContest(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Contest not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete contest" });
    }
  });

  app.get("/api/admin/payments", authMiddleware(["admin"]), async (req, res) => {
    try {
      const registrations = await storage.getRegistrations();
      
      // Enrich with user and contest data
      const enriched = await Promise.all(registrations.map(async reg => {
        const user = await storage.getUser(reg.userId);
        const contest = await storage.getContest(reg.contestId);
        return {
          ...reg,
          userName: user?.name,
          userEmail: user?.email,
          contestTitle: contest?.title,
          contestFee: contest?.fee,
        };
      }));
      
      res.json(enriched);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.get("/api/admin/payments/pending", authMiddleware(["admin"]), async (req, res) => {
    try {
      const regs = await RegistrationModel.find({ paymentStatus: "pending" }).sort({ registeredAt: -1 }).limit(5).lean();
      res.json(regs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post("/api/admin/payments/:id/approve", authMiddleware(["admin"]), async (req, res) => {
    try {
      const registration = await storage.getRegistration(req.params.id);
      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }

      const updated = await storage.updateRegistration(req.params.id, {
        paymentStatus: "approved",
        approvedAt: new Date().toISOString(),
      });

      // Handle creator commission
      if (registration.referralCode) {
        const creators = await storage.getUsers("creator");
        const creator = creators.find(c => c.referralCode === registration.referralCode);
        if (creator) {
          const contest = await storage.getContest(registration.contestId);
          if (contest && (contest.commissionPerRegistration ?? 0) > 0) {
            await storage.createEarning({
              creatorId: creator.id,
              registrationId: registration.id,
              contestId: registration.contestId,
              amount: contest.commissionPerRegistration || 0,
              earnedAt: new Date().toISOString(),
            });
          }
        }
      }

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve payment" });
    }
  });

  app.post("/api/admin/payments/:id/reject", authMiddleware(["admin"]), async (req, res) => {
    try {
      const updated = await storage.updateRegistration(req.params.id, {
        paymentStatus: "rejected",
      });
      if (!updated) {
        return res.status(404).json({ message: "Registration not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to reject payment" });
    }
  });

  // Question management
  app.get("/api/admin/contests/:contestId/questions", authMiddleware(["admin"]), async (req, res) => {
    try {
      const questions = await storage.getQuestions(req.params.contestId);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.post("/api/admin/contests/:contestId/questions", authMiddleware(["admin"]), async (req, res) => {
    try {
      const data = insertQuestionSchema.parse({
        ...req.body,
        contestId: req.params.contestId,
      });
      const question = await storage.createQuestion(data);
      res.json(question);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create question";
      res.status(400).json({ message });
    }
  });

  app.patch("/api/admin/questions/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
      const question = await storage.updateQuestion(req.params.id, req.body);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      res.json(question);
    } catch (error) {
      res.status(500).json({ message: "Failed to update question" });
    }
  });

  app.delete("/api/admin/questions/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
      const deleted = await storage.deleteQuestion(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Question not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete question" });
    }
  });

  // Get single contest for admin
  app.get("/api/admin/contests/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
      const contest = await storage.getContest(req.params.id);
      if (!contest) {
        return res.status(404).json({ message: "Contest not found" });
      }
      res.json(contest);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contest" });
    }
  });

  // Results for a contest
  app.get("/api/admin/contests/:contestId/results", authMiddleware(["admin"]), async (req, res) => {
    try {
      const results = await storage.getResults({ contestId: req.params.contestId });
      
      // Enrich with user data
      const enriched = await Promise.all(results.map(async result => {
        const user = await storage.getUser(result.userId);
        return {
          ...result,
          userName: user?.name,
          userEmail: user?.email,
          userCollege: user?.college,
        };
      }));
      
      res.json(enriched);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  // Publish results
  app.post("/api/admin/contests/:contestId/publish-results", authMiddleware(["admin"]), async (req, res) => {
    try {
      const contest = await storage.getContest(req.params.contestId);
      if (!contest) return res.status(404).json({ message: "Contest not found" });

      // gather all results for this contest
      const results = await storage.getResults({ contestId: req.params.contestId });

      // sort by score desc, then timeTakenSeconds asc (smaller time is better)
      const sorted = results.slice().sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const ta = a.timeTakenSeconds ?? Number.MAX_SAFE_INTEGER;
        const tb = b.timeTakenSeconds ?? Number.MAX_SAFE_INTEGER;
        return ta - tb;
      });

      // allow admin to manually assign prizes via request body: { prizes: [{ userId, prize }] }
      const manualPrizes: Record<string, number> = {};
      if (Array.isArray(req.body?.prizes)) {
        for (const p of req.body.prizes) {
          if (p && p.userId && typeof p.prize === 'number') manualPrizes[p.userId] = p.prize;
        }
      }

      const publishedAt = new Date().toISOString();

      // assign ranks and update results
      for (let i = 0; i < sorted.length; i++) {
        const r = sorted[i];
        const newRank = i + 1;
        const prizeFromContest = (contest as any)?.prizes?.find((p: any) => p.rank === newRank)?.prize;
        const prizeForUser = manualPrizes[r.userId] ?? prizeFromContest ?? r.prize ?? undefined;
        await storage.updateResult(r.id, {
          rank: newRank,
          publishedAt,
          prize: prizeForUser,
          isWinner: !!(prizeForUser && prizeForUser > 0),
        } as any);
      }

      // mark contest completed
      const updatedContest = await storage.updateContest(req.params.contestId, { status: "completed" });

      // return updated result list enriched with user info
      const updatedResults = await storage.getResults({ contestId: req.params.contestId });
      const enriched = await Promise.all(updatedResults.map(async (result) => {
        const user = await storage.getUser(result.userId);
        return { ...result, userName: user?.name, userEmail: user?.email, userCollege: user?.college };
      }));

      res.json({ success: true, contest: updatedContest, results: enriched });
    } catch (error) {
      res.status(500).json({ message: "Failed to publish results" });
    }
  });

  // Admin withdrawal management
  app.get("/api/admin/withdrawals", authMiddleware(["admin"]), async (req, res) => {
    try {
      const withdrawals = await storage.getWithdrawals();
      
      // Enrich with creator data
      const enriched = await Promise.all(withdrawals.map(async w => {
        const creator = await storage.getUser(w.creatorId);
        return {
          ...w,
          creatorName: creator?.name,
          creatorEmail: creator?.email,
        };
      }));
      
      res.json(enriched);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch withdrawals" });
    }
  });

  app.post("/api/admin/withdrawals/:id/approve", authMiddleware(["admin"]), async (req, res) => {
    try {
      const withdrawal = await storage.updateWithdrawal(req.params.id, {
        status: "approved",
        processedAt: new Date().toISOString(),
      });
      if (!withdrawal) {
        return res.status(404).json({ message: "Withdrawal not found" });
      }
      res.json(withdrawal);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve withdrawal" });
    }
  });

  app.post("/api/admin/withdrawals/:id/reject", authMiddleware(["admin"]), async (req, res) => {
    try {
      const withdrawal = await storage.updateWithdrawal(req.params.id, {
        status: "rejected",
        processedAt: new Date().toISOString(),
      });
      if (!withdrawal) {
        return res.status(404).json({ message: "Withdrawal not found" });
      }
      res.json(withdrawal);
    } catch (error) {
      res.status(500).json({ message: "Failed to reject withdrawal" });
    }
  });

  // ============ CREATOR ROUTES ============

  app.get("/api/creator/stats", authMiddleware(["creator"]), async (req: AuthRequest, res) => {
    try {
      const stats = await storage.getCreatorStats(req.user!.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/creator/earnings/recent", authMiddleware(["creator"]), async (req: AuthRequest, res) => {
    try {
      const earnings = await storage.getEarnings(req.user!.id);
      res.json(earnings.slice(0, 10));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch earnings" });
    }
  });

  app.get("/api/creator/withdrawals", authMiddleware(["creator"]), async (req: AuthRequest, res) => {
    try {
      const withdrawals = await storage.getWithdrawals({ creatorId: req.user!.id });
      res.json(withdrawals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch withdrawals" });
    }
  });

  app.post("/api/creator/withdrawals", authMiddleware(["creator"]), async (req: AuthRequest, res) => {
    try {
      const { amount, paymentMethod, upiId, bankDetails } = req.body;
      
      const stats = await storage.getCreatorStats(req.user!.id);
      if (stats.availableBalance < 300) {
        return res.status(400).json({ message: "Minimum balance of ₹300 required" });
      }
      if (amount > stats.availableBalance) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      const withdrawal = await storage.createWithdrawal({
        creatorId: req.user!.id,
        amount,
        paymentMethod,
        upiId,
        bankDetails,
      });

      res.json(withdrawal);
    } catch (error) {
      res.status(500).json({ message: "Failed to create withdrawal request" });
    }
  });

  return httpServer;
}
