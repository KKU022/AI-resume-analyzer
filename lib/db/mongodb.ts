import mongoose from 'mongoose';

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache =
  global.mongooseCache ??
  (global.mongooseCache = {
    conn: null,
    promise: null,
  });

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error: unknown) {
    cached.promise = null;
    const message = error instanceof Error ? error.message : 'Unknown MongoDB error';
    throw new Error(`MongoDB connection failed: ${message}`);
  }
}

export default connectDB;
