import prisma from "../../db.js";

const clockingSelect = {
  id: true,
  firstArrival: true,
  lastDeparture: true,
  workTime: true,
  breakTime: true,
  clockingDate: true,
  totalHours: true,
  weekDay: true,
  userId: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      contractType: true,
    },
  },
  createdAt: true,
  updatedAt: true,
};

/**
 * Convertir une chaîne de temps (HH:MM:SS) en DateTime pour Prisma
 */
function timeStringToDateTime(timeStr) {
  if (!timeStr) return null;
  const [hours, minutes, seconds = "00"] = timeStr.split(":");
  const date = new Date();
  date.setHours(
    Number.parseInt(hours),
    Number.parseInt(minutes),
    Number.parseInt(seconds),
    0
  );
  return date;
}

/**
 * Créer un pointage
 */
export async function createClocking(data) {
  return prisma.clocking.create({
    data: {
      userId: data.userId,
      clockingDate: new Date(data.clockingDate),
      firstArrival: timeStringToDateTime(data.firstArrival),
      lastDeparture: timeStringToDateTime(data.lastDeparture),
      workTime: data.workTime || 0,
      breakTime: data.breakTime || 0,
      totalHours: data.totalHours || 0,
      weekDay: data.weekDay,
    },
    select: clockingSelect,
  });
}

/**
 * Trouver un pointage par ID
 */
export async function findClockingById(id) {
  return prisma.clocking.findUnique({
    where: { id },
    select: clockingSelect,
  });
}

/**
 * Trouver tous les pointages avec pagination et filtres
 */
export async function findAllClockings({
  skip = 0,
  take = 50,
  userId,
  startDate,
  endDate,
} = {}) {
  const where = {};

  if (userId) {
    where.userId = userId;
  }

  if (startDate || endDate) {
    where.clockingDate = {};
    if (startDate) where.clockingDate.gte = new Date(startDate);
    if (endDate) where.clockingDate.lte = new Date(endDate);
  }

  return prisma.clocking.findMany({
    where,
    skip,
    take,
    orderBy: { clockingDate: "desc" },
    select: clockingSelect,
  });
}

/**
 * Trouver les pointages d'un utilisateur
 */
export async function findClockingsByUserId(
  userId,
  { skip = 0, take = 50, startDate, endDate } = {}
) {
  const where = { userId };

  if (startDate || endDate) {
    where.clockingDate = {};
    if (startDate) where.clockingDate.gte = new Date(startDate);
    if (endDate) where.clockingDate.lte = new Date(endDate);
  }

  return prisma.clocking.findMany({
    where,
    skip,
    take,
    orderBy: { clockingDate: "desc" },
    select: clockingSelect,
  });
}

/**
 * Trouver les pointages d'un utilisateur pour une date donnée
 * Retourne une liste car plusieurs pointages par jour sont possibles
 */
export async function findClockingsByUserAndDate(userId, clockingDate) {
  return prisma.clocking.findMany({
    where: {
      userId,
      clockingDate: new Date(clockingDate),
    },
    orderBy: { firstArrival: "asc" },
    select: clockingSelect,
  });
}

/**
 * Mettre à jour un pointage
 */
export async function updateClockingById(id, data) {
  const updateData = {};

  if (data.firstArrival !== undefined)
    updateData.firstArrival = timeStringToDateTime(data.firstArrival);
  if (data.lastDeparture !== undefined)
    updateData.lastDeparture = timeStringToDateTime(data.lastDeparture);
  if (data.workTime !== undefined) updateData.workTime = data.workTime;
  if (data.breakTime !== undefined) updateData.breakTime = data.breakTime;
  if (data.totalHours !== undefined) updateData.totalHours = data.totalHours;
  if (data.weekDay !== undefined) updateData.weekDay = data.weekDay;

  return prisma.clocking.update({
    where: { id },
    data: updateData,
    select: clockingSelect,
  });
}

/**
 * Supprimer un pointage
 */
export async function deleteClockingById(id) {
  return prisma.clocking.delete({
    where: { id },
    select: clockingSelect,
  });
}

/**
 * Calculer les statistiques de pointage pour un utilisateur
 */
export async function getClockingStats(userId, startDate, endDate) {
  const where = { userId };

  if (startDate || endDate) {
    where.clockingDate = {};
    if (startDate) where.clockingDate.gte = new Date(startDate);
    if (endDate) where.clockingDate.lte = new Date(endDate);
  }

  const stats = await prisma.clocking.aggregate({
    where,
    _sum: {
      workTime: true,
      breakTime: true,
    },
    _avg: {
      workTime: true,
      totalHours: true,
    },
    _count: {
      id: true,
    },
  });

  return {
    totalWorkMinutes: stats._sum.workTime || 0,
    totalBreakMinutes: stats._sum.breakTime || 0,
    averageWorkMinutes: stats._avg.workTime || 0,
    averageTotalHours: stats._avg.totalHours || 0,
    totalDays: stats._count.id || 0,
  };
}
