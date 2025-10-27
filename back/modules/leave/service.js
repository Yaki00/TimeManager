import prisma from "../../db.js";
import {
  notifyLeaveRequest,
  notifyLeaveApproved,
  notifyLeaveRefused,
} from "../notification/utils.js";

const leaveSelect = {
  id: true,
  startDate: true,
  endDate: true,
  justification: true,
  status: true,
  daysLeave: true,
  type: true,
  userId: true,
  user: {
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
  createdAt: true,
  updatedAt: true,
};

export async function createLeave(data) {
  const leave = await prisma.leave.create({
    data,
    select: leaveSelect,
  });

  // Envoyer une notification automatique aux managers et responsables
  // On le fait de manière asynchrone pour ne pas bloquer la création
  notifyLeaveRequest(leave).catch((error) => {
    console.error(
      "Erreur lors de l'envoi de la notification de demande de congé:",
      error
    );
  });

  return leave;
}

export async function findLeaveById(id) {
  return prisma.leave.findUnique({
    where: { id },
    select: leaveSelect,
  });
}

export async function findAllLeaves({ skip = 0, take = 50 } = {}) {
  return prisma.leave.findMany({
    skip,
    take,
    orderBy: { createdAt: "desc" },
    select: leaveSelect,
  });
}

export async function findLeavesByUserId(userId) {
  return prisma.leave.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: leaveSelect,
  });
}

export async function findLeavesByTeamId(teamId) {
  return prisma.leave.findMany({
    where: { user: { belongs: { some: { teamId } } } },
    orderBy: { createdAt: "desc" },
    select: leaveSelect,
  });
}

export async function updateLeaveById(id, data) {
  const oldLeave = await prisma.leave.findUnique({
    where: { id },
    select: leaveSelect,
  });

  const updatedLeave = await prisma.leave.update({
    where: { id },
    data,
    select: leaveSelect,
  });

  // Envoyer une notification si le statut a changé
  if (data.status && oldLeave.status !== data.status) {
    if (data.status === "Approved") {
      notifyLeaveApproved(updatedLeave).catch((error) => {
        console.error(
          "Erreur lors de l'envoi de la notification d'approbation:",
          error
        );
      });
    } else if (data.status === "Refused") {
      notifyLeaveRefused(updatedLeave).catch((error) => {
        console.error(
          "Erreur lors de l'envoi de la notification de refus:",
          error
        );
      });
    }
  }

  return updatedLeave;
}

export async function deleteLeaveById(id) {
  return prisma.leave.delete({
    where: { id },
    select: leaveSelect,
  });
}

/**
 * Recherche un chevauchement sur [start, end] pour un user donné.
 * Si excludeId est fourni, on exclut cette demande.
 */
export async function findOverlappingLeave(userId, start, end, excludeId) {
  return prisma.leave.findFirst({
    where: {
      userId,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      startDate: { lte: end },
      endDate: { gte: start },
    },
    select: { id: true },
  });
}

/**
 * Récupère toutes les demandes des managers (role Manager)
 */
export async function findManagerLeaves({ skip = 0, take = 50 } = {}) {
  return prisma.leave.findMany({
    skip,
    take,
    where: {
      user: {
        role: "Manager",
      },
    },
    orderBy: { createdAt: "desc" },
    select: leaveSelect,
  });
}
