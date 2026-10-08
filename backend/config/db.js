const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/alnawab_db';
  console.log(`[MongoDB] Attempting connection to: ${mongoUri}...`);

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
    });
    console.log(`[MongoDB] Connected successfully to: ${mongoUri}`);
    return;
  } catch (primaryErr) {
    console.warn(`[MongoDB] Standard connection failed: ${primaryErr.message}`);
    console.log('[MongoDB] Initializing resilient in-memory database server...');
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'alnawab_db',
      },
    });
    const memUri = mongoMemoryServer.getUri();
    await mongoose.connect(memUri);
    console.log(`[MongoDB] Connected successfully to Embedded MongoDB at: ${memUri}`);
  } catch (memErr) {
    console.error('[MongoDB] Embedded MongoDB engine error:', memErr.message);
    throw memErr;
  }
};

const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

module.exports = { connectDB, closeDB };
