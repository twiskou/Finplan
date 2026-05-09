const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users:", users.map(u => ({ id: u.id, email: u.email, name: u.name })));
  
  // Find demo user
  const demoUsers = users.filter(u => u.email.includes('demo') || u.name.toLowerCase().includes('demo') || u.email === 'anis@gmail.com' && u.name.toLowerCase() === 'demo');
  
  // Let's just delete any user with 'demo' in email or name
  console.log("Demo users found:", demoUsers.map(u => u.email));
  
  if (demoUsers.length > 0) {
    for (const u of demoUsers) {
      await prisma.user.delete({ where: { id: u.id }});
      console.log('Deleted user:', u.email);
    }
  } else {
    console.log('No demo user found.');
  }
}

main().finally(() => prisma.$disconnect());
