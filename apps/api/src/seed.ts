import { prisma } from "./prisma.js";
import { hashPassword } from "./utils/password.js";

async function main() {
  const adminEmail = "admin@example.com";
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log("Admin user already exists:", existing.email);
    return;
  }
  const passwordHash = await hashPassword("qwe123456");
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      username: "admin",
      name: "Administrator",
    },
    select: { id: true, email: true },
  });
  console.log("Created admin user:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
