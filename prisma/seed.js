const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Create Frankie as admin
  const frankie = await prisma.user.upsert({
    where: { email: 'frankie@example.com' },
    update: {},
    create: {
      email: 'frankie@example.com',
      name: 'Frankie',
      role: 'ADMIN',
      bio: 'Hi! I\'m Frankie, 17 years old and I love working with kids. I\'m CPR certified and have 3 years of babysitting experience.',
      hourlyRate: 20,
      emailVerified: new Date(),
    },
  });

  console.log('Created admin user:', frankie);

  // Create mom as co-admin
  const mom = await prisma.user.upsert({
    where: { email: 'mom@example.com' },
    update: {},
    create: {
      email: 'mom@example.com',
      name: 'Mom',
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });

  console.log('Created co-admin user:', mom);

  // Create a sample parent
  const parent = await prisma.user.upsert({
    where: { email: 'parent@example.com' },
    update: {},
    create: {
      email: 'parent@example.com',
      name: 'Sample Parent',
      role: 'PARENT',
      emailVerified: new Date(),
      address: '123 Main St, Anytown, USA',
      kidsAges: '5, 8',
      emergencyName: 'Jane Doe',
      emergencyPhone: '555-0123',
    },
  });

  console.log('Created sample parent:', parent);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
