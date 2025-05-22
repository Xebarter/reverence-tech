import { MongoClient, MongoClientOptions } from 'mongodb';

// Ensure MONGODB_URI is defined
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is not defined in the environment variables');
}

// Declare client and clientPromise with proper typing
let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

// Use a more specific global type to avoid 'any'
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const options: MongoClientOptions = {
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
  maxPoolSize: 10, // Limit connection pool size for efficiency
};

if (process.env.NODE_ENV === 'development') {
  // In development, reuse the client across hot reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().catch((err) => {
      console.error('Failed to connect to MongoDB:', err);
      throw err; // Rethrow to prevent silent failures
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a new client
  client = new MongoClient(uri, options);
  clientPromise = client.connect().catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    throw err; // Rethrow to prevent silent failures
  });
}

export async function getMongoClient(): Promise<MongoClient> {
  if (!clientPromise) {
    throw new Error('MongoDB client promise is not initialized');
  }
  try {
    const connectedClient = await clientPromise;
    // Verify connection state
    if (!connectedClient.db().command({ ping: 1 })) {
      throw new Error('MongoDB client is not connected');
    }
    return connectedClient;
  } catch (error) {
    console.error('Error getting MongoDB client:', error);
    // Reset clientPromise to force reconnection on next attempt
    clientPromise = null;
    global._mongoClientPromise = undefined;
    throw error;
  }
}