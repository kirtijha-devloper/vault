const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { encrypt } = require('./src/utils/encryption');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with test user and sample vault items...');

  const email = 'admin@securevault.com';
  const plainPassword = 'AdminVault123!';
  const name = 'Alex Morgan';

  // Check if user already exists
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
    console.log(`Created test user: ${email}`);
  } else {
    console.log(`User ${email} already exists.`);
  }

  // Check existing items count
  const passCount = await prisma.passwordItem.count({ where: { userId: user.id } });

  if (passCount === 0) {
    // Seed Passwords
    await prisma.passwordItem.createMany({
      data: [
        {
          title: 'Personal Gmail',
          website: 'mail.google.com',
          username: 'alex.morgan@gmail.com',
          password: encrypt('SuperSecretGmailPass2026!'),
          notes: encrypt('Primary personal email account. 2FA enabled via Authenticator app.'),
          category: 'Passwords',
          userId: user.id,
        },
        {
          title: 'Chase Bank Online',
          website: 'chase.com',
          username: 'alex_m_banking',
          password: encrypt('ChaseBankSecure#9981'),
          notes: encrypt('Security questions: Mother\'s maiden name = Smith, First pet = Fluffy'),
          category: 'Banking',
          userId: user.id,
        },
        {
          title: 'AWS Production Console',
          website: 'aws.amazon.com',
          username: 'alex.morgan@company.com',
          password: encrypt('AwsProdRoot!Kms9021'),
          notes: encrypt('Production environment access. Do not share outside DevOps team.'),
          category: 'Work',
          userId: user.id,
        },
      ],
    });
    console.log('Seeded sample password items.');

    // Seed Documents (using placeholder URLs or local structure)
    await prisma.documentItem.createMany({
      data: [
        {
          title: 'Passport Copy',
          category: 'Documents',
          description: 'Scanned bio page of US Passport (Expires 2032)',
          fileUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=600',
          fileId: 'sample_passport.jpg',
          fileSize: 2450123, // ~2.4 MB
          fileType: 'image/jpeg',
          userId: user.id,
        },
        {
          title: 'Q1 Tax Invoice',
          category: 'Work',
          description: 'Quarterly tax filing confirmation receipt and summary',
          fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
          fileId: 'sample_invoice.pdf',
          fileSize: 1048576, // 1 MB
          fileType: 'application/pdf',
          userId: user.id,
        },
      ],
    });
    console.log('Seeded sample document items.');

    // Seed Notes
    await prisma.noteItem.createMany({
      data: [
        {
          title: 'Crypto Wallet Recovery Seed Phrase',
          content: encrypt('abandon ability able about above absent absorb abstract absurd abuse access accident'),
          category: 'Notes',
          color: '#8B5CF6', // Purple
          userId: user.id,
        },
        {
          title: 'Home Security PINs & Alarm Codes',
          content: encrypt('Front Door Lock: 4921\nGarage Keypad: 8832\nMaster Alarm Disarm: 1090\nSafe Combination: 34-12-89'),
          category: 'Personal',
          color: '#EF4444', // Red
          userId: user.id,
        },
      ],
    });
    console.log('Seeded sample secure notes.');
  } else {
    console.log('Sample items already seeded.');
  }

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
