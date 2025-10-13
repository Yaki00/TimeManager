import prisma from "../../db.js";

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  phoneNumber: true,
  contractType: true,
};

export async function findUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });
}

export async function findAllUsers({ skip = 0, take = 50 } = {}) {
  return prisma.user.findMany({
    skip,
    take,
    orderBy: { id: "asc" },
    select: userSelect,
  });
}

export async function findByRole(role) {
  return prisma.user.findMany({
    where: { role },
    select: userSelect,
  });
}

export async function findByName(search) {
  const parts = search.trim().split(/\s+/);
  if (parts.length === 1) {
    const q = parts[0];
    return prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
        ],
      },
      select: userSelect,
    });
  }
  const [first, ...rest] = parts;
  const last = rest.join(" ");
  return prisma.user.findMany({
    where: {
      AND: [
        { firstName: { contains: first, mode: "insensitive" } },
        { lastName: { contains: last, mode: "insensitive" } },
      ],
    },
    select: userSelect,
  });
}

export async function findByPhoneNumber(phoneNumber) {
  const norm = phoneNumber.replace(/[^\d]/g, "");
  return prisma.user.findMany({
    where: {
      phoneNumber: { contains: norm, mode: "insensitive" },
    },
    select: userSelect,
  });
}

export async function findByContractType(contractType) {
  return prisma.user.findMany({
    where: { contractType },
    select: userSelect,
  });
}

export async function updateUser(id, data) {
  return prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });
}

export async function updateRoleUserById(id, role) {
  return prisma.user.update({
    where: { id },
    data: { role },
    select: userSelect,
  });
}

export async function deleteUser(id) {
  return prisma.user.delete({
    where: { id },
    select: userSelect,
  });
}

export async function countUsers() {
  return prisma.user.count();
}

export async function countUsersByRole(role) {
  return prisma.user.count({
    where: { role },
  });
}

export async function countUsersByContractType(contractType) {
  return prisma.user.count({
    where: { contractType },
  });
}
