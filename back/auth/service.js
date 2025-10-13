import bcrypt from "bcrypt";
import prisma from "../db.js";

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
    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
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
      throw new Error("Cet email est déjà enregistré.");
    }
    throw err;
  }
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}
