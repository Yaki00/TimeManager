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
  belongs: {
    select: {
      team: {
        select: {
          id: true,
          teamName: true,
        },
      },
    },
  },
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
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    skip,
    take,
    orderBy: { id: "asc" },
    select: userSelect,
  });

  // Transformer les données pour avoir un format plus simple
  return users.map((user) => {
    const { belongs, ...userData } = user;
    return {
      ...userData,
      teams: belongs?.map((b) => b.team) || [],
    };
  });
}

export async function findByRole(role) {
  const users = await prisma.user.findMany({
    where: { role, deletedAt: null },
    select: userSelect,
  });

  return users.map((user) => {
    const { belongs, ...userData } = user;
    return {
      ...userData,
      teams: belongs?.map((b) => b.team) || [],
    };
  });
}

export async function findByName(search) {
  const parts = search.trim().split(/\s+/);
  let users;

  if (parts.length === 1) {
    const q = parts[0];
    users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
        ],
      },
      select: userSelect,
    });
  } else {
    const [first, ...rest] = parts;
    const last = rest.join(" ");
    users = await prisma.user.findMany({
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

  return users.map((user) => {
    const { belongs, ...userData } = user;
    return {
      ...userData,
      teams: belongs?.map((b) => b.team) || [],
    };
  });
}

export async function findByPhoneNumber(phoneNumber) {
  const norm = phoneNumber.replaceAll(/[^\d]/g, "");
  const users = await prisma.user.findMany({
    where: {
      phoneNumber: { contains: norm, mode: "insensitive" },
      deletedAt: null,
    },
    select: userSelect,
  });

  return users.map((user) => {
    const { belongs, ...userData } = user;
    return {
      ...userData,
      teams: belongs?.map((b) => b.team) || [],
    };
  });
}

export async function findByContractType(contractType) {
  const users = await prisma.user.findMany({
    where: { contractType, deletedAt: null },
    select: userSelect,
  });

  return users.map((user) => {
    const { belongs, ...userData } = user;
    return {
      ...userData,
      teams: belongs?.map((b) => b.team) || [],
    };
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

export async function updateUserTeams(userId, teamIds) {
  return prisma.$transaction(async (tx) => {
    // Vérifier que l'utilisateur existe et n'est pas supprimé
    const existingUser = await tx.user.findUnique({
      where: { id: userId },
      select: { deletedAt: true },
    });

    if (!existingUser || existingUser.deletedAt) {
      return null;
    }

    // Supprimer toutes les appartenances actuelles de l'utilisateur
    await tx.belongs.deleteMany({
      where: { userId },
    });

    // Si teamIds est fourni et non vide, créer les nouvelles appartenances
    if (teamIds && teamIds.length > 0) {
      await tx.belongs.createMany({
        data: teamIds.map((teamId) => ({
          userId,
          teamId,
          isLead: false,
        })),
        skipDuplicates: true,
      });
    }

    // Retourner l'utilisateur avec ses nouvelles équipes
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });

    const { belongs, ...userData } = user;
    return {
      ...userData,
      teams: belongs?.map((b) => b.team) || [],
    };
  });
}
