import bcrypt from "bcrypt";
import prisma from "../../db.js";
import "dotenv/config";

const ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12);
const DUMMY_FALLBACK = bcrypt.hashSync("fakepassword", ROUNDS);

export async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      password: true,
      phoneNumber: true,
      contractType: true,
    },
  });
}

export async function dummyVerifyPassword(password) {
  const hash = process.env.DUMMY_HASH || DUMMY_FALLBACK;
  try {
    return await verifyPassword(password, hash);
  } catch {
    return false;
  }
}

export async function createUser({
  email,
  password,
  firstName,
  lastName,
  phoneNumber,
  role = "Employer",
  contractType = "H35",
}) {
  try {
    const hash = await bcrypt.hash(password, ROUNDS);
    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        password: hash,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
        role,
        contractType: contractType,
      },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    return user;
  } catch (err) {
    if (err.code === "P2002") {
      const e = new Error("Cet email est déjà enregistré.");
      e.status = 409;
      e.code = "EMAIL_IN_USE";
      throw e;
    }
    throw err;
  }
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}
