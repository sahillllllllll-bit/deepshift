import mongoose, { Schema } from "mongoose";
import { randomUUID } from "crypto";

const idField = {
  type: String,
  required: true,
  default: () => randomUUID(),
  index: true,
  unique: true,
};

const UserSchema = new Schema(
  {
    id: idField,
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true, default: "student" },
    college: { type: String },
    upiId: { type: String },
    phone: { type: String },
    avatar: { type: String },
    referralCode: { type: String, index: true },
    referredBy: { type: String, index: true },
    createdAt: { type: Date, default: () => new Date() },
  },
  { timestamps: false }
);

const ContestSchema = new Schema(
  {
    id: idField,
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true },
    category: { type: String, required: true },
    prize: { type: Number, required: true },
    fee: { type: Number, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    maxParticipants: { type: Number },
    status: { type: String, default: "upcoming" },
    qrCodeUrl: { type: String },
    commissionPerRegistration: { type: Number, default: 0 },
    negativeMarking: { type: Boolean, default: false },
    negativeMarkValue: { type: Number, default: 0 },
    totalMarks: { type: Number, required: true },
    passingMarks: { type: Number },
    createdAt: { type: Date, default: () => new Date() },
    prizes: { type: Schema.Types.Mixed },
  },
  { timestamps: false }
);

const QuestionSchema = new Schema(
  {
    id: idField,
    contestId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    questionText: { type: String, required: true },
    options: { type: [String], default: undefined },
    correctAnswer: { type: String },
    marks: { type: Number, required: true },
    explanation: { type: String },
    testCases: { type: Schema.Types.Mixed },
    order: { type: Number, required: true },
  },
  { timestamps: false }
);

const RegistrationSchema = new Schema(
  {
    id: idField,
    contestId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    paymentScreenshot: { type: String },
    paymentStatus: { type: String, default: "pending" },
    referralCode: { type: String },
    registeredAt: { type: Date, default: () => new Date() },
    approvedAt: { type: Date },
  },
  { timestamps: false }
);

const AttemptSchema = new Schema(
  {
    id: idField,
    contestId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    answers: { type: Schema.Types.Mixed, default: {} },
    startedAt: { type: Date, default: () => new Date() },
    submittedAt: { type: Date },
    autoSubmitted: { type: Boolean, default: false },
    tabSwitchCount: { type: Number, default: 0 },
    score: { type: Number },
    rank: { type: Number },
  },
  { timestamps: false }
);

const ResultSchema = new Schema(
  {
    id: idField,
    contestId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    score: { type: Number, required: true },
    rank: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    wrongAnswers: { type: Number, required: true },
    unanswered: { type: Number, required: true },
    prize: { type: Number },
    isWinner: { type: Boolean, default: false },
    // Do not auto-publish results; admin must publish which sets `publishedAt`
    publishedAt: { type: Date },
    timeTakenSeconds: { type: Number },
    // optional: store answers or metadata
    answers: { type: Schema.Types.Mixed },
    tabSwitchCount: { type: Number },
  },
  { timestamps: false }
);

const EarningSchema = new Schema(
  {
    id: idField,
    creatorId: { type: String, required: true, index: true },
    registrationId: { type: String, required: true },
    contestId: { type: String, required: true },
    amount: { type: Number, required: true },
    earnedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: false }
);

const WithdrawalSchema = new Schema(
  {
    id: idField,
    creatorId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    upiId: { type: String },
    bankDetails: { type: Schema.Types.Mixed },
    status: { type: String, default: "pending" },
    requestedAt: { type: Date, default: () => new Date() },
    processedAt: { type: Date },
  },
  { timestamps: false }
);

export const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
export const ContestModel = mongoose.models.Contest || mongoose.model("Contest", ContestSchema);
export const QuestionModel = mongoose.models.Question || mongoose.model("Question", QuestionSchema);
export const RegistrationModel = mongoose.models.Registration || mongoose.model("Registration", RegistrationSchema);
export const AttemptModel = mongoose.models.Attempt || mongoose.model("Attempt", AttemptSchema);
export const ResultModel = mongoose.models.Result || mongoose.model("Result", ResultSchema);
export const EarningModel = mongoose.models.Earning || mongoose.model("Earning", EarningSchema);
export const WithdrawalModel = mongoose.models.Withdrawal || mongoose.model("Withdrawal", WithdrawalSchema);

export default mongoose;
