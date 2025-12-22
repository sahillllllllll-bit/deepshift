import mongoose from "mongoose";

export async function connectMongo(uri: string) {
  if (!uri) throw new Error("MONGODB_URI must be provided");

  mongoose.set("strictQuery", false);

  try {
    // reasonable timeouts to fail fast during dev
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      // modern mongoose uses these by default; kept here for clarity
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    } as any);

    const db = mongoose.connection;
    db.on("error", (err) => console.error("MongoDB connection error:", err));
    db.once("open", () => console.log("Connected to MongoDB"));

    return db;
  } catch (err) {
    console.error("Failed to connect to MongoDB:", (err as Error).message || err);
    throw err;
  }
}

export default mongoose;
