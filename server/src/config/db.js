import mongoose from 'mongoose';

/**
 * Connects to MongoDB.
 * - If MONGO_URI is set, uses it (local mongod or Atlas).
 * - Otherwise spins up an in-memory MongoDB so the app runs with zero setup
 *   (ideal for hackathon demos and fresh clones). Data is not persisted.
 */
export async function connectDB() {
  let uri = process.env.MONGO_URI?.trim();

  if (!uri) {
    try {
      console.log('[db] MONGO_URI not set -> starting in-memory MongoDB (data will not persist)');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mem = await MongoMemoryServer.create();
      uri = mem.getUri();
      globalThis.__MEM_MONGO__ = mem; // keep handle so it isn't GC'd
    } catch (e) {
      throw new Error(
        'No MONGO_URI set and the optional in-memory MongoDB is unavailable. ' +
          'Set MONGO_URI in .env to a local mongod or MongoDB Atlas connection string. ' +
          `(in-memory error: ${e.message})`
      );
    }
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { dbName: 'peoplepay360' });
  console.log(`[db] connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  return mongoose.connection;
}
