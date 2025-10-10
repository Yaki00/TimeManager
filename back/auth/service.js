import bcrypt from "bcrypt";
import prisma from "../db.js";

export async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      contratType: true,
    },
  });
}

export async function createUser({
  email,
  password,
  first_name,
  last_name,
  phone_number,
  role = "Employer",
  contrat_type = "H35",
}) {
  try {
    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        firstName: first_name,
        lastName: last_name,
        phoneNumber: phone_number,
        role,
        contratType: contrat_type,
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
