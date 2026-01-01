const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

function readEnv() {
  try {
    const envPath = path.resolve(__dirname, '..', '.env.local');
    const raw = fs.readFileSync(envPath, 'utf8');
    const obj = {};
    raw.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) {
        obj[m[1]] = m[2];
      }
    });
    return obj;
  } catch {
    return {};
  }
}

const env = readEnv();
const MONGODB_URI = env.MONGODB_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/saloncapp';
const SEED_EMAIL = env.SEED_ADMIN_EMAIL || process.env.SEED_ADMIN_EMAIL || 'dileepkumargr2001@gmail.com';

async function main() {
  try {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    const conn = mongoose.connection;
    const users = conn.collection('users');

    const count = await users.countDocuments();
    const admin = await users.findOne({ email: SEED_EMAIL });

    console.log(JSON.stringify({
      connected: true,
      db: conn.name,
      userCount: count,
      seedAdminEmail: SEED_EMAIL,
      seedAdminExists: !!admin,
      seedAdmin: admin ? {
        _id: admin._id,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        passwordHashPreview: typeof admin.password === 'string' ? admin.password.slice(0, 10) + '...' : null,
      } : null,
    }, null, 2));
  } catch (err) {
    console.error(JSON.stringify({
      connected: false,
      error: err.message,
    }, null, 2));
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.disconnect();
    } catch {}
  }
}

main();
