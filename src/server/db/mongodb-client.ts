import { MongoClient } from 'mongodb';
import { config } from '../../config/config';
import { logger } from '../logger/structured-logger';

// Extend the Node global interface to preserve the Mongo Client Promise across Next.js hot-reloads
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = config.db.uri;
const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  connectTimeoutMS: 5000,
  socketTimeoutMS: 30000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development, preserve connection promise using global object
  if (!global._mongoClientPromise) {
    logger.info('Initializing new global MongoDB client in development mode');
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, establish a direct client connection pool
  logger.info('Initializing new direct MongoDB client in production mode');
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Graceful shutdown hooks
const handleShutdown = async () => {
  logger.info('Closing MongoDB connection pools due to application termination');
  try {
    const activeClient = await clientPromise;
    await activeClient.close();
    logger.info('MongoDB connection pools closed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Failed to close MongoDB connections cleanly', error);
    process.exit(1);
  }
};

// Hook termination signals
process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);

export default clientPromise;
export { clientPromise };
