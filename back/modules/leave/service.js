import prisma from "../../db.js";

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
  return prisma.leave.create({
    data,
    select: leaveSelect,
  });
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
  return prisma.leave.update({
    where: { id },
    data,
    select: leaveSelect,
  });
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
