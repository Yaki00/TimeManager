import prisma from "../../db.js";

const warningSelect = {
  id: true,
  status: true,
  description: true,
  date: true,
  createdById: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      phoneNumber: true,
      contractType: true,
    },
  },
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      phoneNumber: true,
      contractType: true,
      totalWarningPoints: true,
    },
  },
};

export async function createWarning(data) {
  return prisma.$transaction(async (tx) => {
    // Créer le warning
    const warning = await tx.warning.create({
      data: {
        status: data.status,
        description: data.description,
        date: data.date,
        createdById: data.createdById,
        userId: data.userId,
      },
    });

    // Mettre à jour les points de warning de l'utilisateur
    const warningPoints = getWarningPoints(data.status);
    await tx.user.update({
      where: { id: data.userId },
      data: {
        totalWarningPoints: {
          increment: warningPoints,
        },
      },
    });

    return tx.warning.findUnique({
      where: { id: warning.id },
      select: warningSelect,
    });
  });
}

export async function findWarningById(id) {
  return prisma.warning.findUnique({
    where: { id },
    select: warningSelect,
  });
}

export async function findAllWarnings({ skip = 0, take = 50 } = {}) {
  return prisma.warning.findMany({
    skip,
    take,
    orderBy: { createdAt: "desc" },
    select: warningSelect,
  });
}

export async function findWarningsByUserId(
  userId,
  { skip = 0, take = 50 } = {}
) {
  return prisma.warning.findMany({
    where: { userId },
    skip,
    take,
    orderBy: { createdAt: "desc" },
    select: warningSelect,
  });
}

export async function findWarningsByStatus(
  status,
  { skip = 0, take = 50 } = {}
) {
  return prisma.warning.findMany({
    where: { status },
    skip,
    take,
    orderBy: { createdAt: "desc" },
    select: warningSelect,
  });
}

export async function findWarningsByDateRange(
  startDate,
  endDate,
  { skip = 0, take = 50 } = {}
) {
  return prisma.warning.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    skip,
    take,
    orderBy: { createdAt: "desc" },
    select: warningSelect,
  });
}

export async function findWarningsByCreatedBy(
  createdById,
  { skip = 0, take = 50 } = {}
) {
  return prisma.warning.findMany({
    where: { createdById },
    skip,
    take,
    orderBy: { createdAt: "desc" },
    select: warningSelect,
  });
}

export async function updateWarningById(id, data) {
  return prisma.$transaction(async (tx) => {
    const oldWarning = await tx.warning.findUnique({
      where: { id },
      select: { status: true, userId: true },
    });

    if (!oldWarning) {
      throw new Error("Warning non trouvé");
    }

    // Mettre à jour le warning
    const updatedWarning = await tx.warning.update({
      where: { id },
      data,
    });

    // Si le statut a changé, ajuster les points de warning
    if (data.status && data.status !== oldWarning.status) {
      const oldPoints = getWarningPoints(oldWarning.status);
      const newPoints = getWarningPoints(data.status);
      const pointDifference = newPoints - oldPoints;

      if (pointDifference !== 0) {
        await tx.user.update({
          where: { id: oldWarning.userId },
          data: {
            totalWarningPoints: {
              increment: pointDifference,
            },
          },
        });
      }
    }

    return tx.warning.findUnique({
      where: { id },
      select: warningSelect,
    });
  });
}

export async function deleteWarningById(id) {
  return prisma.$transaction(async (tx) => {
    const warning = await tx.warning.findUnique({
      where: { id },
      select: { status: true, userId: true },
    });

    if (!warning) {
      throw new Error("Warning non trouvé");
    }

    // Supprimer le warning
    const deletedWarning = await tx.warning.delete({
      where: { id },
      select: warningSelect,
    });

    // Retirer les points de warning de l'utilisateur
    const warningPoints = getWarningPoints(warning.status);
    await tx.user.update({
      where: { id: warning.userId },
      data: {
        totalWarningPoints: {
          decrement: warningPoints,
        },
      },
    });

    return deletedWarning;
  });
}

export async function countWarnings() {
  return prisma.warning.count();
}

export async function countWarningsByUserId(userId) {
  return prisma.warning.count({
    where: { userId },
  });
}

export async function countWarningsByStatus(status) {
  return prisma.warning.count({
    where: { status },
  });
}

export async function countWarningsByDateRange(startDate, endDate) {
  return prisma.warning.count({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });
}

export async function countWarningsByCreatedBy(createdById) {
  return prisma.warning.count({
    where: { createdById },
  });
}

// Fonction utilitaire pour obtenir les points de warning selon le statut
function getWarningPoints(status) {
  switch (status) {
    case "Alert":
      return 1;
    case "Late":
      return 2;
    case "UnjustifiedAbsence":
      return 3;
    default:
      return 0;
  }
}
