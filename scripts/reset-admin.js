// Sets a new password for an admin who cannot sign in, and signs out all their sessions.
// Usage:
//   npm run reset-admin                     lists the admin usernames
//   npm run reset-admin -- <username>       asks for a new password (typed, not shown)
//   npm run reset-admin -- <username> --clear-mfa   also turns off two-step verification
//                                                   (for a lost phone; set it up again after)
require('dotenv').config();
const readline = require('readline');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../server/models/User');
const { passwordError } = require('../server/lib/accounts');

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (text) => { if (text.includes(question)) rl.output.write(text); };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    });
  });
}

async function main() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing from .env');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });

  const username = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : '';
  if (!username) {
    const users = await User.find().sort({ createdAt: 1 }).lean();
    if (!users.length) {
      console.log('There are no admin accounts. Set ADMIN_USERNAME and ADMIN_PASSWORD in .env and start the server to create one.');
      return;
    }
    console.log('Admin accounts:');
    for (const u of users) console.log(`  ${u.username}  (${u.role}${u.mfaEnabled ? ', two-step on' : ''})`);
    console.log('\nReset one with: npm run reset-admin -- <username>');
    return;
  }

  const user = await User.findOne({ username });
  if (!user) throw new Error(`No admin named "${username}". Run without a name to list them.`);

  const password = await askHidden('New password: ');
  const invalid = passwordError(password, user.username);
  if (invalid) throw new Error(invalid);
  if ((await askHidden('Repeat it: ')) !== password) throw new Error('The passwords do not match.');

  user.passwordHash = await bcrypt.hash(password, 12);
  user.clearPasswordReset();
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  if (process.argv.includes('--clear-mfa')) user.clearMfa();
  await user.save();
  console.log(`Password changed for "${user.username}". Sign in at /admin/login.`);
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
