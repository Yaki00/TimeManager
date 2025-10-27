import prisma from "../../db.js";

/**
 * Créer une notification automatique
 * @param {Object} params - Paramètres de la notification
 * @param {string} params.title - Titre de la notification
 * @param {string} params.message - Message de la notification
 * @param {string} params.status - Statut de la notification
 * @param {Array<number>} params.receiverIds - IDs des destinataires
 * @returns {Promise<Object>} La notification créée
 */
export async function createAutoNotification({
  title,
  message,
  status,
  receiverIds,
}) {
  if (!receiverIds || receiverIds.length === 0) {
    return null;
  }

  try {
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        status,
        date: new Date(),
      },
    });

    // Ajouter les destinataires
    await prisma.receive.createMany({
      data: receiverIds.map((userId) => ({
        userId,
        notificationId: notification.id,
      })),
      skipDuplicates: true,
    });

    return notification;
  } catch (error) {
    console.error(
      "Erreur lors de la création de la notification automatique:",
      error
    );
    return null;
  }
}

/**
 * Récupérer les Responsables uniquement
 * @returns {Promise<Array<number>>} IDs des responsables
 */
export async function getResponsablesIds() {
  const users = await prisma.user.findMany({
    where: {
      role: "Responsable",
    },
    select: {
      id: true,
    },
  });

  return users.map((user) => user.id);
}

/**
 * Récupérer l'ID du manager de l'équipe d'un employé
 * @param {number} userId - ID de l'employé
 * @returns {Promise<number|null>} ID du manager ou null si pas d'équipe
 */
export async function getTeamManagerForUser(userId) {
  // Trouver l'équipe de l'utilisateur
  const userTeam = await prisma.belongs.findFirst({
    where: { userId },
    include: {
      team: {
        include: {
          owner: true,
        },
      },
    },
  });

  if (!userTeam || !userTeam.team) {
    return null;
  }

  // Retourner l'ID du propriétaire de l'équipe (qui est le manager)
  return userTeam.team.ownerId;
}

/**
 * Notifier les managers et responsables d'une nouvelle demande de congé
 * @param {Object} leave - La demande de congé
 * @returns {Promise<Object|null>}
 */
export async function notifyLeaveRequest(leave) {
  // Récupérer les IDs des destinataires
  const receiverIds = [];

  // Ajouter tous les responsables
  const responsablesIds = await getResponsablesIds();
  receiverIds.push(...responsablesIds);

  // Ajouter le manager de l'équipe de l'employé
  const teamManagerId = await getTeamManagerForUser(leave.userId);
  if (teamManagerId && !receiverIds.includes(teamManagerId)) {
    receiverIds.push(teamManagerId);
  }

  if (receiverIds.length === 0) return null;

  const userName = `${leave.user.firstName} ${leave.user.lastName}`;
  const leaveTypeMap = {
    Absence: "Absence",
    PaidLeave: "Congé payé",
    Training: "Formation",
    Remote: "Télétravail",
  };
  const leaveType = leaveTypeMap[leave.type] || leave.type;

  return createAutoNotification({
    title: "Nouvelle demande de congé",
    message: `${userName} a fait une demande de ${leaveType} du ${new Date(
      leave.startDate
    ).toLocaleDateString("fr-FR")} au ${new Date(
      leave.endDate
    ).toLocaleDateString("fr-FR")}.`,
    status: "Warning",
    receiverIds,
  });
}

/**
 * Notifier un utilisateur quand sa demande de congé est approuvée
 * @param {Object} leave - La demande de congé
 * @returns {Promise<Object|null>}
 */
export async function notifyLeaveApproved(leave) {
  const leaveTypeMap = {
    Absence: "Absence",
    PaidLeave: "Congé payé",
    Training: "Formation",
    Remote: "Télétravail",
  };
  const leaveType = leaveTypeMap[leave.type] || leave.type;

  return createAutoNotification({
    title: "Demande de congé approuvée",
    message: `Votre demande de ${leaveType} du ${new Date(
      leave.startDate
    ).toLocaleDateString("fr-FR")} au ${new Date(
      leave.endDate
    ).toLocaleDateString("fr-FR")} a été approuvée.`,
    status: "Present",
    receiverIds: [leave.userId],
  });
}

/**
 * Notifier un utilisateur quand sa demande de congé est refusée
 * @param {Object} leave - La demande de congé
 * @returns {Promise<Object|null>}
 */
export async function notifyLeaveRefused(leave) {
  const leaveTypeMap = {
    Absence: "Absence",
    PaidLeave: "Congé payé",
    Training: "Formation",
    Remote: "Télétravail",
  };
  const leaveType = leaveTypeMap[leave.type] || leave.type;

  return createAutoNotification({
    title: "Demande de congé refusée",
    message: `Votre demande de ${leaveType} du ${new Date(
      leave.startDate
    ).toLocaleDateString("fr-FR")} au ${new Date(
      leave.endDate
    ).toLocaleDateString("fr-FR")} a été refusée.`,
    status: "Warning",
    receiverIds: [leave.userId],
  });
}

/**
 * Notifier un utilisateur d'un avertissement
 * @param {Object} warning - L'avertissement
 * @returns {Promise<Object|null>}
 */
export async function notifyWarningCreated(warning) {
  const warningTypeMap = {
    Alert: "Alerte",
    Late: "Retard",
    UnjustifiedAbsence: "Absence injustifiée",
  };
  const warningType = warningTypeMap[warning.status] || warning.status;

  return createAutoNotification({
    title: "Avertissement reçu",
    message: `Vous avez reçu un avertissement de type "${warningType}". Détails: ${warning.description}`,
    status: "Warning",
    receiverIds: [warning.userId],
  });
}
