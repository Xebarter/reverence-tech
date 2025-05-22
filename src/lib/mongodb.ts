import { MongoClient, MongoClientOptions } from 'mongodb';

// Ensure MONGODB_URI is defined
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is not defined in the environment variables');
}

// Declare client and clientPromise
let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const options: MongoClientOptions = {
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
  maxPoolSize: 5, // Reduced for serverless environments
};

if (process.env.NODE_ENV === 'development') {
  // Reuse client in development to handle hot reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().catch((err) => {
      console.error('Failed to connect to MongoDB:', err);
      throw err;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production (Vercel), create or reuse client
  if (!clientPromise) {
    client = new MongoClient(uri, options);
    clientPromise = client.connect().catch((err) => {
      console.error('Failed to connect to MongoDB:', err);
      throw err;
    });
  }
}

export async function getMongoClient(): Promise<MongoClient> {
  if (!clientPromise) {
    throw new Error('MongoDB client promise is not initialized');
  }
  try {
    const connectedClient = await clientPromise;
    // Verify connection with a ping
    await connectedClient.db().command({ ping: 1 });
    return connectedClient;
  } catch (error) {
    console.error('Error getting MongoDB client:', error);
    clientPromise = null; // Reset to force reconnection
    global._mongoClientPromise = undefined;
    throw error;
  }
}