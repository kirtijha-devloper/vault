const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with admin account only...');

  const legacyEmail = process.env.LEGACY_ADMIN_EMAIL || 'admin@securevault.com';
  const email = process.env.ADMIN_EMAIL;
  const plainPassword = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Admin';

  if (!email || !plainPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set before running the seed script.');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);

  await prisma.user.deleteMany({
    where: {
      email: legacyEmail,
    },
  });

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: hashedPassword,
    },
    create: {
      email,
      password: hashedPassword,
      name,
    },
  });

  await prisma.passwordItem.deleteMany({ where: { userId: user.id } });
  await prisma.documentItem.deleteMany({ where: { userId: user.id } });
  await prisma.noteItem.deleteMany({ where: { userId: user.id } });
  await prisma.shareLink.deleteMany({ where: { userId: user.id } });

  console.log(`Admin account is ready: ${email}`);
  console.log('No sample vault items were created.');

  console.log('\n==================================================');
  console.log('SEEDING COMPLETE! USE THESE CREDENTIALS TO LOGIN:');
  console.log(`Email:    ${email}`);
  console.log(`Password: ${plainPassword}`);
  console.log('==================================================\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
