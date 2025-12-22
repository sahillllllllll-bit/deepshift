import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import {
  User,
  InsertUser,
  Contest,
  InsertContest,
  Question,
  InsertQuestion,
  Registration,
  InsertRegistration,
  Attempt,
  InsertAttempt,
  Result,
  InsertResult,
  Earning,
  Withdrawal,
  StudentStats,
  AdminStats,
  CreatorStats,
} from "./shared/schema";
import {
  UserModel,
  ContestModel,
  QuestionModel,
  RegistrationModel,
  AttemptModel,
  ResultModel,
  EarningModel,
  WithdrawalModel,
} from "./models";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  getUsers(role?: string): Promise<User[]>;

  // Contests
  getContest(id: string): Promise<Contest | undefined>;
  getContests(status?: string): Promise<Contest[]>;
  getRecentContests(limit?: number): Promise<Contest[]>;
  createContest(contest: InsertContest): Promise<Contest>;
  updateContest(id: string, data: Partial<Contest>): Promise<Contest | undefined>;
  deleteContest(id: string): Promise<boolean>;

  // Questions
  getQuestions(contestId: string): Promise<Question[]>;
  getQuestion(id: string): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: string, data: Partial<Question>): Promise<Question | undefined>;
  deleteQuestion(id: string): Promise<boolean>;

  // Registrations
  getRegistration(id: string): Promise<Registration | undefined>;
  getRegistrationByUserAndContest(userId: string, contestId: string): Promise<Registration | undefined>;
  getRegistrations(filter?: { userId?: string; contestId?: string; paymentStatus?: string }): Promise<Registration[]>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  updateRegistration(id: string, data: Partial<Registration>): Promise<Registration | undefined>;

  // Attempts
  getAttempt(id: string): Promise<Attempt | undefined>;
  getAttemptByUserAndContest(userId: string, contestId: string): Promise<Attempt | undefined>;
  createAttempt(attempt: InsertAttempt): Promise<Attempt>;
  updateAttempt(id: string, data: Partial<Attempt>): Promise<Attempt | undefined>;

  // Results
  getResults(filter?: { userId?: string; contestId?: string }): Promise<Result[]>;
  updateResult(id: string, data: Partial<Result>): Promise<Result | undefined>;
  createResult(result: InsertResult): Promise<Result>;

  // Earnings
  getEarnings(creatorId: string): Promise<Earning[]>;
  createEarning(earning: Omit<Earning, "id">): Promise<Earning>;

  // Withdrawals
  getWithdrawals(filter?: { creatorId?: string; status?: string }): Promise<Withdrawal[]>;
  createWithdrawal(withdrawal: Omit<Withdrawal, "id" | "requestedAt" | "processedAt" | "status">): Promise<Withdrawal>;
  updateWithdrawal(id: string, data: Partial<Withdrawal>): Promise<Withdrawal | undefined>;

  // Stats
  getStudentStats(userId: string): Promise<StudentStats>;
  getAdminStats(): Promise<AdminStats>;
  getCreatorStats(creatorId: string): Promise<CreatorStats>;

  // Admin
  seedAdmin(): Promise<void>;
}

// Blueprint: javascript_database - PostgreSQL with Drizzle ORM
export class DatabaseStorage implements IStorage {
  private computeContestStatus(contest: any) {
    if (!contest) return "upcoming";
    try {
      const now = new Date();
      const start = new Date(contest.startTime);
      const end = new Date(contest.endTime);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) return contest.status || "upcoming";

      if (now < start) return "upcoming";
      if (now >= start && now <= end) return "live";
      return "completed";
    } catch {
      return contest.status || "upcoming";
    }
  }
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ id }).lean();
    return (user as unknown as User) || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email }).lean();
    return (user as unknown as User) || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Special case for admin login
    if (username === "sahil") {
      const user = await UserModel.findOne({ role: "admin", name: "Sahil (Admin)" }).lean();
      return (user as unknown as User) || undefined;
    }
    const user = await UserModel.findOne({ name: username }).lean();
    return (user as unknown as User) || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    let referralCode: string | undefined;
    if (insertUser.role === "creator") {
      referralCode = `DS${id.slice(0, 8).toUpperCase()}`;
    }
    const created = await UserModel.create({
      ...insertUser,
      id,
      password: hashedPassword,
      referralCode,
    } as any);

    return (created.toObject() as unknown) as User;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const updated = await UserModel.findOneAndUpdate({ id }, data, { new: true }).lean();
    return (updated as unknown as User) || undefined;
  }

  async getUsers(role?: string): Promise<User[]> {
    if (role) {
      return (await UserModel.find({ role }).lean()) as unknown as User[];
    }
    return (await UserModel.find().lean()) as unknown as User[];
  }

  // Contests
  async getContest(id: string): Promise<Contest | undefined> {
    const contest = await ContestModel.findOne({ id }).lean();
    if (!contest) return undefined;
    const c = (contest as unknown as Contest);
    // compute runtime status from start/end times so UI reflects live/upcoming/completed automatically
    const computed = this.computeContestStatus(c);
    return { ...c, status: computed } as Contest;
  }

  async getContests(status?: string): Promise<Contest[]> {
    let contests = [] as any[];
    if (status) {
      // Fetch all and filter after computing status to ensure time-based transitions are considered
      contests = (await ContestModel.find().sort({ createdAt: -1 }).lean()) as any[];
    } else {
      contests = (await ContestModel.find().sort({ createdAt: -1 }).lean()) as any[];
    }

    // Compute status for each contest based on start/end times
    const mapped = contests.map((c) => ({ ...c, status: this.computeContestStatus(c) }));

    if (status) {
      return mapped.filter((c) => c.status === status) as Contest[];
    }

    return mapped as Contest[];
  }

  async getRecentContests(limit = 5): Promise<Contest[]> {
    const contests = (await ContestModel.find().sort({ createdAt: -1 }).limit(limit).lean()) as any[];
    return contests.map((c) => ({ ...c, status: this.computeContestStatus(c) })) as Contest[];
  }

  async createContest(insertContest: InsertContest): Promise<Contest> {
    const id = randomUUID();
    const created = await ContestModel.create({ ...insertContest, id, status: "upcoming" } as any);
    return (created.toObject() as unknown) as Contest;
  }

  async updateContest(id: string, data: Partial<Contest>): Promise<Contest | undefined> {
    const updated = await ContestModel.findOneAndUpdate({ id }, data, { new: true }).lean();
    return (updated as unknown as Contest) || undefined;
  }

  async deleteContest(id: string): Promise<boolean> {
    const result = await ContestModel.deleteOne({ id });
    return result.deletedCount ? true : false;
  }

  // Questions
  async getQuestions(contestId: string): Promise<Question[]> {
    return (await QuestionModel.find({ contestId }).sort({ order: 1 }).lean()) as unknown as Question[];
  }

  async getQuestion(id: string): Promise<Question | undefined> {
    const question = await QuestionModel.findOne({ id }).lean();
    return (question as unknown as Question) || undefined;
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = randomUUID();
    const created = await QuestionModel.create({ ...insertQuestion, id } as any);
    return (created.toObject() as unknown) as Question;
  }

  async updateQuestion(id: string, data: Partial<Question>): Promise<Question | undefined> {
    const updated = await QuestionModel.findOneAndUpdate({ id }, data, { new: true }).lean();
    return (updated as unknown as Question) || undefined;
  }

  async deleteQuestion(id: string): Promise<boolean> {
    const result = await QuestionModel.deleteOne({ id });
    return result.deletedCount ? true : false;
  }

  // Registrations
  async getRegistration(id: string): Promise<Registration | undefined> {
    const registration = await RegistrationModel.findOne({ id }).lean();
    return (registration as unknown as Registration) || undefined;
  }

  async getRegistrationByUserAndContest(userId: string, contestId: string): Promise<Registration | undefined> {
    const registration = await RegistrationModel.findOne({ userId, contestId }).lean();
    return (registration as unknown as Registration) || undefined;
  }

  async getRegistrations(filter?: { userId?: string; contestId?: string; paymentStatus?: string }): Promise<Registration[]> {
    const q: any = {};
    if (filter?.userId) q.userId = filter.userId;
    if (filter?.contestId) q.contestId = filter.contestId;
    if (filter?.paymentStatus) q.paymentStatus = filter.paymentStatus;
    return (await RegistrationModel.find(q).sort({ registeredAt: -1 }).lean()) as unknown as Registration[];
  }

  async createRegistration(insertReg: InsertRegistration): Promise<Registration> {
    const id = randomUUID();
    const created = await RegistrationModel.create({ ...insertReg, id, paymentStatus: "pending" } as any);
    return (created.toObject() as unknown) as Registration;
  }

  async updateRegistration(id: string, data: Partial<Registration>): Promise<Registration | undefined> {
    const updated = await RegistrationModel.findOneAndUpdate({ id }, data, { new: true }).lean();
    return (updated as unknown as Registration) || undefined;
  }

  // Attempts
  async getAttempt(id: string): Promise<Attempt | undefined> {
    const attempt = await AttemptModel.findOne({ id }).lean();
    return (attempt as unknown as Attempt) || undefined;
  }

  async getAttemptByUserAndContest(userId: string, contestId: string): Promise<Attempt | undefined> {
    const attempt = await AttemptModel.findOne({ userId, contestId }).lean();
    return (attempt as unknown as Attempt) || undefined;
  }

  async createAttempt(insertAttempt: InsertAttempt): Promise<Attempt> {
    const id = randomUUID();
    const created = await AttemptModel.create({ ...insertAttempt, id } as any);
    return (created.toObject() as unknown) as Attempt;
  }

  async updateAttempt(id: string, data: Partial<Attempt>): Promise<Attempt | undefined> {
    const updated = await AttemptModel.findOneAndUpdate({ id }, data, { new: true }).lean();
    return (updated as unknown as Attempt) || undefined;
  }

  // Results
  async getResults(filter?: { userId?: string; contestId?: string }): Promise<Result[]> {
    const q: any = {};
    if (filter?.userId) q.userId = filter.userId;
    if (filter?.contestId) q.contestId = filter.contestId;
    return (await ResultModel.find(q).sort({ publishedAt: -1 }).lean()) as unknown as Result[];
  }

  async createResult(insertResult: InsertResult): Promise<Result> {
    const id = randomUUID();
    const created = await ResultModel.create({ ...insertResult, id } as any);
    return (created.toObject() as unknown) as Result;
  }

  async updateResult(id: string, data: Partial<Result>): Promise<Result | undefined> {
    const updated = await ResultModel.findOneAndUpdate({ id }, data, { new: true }).lean();
    return (updated as unknown as Result) || undefined;
  }

  // Earnings
  async getEarnings(creatorId: string): Promise<Earning[]> {
    return (await EarningModel.find({ creatorId }).sort({ earnedAt: -1 }).lean()) as unknown as Earning[];
  }

  async createEarning(data: Omit<Earning, "id">): Promise<Earning> {
    const id = randomUUID();
    const created = await EarningModel.create({ ...data, id } as any);
    return (created.toObject() as unknown) as Earning;
  }

  // Withdrawals
  async getWithdrawals(filter?: { creatorId?: string; status?: string }): Promise<Withdrawal[]> {
    const q: any = {};
    if (filter?.creatorId) q.creatorId = filter.creatorId;
    if (filter?.status) q.status = filter.status;
    return (await WithdrawalModel.find(q).sort({ requestedAt: -1 }).lean()) as unknown as Withdrawal[];
  }

  async createWithdrawal(data: Omit<Withdrawal, "id" | "requestedAt" | "processedAt" | "status">): Promise<Withdrawal> {
    const id = randomUUID();
    const created = await WithdrawalModel.create({ ...data, id, status: "pending" } as any);
    return (created.toObject() as unknown) as Withdrawal;
  }

  async updateWithdrawal(id: string, data: Partial<Withdrawal>): Promise<Withdrawal | undefined> {
    const updated = await WithdrawalModel.findOneAndUpdate({ id }, data, { new: true }).lean();
    return (updated as unknown as Withdrawal) || undefined;
  }

  // Stats
  async getStudentStats(userId: string): Promise<StudentStats> {
    const userRegistrations = await this.getRegistrations({ userId });
    const userResults = await this.getResults({ userId });
    const allContests = await this.getContests();

    const approvedRegs = userRegistrations.filter((r) => r.paymentStatus === "approved");
    const upcomingContests = approvedRegs.filter((r) => {
      const contest = allContests.find((c) => c.id === r.contestId);
      return contest?.status === "upcoming";
    });

    return {
      contestsJoined: approvedRegs.length,
      upcomingContests: upcomingContests.length,
      totalWinnings: userResults.filter(r => !!r.publishedAt).reduce((sum, r) => sum + (r.prize || 0), 0),
      bestRank: userResults.filter(r => !!r.publishedAt).length ? Math.min(...userResults.filter(r => !!r.publishedAt).map((r) => r.rank as number)) : null,
    };
  }

  async getAdminStats(): Promise<AdminStats> {
    // Use efficient DB operations instead of loading full collections into memory
    const [totalStudents, totalCreators, totalContests] = await Promise.all([
      UserModel.countDocuments({ role: "student" }),
      UserModel.countDocuments({ role: "creator" }),
      ContestModel.countDocuments(),
    ]);

    // Active contests: count where startTime <= now <= endTime
    const now = new Date();
    const activeContests = await ContestModel.countDocuments({ startTime: { $lte: now }, endTime: { $gte: now } });

    // Pending payments count
    const pendingPayments = await RegistrationModel.countDocuments({ paymentStatus: "pending" });

    // Compute total revenue by aggregating approved registrations joined with contests
    const revenueAgg = await RegistrationModel.aggregate([
      { $match: { paymentStatus: "approved" } },
      { $lookup: { from: "contests", localField: "contestId", foreignField: "id", as: "contest" } },
      { $unwind: { path: "$contest", preserveNullAndEmptyArrays: false } },
      { $group: { _id: null, totalRevenue: { $sum: "$contest.fee" } } },
    ]).allowDiskUse(true);

    const totalRevenue = (revenueAgg && revenueAgg.length > 0 && revenueAgg[0].totalRevenue) ? revenueAgg[0].totalRevenue : 0;

    return {
      totalStudents,
      totalContests,
      activeContests,
      totalRevenue,
      pendingPayments,
      totalCreators,
    };
  }

  async getCreatorStats(creatorId: string): Promise<CreatorStats> {
    const creatorEarnings = await this.getEarnings(creatorId);
    const creatorWithdrawals = await this.getWithdrawals({ creatorId });
    
    const totalEarnings = creatorEarnings.reduce((sum, e) => sum + e.amount, 0);
    const pendingWithdrawals = creatorWithdrawals
      .filter(w => w.status === "pending")
      .reduce((sum, w) => sum + w.amount, 0);
    const approvedWithdrawals = creatorWithdrawals
      .filter(w => w.status === "approved")
      .reduce((sum, w) => sum + w.amount, 0);

    // Count referrals
    const allUsers = await this.getUsers();
    const referralCount = allUsers.filter(u => u.referredBy === creatorId).length;

    return {
      totalEarnings,
      pendingWithdrawals,
      totalReferrals: referralCount,
      availableBalance: totalEarnings - approvedWithdrawals - pendingWithdrawals,
    };
  }

  // Admin seeding
  async seedAdmin(): Promise<void> {
    // Check if admin already exists
    const existingAdmin = await this.getUserByUsername("sahil");
    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("12345sahil", 10);
    const adminId = randomUUID();

    await UserModel.create({ id: adminId, email: "admin@deepshift.com", password: hashedPassword, name: "Sahil (Admin)", role: "admin" } as any);

    console.log("Admin user seeded: username=sahil, password=12345sahil");

    // Seed sample contests
    await this.seedSampleContests();
  }

  private async seedSampleContests(): Promise<void> {
    const existingContests = await this.getContests();
    if (existingContests.length > 0) {
      console.log("Sample contests already exist");
      return;
    }

    const sampleContests = [
      {
        title: "Aptitude Challenge 2024",
        description: "Test your logical reasoning and quantitative skills in this exciting challenge.",
        type: "mcq",
        category: "aptitude",
        prize: 50000,
        fee: 99,
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        duration: 60,
        totalMarks: 100,
        commissionPerRegistration: 10,
        negativeMarking: true,
        negativeMarkValue: 25,
      },
      {
        title: "Code Sprint Finals",
        description: "Competitive programming contest with algorithmic challenges.",
        type: "coding",
        category: "coding",
        prize: 100000,
        fee: 199,
        startTime: new Date(Date.now() + 1 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
        duration: 120,
        totalMarks: 500,
        commissionPerRegistration: 20,
        negativeMarking: false,
        negativeMarkValue: 0,
      },
      {
        title: "GK Master Quiz",
        description: "Test your general knowledge across various topics.",
        type: "mcq",
        category: "gk",
        prize: 25000,
        fee: 49,
        startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        duration: 45,
        totalMarks: 100,
        commissionPerRegistration: 5,
        negativeMarking: false,
        negativeMarkValue: 0,
      },
      {
        title: "Innovation Hackathon",
        description: "Build innovative solutions for real-world problems.",
        type: "coding",
        category: "hackathon",
        prize: 200000,
        fee: 499,
        startTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        duration: 2880,
        totalMarks: 1000,
        commissionPerRegistration: 50,
        negativeMarking: false,
        negativeMarkValue: 0,
      },
    ];

    for (const contestData of sampleContests) {
      const payload: any = { ...contestData };
      if (payload.startTime instanceof Date) payload.startTime = payload.startTime.toISOString();
      if (payload.endTime instanceof Date) payload.endTime = payload.endTime.toISOString();
      await this.createContest(payload as InsertContest);
    }
    console.log("Sample contests seeded");
  }
}

export const storage = new DatabaseStorage();
