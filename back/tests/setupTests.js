import bcrypt from "bcrypt";
import prisma from "../db.js";

process.env.NODE_ENV = "test";
process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "test-access-secret";
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "test-refresh-secret";
process.env.JWT_ISSUER = process.env.JWT_ISSUER || "test-issuer";
process.env.JWT_AUDIENCE = process.env.JWT_AUDIENCE || "test-audience";

beforeAll(async () => {
  const passwordHash = await bcrypt.hash("Secret123!", 10);

  await prisma.user.upsert({
    where: { email: "john@doe.com" },
    update: { password: passwordHash },
    create: {
      email: "john@doe.com",
      password: passwordHash,
      firstName: "John",
      lastName: "Doe",
      role: "Employer",
      contractType: "H35",
      phoneNumber: "0123456789",
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
