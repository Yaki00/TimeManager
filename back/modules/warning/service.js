import prisma from "../../db.js";
import { notifyWarningCreated } from "../notification/utils.js";

// Fonction utilitaire pour convertir une date en objet Date pour les opérations create/update
// Pour les champs @db.Date, Prisma accepte les objets Date
function toDateTimeISO(dateString, isEndDate = false) {
  if (!dateString) return null;
  // Si c'est déjà un objet Date, le retourner tel quel
  if (dateString instanceof Date) {
    return dateString;
  }
  // Si c'est déjà un DateTime complet, le convertir en Date
  if (dateString.includes("T") || dateString.includes(" ")) {
    return new Date(dateString);
  }
  // Pour une date de fin, utiliser la fin de la journée (23:59:59.999)
  if (isEndDate) {
    return new Date(`${dateString}T23:59:59.999Z`);
  }
  // Sinon, ajouter le temps à minuit UTC
  return new Date(`${dateString}T00:00:00.000Z`);
}

// Fonction utilitaire pour convertir une date pour les clauses where (accepte Date ou string)
function toDateTimeForWhere(dateString, isEndDate = false) {
  if (!dateString) return null;
  // Si c'est déjà un objet Date, le retourner tel quel (Prisma accepte les Date dans where)
  if (dateString instanceof Date) {
    if (isEndDate) {
      // Pour une date de fin, utiliser la fin de la journée
      const date = new Date(dateString);
      date.setHours(23, 59, 59, 999);
      return date;
    }
    return dateString;
  }
  // Si c'est déjà un DateTime complet, le convertir en Date
  if (dateString.includes("T") || dateString.includes(" ")) {
    const date = new Date(dateString);
    if (isEndDate) {
      date.setHours(23, 59, 59, 999);
    }
    return date;
  }
  // Pour une date de fin, utiliser la fin de la journée (23:59:59.999)
  if (isEndDate) {
    return new Date(`${dateString}T23:59:59.999Z`);
  }
  // Sinon, ajouter le temps à minuit UTC
  return new Date(`${dateString}T00:00:00.000Z`);
}

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
        date: toDateTimeISO(data.date),
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

    const fullWarning = await tx.warning.findUnique({
      where: { id: warning.id },
      select: warningSelect,
    });

    // Envoyer une notification automatique à l'utilisateur concerné
    notifyWarningCreated(fullWarning).catch((error) => {
      console.error(
        "Erreur lors de l'envoi de la notification d'avertissement:",
        error
      );
    });

    return fullWarning;
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
  // Valider le statut avant de l'utiliser dans la requête Prisma
  const validStatuses = ["Alert", "Late", "UnjustifiedAbsence"];
  if (!validStatuses.includes(status)) {
    return [];
  }

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
        gte: toDateTimeForWhere(startDate, false),
        lte: toDateTimeForWhere(endDate, true),
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

    // Convertir la date si elle est présente
    const updateData = { ...data };
    if (updateData.date) {
      updateData.date = toDateTimeISO(updateData.date);
    }

    // Mettre à jour le warning
    const updatedWarning = await tx.warning.update({
      where: { id },
      data: updateData,
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
  // Valider le statut avant de l'utiliser dans la requête Prisma
  const validStatuses = ["Alert", "Late", "UnjustifiedAbsence"];
  if (!validStatuses.includes(status)) {
    return 0;
  }

  return prisma.warning.count({
    where: { status },
  });
}

export async function countWarningsByDateRange(startDate, endDate) {
  return prisma.warning.count({
    where: {
      date: {
        gte: toDateTimeForWhere(startDate, false),
        lte: toDateTimeForWhere(endDate, true),
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
