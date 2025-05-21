import { MongoClient, MongoClientOptions } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

// In development, create a new client for hot-reloading
// In production, reuse the client
if (process.env.NODE_ENV === 'development') {
  // Use global to persist client across hot-reloads
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
    } as MongoClientOptions);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // Production: single client
  client = new MongoClient(uri, {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
  } as MongoClientOptions);
  clientPromise = client.connect();
}

export async function getMongoClient() {
  return await clientPromise;
}