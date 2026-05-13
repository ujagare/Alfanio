import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: '.env' });
dotenv.config({ path: 'backend/.env' });

const buildMongoUri = () => {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  const username = process.env.MONGO_USERNAME;
  const password = process.env.MONGO_PASSWORD;
  const cluster = process.env.MONGO_CLUSTER;
  const dbName = process.env.MONGO_DB_NAME || 'Alfanio';

  if (!username || !password || !cluster) {
    return null;
  }

  return `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${cluster}/${dbName}?retryWrites=true&w=majority`;
};

const redactMongoUri = (uri) => uri.replace(/mongodb(\+srv)?:\/\/([^@]+)@/, 'mongodb$1://***:***@');

async function testConnection() {
  const mongoUri = buildMongoUri();

  if (!mongoUri) {
    console.error('MongoDB configuration missing. Set MONGODB_URI or MONGO_USERNAME, MONGO_PASSWORD, and MONGO_CLUSTER.');
    return false;
  }

  console.log(`Testing MongoDB connection: ${redactMongoUri(mongoUri)}`);

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });

    console.log('MongoDB connection successful');
    console.log(`Database: ${mongoose.connection.name}`);
    console.log(`Host: ${mongoose.connection.host}`);

    await mongoose.connection.close();
    return true;
  } catch (error) {
    console.error('MongoDB connection failed');
    console.error(`Error: ${error.message}`);
    return false;
  }
}

const success = await testConnection();
process.exit(success ? 0 : 1);
