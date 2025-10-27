import prisma from "../../db.js";

// Sélection interne incluant deletedAt pour vérifications
const userSelectWithDeleted = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  phoneNumber: true,
  contractType: true,
  deletedAt: true,
};

// Sélection publique sans deletedAt
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
  const user = await prisma.user.findUnique({
    where: { id },
    select: userSelectWithDeleted,
  });

  // Retourner null si l'utilisateur n'existe pas ou est supprimé
  if (!user || user.deletedAt) {
    return null;
  }

  // Retirer deletedAt du résultat final pour ne pas l'exposer
  const { deletedAt, ...userWithoutDeletedAt } = user;
  return userWithoutDeletedAt;
}

export async function findAllUsers({ skip = 0, take = 50 } = {}) {
  return prisma.user.findMany({
    where: { deletedAt: null },
    skip,
    take,
    orderBy: { id: "asc" },
    select: userSelect,
  });
}

export async function findByRole(role) {
  return prisma.user.findMany({
    where: { role, deletedAt: null },
    select: userSelect,
  });
}

export async function findByName(search) {
  const parts = search.trim().split(/\s+/);
  if (parts.length === 1) {
    const q = parts[0];
    return prisma.user.findMany({
      where: {
        deletedAt: null,
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
      deletedAt: null,
      AND: [
        { firstName: { contains: first, mode: "insensitive" } },
        { lastName: { contains: last, mode: "insensitive" } },
      ],
    },
    select: userSelect,
  });
}

export async function findByPhoneNumber(phoneNumber) {
  const norm = phoneNumber.replaceAll(/[^\d]/g, "");
  return prisma.user.findMany({
    where: {
      phoneNumber: { contains: norm, mode: "insensitive" },
      deletedAt: null,
    },
    select: userSelect,
  });
}

export async function findByContractType(contractType) {
  return prisma.user.findMany({
    where: { contractType, deletedAt: null },
    select: userSelect,
  });
}

export async function updateUser(id, data) {
  // Vérifier que l'utilisateur existe et n'est pas supprimé
  const existingUser = await prisma.user.findUnique({
    where: { id },
    select: { deletedAt: true },
  });

  if (!existingUser || existingUser.deletedAt) {
    return null;
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: userSelectWithDeleted,
  });

  const { deletedAt, ...userWithoutDeletedAt } = user;
  return userWithoutDeletedAt;
}

export async function updateRoleUserById(id, role) {
  // Vérifier que l'utilisateur existe et n'est pas supprimé
  const existingUser = await prisma.user.findUnique({
    where: { id },
    select: { deletedAt: true },
  });

  if (!existingUser || existingUser.deletedAt) {
    return null;
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: userSelectWithDeleted,
  });

  const { deletedAt, ...userWithoutDeletedAt } = user;
  return userWithoutDeletedAt;
}

export async function deleteUser(id) {
  // Suppression logique (soft delete)
  const deletedUser = await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
    select: userSelectWithDeleted,
  });

  // Retirer deletedAt du résultat
  const { deletedAt, ...userWithoutDeletedAt } = deletedUser;
  return userWithoutDeletedAt;
}

export async function countUsers() {
  return prisma.user.count({ where: { deletedAt: null } });
}

export async function countUsersByRole(role) {
  return prisma.user.count({
    where: { role, deletedAt: null },
  });
}

export async function countUsersByContractType(contractType) {
  return prisma.user.count({
    where: { contractType, deletedAt: null },
  });
}
